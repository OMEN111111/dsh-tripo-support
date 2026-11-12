import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
async function clickExact(text) {
  await page.evaluate((wanted) => {
    const candidates = [...document.querySelectorAll('button, [role="button"], div, span')];
    const matches = candidates.filter((item) => (item.innerText || '').trim() === wanted);
    const element = matches.find((item) => item.children.length === 0) || matches[0];
    if (element) (element.closest('button, [role="button"]') || element).click();
  }, text);
  await wait(1000);
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3500);
  await clickExact('添加 API Key'); await wait(500); await clickExact('稍后配置'); await wait(900);
  await page.evaluate(() => { const b = document.querySelector('button[aria-label="账号菜单"]'); if (b) b.click(); }); await wait(1300);
  await clickExact('设置'); await wait(2000); await clickExact('3D 生成'); await wait(1800);
  const clicked = await page.evaluate(() => {
    const cards = [...document.querySelectorAll('.dsh-3d-card')];
    const card = cards.find((item) => (item.innerText || '').includes('HY3D'));
    if (!card) return false;
    const button = [...card.querySelectorAll('button')].find((item) => item.innerText.trim() === '配置');
    if (!button) return false;
    button.click(); return true;
  });
  console.log(`hy3d=${clicked}`);
  await wait(1200);
  const text = await page.evaluate(() => {
    const card = [...document.querySelectorAll('.dsh-3d-card')].find((item) => (item.innerText || '').includes('HY3D'));
    return card?.innerText || '';
  });
  console.log(text);
  await page.screenshot({ path: 'D:/Program/dsh-tripo-support/feasibility/artifacts/ui-redesign/hy3d-auth.png', fullPage: true });
} finally { await browser.close(); }
