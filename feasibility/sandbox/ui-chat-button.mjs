import { createRequire } from 'node:module';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3500);
  const editor = await page.$('[contenteditable="true"]');
  await editor.click();
  await page.keyboard.type('请生成一个低多边形宝箱');
  await page.keyboard.press('Enter');
  await wait(12000);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('button')].find((item) => (item.innerText || '').trim().startsWith('已完成，用时'));
    if (el) el.click();
  });
  await wait(1000);
  const clicked = await page.evaluate(() => {
    const btn = [...document.querySelectorAll('button.BE0jCW_title, button')].find((item) => (item.innerText || '').trim() === '已调用工具');
    if (!btn) return false;
    btn.click();
    return true;
  });
  console.log(`tool button clicked=${clicked}`);
  await wait(12000);
  await page.evaluate(() => document.querySelector('model-viewer')?.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(3000);
  const info = await page.evaluate(() => ({
    expanded: [...document.querySelectorAll('button.BE0jCW_title')].map((b) => ({ text: b.innerText.trim(), expanded: b.getAttribute('aria-expanded') })),
    viewers: [...document.querySelectorAll('model-viewer')].map((v) => ({ loaded: v.loaded, visible: v.modelIsVisible, src: v.getAttribute('src') })),
  }));
  console.log(JSON.stringify(info, null, 2));
  await page.screenshot({ path: 'D:/Program/dsh-tripo-support/feasibility/artifacts/formal/chat-3d-preview.png', fullPage: true });
} finally { await browser.close(); }
