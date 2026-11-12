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
try {
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 120000 });
  await wait(4000);
  const clickText = async (wanted, contains = false) => {
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
    await wait(1000);
    return clicked;
  };
  await clickText('添加 API Key');
  await wait(500);
  await clickText('稍后配置', true);
  await wait(1200);
  let text = await page.evaluate(() => document.body.innerText);
  console.log(`has_pill=${text.includes('3D ·')}`);
  await page.screenshot({ path: `${artifacts}/13-composer-pill.png`, fullPage: true });
  const clicked = await page.evaluate(() => {
    const button = [...document.querySelectorAll('button')].find((candidate) => (candidate.innerText || '').includes('3D ·'));
    if (!button) return false;
    button.click();
    return true;
  });
  console.log(`pill clicked=${clicked}`);
  await wait(1500);
  await page.screenshot({ path: `${artifacts}/14-pill-open.png`, fullPage: true });
  text = await page.evaluate(() => document.body.innerText);
  await writeFile(`${artifacts}/14-pill-text.txt`, text, 'utf8');
  console.log(text.slice(0, 1600));
} finally {
  await browser.close();
}
