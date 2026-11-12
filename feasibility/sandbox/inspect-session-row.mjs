import { createRequire } from 'node:module';
const require = createRequire('C:/Users/31949/.dsh/profiles/desktop/node_modules/');
const puppeteer = require('puppeteer-core');
const browser = await puppeteer.launch({ executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe', headless: true, args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'] });
const page = await browser.newPage();
await page.goto(process.env.DSH_URL, { waitUntil: 'domcontentloaded', timeout: 120000 });
await new Promise((r) => setTimeout(r, 3000));
const info = await page.evaluate(() => {
  const el = [...document.querySelectorAll('*')].filter((item) => (item.innerText || '').includes('请用 3D')).sort((a,b) => a.innerText.length - b.innerText.length)[0];
  if (!el) return null;
  const chain = [];
  let current = el;
  for (let i = 0; i < 8 && current; i += 1) {
    chain.push({ tag: current.tagName, role: current.getAttribute('role'), cls: current.className, text: (current.innerText || '').slice(0, 80), rect: (() => { const r = current.getBoundingClientRect(); return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height) }; })() });
    current = current.parentElement;
  }
  return chain;
});
console.log(JSON.stringify(info, null, 2));
await browser.close();


