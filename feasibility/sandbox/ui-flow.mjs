import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const root = 'D:/Program/dsh-tripo-support/feasibility';
const artifacts = join(root, 'artifacts');
const url = process.env.DSH_URL;
if (!url) throw new Error('DSH_URL is required');
await mkdir(artifacts, { recursive: true });

const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

async function click(wanted, mode = 'exact') {
  const clicked = await page.evaluate((text, matchMode) => {
    const candidates = [...document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"]')];
    const element = candidates.find((candidate) => {
      const value = (candidate.innerText || '').trim();
      const aria = (candidate.getAttribute('aria-label') || '').trim();
      return matchMode === 'contains' ? value.includes(text) || aria.includes(text) : value === text || aria === text;
    });
    if (!element) return false;
    element.click();
    return true;
  }, wanted, mode);
  console.log(`click(${mode}) ${wanted} => ${clicked}`);
  await wait(1500);
  return clicked;
}

async function dump(label) {
  await page.screenshot({ path: join(artifacts, `${label}.png`), fullPage: true });
  const text = await page.evaluate(() => document.body.innerText);
  await writeFile(join(artifacts, `${label}-text.txt`), text, 'utf8');
  const controls = await page.evaluate(() => [...document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"], input, select')].map((element) => {
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
  console.log(`--- ${label} text ---\n${text.slice(0, 2500)}`);
}

try {
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  await wait(2500);
  await click('添加 API Key');
  await wait(1000);
  await click('稍后配置', 'contains');
  await wait(1500);
  await click('账号菜单');
  await wait(1000);
  await dump('03-account-menu');
} finally {
  await browser.close();
}
