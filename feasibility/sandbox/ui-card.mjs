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
    const target = element.closest('button, a, [role="button"], [role="menuitem"], li') || element;
    target.click();
    return true;
  }, wanted, mode);
  console.log(`click(${mode}) ${wanted} => ${clicked}`);
  await wait(1600);
  return clicked;
}

async function openModels() {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(4000);
  await click('添加 API Key');
  await wait(700);
  await click('稍后配置', 'contains');
  await wait(1000);
  await click('账号菜单');
  await wait(1600);
  await click('设置');
  await wait(2500);
  await click('模型');
  await wait(2500);
}

try {
  await openModels();
  const tokens = await page.evaluate(() => {
    const style = getComputedStyle(document.documentElement);
    return {
      brand: style.getPropertyValue('--dsw-alias-brand-primary').trim(),
      bgBase: style.getPropertyValue('--dsw-alias-bg-base').trim(),
      bgLayer1: style.getPropertyValue('--dsw-alias-bg-layer-1').trim(),
      label: style.getPropertyValue('--dsw-alias-label-primary').trim(),
      theme: document.documentElement.getAttribute('data-theme') || document.documentElement.className,
    };
  });
  console.log(`tokens=${JSON.stringify(tokens)}`);

  const card = await page.$('section[aria-label="3D generation services"]');
  if (!card) {
    const debugText = await page.evaluate(() => document.body.innerText);
    await writeFile(join(artifacts, '06-missing-card-text.txt'), debugText, 'utf8');
    await page.screenshot({ path: join(artifacts, '06-missing-card.png'), fullPage: true });
    throw new Error(`3D card not found; page text saved. Tail: ${debugText.slice(-800)}`);
  }
  await page.evaluate(() => {
    const element = document.querySelector('section[aria-label="3D generation services"]');
    element.scrollIntoView({ block: 'start', behavior: 'instant' });
  });
  await wait(800);
  await card.screenshot({ path: join(artifacts, '06-card.png'), captureBeyondViewport: true });
  let text = await page.evaluate(() => document.querySelector('section[aria-label="3D generation services"]').innerText);
  await writeFile(join(artifacts, '06-card-text.txt'), text, 'utf8');
  console.log(`--- card ---\n${text}`);

  // Test the Tripo connection from the actual card button.
  const testClicked = await page.evaluate(() => {
    const card = document.querySelector('section[aria-label="3D generation services"]');
    const provider = [...card.querySelectorAll('div')].find((div) => div.innerText?.trim().startsWith('Tripo\n') || div.innerText?.trim().startsWith('Tripo '));
    const button = [...card.querySelectorAll('button')].find((candidate) => candidate.innerText.trim() === '测试连接');
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`ui test clicked=${testClicked}`);
  await wait(2500);
  text = await page.evaluate(() => document.querySelector('section[aria-label="3D generation services"]').innerText);
  await writeFile(join(artifacts, '07-after-test-text.txt'), text, 'utf8');
  console.log(`--- after test ---\n${text}`);

  // Generate a model through the card's end-to-end row.
  const generateClicked = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => candidate.innerText.trim() === '生成测试模型');
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`ui generate clicked=${generateClicked}`);
  await wait(12000);
  text = await page.evaluate(() => document.querySelector('section[aria-label="3D generation services"]').innerText);
  await writeFile(join(artifacts, '08-after-generate-text.txt'), text, 'utf8');
  await page.screenshot({ path: join(artifacts, '08-after-generate.png'), fullPage: true });
  console.log(`--- after generate ---\n${text}`);
} finally {
  await browser.close();
}
