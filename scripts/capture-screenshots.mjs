import { chromium } from 'playwright';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.SCREENSHOT_URL || 'http://127.0.0.1:3107';
const outDir = path.resolve('docs/screenshots');

const captures = [
  {
    file: '01-dashboard-hero.png',
    description: 'Dashboard hero with insurance agency KPIs',
    locator: 'header'
  },
  {
    file: '02-policy-book.png',
    description: 'Policy book with active policies, risk scores, and coverage',
    locator: ':has-text("Policy Book")'
  },
  {
    file: '03-claims-pipeline.png',
    description: 'Claims pipeline with fraud detection and processing stages',
    locator: ':has-text("Claims Pipeline")'
  },
  {
    file: '04-recent-claims.png',
    description: 'Recent claims with AI triage rationale and governance checkpoints',
    locator: ':has-text("Recent Claims")'
  },
  {
    file: '05-customer-risk-analytics.png',
    description: 'Customer portal and risk analytics dashboard',
    locator: ':has-text("Customer Portal")'
  },
  {
    file: '06-agency-metrics.png',
    description: 'Agency performance metrics and customer risk scores',
    locator: ':has-text("Agency Metrics")'
  },
  {
    file: '00-full-page.png',
    description: 'Full-page portfolio demo screenshot',
    fullPage: true
  }
];

await mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
await page.goto(baseUrl, { waitUntil: 'networkidle' });
await page.emulateMedia({ colorScheme: 'light' });

const manifest = [];
for (const capture of captures) {
  const outputPath = path.join(outDir, capture.file);
  if (capture.fullPage) {
    await page.screenshot({ path: outputPath, fullPage: true });
  } else {
    const element = page.locator(capture.locator).first();
    await element.scrollIntoViewIfNeeded();
    await element.screenshot({ path: outputPath });
  }
  manifest.push({ file: `docs/screenshots/${capture.file}`, description: capture.description });
}

await browser.close();
console.log(JSON.stringify({ ok: true, baseUrl, screenshots: manifest }, null, 2));
