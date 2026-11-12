import { createRequire } from 'node:module';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const url = process.env.DSH_URL;
const wait = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
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
  await wait(1200);
  const info = await page.evaluate(() => {
    const chain = (start) => {
      const out = [];
      let current = start;
      for (let i = 0; i < 8 && current; i += 1) {
        const rect = current.getBoundingClientRect();
        const style = getComputedStyle(current);
        out.push({ tag: current.tagName, cls: String(current.className).slice(0, 100), role: current.getAttribute('role'), display: style.display, visibility: style.visibility, opacity: style.opacity, height: style.height, text: (current.innerText || '').slice(0, 80), rect: { x: Math.round(rect.x), y: Math.round(rect.y), w: Math.round(rect.width), h: Math.round(rect.height) } });
        current = current.parentElement;
      }
      return out;
    };
    const viewer = document.querySelector('model-viewer');
    const toolLabel = [...document.querySelectorAll('*')].filter((el) => (el.innerText || '').trim() === '已调用工具').sort((a, b) => a.innerText.length - b.innerText.length)[0];
    return { viewer: viewer ? chain(viewer) : null, toolLabel: toolLabel ? chain(toolLabel) : null };
  });
  console.log(JSON.stringify(info, null, 2));
} finally {
  await browser.close();
}
