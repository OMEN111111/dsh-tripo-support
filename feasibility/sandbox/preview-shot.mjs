import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const artifacts = 'D:/Program/dsh-tripo-support/feasibility/artifacts';

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1000,760'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1000, height: 760, deviceScaleFactor: 1 });
  await page.goto('http://127.0.0.1:6127/preview', { waitUntil: 'domcontentloaded', timeout: 60000 });
  await new Promise((resolve) => setTimeout(resolve, 6000));
  const status = await page.evaluate(() => {
    const viewer = document.querySelector('model-viewer');
    return {
      customElement: Boolean(customElements.get('model-viewer')),
      loaded: viewer?.loaded ?? null,
      modelIsVisible: viewer?.modelIsVisible ?? null,
      src: viewer?.getAttribute('src'),
      error: viewer?.error ?? null,
    };
  });
  await page.screenshot({ path: `${artifacts}/09-model-preview.png` });
  await writeFile(`${artifacts}/09-model-preview.json`, JSON.stringify(status, null, 2), 'utf8');
  console.log(JSON.stringify(status, null, 2));
} finally {
  await browser.close();
}
