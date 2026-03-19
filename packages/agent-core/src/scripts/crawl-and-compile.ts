/**
 * Crawl each skill's website using Playwright (via Chrome CDP),
 * extract real selectors, and update compiled scripts.
 *
 * Usage: CHROME_CDP_ENDPOINT=http://127.0.0.1:9222 npx tsx packages/agent-core/src/scripts/crawl-and-compile.ts [--start=N] [--limit=N]
 *
 * Requires Chrome-Debug running on port 9222 with Profile 3.
 */

import { chromium, type Browser, type Page, type BrowserContext } from 'playwright';
import { readdirSync, readFileSync, writeFileSync, existsSync, mkdirSync } from 'fs';
import { join } from 'path';

const SKILLS_DIR = join(__dirname, '..', 'skills');
const COMPILED_DIR = join(__dirname, 'compiled');
const RESULTS_DIR = join(__dirname, 'crawl-results');
const CDP_ENDPOINT = process.env.CHROME_CDP_ENDPOINT || 'http://127.0.0.1:9222';

// Parse CLI args
const args = process.argv.slice(2);
const startIdx = parseInt(args.find(a => a.startsWith('--start='))?.split('=')[1] || '0');
const limit = parseInt(args.find(a => a.startsWith('--limit='))?.split('=')[1] || '999');
const skipFile = join(RESULTS_DIR, 'skip-list.json');

interface SiteSelectors {
  skillName: string;
  siteUrl: string;
  crawledAt: string;
  success: boolean;
  error?: string;
  selectors: {
    searchBar?: string;
    resultCards?: string;
    cardTitle?: string;
    cardPrice?: string;
    cardRating?: string;
    addToCart?: string;
    cartIcon?: string;
    checkoutBtn?: string;
    loginBtn?: string;
    profileIcon?: string;
    popupClose?: string;
    locationInput?: string;
  };
  pageTitle?: string;
  pageUrl?: string;
  snapshotSummary?: string;
}

function parseFrontmatter(content: string): { name: string; siteUrl: string; requiresAuth: boolean } | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;
  const yaml = match[1];
  const name = yaml.match(/^name:\s*(.+)/m)?.[1]?.trim() || '';
  const siteUrl = yaml.match(/^siteUrl:\s*(.+)/m)?.[1]?.trim() || '';
  const requiresAuth = yaml.match(/^requiresAuth:\s*(.+)/m)?.[1]?.trim() === 'true';
  return { name, siteUrl, requiresAuth };
}

async function crawlSite(page: Page, siteUrl: string, skillName: string): Promise<SiteSelectors> {
  const result: SiteSelectors = {
    skillName,
    siteUrl,
    crawledAt: new Date().toISOString(),
    success: false,
    selectors: {},
  };

  try {
    // Navigate with timeout
    await page.goto(siteUrl, { timeout: 15000, waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);

    result.pageTitle = await page.title();
    result.pageUrl = page.url();

    // Dismiss common popups
    for (const sel of [
      'button[aria-label="Close"]',
      '[class*="close-btn"]',
      '.modal button[class*="close"]',
      '#onetrust-accept-btn-handler',
      'button:has-text("Accept")',
      'button:has-text("Got it")',
      'button:has-text("OK")',
      '[class*="popup"] button',
      'img[alt="Close"]',
    ]) {
      try {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 1000 })) {
          await el.click();
          await page.waitForTimeout(500);
        }
      } catch {}
    }

    // Extract selectors by probing common patterns
    result.selectors.searchBar = await findSelector(page, [
      'input[type="search"]',
      'input[placeholder*="search" i]',
      'input[name="q"]',
      'input[name="query"]',
      'input[name="search"]',
      '[data-testid*="search"] input',
      'input[aria-label*="search" i]',
      '#search',
      '.search-input',
    ]);

    result.selectors.resultCards = await findSelector(page, [
      '[data-testid*="card"]',
      '[data-testid*="property-card"]',
      '[class*="product-card"]',
      '[class*="restaurant-card"]',
      '[class*="result-card"]',
      '[class*="item-card"]',
      '.card',
      '[class*="listing"]',
    ]);

    result.selectors.cardTitle = await findSelector(page, [
      '[data-testid*="title"]',
      '[class*="card"] h2',
      '[class*="card"] h3',
      '[class*="name"]',
      '[class*="title"]',
    ]);

    result.selectors.cardPrice = await findSelector(page, [
      '[data-testid*="price"]',
      '[class*="price"]',
      '[class*="cost"]',
      '[class*="amount"]',
      '[class*="rupee"]',
    ]);

    result.selectors.cardRating = await findSelector(page, [
      '[data-testid*="rating"]',
      '[class*="rating"]',
      '[class*="star"]',
      '[class*="review-score"]',
    ]);

    result.selectors.addToCart = await findSelector(page, [
      'button:has-text("Add to Cart")',
      'button:has-text("Add to Bag")',
      'button:has-text("Add")',
      '[data-testid*="add-to-cart"]',
      '[class*="add-to-cart"]',
      'button:has-text("Buy Now")',
    ]);

    result.selectors.cartIcon = await findSelector(page, [
      '[data-testid*="cart"]',
      '[class*="cart-icon"]',
      '[aria-label*="cart" i]',
      'a[href*="cart"]',
      '[class*="basket"]',
    ]);

    result.selectors.loginBtn = await findSelector(page, [
      'a:has-text("Sign in")',
      'a:has-text("Login")',
      'a:has-text("Log in")',
      'button:has-text("Sign in")',
      'button:has-text("Login")',
      '[data-testid*="login"]',
      '[data-testid*="sign-in"]',
    ]);

    result.selectors.profileIcon = await findSelector(page, [
      '[data-testid*="profile"]',
      '[class*="profile"]',
      '[class*="account"]',
      '[class*="user-icon"]',
      '[aria-label*="account" i]',
      '[aria-label*="profile" i]',
    ]);

    result.selectors.popupClose = await findSelector(page, [
      'button[aria-label="Close"]',
      '[class*="close-btn"]',
      '.modal button[class*="close"]',
      '[role="dialog"] button:first-child',
    ]);

    result.selectors.locationInput = await findSelector(page, [
      'input[placeholder*="location" i]',
      'input[placeholder*="address" i]',
      'input[placeholder*="city" i]',
      'input[placeholder*="area" i]',
      '[data-testid*="location"]',
      '[class*="location"] input',
    ]);

    result.success = true;

    // Get a content summary
    const bodyText = await page.locator('body').innerText().catch(() => '');
    result.snapshotSummary = bodyText.slice(0, 500);

  } catch (err) {
    result.error = err instanceof Error ? err.message : String(err);
  }

  return result;
}

async function findSelector(page: Page, candidates: string[]): Promise<string | undefined> {
  for (const sel of candidates) {
    try {
      const count = await page.locator(sel).count();
      if (count > 0) return sel;
    } catch {}
  }
  return undefined;
}

function updateCompiledScript(skillName: string, selectors: SiteSelectors['selectors']): void {
  const filePath = join(COMPILED_DIR, `${skillName}.ts`);
  if (!existsSync(filePath)) return;

  let content = readFileSync(filePath, 'utf-8');

  // Replace generic selectors with real ones
  if (selectors.searchBar) {
    content = content.replace(
      /input\[type="search"\], input\[type="text"\]\[placeholder\*="search" i\][^'"]*/g,
      selectors.searchBar
    );
  }
  if (selectors.resultCards) {
    content = content.replace(
      /\[class\*="card"\], \[class\*="result"\], \[class\*="item"\], \[class\*="product"\], \[data-testid\*="card"\]/g,
      selectors.resultCards
    );
  }
  if (selectors.profileIcon) {
    content = content.replace(
      /\[class\*="profile"\], \[class\*="account"\], \[class\*="user"\], \[aria-label\*="account" i\], \[data-testid\*="profile"\]/g,
      selectors.profileIcon
    );
  }

  writeFileSync(filePath, content);
}

async function main() {
  mkdirSync(RESULTS_DIR, { recursive: true });
  mkdirSync(COMPILED_DIR, { recursive: true });

  // Get all skills
  const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .filter(d => existsSync(join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map(d => d.name)
    .sort();

  // Load skip list (already crawled or known failures)
  let skipList: string[] = [];
  if (existsSync(skipFile)) {
    skipList = JSON.parse(readFileSync(skipFile, 'utf-8'));
  }

  const toProcess = skillDirs
    .filter(d => !skipList.includes(d))
    .slice(startIdx, startIdx + limit);

  console.log(`Skills total: ${skillDirs.length}`);
  console.log(`Already crawled: ${skipList.length}`);
  console.log(`Processing: ${toProcess.length} (from index ${startIdx}, limit ${limit})`);
  console.log('');

  // Connect to Chrome via CDP
  console.log(`Connecting to Chrome at ${CDP_ENDPOINT}...`);
  let browser: Browser;
  try {
    browser = await chromium.connectOverCDP(CDP_ENDPOINT);
  } catch (err) {
    console.error(`Cannot connect to Chrome at ${CDP_ENDPOINT}. Start Chrome-Debug first.`);
    process.exit(1);
  }

  const context = browser.contexts()[0];
  if (!context) {
    console.error('No browser context found.');
    process.exit(1);
  }

  console.log('Connected! Starting crawl...\n');

  let success = 0;
  let failed = 0;
  let skipped = 0;

  for (let i = 0; i < toProcess.length; i++) {
    const skillName = toProcess[i];
    const skillPath = join(SKILLS_DIR, skillName, 'SKILL.md');
    const content = readFileSync(skillPath, 'utf-8');
    const meta = parseFrontmatter(content);

    if (!meta || !meta.siteUrl) {
      console.log(`[${i + 1}/${toProcess.length}] SKIP ${skillName}: no siteUrl`);
      skipped++;
      skipList.push(skillName);
      continue;
    }

    console.log(`[${i + 1}/${toProcess.length}] Crawling ${skillName} → ${meta.siteUrl}`);

    const page = await context.newPage();
    try {
      const result = await crawlSite(page, meta.siteUrl, skillName);

      // Save crawl result
      writeFileSync(
        join(RESULTS_DIR, `${skillName}.json`),
        JSON.stringify(result, null, 2)
      );

      if (result.success) {
        // Update compiled script with real selectors
        updateCompiledScript(skillName, result.selectors);

        const selectorCount = Object.values(result.selectors).filter(Boolean).length;
        console.log(`  ✅ ${selectorCount} selectors found, script updated`);
        success++;
      } else {
        console.log(`  ❌ ${result.error}`);
        failed++;
      }

      skipList.push(skillName);
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.log(`  ❌ ${msg}`);
      failed++;
      skipList.push(skillName);
    } finally {
      await page.close().catch(() => {});
    }

    // Save skip list after each skill (resume-safe)
    writeFileSync(skipFile, JSON.stringify(skipList, null, 2));

    // Brief pause between sites to avoid rate limiting
    await new Promise(r => setTimeout(r, 1000));
  }

  console.log('\n═══════════════════════════════════════');
  console.log(`Done! ${success} succeeded, ${failed} failed, ${skipped} skipped`);
  console.log(`Total crawled: ${skipList.length}/${skillDirs.length}`);
  console.log(`Results: ${RESULTS_DIR}/`);
  console.log(`Scripts: ${COMPILED_DIR}/`);
}

main().catch(err => {
  console.error('Fatal:', err);
  process.exit(1);
});
