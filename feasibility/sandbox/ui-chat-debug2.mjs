import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const artifacts = 'D:/Program/dsh-tripo-support/feasibility/artifacts/formal';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const logs = [];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
page.on('console', (message) => {
  const text = message.text();
  if (text.includes('dsh-tripo-support')) logs.push(text);
});
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3500);
  const editor = await page.$('[contenteditable="true"]');
  await editor.click();
  await page.keyboard.type('请生成一个低多边形宝箱');
  await page.keyboard.press('Enter');
  await wait(12000);
  let text = await page.evaluate(() => document.body.innerText);
  await writeFile(`${artifacts}/chat-debug2-step1.txt`, text, 'utf8');
  const expand = await page.evaluate(() => {
    const candidates = [...document.querySelectorAll('button, [role="button"], div, span')];
    const element = candidates.find((item) => /已完成|1 轮 2 步|2 步/.test((item.innerText || '').trim()) && (item.innerText || '').length < 40);
    if (!element) return false;
    (element.closest('button, [role="button"]') || element).click();
    return true;
  });
  console.log(`expand=${expand}`);
  await wait(2500);
  text = await page.evaluate(() => document.body.innerText);
  await writeFile(`${artifacts}/chat-debug2-final.txt`, text, 'utf8');
  const viewers = await page.evaluate(() => [...document.querySelectorAll('model-viewer')].map((v) => ({ loaded: v.loaded ?? null, visible: v.modelIsVisible ?? null, src: v.getAttribute('src') })));
  await page.screenshot({ path: `${artifacts}/chat-debug2.png`, fullPage: true });
  await writeFile(`${artifacts}/chat-debug2-logs.txt`, logs.join('\n'), 'utf8');
  console.log(`viewers=${JSON.stringify(viewers)}`);
  console.log(`logs=${logs.length}`);
  console.log(logs.slice(0, 5).join('\n'));
  console.log(text.slice(-2500));
} finally {
  await browser.close();
}
