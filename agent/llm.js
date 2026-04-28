"use strict";

const { OpenAI } = require('openai');

module.exports = class LLM {
  constructor(model = 'claude-3-haiku') {
    this.model = model;
    this.client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY || 'sk-xxx',
      baseURL: 'https://api.openai.com/v1'
    });
  }

  async planTask(userInput, context) {
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

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    
    // Extract JSON array
    const jsonMatch = content.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error('LLM did not return valid JSON array');
    
    return JSON.parse(jsonMatch[0]);
  }

  async repairSelector(change) {
    const prompt = `The selector '${change.old}' no longer works on the page. The element's text is now: '${change.text}'.

Suggest a new CSS selector or text-based selector that will reliably find this element.

Examples:
- 'button:has-text("Add to Cart")'
- 'a[href="/product/123"]'
- 'input[placeholder="Enter email"]'

Return only the new selector string. No explanations.`;

    const response = await this.client.chat.completions.create({
      model: "gpt-4o",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.1
    });

    const content = response.choices[0].message.content.trim();
    return content.startsWith('`') ? content.slice(1, -1) : content;
  }
};