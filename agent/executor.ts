interface StepResult {
  success: boolean;
  action: string;
  info?: string;
  error?: string;
  data?: any;
}

interface BrowserStep {
  action: string;
  selector?: string;
  value?: string;
  direction?: 'up' | 'down';
  amount?: number;
  path?: string;
}

export class Executor {
  page: any;
  private screenshotCount: number = 0;

  constructor() {
    this.page = null;
  }

  async execute(step: BrowserStep): Promise<StepResult> {
    const { action, selector, value } = step;
    const stepInfo = `[${action}${selector ? ` on ${selector}` : ''}]`;
    
    try {
      switch (action) {
        case 'navigate':
          if (!value) throw new Error('navigate requires value (URL)');
          await this.page.goto(value, { waitUntil: 'networkidle' });
          return { success: true, action, info: `Navigated to ${value}` };

        case 'click':
          if (!selector) throw new Error('click requires selector');
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.click(selector);
          return { success: true, action, info: `Clicked ${selector}` };

        case 'type':
          if (!selector || value === undefined) throw new Error('type requires selector and value');
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.fill(selector, value);
          return { success: true, action, info: `Typed "${value}" into ${selector}` };

        case 'select':
          if (!selector || !value) throw new Error('select requires selector and value');
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.selectOption(selector, value);
          return { success: true, action, info: `Selected ${value} in ${selector}` };

        case 'wait':
          const ms = parseInt(value || '1000');
          await this.page.waitForTimeout(ms);
          return { success: true, action, info: `Waited ${ms}ms` };

        case 'wait_for_selector':
          if (!selector) throw new Error('wait_for_selector requires selector');
          const timeout = parseInt(value || '10000');
          await this.page.waitForSelector(selector, { timeout });
          return { success: true, action, info: `Waited for ${selector} (${timeout}ms timeout)` };

        case 'scroll':
          const direction = step.direction || 'down';
          const amount = step.amount || 500;
          const scrollAmount = direction === 'up' ? -amount : amount;
          await this.page.evaluate((y: number) => window.scrollBy(0, y), scrollAmount);
          return { success: true, action, info: `Scrolled ${direction} ${amount}px` };

        case 'hover':
          if (!selector) throw new Error('hover requires selector');
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.hover(selector);
          return { success: true, action, info: `Hovered over ${selector}` };

        case 'screenshot':
          this.screenshotCount++;
          const path = step.path || `/tmp/kri-screenshot-${this.screenshotCount}.png`;
          await this.page.screenshot({ path, fullPage: true });
          return { success: true, action, info: `Screenshot saved to ${path}`, data: { path } };

        case 'press_key':
          if (!value) throw new Error('press_key requires value (key name)');
          await this.page.keyboard.press(value);
          return { success: true, action, info: `Pressed key: ${value}` };

        case 'clear':
          if (!selector) throw new Error('clear requires selector');
          await this.page.waitForSelector(selector, { timeout: 5000 });
          await this.page.fill(selector, '');
          return { success: true, action, info: `Cleared ${selector}` };

        case 'evaluate':
          if (!value) throw new Error('evaluate requires value (JavaScript code)');
          const result = await this.page.evaluate(value);
          return { success: true, action, info: `Evaluated JS`, data: result };

        default:
          return { success: false, action, error: `Unknown action: ${action}` };
      }
    } catch (err: any) {
      console.error(`[Executor] Error ${stepInfo}: ${err.message}`);
      return { success: false, action, error: err.message };
    }
  }

  async init(page: any): Promise<void> {
    this.page = page;
    this.screenshotCount = 0;
    console.log('[Executor] Initialized with page');
  }

  async close(): Promise<void> {
    // Page cleanup handled by BrowserManager
    this.page = null;
  }
}
