"use strict";

const { LLM } = require('./llm');
const { Executor } = require('./executor');
const { Memory } = require('./memory');

module.exports = class Operator {
  constructor(siteId, config) {
    this.siteId = siteId;
    this.config = config;
    this.llm = new LLM(config.agent);
    this.executor = new Executor();
    this.memory = new Memory(siteId);
  }

  async executeTask(userInput) {
    const context = await this.memory.getContext();
    
    const plan = await this.llm.planTask(userInput, context);
    
    const results = [];
    for (const step of plan.steps) {
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
};