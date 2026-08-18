import { chromium } from 'playwright';
import fs from 'node:fs';

const outDir = 'D:/Craft/.impeccable/review';
fs.mkdirSync(outDir, { recursive: true });

const browser = await chromium.launch();

async function shoot(width, height, name, isMobile) {
  const ctx = await browser.newContext({
    viewport: { width, height },
    isMobile: !!isMobile,
    hasTouch: !!isMobile,
    deviceScaleFactor: isMobile ? 2 : 1,
  });
  const page = await ctx.newPage();
  await page.goto('http://localhost:8743/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(900); // let reveal animations settle
  await page.screenshot({ path: `${outDir}/${name}.png`, fullPage: true });
  await ctx.close();
  console.log('captured', name);
}

await shoot(1440, 900, 'desktop', false);
await shoot(390, 844, 'mobile', true);

await browser.close();
