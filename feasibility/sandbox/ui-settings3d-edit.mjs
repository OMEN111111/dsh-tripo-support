import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const artifacts = 'D:/Program/dsh-tripo-support/feasibility/artifacts/ui-redesign';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
async function clickExact(text) {
  const clicked = await page.evaluate((wanted) => {
    const candidates = [...document.querySelectorAll('button, [role="button"], div, span')];
    const matches = candidates.filter((item) => (item.innerText || '').trim() === wanted);
    const element = matches.find((item) => item.children.length === 0) || matches[0];
    if (!element) return false;
    (element.closest('button, [role="button"]') || element).click();
    return true;
  }, text);
  await wait(1000);
  return clicked;
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3500);
  await clickExact('添加 API Key');
  await wait(600);
  await clickExact('稍后配置');
  await wait(900);
  await page.evaluate(() => { const b = document.querySelector('button[aria-label="账号菜单"]'); if (b) b.click(); });
  await wait(1400);
  await clickExact('设置');
  await wait(2200);
  await clickExact('3D 生成');
  await wait(1800);
  const configClicked = await page.evaluate(() => { const b = [...document.querySelectorAll('button.dsh-3d-btn')].find((x) => x.innerText.trim() === '配置'); if (!b) return false; b.click(); return true; });
  console.log(`config=${configClicked}`);
  await wait(1000);
  await page.screenshot({ path: `${artifacts}/settings-official-edit.png`, fullPage: true });
  const advanced = await page.evaluate(() => { const b = [...document.querySelectorAll('button.dsh-3d-link')].find((x) => x.innerText.includes('高级')); if (!b) return false; b.click(); return true; });
  console.log(`advanced=${advanced}`);
  await wait(1000);
  await page.screenshot({ path: `${artifacts}/settings-official-advanced.png`, fullPage: true });
  const third = await page.evaluate(() => { const b = [...document.querySelectorAll('button.dsh-3d-tab')].find((x) => x.innerText.includes('第三方')); if (!b) return false; b.click(); return true; });
  console.log(`third=${third}`);
  await wait(1200);
  await page.screenshot({ path: `${artifacts}/settings-third.png`, fullPage: true });
  const add = await page.evaluate(() => { const b = [...document.querySelectorAll('button.dsh-3d-btn')].find((x) => x.innerText.includes('添加第三方')); if (!b) return false; b.click(); return true; });
  console.log(`add=${add}`);
  await wait(1000);
  await page.screenshot({ path: `${artifacts}/settings-third-add.png`, fullPage: true });
} finally { await browser.close(); }
