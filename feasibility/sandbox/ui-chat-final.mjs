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
async function clickText(text, startsWith = false) {
  const clicked = await page.evaluate((wanted, prefix) => {
    const candidates = [...document.querySelectorAll('button, [role="button"], div, span')];
    const element = candidates.find((item) => {
      const value = (item.innerText || '').trim();
      return prefix ? value.startsWith(wanted) : value === wanted;
    });
    if (!element) return false;
    (element.closest('button, [role="button"]') || element).click();
    return true;
  }, text, startsWith);
  await wait(1000);
  return clicked;
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3500);
  const editor = await page.$('[contenteditable="true"]');
  await editor.click();
  await page.keyboard.type('请生成一个低多边形宝箱');
  await page.keyboard.press('Enter');
  await wait(12000);
  console.log('turn=' + await clickText('已完成，用时', true));
  await wait(1200);
  console.log('tool=' + await clickText('已调用工具'));
  await wait(12000);
  await page.evaluate(() => document.querySelector('model-viewer')?.scrollIntoView({ block: 'center', behavior: 'instant' }));
  await wait(4000);
  const info = await page.evaluate(() => ({
    viewers: [...document.querySelectorAll('model-viewer')].map((v) => ({ loaded: v.loaded ?? null, visible: v.modelIsVisible ?? null, src: v.getAttribute('src') })),
    text: document.body.innerText,
  }));
  await writeFile(`${artifacts}/chat-final-tool.txt`, info.text, 'utf8');
  await page.screenshot({ path: `${artifacts}/chat-final-tool.png`, fullPage: true });
  console.log(JSON.stringify(info.viewers));
  console.log(info.text.slice(-3000));
} finally { await browser.close(); }
