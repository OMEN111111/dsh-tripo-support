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
  await wait(3500);
  const editor = await page.$('[contenteditable="true"]');
  await editor.click();
  await page.keyboard.type('请生成一个低多边形宝箱');
  await page.keyboard.press('Enter');
  await wait(12000);
  const clicked = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('button, [role="button"], div, span')];
    const element = candidates.find((item) => (item.innerText || '').trim().startsWith('已完成，用时'));
    if (!element) return false;
    (element.closest('button, [role="button"]') || element).click();
    return true;
  });
  console.log(`turn expanded=${clicked}`);
  await wait(8000);
  const info = await page.evaluate(() => {
    const viewers = [...document.querySelectorAll('model-viewer')].map((v) => ({ loaded: v.loaded ?? null, visible: v.modelIsVisible ?? null, src: v.getAttribute('src') }));
    return { viewers, text: document.body.innerText };
  });
  await writeFile(`${artifacts}/chat-expanded.txt`, info.text, 'utf8');
  await page.screenshot({ path: `${artifacts}/chat-expanded.png`, fullPage: true });
  console.log(JSON.stringify(info.viewers));
  console.log(info.text.slice(-3000));
} finally {
  await browser.close();
}
