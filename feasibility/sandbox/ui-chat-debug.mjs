import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const artifacts = 'D:/Program/dsh-tripo-support/feasibility/artifacts/formal';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3000);
  const clicked = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('button, a, [role="button"], div, span')];
    const element = candidates.find((item) => (item.innerText || '').trim().startsWith('请用 3D 生成服务做一个低多边'));
    if (!element) return false;
    (element.closest('button, a, [role="button"]') || element).click();
    return true;
  });
  console.log(`session clicked=${clicked}`);
  await wait(2500);
  const text = await page.evaluate(() => document.body.innerText);
  await writeFile(`${artifacts}/chat-reopen.txt`, text, 'utf8');
  await page.screenshot({ path: `${artifacts}/chat-reopen.png`, fullPage: true });
  console.log(text.slice(0, 3000));
  const matches = await page.evaluate(() => [...document.querySelectorAll('*')].filter((el) => el.children.length === 0 && /3D|create_3d|tool|模型/.test(el.innerText || '')).map((el) => ({ tag: el.tagName, text: (el.innerText || '').slice(0, 160), cls: el.className })).slice(0, 80));
  await writeFile(`${artifacts}/chat-dom.json`, JSON.stringify(matches, null, 2), 'utf8');
  console.log(JSON.stringify(matches, null, 2));
} finally {
  await browser.close();
}
