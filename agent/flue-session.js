"use strict";

const { init } = require('@flue/sdk/client');
const v = require('valibot');

module.exports = class FlueSession {
  constructor(model = 'anthropic/claude-sonnet-4-6') {
    this.model = model;
    this.session = null;
  }

  async init() {
    this.session = await init({ 
      sandbox: 'local',
      model: this.model
    });
    return this;
  }

  async planTask(userInput, context) {
    if (!this.session) await this.init();

    const prompt = `You are an autonomous web operator. Your job is to interpret natural language commands and turn them into precise browser actions using Playwright.

User command: "${userInput}"

Previous context: ${JSON.stringify(context)}

Available actions: navigate, click, type, select, wait

Return a JSON array of steps. Each step must have:
- action: one of [navigate, click, type, select, wait]
- selector: CSS selector or label text (for click/type/select)
- value: optional value for type/select

Example output:
[
  {"action": "click", "selector": "button:has-text('Shop')"},
  {"action": "type", "selector": "input[name='search']", "value": "blue dress"},
  {"action": "click", "selector": "button:has-text('Search')"},
  {"action": "click", "selector": "a:has-text('Blue Cotton Dress')"},
  {"action": "select", "selector": "select#size", "value": "M"},
  {"action": "click", "selector": "button:has-text('Add to Cart')"}
]

Only return the JSON array. No explanations.`;

    const result = await this.session.prompt(prompt, {
      result: v.array(
        v.object({
          action: v.picklist(['navigate', 'click', 'type', 'select', 'wait']),
          selector: v.string(),
          value: v.optional(v.string()),
        })
      )
    });

    return result.result;
  }

  async repairSelector(change) {
    if (!this.session) await this.init();

    const prompt = `The selector '${change.old}' no longer works on the page. The element's text is now: '${change.text}'.

Suggest a new CSS selector or text-based selector that will reliably find this element.

Examples:
- 'button:has-text("Add to Cart")'
- 'a[href="/product/123"]'
- 'input[placeholder="Enter email"]'

Return only the new selector string. No explanations.`;

    const result = await this.session.prompt(prompt, {
      result: v.string()
    });

    return result.result.trim();
  }

  async close() {
    if (this.session) {
      await this.session.close();
      this.session = null;
    }
  }
};
