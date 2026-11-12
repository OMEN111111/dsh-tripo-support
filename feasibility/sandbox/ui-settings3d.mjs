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
async function click(wanted, contains = false) {
  const clicked = await page.evaluate((text, matchContains) => {
    const candidates = [...document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"], li, div, span')];
    const matches = candidates.filter((candidate) => {
      const value = (candidate.innerText || '').trim();
      const aria = (candidate.getAttribute('aria-label') || '').trim();
      return matchContains ? value.includes(text) || aria.includes(text) : value === text || aria === text;
    });
    const element = matches.find((candidate) => candidate.children.length === 0) || matches[0];
    if (!element) return false;
    (element.closest('button, a, [role="button"], [role="menuitem"], li') || element).click();
    return true;
  }, wanted, contains);
  await wait(1300);
  return clicked;
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3500);
  await click('添加 API Key');
  await wait(500);
  await click('稍后配置', true);
  await wait(900);
  await click('账号菜单');
  await wait(1400);
  await click('设置');
  await wait(2200);
  const nav = await click('3D 生成');
  console.log(`nav=${nav}`);
  await wait(2000);
  const text = await page.evaluate(() => document.body.innerText);
  await writeFile(`${artifacts}/settings-3d.txt`, text, 'utf8');
  await page.screenshot({ path: `${artifacts}/settings-3d.png`, fullPage: true });
  console.log(text.slice(0, 2200));
  console.log('ERRORS=' + JSON.stringify(errors.slice(-10)));
} finally { await browser.close(); }
