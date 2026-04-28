"use strict";

const level = require('level');
const path = require('path');

module.exports = class Memory {
  constructor(siteId) {
    this.dbPath = path.join(__dirname, '..', '..', 'memory', 'sites');
    this.siteId = siteId;
    this.db = level(this.dbPath);
  }

  async getCurrentDOM() {
    try {
      const key = `${this.siteId}:dom:last`;
      const dom = await this.db.get(key);
      return dom ? JSON.parse(dom) : null;
    } catch (err) {
      return null;
    }
  }

  async updateContext(step, result) {
    const context = await this.getContext();
    const newContext = { ...context, lastAction: step, lastResult: result };
    
    const key = `${this.siteId}:context:last`;
    await this.db.put(key, JSON.stringify(newContext));
  }

  async getContext() {
    try {
      const key = `${this.siteId}:context:last`;
      const context = await this.db.get(key);
      return context ? JSON.parse(context) : {};
    } catch (err) {
      return {};
    }
  }

  async updateSelector(oldSelector, newSelector) {
    const key = `${this.siteId}:selectors:map`;
    let map = {};
    try {
      map = JSON.parse(await this.db.get(key));
    } catch (err) {}
    
    map[oldSelector] = newSelector;
    await this.db.put(key, JSON.stringify(map));
  }
};