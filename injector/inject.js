"use strict";

const fs = require('fs');
const path = require('path');

module.exports = class Injector {
  constructor() {
    this.overlayCode = fs.readFileSync(path.join(__dirname, '..', 'overlay', 'kri-overlay.js'), 'utf8');
  }

  async inject(page, url) {
    const html = await page.content();
    const platform = require('../injector/detect').detect(url, html);
    
    if (!platform) {
      console.warn(`⚠️  Unsupported platform: ${url}`);
      return;
    }
    
    console.log(`✅ Detected ${platform} site: ${url}`);
    
    await page.evaluate((code) => {
      const script = document.createElement('script');
      script.textContent = code;
      document.head.appendChild(script);
    }, this.overlayCode);
    
    console.log('✅ Kri overlay injected');
  }
};