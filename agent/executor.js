"use strict";

const playwright = require('playwright');

module.exports = class Executor {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async execute(step) {
    try {
      const { action, selector, value } = step;
      
      switch (action) {
        case 'navigate':
          await this.page.goto(value);
          return { success: true, action, info: `Navigated to ${value}` };
        
        case 'click':
          await this.page.click(selector);
          return { success: true, action, info: `Clicked ${selector}` };
        
        case 'type':
          await this.page.type(selector, value);
          return { success: true, action, info: `Typed "${value}" into ${selector}` };
        
        case 'select':
          await this.page.select(selector, value);
          return { success: true, action, info: `Selected ${value} in ${selector}` };
        
        case 'wait':
          await this.page.waitForTimeout(parseInt(value));
          return { success: true, action, info: `Waited ${value}ms` };
        
        default:
          return { success: false, action, error: `Unknown action: ${action}` };
      }
    } catch (err) {
      return { success: false, action, error: err.message };
    }
  }

  async init(page) {
    this.page = page;
  }

  async close() {
    if (this.page) await this.page.close();
    if (this.browser) await this.browser.close();
  }
};