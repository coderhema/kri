"use strict";

const { LLM } = require('./llm');
const { FlueSession } = require('./flue-session');
const { Executor } = require('./executor');
const { Memory } = require('./memory');

module.exports = class Operator {
  constructor(siteId, config) {
    this.siteId = siteId;
    this.config = config;
    this.llm = new LLM(config.agent);
    this.flue = new FlueSession(config.agent?.model || 'anthropic/claude-sonnet-4-6');
    this.executor = new Executor();
    this.memory = new Memory(siteId);
  }

  async init() {
    await this.flue.init();
  }

  async executeTask(userInput) {
    const context = await this.memory.getContext();
    
    const plan = await this.flue.planTask(userInput, context);
    
    const results = [];
    for (const step of plan) {
      const result = await this.executor.execute(step);
      results.push(result);
      if (result.success) await this.memory.updateContext(step, result);
    }
    
    return {
      success: results.every(r => r.success),
      steps: results,
      final: results[results.length - 1]
    };
  }

  async repairSelector(change) {
    return await this.flue.repairSelector(change);
  }

  async close() {
    await this.flue.close();
  }
};
