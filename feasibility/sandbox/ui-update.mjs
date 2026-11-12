import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const artifacts = 'D:/Program/dsh-tripo-support/feasibility/artifacts/ui-redesign';
await mkdir(artifacts, { recursive: true });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
const errors = [];
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
page.on('pageerror', (e) => errors.push(String(e)));
async function clickExact(text) {
  const clicked = await page.evaluate((wanted) => {
    const candidates = [...document.querySelectorAll('button, a, [role="button"], [role="tab"], div, span')];
    const matches = candidates.filter((item) => (item.innerText || '').trim() === wanted || (item.getAttribute('aria-label') || '').trim() === wanted);
    const element = matches.find((item) => item.children.length === 0) || matches[0];
    if (!element) return false;
    (element.closest('button, a, [role="button"], [role="tab"]') || element).click();
    return true;
  }, text);
  await wait(1200);
  return clicked;
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3500);
  await clickExact('添加 API Key');
  await wait(500);
  await clickExact('稍后配置');
  await wait(900);
  await page.evaluate(() => { const b = document.querySelector('button[aria-label="账号菜单"]'); if (b) b.click(); });
  await wait(1300);
  await clickExact('设置');
  await wait(2000);
  const section = await clickExact('3D 生成');
  console.log(`section=${section}`);
  await wait(2200);
  const text = await page.evaluate(() => document.body.innerText);
  await writeFile(`${artifacts}/settings-3d-update.txt`, text, 'utf8');
  await page.screenshot({ path: `${artifacts}/settings-3d-update.png`, fullPage: true });
  console.log(text.slice(-1000));
  console.log('ERRORS=' + JSON.stringify(errors.slice(-10)));
} finally { await browser.close(); }
