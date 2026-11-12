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
const browser = await puppeteer.launch({
  executablePath: 'C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe',
  headless: true,
  args: ['--no-sandbox', '--disable-gpu', '--window-size=1440,1100'],
});
try {
  const page = await browser.newPage();
  await page.setViewport({ width: 1440, height: 1100, deviceScaleFactor: 1 });
  await page.goto(url, { waitUntil: 'networkidle2', timeout: 90000 });
  await new Promise((resolve) => setTimeout(resolve, 3000));
  await page.screenshot({ path: join(artifacts, '01-home.png'), fullPage: true });
  const text = await page.evaluate(() => document.body.innerText);
  await writeFile(join(artifacts, 'page-text.txt'), text, 'utf8');
  const controls = await page.evaluate(() => {
    const items = [];
    for (const element of document.querySelectorAll('button, a, [role="button"], [role="tab"], input, select')) {
      const rect = element.getBoundingClientRect();
      if (rect.width === 0 && rect.height === 0) continue;
      items.push({
        tag: element.tagName,
        text: (element.innerText || element.getAttribute('aria-label') || element.getAttribute('placeholder') || '').trim().slice(0, 120),
        aria: element.getAttribute('aria-label'),
        role: element.getAttribute('role'),
        type: element.getAttribute('type'),
        placeholder: element.getAttribute('placeholder'),
        x: Math.round(rect.x),
        y: Math.round(rect.y),
        w: Math.round(rect.width),
        h: Math.round(rect.height),
      });
    }
    return items;
  });
  await writeFile(join(artifacts, 'controls.json'), JSON.stringify(controls, null, 2), 'utf8');
  console.log(`title=${await page.title()}`);
  console.log(`url=${page.url()}`);
  console.log(`text_length=${text.length}`);
  console.log(text.slice(0, 2000));
} finally {
  await browser.close();
}
