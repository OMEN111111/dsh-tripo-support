import { createRequire } from 'node:module';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const errors = [];
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
page.on('console', (m) => { if (['error', 'warning'].includes(m.type())) errors.push(`${m.type()}: ${m.text()}`); });
page.on('requestfailed', (r) => errors.push(`requestfailed: ${r.url()} ${r.failure()?.errorText}`));
await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(3500);
  const editor = await page.$('[contenteditable="true"]');
  await editor.click();
  await page.keyboard.type('请生成一个低多边形宝箱');
  await page.keyboard.press('Enter');
  await wait(12000);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('button, [role="button"], div, span')].find((item) => (item.innerText || '').trim().startsWith('已完成，用时'));
    if (el) (el.closest('button, [role="button"]') || el).click();
  });
  await wait(1000);
  await page.evaluate(() => {
    const el = [...document.querySelectorAll('button, [role="button"], div, span')].find((item) => (item.innerText || '').trim() === '已调用工具');
    if (el) (el.closest('button, [role="button"]') || el).click();
  });
  await wait(10000);
  const info = await page.evaluate(async () => {
    const viewer = document.querySelector('model-viewer');
    let fetchStatus = null;
    let fetchError = null;
    if (viewer?.getAttribute('src')) {
      try { const r = await fetch(viewer.getAttribute('src')); fetchStatus = r.status; } catch (e) { fetchError = String(e); }
    }
    return {
      custom: Boolean(customElements.get('model-viewer')),
      viewer: viewer ? { loaded: viewer.loaded, visible: viewer.modelIsVisible, error: viewer.error ? String(viewer.error) : null, src: viewer.getAttribute('src'), w: viewer.getBoundingClientRect().width, h: viewer.getBoundingClientRect().height } : null,
      fetchStatus,
      fetchError,
      resources: performance.getEntriesByType('resource').filter((r) => r.name.includes('model') || r.name.includes('tripo')).map((r) => ({ name: r.name, duration: Math.round(r.duration), size: r.transferSize })),
    };
  });
  console.log(JSON.stringify(info, null, 2));
  console.log('ERRORS=' + JSON.stringify(errors.slice(-20), null, 2));
} finally { await browser.close(); }
