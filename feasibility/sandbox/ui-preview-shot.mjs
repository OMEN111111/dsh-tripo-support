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
  await page.evaluate(() => {
    const select = [...document.querySelectorAll('select')].find((item) => [...item.options].some((option) => option.value === 'qwenai-dashscope'));
    if (select) { select.value = 'qwenai-dashscope'; select.dispatchEvent(new Event('change', { bubbles: true })); }
  });
  await wait(1200);
  const clicked = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => candidate.innerText.trim() === '执行操作');
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`run=${clicked}`);
  await wait(14000);
  await page.evaluate(() => {
    const card = document.querySelector('section[aria-label="3D generation services"]');
    let el = card?.parentElement;
    while (el) {
      const style = getComputedStyle(el);
      if ((style.overflowY === 'auto' || style.overflowY === 'scroll') && el.scrollHeight > el.clientHeight) { el.scrollTop = el.scrollHeight; break; }
      el = el.parentElement;
    }
  });
  await wait(2500);
  const status = await page.evaluate(() => {
    const viewer = document.querySelector('model-viewer');
    return { present: Boolean(viewer), loaded: viewer?.loaded ?? null, visible: viewer?.modelIsVisible ?? null, src: viewer?.getAttribute('src') || null };
  });
  await writeFile(`${artifacts}/operation-preview.json`, JSON.stringify(status, null, 2), 'utf8');
  await page.screenshot({ path: `${artifacts}/operation-preview.png`, fullPage: true });
  console.log(JSON.stringify(status));
} finally {
  await browser.close();
}
