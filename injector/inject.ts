import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import Detector from './detect.ts';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class Injector {
  overlayCode: string;

  constructor() {
    this.overlayCode = fs.readFileSync(path.join(__dirname, '..', 'overlay', 'kri-overlay.ts'), 'utf8');
  }

  async inject(page, url) {
    const html = await page.content();
    const platform = Detector.detect(url, html);

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
}
