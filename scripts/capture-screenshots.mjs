import { chromium } from 'playwright';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const baseUrl = process.env.SCREENSHOT_URL || 'http://127.0.0.1:3107';
const outDir = path.resolve('docs/screenshots');
const captures = [
  {"file": "01-policy-book.png", "description": "Policy book with active policies, risk scores, and coverage", "heading": "Policy Book"},
  {"file": "02-claims-pipeline.png", "description": "Claims pipeline with fraud detection and processing stages", "heading": "Claims Pipeline"},
  {"file": "03-recent-claims.png", "description": "Recent claims with AI triage rationale and governance checkpoints", "heading": "Recent Claims"},
  {"file": "04-customer-portal.png", "description": "Customer portal with policy and claims context", "heading": "Customer Portal"},
  {"file": "05-risk-analytics.png", "description": "Risk analytics with customer and portfolio scoring", "heading": "Risk Analytics"},
  {"file": "06-agency-metrics.png", "description": "Agency performance metrics and customer risk scores", "heading": "Agency Metrics"}
];

await rm(outDir, { recursive: true, force: true });
await mkdir(outDir, { recursive: true });
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1100 }, deviceScaleFactor: 1 });
await page.emulateMedia({ colorScheme: 'light', reducedMotion: 'reduce' });
await page.goto(baseUrl, { waitUntil: 'networkidle' });

const manifest = [];
for (const capture of captures) {
  const heading = page.getByRole('heading', { name: capture.heading, exact: true }).first();
  await heading.waitFor({ state: 'visible', timeout: 10000 });
  let panel = heading.locator('xpath=ancestor::*[(self::section or self::article or self::div) and contains(@class,"rounded")][1]');
  if (await panel.count() === 0) panel = heading.locator('xpath=ancestor::section[1]');
  if (await panel.count() === 0) throw new Error(`No panel found for ${capture.heading}`);
  await panel.scrollIntoViewIfNeeded();
  await page.waitForTimeout(150);
  await panel.screenshot({ path: path.join(outDir, capture.file), animations: 'disabled' });
  manifest.push({ file: `docs/screenshots/${capture.file}`, description: capture.description });
}
await page.screenshot({ path: path.join(outDir, '00-full-page.png'), fullPage: true, animations: 'disabled' });
manifest.push({ file: 'docs/screenshots/00-full-page.png', description: 'Full-page portfolio demo screenshot' });
await browser.close();
console.log(JSON.stringify({ ok: true, baseUrl, screenshots: manifest }, null, 2));
