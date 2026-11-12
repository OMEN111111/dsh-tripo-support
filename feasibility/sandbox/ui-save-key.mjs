import { createRequire } from 'node:module';
import { writeFile } from 'node:fs/promises';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const artifacts = 'D:/Program/dsh-tripo-support/feasibility/artifacts';
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'],
});
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
async function click(wanted, mode = 'exact') {
  const clicked = await page.evaluate((text, matchMode) => {
    const candidates = [...document.querySelectorAll('button, a, [role="button"], [role="tab"], [role="menuitem"], li, div, span')];
    const matches = candidates.filter((candidate) => {
      const value = (candidate.innerText || '').trim();
      const aria = (candidate.getAttribute('aria-label') || '').trim();
      return matchMode === 'contains' ? value.includes(text) || aria.includes(text) : value === text || aria === text;
    });
    const element = matches.find((candidate) => candidate.children.length === 0) || matches[0];
    if (!element) return false;
    (element.closest('button, a, [role="button"], [role="menuitem"], li') || element).click();
    return true;
  }, wanted, mode);
  await wait(1400);
  return clicked;
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(4000);
  await click('添加 API Key');
  await wait(600);
  await click('稍后配置', 'contains');
  await wait(900);
  await click('账号菜单');
  await wait(1400);
  await click('设置');
  await wait(2000);
  await click('模型');
  await wait(2000);
  const input = await page.$('section[aria-label="3D generation services"] input[type="password"]');
  if (!input) throw new Error('no password input');
  await input.click({ clickCount: 3 });
  await input.type('test-tripo-key');
  const clicked = await page.evaluate(() => {
    const card = document.querySelector('section[aria-label="3D generation services"]');
    const button = [...card.querySelectorAll('button')].find((candidate) => candidate.innerText.trim() === '保存密钥');
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`save clicked=${clicked}`);
  await wait(2500);
  const text = await page.evaluate(() => document.querySelector('section[aria-label="3D generation services"]')?.innerText || '');
  await writeFile(`${artifacts}/12-save-key-text.txt`, text, 'utf8');
  await page.screenshot({ path: `${artifacts}/12-save-key.png`, fullPage: true });
  console.log(text.slice(0, 600));
  console.log(`contains_saved=${text.includes('密钥已保存')}`);
} finally {
  await browser.close();
}
