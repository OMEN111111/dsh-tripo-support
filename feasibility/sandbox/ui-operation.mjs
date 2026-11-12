import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const artifacts = 'D:/Program/dsh-tripo-support/feasibility/artifacts';
await mkdir(`${artifacts}/formal`, { recursive: true });
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
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
  await wait(1200);
  return clicked;
}
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(4000);
  await click('添加 API Key');
  await wait(500);
  await click('稍后配置', true);
  await wait(900);
  await click('账号菜单');
  await wait(1500);
  await click('设置');
  await wait(2200);
  await click('模型');
  await wait(2200);
  const selected = await page.evaluate(() => {
    const selects = [...document.querySelectorAll('select')];
    const providerSelect = selects.find((select) => [...select.options].some((option) => option.value === 'qwenai-dashscope'));
    if (!providerSelect) return 'no-provider-select';
    providerSelect.value = 'qwenai-dashscope';
    providerSelect.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok';
  });
  console.log(`provider select=${selected}`);
  await wait(1500);
  const operation = await page.evaluate(() => {
    const selects = [...document.querySelectorAll('select')];
    const operationSelect = selects.find((select) => [...select.options].some((option) => option.value === 'text_to_3d'));
    if (!operationSelect) return 'no-op-select';
    operationSelect.value = 'text_to_3d';
    operationSelect.dispatchEvent(new Event('change', { bubbles: true }));
    return 'ok';
  });
  console.log(`operation select=${operation}`);
  await wait(1000);
  const clicked = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => candidate.innerText.trim() === '执行操作');
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`run clicked=${clicked}`);
  await wait(14000);
  const text = await page.evaluate(() => document.querySelector('section[aria-label="3D generation services"]')?.innerText || '');
  await writeFile(`${artifacts}/formal/operation-result.txt`, text, 'utf8');
  await page.screenshot({ path: `${artifacts}/formal/operation-result.png`, fullPage: true });
  console.log(text.slice(-1800));
} finally {
  await browser.close();
}
