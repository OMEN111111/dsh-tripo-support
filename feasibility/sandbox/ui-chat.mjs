import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const artifacts = 'D:/Program/dsh-tripo-support/feasibility/artifacts/formal';
await mkdir(artifacts, { recursive: true });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(4000);
  const editors = await page.evaluate(() => [...document.querySelectorAll('[contenteditable="true"], textarea, [role="textbox"]')].map((element) => ({ tag: element.tagName, cls: element.className, placeholder: element.getAttribute('placeholder') || element.getAttribute('aria-label') || '' })));
  console.log(JSON.stringify(editors, null, 2));
  const editor = await page.$('[contenteditable="true"], textarea, [role="textbox"]');
  if (!editor) throw new Error('no editor');
  await editor.click();
  await page.keyboard.type('请用 3D 生成服务做一个低多边形宝箱');
  await page.keyboard.press('Enter');
  console.log('submitted');
  await wait(6000);
  let text = await page.evaluate(() => document.body.innerText);
  await writeFile(`${artifacts}/chat-step1.txt`, text, 'utf8');
  await page.screenshot({ path: `${artifacts}/chat-step1.png`, fullPage: true });
  console.log(text.slice(0, 2500));
  await wait(16000);
  text = await page.evaluate(() => document.body.innerText);
  await writeFile(`${artifacts}/chat-final.txt`, text, 'utf8');
  const viewers = await page.evaluate(() => [...document.querySelectorAll('model-viewer')].map((viewer) => ({ loaded: viewer.loaded ?? null, visible: viewer.modelIsVisible ?? null, src: viewer.getAttribute('src') })));
  await writeFile(`${artifacts}/chat-viewers.json`, JSON.stringify(viewers, null, 2), 'utf8');
  await page.screenshot({ path: `${artifacts}/chat-final.png`, fullPage: true });
  console.log('VIEWERS=' + JSON.stringify(viewers));
  console.log(text.slice(-3000));
} finally {
  await browser.close();
}
