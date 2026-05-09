import 'dotenv/config';
import { OpenAI } from 'openai';

export class LLM {
  model: string;
  client: OpenAI | null;
  mockMode: boolean;

  constructor(model = 'claude-3-haiku') {
    this.model = model;
    
    // Check if we have a valid API key
    const apiKey = process.env.OPENAI_API_KEY;
    if (apiKey && apiKey !== 'sk-xxx' && apiKey.length > 10) {
      this.client = new OpenAI({
        apiKey: apiKey,
        baseURL: 'https://api.openai.com/v1'
      });
      this.mockMode = false;
      console.log('[LLM] Using OpenAI API');
    } else {
      this.client = null;
      this.mockMode = true;
      console.log('[LLM] Mock mode: No valid API key found');
    }
  }

  async planTask(userInput, context) {
    if (this.mockMode) {
      console.log(`[LLM Mock] Planning task for: "${userInput}"`);
      // Return a simple mock plan for testing
      return [
        { action: 'click', selector: 'button:has-text("Search")' },
        { action: 'type', selector: 'input[name="q"]', value: userInput },
        { action: 'click', selector: 'button[type="submit"]' }
      ];
    }

    if (!this.client) throw new Error('LLM client not initialized');

    const prompt = `You are an autonomous web operator. Your job is to interpret natural language commands and turn into precise browser actions using Playwright.

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
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error('LLM did not return valid JSON array');
    
    return JSON.parse(jsonMatch[0]);
  }

  async repairSelector(change) {
    if (this.mockMode) {
      console.log(`[LLM Mock] Repairing selector: "${change.old}" to new selector based on text: "${change.text}"`);
      // Return a mock selector
      return `button:has-text("${change.text.substring(0, 20)}")`;
    }

    if (!this.client) throw new Error('LLM client not initialized');

    const prompt = `The selector '${change.old}' no longer works on the page. The element's text is now: '${change.text}'.

Suggest a new CSS selector or text-based selector that will reliably find this element.
Examples:
- 'button:has-text("Add to Cart")'
- 'a[href="/product/123"]'
- 'input[placeholder="Enter email"]'

Return only the new selector string. No explanations.`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1
    });

    const content = response.choices[0].message.content.trim();
    return content.startsWith('`') ? content.slice(1, -1) : content;
  }
}
