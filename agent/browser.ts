let playwright: any = null;

async function loadPlaywright() {
  if (playwright) return playwright;
  try {
    playwright = await import('playwright');
    return playwright;
  } catch (error) {
    console.warn('[BrowserManager] Playwright not available:', error.message);
    return null;
  }
}

export class BrowserManager {
  private browser: any = null;
  private pages: Map<string, any> = new Map();

  async init(): Promise<void> {
    const pw = await loadPlaywright();
    if (!pw) {
      console.log('[BrowserManager] Running in mock mode (Playwright unavailable)');
      return;
    }

    try {
      this.browser = await pw.chromium.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox']
      });
      console.log('[BrowserManager] Browser launched');
    } catch (error) {
      console.warn('[BrowserManager] Failed to launch browser, using mock mode:', error.message);
      this.browser = null;
    }
  }

  async getPage(siteId: string, url: string): Promise<any> {
    if (this.pages.has(siteId)) {
      return this.pages.get(siteId);
    }

    if (!this.browser) {
      // Mock page for testing
      console.log(`[BrowserManager] Creating mock page for ${siteId}`);
      const mockPage = this.createMockPage();
      this.pages.set(siteId, mockPage);
      return mockPage;
    }

    try {
      const context = await this.browser.newContext();
      const page = await context.newPage();
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
      this.pages.set(siteId, page);
      console.log(`[BrowserManager] Page created for ${siteId}`);
      return page;
    } catch (error) {
      console.error(`[BrowserManager] Failed to create page for ${siteId}:`, error.message);
      return this.createMockPage();
    }
  }

  private createMockPage(): any {
    return {
      goto: async (url: string) => console.log(`[MockPage] Navigating to ${url}`),
      click: async (selector: string) => console.log(`[MockPage] Clicking ${selector}`),
      type: async (selector: string, text: string) => console.log(`[MockPage] Typing "${text}" into ${selector}`),
      fill: async (selector: string, value: string) => console.log(`[MockPage] Filling "${value}" into ${selector}`),
      selectOption: async (selector: string, value: string) => console.log(`[MockPage] Selecting ${value} in ${selector}`),
      select: async (selector: string, value: string) => console.log(`[MockPage] Selecting ${value} in ${selector}`),
      waitForTimeout: async (ms: number) => new Promise(resolve => setTimeout(resolve, ms)),
      waitForSelector: async (selector: string, options?: { timeout?: number }) => {
        console.log(`[MockPage] Waiting for selector ${selector}`);
        return { click: async () => console.log(`[MockPage] Clicked ${selector}`) };
      },
      hover: async (selector: string) => console.log(`[MockPage] Hovering over ${selector}`),
      screenshot: async (options: { path?: string; fullPage?: boolean }) => {
        console.log(`[MockPage] Taking screenshot to ${options?.path || 'default'}`);
        return Buffer.from('mock-screenshot-data');
      },
      keyboard: {
        press: async (key: string) => console.log(`[MockPage] Pressing key: ${key}`)
      },
      evaluate: async (fn: Function | string, ...args: any[]) => {
        console.log('[MockPage] Evaluating function');
        if (typeof fn === 'string') {
          // Handle string evaluation (e.g., document.title)
          if (fn === 'document.title') return 'Example Domain';
          if (fn.includes('scrollBy')) {
            const amount = args[0] || 0;
            console.log(`[MockPage] Scrolled by ${amount}px`);
            return undefined;
          }
          return null;
        }
        // For function evaluation, check if it's a scroll operation
        const fnStr = fn.toString();
        if (fnStr.includes('scrollBy')) {
          const amount = args[0] || 0;
          console.log(`[MockPage] Scrolled by ${amount}px`);
          return undefined;
        }
        // Create a minimal mock window for other operations
        const mockWindow = {
          scrollBy: (x: number, y: number) => console.log(`[MockWindow] scrollBy(${x}, ${y})`),
          scrollTo: (x: number, y: number) => console.log(`[MockWindow] scrollTo(${x}, ${y})`),
          innerWidth: 1920,
          innerHeight: 1080,
          scrollX: 0,
          scrollY: 0
        };
        const mockDocument = {
          title: 'Mock Document',
          querySelector: (sel: string) => ({ click: () => console.log(`[MockDoc] Clicked ${sel}`) }),
          querySelectorAll: (sel: string) => [],
          body: { scrollHeight: 2000 }
        };
        const mockGlobal = { window: mockWindow, document: mockDocument, ...mockWindow };
        try {
          return fn.call(mockGlobal, ...args);
        } catch (e) {
          console.log(`[MockPage] Function evaluation error (expected): ${e.message}`);
          return undefined;
        }
      },
      close: async () => console.log('[MockPage] Closing'),
      content: async () => '<html><body>Mock page content</body></html>'
    };
  }

  async closePage(siteId: string): Promise<void> {
    const page = this.pages.get(siteId);
    if (page) {
      if (page.close && !page.close.toString().includes('MockPage')) {
        await page.close();
      }
      this.pages.delete(siteId);
      console.log(`[BrowserManager] Page closed for ${siteId}`);
    }
  }

  async close(): Promise<void> {
    for (const [siteId, page] of this.pages) {
      if (page.close && !page.close.toString().includes('MockPage')) {
        await page.close();
      }
    }
    this.pages.clear();
    
    if (this.browser) {
      await this.browser.close();
      this.browser = null;
      console.log('[BrowserManager] Browser closed');
    }
  }
}

// Singleton instance
let browserManagerInstance: BrowserManager | null = null;

export async function getBrowserManager(): Promise<BrowserManager> {
  if (!browserManagerInstance) {
    browserManagerInstance = new BrowserManager();
    await browserManagerInstance.init();
  }
  return browserManagerInstance;
}