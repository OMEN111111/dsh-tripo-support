import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const root = 'D:/Program/dsh-tripo-support/feasibility';
const artifacts = join(root, 'artifacts');
const url = process.env.DSH_URL;
const clickText = process.env.CLICK_TEXT || '';
const label = process.env.LABEL || 'step';
if (!url) throw new Error('DSH_URL is required');
await mkdir(artifacts, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise((resolve) => setTimeout(resolve, 2500));
  if (clickText) {
    const clicked = await page.evaluate((wanted) => {
      const candidates = [...document.querySelectorAll('button, a, [role="button"], [role="tab"]')];
      const element = candidates.find((candidate) => {
        const text = (candidate.innerText || '').trim();
        const aria = (candidate.getAttribute('aria-label') || '').trim();
        return text === wanted || aria === wanted;
      });
      if (!element) return false;
      element.click();
      return true;
    }, clickText);
    console.log(`clicked ${clickText}=${clicked}`);
    await new Promise((resolve) => setTimeout(resolve, 2500));
  }
  await page.screenshot({ path: join(artifacts, `${label}.png`), fullPage: true });
  const text = await page.evaluate(() => document.body.innerText);
  await writeFile(join(artifacts, `${label}-text.txt`), text, 'utf8');
  const controls = await page.evaluate(() => [...document.querySelectorAll('button, a, [role="button"], [role="tab"], input, select')].map((element) => {
    const rect = element.getBoundingClientRect();
    if (rect.width === 0 && rect.height === 0) return null;
    return {
      tag: element.tagName,
      text: (element.innerText || element.getAttribute('aria-label') || element.getAttribute('placeholder') || '').trim().slice(0, 160),
      aria: element.getAttribute('aria-label'),
      placeholder: element.getAttribute('placeholder'),
      x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height),
    };
  }).filter(Boolean));
  await writeFile(join(artifacts, `${label}-controls.json`), JSON.stringify(controls, null, 2), 'utf8');
  console.log(`url=${page.url()}`);
  console.log(text.slice(0, 3000));
} finally {
  await browser.close();
}
