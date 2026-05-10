import 'dotenv/config';
import { OpenAI } from 'openai';

interface BrowserStep {
  action: string;
  selector?: string;
  value?: string;
  direction?: 'up' | 'down';
  amount?: number;
  path?: string;
}

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

  async planTask(userInput: string, context: any): Promise<BrowserStep[]> {
    if (this.mockMode) {
      console.log(`[LLM Mock] Planning task for: "${userInput}"`);
      // Return a comprehensive mock plan for testing
      return [
        { action: 'wait_for_selector', selector: 'button:has-text("Search")', value: '5000' },
        { action: 'hover', selector: 'button:has-text("Search")' },
        { action: 'click', selector: 'button:has-text("Search")' },
        { action: 'wait', value: '500' },
        { action: 'type', selector: 'input[name="q"]', value: userInput },
        { action: 'click', selector: 'button[type="submit"]' },
        { action: 'wait_for_selector', selector: '.results', value: '10000' },
        { action: 'screenshot', path: '/tmp/kri-task-result.png' }
      ];
    }

    if (!this.client) throw new Error('LLM client not initialized');

    const prompt = `You are an autonomous web operator. Your job is to interpret natural language commands and turn them into precise browser actions using Playwright.

User command: "${userInput}"

Previous context: ${JSON.stringify(context)}

Available actions:
- navigate: Go to a URL. Requires: value (URL)
- click: Click an element. Requires: selector
- type: Type text into an input. Requires: selector, value
- select: Select an option. Requires: selector, value (option value)
- wait: Wait for milliseconds. Requires: value (ms)
- wait_for_selector: Wait for element to appear. Requires: selector, optional value (timeout ms)
- scroll: Scroll the page. Requires: direction (up/down), amount (pixels)
- hover: Hover over an element. Requires: selector
- screenshot: Take a screenshot. Optional: path
- press_key: Press a keyboard key. Requires: value (key name like "Enter", "Escape")
- clear: Clear an input field. Requires: selector
- evaluate: Run JavaScript. Requires: value (JS code)

Return a JSON array of steps. Each step must have:
- action: one of the available actions
- selector: CSS selector or label text (for click/type/select/hover/wait_for_selector/clear)
- value: action-specific value
- direction: for scroll action (up/down)
- amount: for scroll action (pixels)
- path: for screenshot action (file path)

Example output:
[
  {"action": "navigate", "value": "https://example.com"},
  {"action": "wait_for_selector", "selector": "nav", "value": "5000"},
  {"action": "hover", "selector": "a:has-text('Products')"},
  {"action": "click", "selector": "a:has-text('Products')"},
  {"action": "scroll", "direction": "down", "amount": 500},
  {"action": "type", "selector": "input[name='search']", "value": "blue dress"},
  {"action": "press_key", "value": "Enter"},
  {"action": "wait", "value": "2000"},
  {"action": "screenshot", "path": "/tmp/results.png"}
]

Only return the JSON array. No explanations.`;

    const response = await this.client.chat.completions.create({
      model: 'gpt-4o',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.1,
      response_format: { type: 'json_object' }
    });

    const content = response.choices[0].message.content;
    const jsonMatch = content.match(/\[.*\]/s);
    if (!jsonMatch) throw new Error('LLM did not return valid JSON array');
    
    return JSON.parse(jsonMatch[0]);
  }

  async repairSelector(change: { old: string; text: string }): Promise<string> {
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
