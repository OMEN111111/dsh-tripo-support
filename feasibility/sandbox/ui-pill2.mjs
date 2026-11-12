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
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3500);
  // dismiss onboarding if present
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').trim() === '添加 API Key');
    if (button) button.click();
  });
  await wait(700);
  await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((b) => (b.innerText || '').includes('稍后配置'));
    if (button) button.click();
  });
  await wait(1000);
  const opened = await page.evaluate(() => {
    const button = document.querySelector('button.dsh-3d-pill');
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`pill opened=${opened}`);
  await wait(1000);
  await page.screenshot({ path: `${artifacts}/pill-open.png`, fullPage: true });
  let text = await page.evaluate(() => document.body.innerText);
  console.log(text.slice(-1200));
  const providerClicked = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button.dsh-3d-menu-option')].find((b) => (b.innerText || '').includes('qwenai'));
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`provider clicked=${providerClicked}`);
  await wait(1200);
  await page.screenshot({ path: `${artifacts}/pill-provider-expanded.png`, fullPage: true });
  const modelClicked = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button.dsh-3d-menu-model')].find((b) => (b.innerText || '').includes('Tripo-Texture'));
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`model clicked=${modelClicked}`);
  await wait(1500);
  const result = await page.evaluate(async () => {
    const status = await (await fetch('/plugins/dsh-tripo-support/status')).json();
    const pill = document.querySelector('button.dsh-3d-pill')?.innerText || '';
    return { pill, selection: status.selection, errors: [] };
  });
  result.errors = errors;
  await writeFile(`${artifacts}/pill-result.json`, JSON.stringify(result, null, 2), 'utf8');
  await page.screenshot({ path: `${artifacts}/pill-selected.png`, fullPage: true });
  console.log(JSON.stringify(result));
} finally { await browser.close(); }
