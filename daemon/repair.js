"use strict";

const { LLM } = require('../agent/llm');
const { FlueSession } = require('../agent/flue-session');
const { Memory } = require('../agent/memory');

module.exports = class Daemon {
  constructor(siteId, config) {
    this.siteId = siteId;
    this.config = config;
    this.llm = new LLM(config.agent);
    this.flue = new FlueSession(config.agent?.model || 'anthropic/claude-sonnet-4-6');
    this.memory = new Memory(siteId);
    this.lastDOM = null;
  }

  async init() {
    await this.flue.init();
  }

  async monitor() {
    const currentDOM = await this.memory.getCurrentDOM();
    
    if (!this.lastDOM) {
      this.lastDOM = currentDOM;
      return;
    }
    
    const diff = this.compareDOMs(this.lastDOM, currentDOM);
    
    if (diff.changedSelectors.length > 0) {
      console.log(`[Daemon] Detected ${diff.changedSelectors.length} selector changes. Repairing...`);
      await this.repairSelectors(diff.changedSelectors);
    }
    
    this.lastDOM = currentDOM;
  }

  compareDOMs(oldDOM, newDOM) {
    const changedSelectors = [];
    
    // Simple diff: if a button's text or label changed, flag it
    for (const oldEl of oldDOM.elements) {
      const newEl = newDOM.elements.find(e => e.id === oldEl.id);
      if (newEl && (oldEl.text !== newEl.text || oldEl.selector !== newEl.selector)) {
        changedSelectors.push({
          old: oldEl.selector,
          new: newEl.selector,
          text: newEl.text
        });
      }
    }
    
    return { changedSelectors };
  }

  async repairSelectors(changedSelectors) {
    const fixes = [];
    
    for (const change of changedSelectors) {
      const newSelector = await this.flue.repairSelector(change);
      if (newSelector) {
        await this.memory.updateSelector(change.old, newSelector);
        fixes.push({ old: change.old, new: newSelector });
      }
    }
    
    return fixes;
  }
};
