import { LLM } from './llm.ts';
import { Executor } from './executor.ts';
import { Memory } from './memory.ts';
import { getBrowserManager } from './browser.ts';

export class Operator {
  siteId: string;
  config: any;
  llm: LLM;
  executor: Executor;
  memory: Memory;

  constructor(siteId: string, config: any) {
    this.siteId = siteId;
    this.config = config;
    this.llm = new LLM(config.agent);
    this.executor = new Executor();
    this.memory = new Memory(siteId);
  }

  async init(): Promise<void> {
    const browserManager = await getBrowserManager();
    const siteUrl = this.config.url || `https://${this.siteId}`;
    const page = await browserManager.getPage(this.siteId, siteUrl);
    
    if (page) {
      await this.executor.init(page);
      console.log(`[Operator] Executor initialized with page for ${this.siteId}`);
    } else {
      console.warn(`[Operator] No page available for ${this.siteId}, executor may not work`);
    }
  }

  async executeTask(userInput: string): Promise<any> {
    const context = await this.memory.getContext();
    const plan = await this.llm.planTask(userInput, context);

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

  async repairSelector(change: any): Promise<string> {
    return await this.llm.repairSelector(change);
  }

  async close(): Promise<void> {
    // Page cleanup handled by BrowserManager
  }
}