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
    const el = [...document.querySelectorAll('button, [role="button"], div, span')].find((item) => (item.innerText || '').trim().startsWith('已完成，用时'));
    if (el) (el.closest('button, [role="button"]') || el).click();
  });
  await wait(1500);
  const html = await page.evaluate(() => {
    const el = [...document.querySelectorAll('div')].find((item) => (item.innerText || '').trim() === '已调用工具');
    if (!el) return 'no label';
    return el.outerHTML.slice(0, 4000);
  });
  console.log(html);
  const buttons = await page.evaluate(() => [...document.querySelectorAll('button')].map((b) => ({ text: (b.innerText || '').slice(0, 60), aria: b.getAttribute('aria-label'), title: b.getAttribute('title') })));
  console.log(JSON.stringify(buttons, null, 2));
} finally { await browser.close(); }
