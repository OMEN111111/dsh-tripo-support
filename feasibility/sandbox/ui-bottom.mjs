import { createRequire } from 'node:module';
import { writeFile, mkdir } from 'node:fs/promises';
import { join } from 'node:path';

const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const root = 'D:/Program/dsh-tripo-support/feasibility';
const artifacts = join(root, 'artifacts');
const url = process.env.DSH_URL;
if (!url) throw new Error('DSH_URL is required');
await mkdir(artifacts, { recursive: true });
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
  console.log(`click(${mode}) ${wanted} => ${clicked}`);
  await wait(1500);
  return clicked;
}

async function scrollCardBottom() {
  return page.evaluate(() => {
    const card = document.querySelector('section[aria-label="3D generation services"]');
    if (!card) return false;
    let element = card.parentElement;
    while (element) {
      const style = getComputedStyle(element);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && element.scrollHeight > element.clientHeight) {
        element.scrollTop = element.scrollHeight;
        return true;
      }
      element = element.parentElement;
    }
    card.scrollIntoView({ block: 'end' });
    return true;
  });
}

async function dump(label) {
  await scrollCardBottom();
  await wait(700);
  await page.screenshot({ path: join(artifacts, `${label}.png`), fullPage: true });
  const text = await page.evaluate(() => document.querySelector('section[aria-label="3D generation services"]')?.innerText || '');
  await writeFile(join(artifacts, `${label}-text.txt`), text, 'utf8');
  console.log(`--- ${label} ---\n${text.slice(-1600)}`);
}

try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(4000);
  await click('添加 API Key');
  await wait(700);
  await click('稍后配置', 'contains');
  await wait(1000);
  await click('账号菜单');
  await wait(1500);
  await click('设置');
  await wait(2200);
  await click('模型');
  await wait(2200);
  await dump('10-card-bottom');
  const clicked = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => candidate.innerText.trim() === '生成测试模型');
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`generate clicked=${clicked}`);
  await wait(12000);
  await dump('11-generate-result');
} finally {
  await browser.close();
}
