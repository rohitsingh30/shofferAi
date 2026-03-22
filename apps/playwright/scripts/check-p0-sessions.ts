#!/usr/bin/env npx tsx
/**
 * P0 Session Health Check
 *
 * Launches a fresh Chrome instance with a COPY of Profile 3
 * (exactly like ChromePool does), navigates to every P0 site,
 * and reports whether we're still signed in.
 *
 * Usage:
 *   npx tsx apps/playwright/scripts/check-p0-sessions.ts
 *   npx tsx apps/playwright/scripts/check-p0-sessions.ts --json
 *   npx tsx apps/playwright/scripts/check-p0-sessions.ts --fix   # open failed sites for manual login
 */

import { chromium, type Browser, type Page } from 'playwright';
import { spawn, type ChildProcess } from 'child_process';
import {
  existsSync, mkdirSync, cpSync, rmSync, readFileSync, writeFileSync,
} from 'fs';
import { join } from 'path';
import { homedir, tmpdir } from 'os';

// ── P0 Site Definitions ─────────────────────────────────────────────────────

interface P0Site {
  name: string;
  url: string;
  /** CSS selector that proves we're signed in (visible on page) */
  signedInSelector?: string;
  /** JS expression that returns truthy if signed in */
  signedInJs?: string;
  /** Text that appears when NOT signed in */
  notSignedInText?: string[];
}

const P0_SITES: P0Site[] = [
  {
    name: 'Blinkit',
    url: 'https://blinkit.com',
    signedInJs: `!!document.querySelector('[class*="Account"]') || document.body.innerText.includes('Account')`,
    notSignedInText: ['Login'],
  },
  {
    name: 'Swiggy',
    url: 'https://www.swiggy.com',
    signedInJs: `document.body.innerText.includes('Rohit') || !!document.querySelector('a[href="/my-account"]')`,
    notSignedInText: ['Sign in', 'Login'],
  },
  {
    name: 'Zomato',
    url: 'https://www.zomato.com/pune/delivery',
    signedInJs: `document.body.innerText.includes('Rohit') || !!document.querySelector('[aria-label*="profile"]')`,
    notSignedInText: ['Log in', 'Sign up'],
  },
  {
    name: 'Booking.com',
    url: 'https://www.booking.com',
    signedInJs: `document.body.innerText.includes('Genius') || document.body.innerText.includes('Rohit')`,
    notSignedInText: ['Register', 'Sign in'],
  },
  {
    name: 'Amazon',
    url: 'https://www.amazon.in',
    signedInJs: `document.body.innerText.includes('Hello, rohit') || document.body.innerText.includes('Hello, Rohit')`,
    notSignedInText: ['Hello, sign in'],
  },
  {
    name: 'Flipkart',
    url: 'https://www.flipkart.com',
    signedInJs: `document.body.innerText.includes('Rohit Singh') || !!document.querySelector('a[href*="/account"]')`,
    notSignedInText: ['Login'],
  },
  {
    name: 'BigBasket',
    url: 'https://www.bigbasket.com',
    signedInJs: `!!document.querySelector('a[href*="/member/"]') || !!document.querySelector('a[href*="/my-account"]') || document.body.innerText.includes('My Basket')`,
    notSignedInText: ['Login', 'Sign Up'],
  },
  {
    name: 'Zepto',
    url: 'https://www.zepto.com',
    signedInJs: `!!document.querySelector('a[href="/account"]') || document.body.innerText.includes('profile')`,
    notSignedInText: ['login'],
  },
  {
    name: 'JioMart',
    url: 'https://www.jiomart.com',
    signedInJs: `document.body.innerText.includes('Hello Rohit') || document.body.innerText.includes('My Account')`,
    notSignedInText: ['Sign In'],
  },
  {
    name: 'Myntra',
    url: 'https://www.myntra.com',
    signedInJs: `document.body.innerText.includes('Profile') && !document.body.innerText.includes('Login')`,
    notSignedInText: ['Login', 'Login or Signup'],
  },
  {
    name: 'Nykaa',
    url: 'https://www.nykaa.com',
    // Check for profile button or user indicator — Nykaa SPAs take time to hydrate
    signedInJs: `
      const btns = [...document.querySelectorAll('button')];
      const hasProfile = btns.some(b => (b.textContent || '').includes('Profile'));
      const hasNykaaUser = document.body.innerText.includes('Nykaa user');
      const noSignIn = !document.querySelector('button')?.textContent?.includes('Sign in');
      hasProfile || hasNykaaUser;
    `,
    notSignedInText: ['Sign Up / Log In'],
  },
  {
    name: 'Croma',
    url: 'https://www.croma.com',
    signedInJs: `!!document.querySelector('a[href*="/my-account"]')`,
    notSignedInText: ['Login'],
  },
];

// ── Chrome Profile Setup ────────────────────────────────────────────────────

const CHROME_BIN = '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const BASE_PROFILE_DIR = join(homedir(), 'Library', 'Application Support', 'Google', 'Chrome-Debug');
const PROFILE_NAME = 'Profile 3';

const SESSION_FILES = [
  'Cookies', 'Cookies-journal',
  'Login Data', 'Login Data-journal',
  'Web Data', 'Web Data-journal',
  'Preferences', 'Secure Preferences',
  join('Network', 'Cookies'), join('Network', 'Cookies-journal'),
];

const SESSION_DIRS = ['Session Storage', 'Local Storage', 'IndexedDB', 'Accounts'];

function setupTempProfile(tempDir: string): void {
  const profileDir = join(tempDir, PROFILE_NAME);
  const sourceProfileDir = join(BASE_PROFILE_DIR, PROFILE_NAME);

  if (!existsSync(sourceProfileDir)) {
    throw new Error(`Source profile not found: ${sourceProfileDir}`);
  }

  mkdirSync(profileDir, { recursive: true });

  // Copy Local State (cookie encryption key reference)
  const localStateSrc = join(BASE_PROFILE_DIR, 'Local State');
  if (existsSync(localStateSrc)) {
    cpSync(localStateSrc, join(tempDir, 'Local State'), { force: true });
  }

  // Remove stale singleton files
  for (const lock of ['SingletonLock', 'SingletonSocket', 'SingletonCookie']) {
    const lockPath = join(tempDir, lock);
    if (existsSync(lockPath)) rmSync(lockPath, { force: true });
  }

  // Copy session files
  for (const file of SESSION_FILES) {
    const src = join(sourceProfileDir, file);
    const dest = join(profileDir, file);
    if (existsSync(src)) {
      mkdirSync(join(dest, '..'), { recursive: true });
      cpSync(src, dest, { force: true });
    }
  }

  // Copy session directories
  for (const dir of SESSION_DIRS) {
    const src = join(sourceProfileDir, dir);
    const dest = join(profileDir, dir);
    if (existsSync(src)) {
      if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
      cpSync(src, dest, { recursive: true, force: true });
    }
  }

  // Suppress restore bubble
  const prefsPath = join(profileDir, 'Preferences');
  if (existsSync(prefsPath)) {
    try {
      const prefs = JSON.parse(readFileSync(prefsPath, 'utf-8'));
      if (!prefs.profile) prefs.profile = {};
      prefs.profile.exit_type = 'Normal';
      prefs.profile.exited_cleanly = true;
      writeFileSync(prefsPath, JSON.stringify(prefs));
    } catch { /* ignore parse errors */ }
  }
}

// ── Chrome Launch ───────────────────────────────────────────────────────────

async function launchChrome(userDataDir: string): Promise<{ process: ChildProcess; port: number }> {
  const args = [
    '--remote-debugging-port=0',
    '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${userDataDir}`,
    `--profile-directory=${PROFILE_NAME}`,
    '--no-first-run',
    '--no-default-browser-check',
    '--disable-sync',
    '--disable-default-apps',
    '--hide-crash-restore-bubble',
    '--disable-session-crashed-bubble',
    // Stealth args
    '--disable-blink-features=AutomationControlled',
    '--disable-features=AutomationControlled,SigninInterceptBubble,IdentityStatusConsistency,OptimizationGuideModelDownloading,OptimizationHintsFetching,PasswordLeakDetection',
    '--disable-infobars',
    '--disable-ipc-flooding-protection',
    '--disable-popup-blocking',
    '--noerrdialogs',
    '--disable-gaia-services',
    'about:blank',
  ];

  const chromeProcess = spawn(CHROME_BIN, args, {
    stdio: ['ignore', 'ignore', 'pipe'],
    detached: false,
  });

  const port = await new Promise<number>((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error('Chrome did not report CDP port within 15s'));
    }, 15_000);

    let stderrData = '';
    chromeProcess.stderr!.on('data', (chunk: Buffer) => {
      stderrData += chunk.toString();
      const match = stderrData.match(/ws:\/\/127\.0\.0\.1:(\d+)\//);
      if (match) {
        clearTimeout(timeout);
        resolve(parseInt(match[1], 10));
      }
    });

    chromeProcess.on('exit', (code) => {
      clearTimeout(timeout);
      reject(new Error(`Chrome exited with code ${code} before reporting port`));
    });
  });

  return { process: chromeProcess, port };
}

// ── Session Check ───────────────────────────────────────────────────────────

interface CheckResult {
  name: string;
  url: string;
  signedIn: boolean;
  indicator: string;
  durationMs: number;
}

async function checkSite(page: Page, site: P0Site): Promise<CheckResult> {
  const start = Date.now();
  try {
    await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 20_000 });
    // Extra wait for SPAs to render
    await page.waitForTimeout(2000);

    // Check with JS expression
    if (site.signedInJs) {
      const result = await page.evaluate(site.signedInJs).catch(() => false);
      if (result) {
        return {
          name: site.name, url: site.url, signedIn: true,
          indicator: 'JS check passed',
          durationMs: Date.now() - start,
        };
      }
    }

    // Check for "not signed in" text as fallback — only check the top of the page
    if (site.notSignedInText?.length) {
      const bodyText = await page.evaluate(() => {
        // Get text from the header/nav area (top 500px) to avoid false positives from footers
        const header = document.querySelector('header, nav, [role="banner"]');
        if (header) return header.innerText || '';
        return (document.body?.innerText || '').slice(0, 1000);
      }).catch(() => '');
      const headerText = bodyText;
      for (const text of site.notSignedInText) {
        if (headerText.includes(text)) {
          return {
            name: site.name, url: site.url, signedIn: false,
            indicator: `Found "${text}" in page`,
            durationMs: Date.now() - start,
          };
        }
      }
      // No "not signed in" indicators found → likely signed in
      return {
        name: site.name, url: site.url, signedIn: true,
        indicator: 'No login prompts found',
        durationMs: Date.now() - start,
      };
    }

    return {
      name: site.name, url: site.url, signedIn: false,
      indicator: 'Could not determine',
      durationMs: Date.now() - start,
    };
  } catch (err) {
    return {
      name: site.name, url: site.url, signedIn: false,
      indicator: `Error: ${(err as Error).message.slice(0, 80)}`,
      durationMs: Date.now() - start,
    };
  }
}

// ── Main ────────────────────────────────────────────────────────────────────

async function main() {
  const jsonMode = process.argv.includes('--json');
  const fixMode = process.argv.includes('--fix');

  const tempDir = join(tmpdir(), `shofferai-session-check-${process.pid}`);
  let chromeProc: ChildProcess | null = null;
  let browser: Browser | null = null;

  try {
    // 1. Setup profile copy
    if (!jsonMode) process.stderr.write('📋 Copying Chrome profile...\n');
    setupTempProfile(tempDir);

    // 2. Launch Chrome
    if (!jsonMode) process.stderr.write('🚀 Launching Chrome...\n');
    const { process: proc, port } = await launchChrome(tempDir);
    chromeProc = proc;
    if (!jsonMode) process.stderr.write(`✅ Chrome running on CDP port ${port}\n`);

    // 3. Connect Playwright
    browser = await chromium.connectOverCDP(`http://127.0.0.1:${port}`);
    const context = browser.contexts()[0] || await browser.newContext();

    // 4. Check each site
    const results: CheckResult[] = [];
    const page = await context.newPage();

    for (const site of P0_SITES) {
      if (!jsonMode) process.stderr.write(`  🔍 Checking ${site.name}...`);
      const result = await checkSite(page, site);
      results.push(result);
      if (!jsonMode) {
        const icon = result.signedIn ? '✅' : '❌';
        process.stderr.write(` ${icon} (${result.durationMs}ms)\n`);
      }
    }

    await page.close();

    // 5. Report
    if (jsonMode) {
      console.log(JSON.stringify(results, null, 2));
    } else {
      console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
      console.log('  P0 SESSION HEALTH CHECK');
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

      const maxName = Math.max(...results.map(r => r.name.length));
      for (const r of results) {
        const icon = r.signedIn ? '✅' : '❌';
        const name = r.name.padEnd(maxName);
        console.log(`  ${icon}  ${name}  ${r.indicator}`);
      }

      const passed = results.filter(r => r.signedIn).length;
      const total = results.length;
      console.log(`\n  ${passed}/${total} sites signed in`);

      const failed = results.filter(r => !r.signedIn);
      if (failed.length > 0) {
        console.log(`\n  ⚠️  Failed sites: ${failed.map(f => f.name).join(', ')}`);
      }
      console.log('');

      // 6. Fix mode — open failed sites for manual login
      if (fixMode && failed.length > 0) {
        console.log('🔧 Fix mode: opening failed sites in Chrome-Debug for manual login...');
        console.log('   Sign in to each site, then close Chrome when done.\n');

        const fixPage = await context.newPage();
        for (const f of failed) {
          console.log(`   Opening ${f.name} → ${f.url}`);
          await fixPage.goto(f.url, { waitUntil: 'domcontentloaded', timeout: 20_000 }).catch(() => {});
          // Wait for user to sign in (they need to interact with Chrome-Debug directly)
        }
        console.log('\n   ℹ️  Sign in to the sites above in the Chrome window,');
        console.log('      then press Ctrl+C to exit this script.');

        // Keep alive until user presses Ctrl+C
        await new Promise(() => {});
      }
    }

    // Exit code: 0 if all passed, 1 if any failed
    const allPassed = results.every(r => r.signedIn);
    process.exitCode = allPassed ? 0 : 1;
  } finally {
    // Cleanup
    if (browser) await browser.close().catch(() => {});
    if (chromeProc) {
      chromeProc.kill('SIGTERM');
      // Give Chrome 2s to exit cleanly
      await new Promise(r => setTimeout(r, 2000));
      if (!chromeProc.killed) chromeProc.kill('SIGKILL');
    }
    if (existsSync(tempDir)) {
      rmSync(tempDir, { recursive: true, force: true });
    }
  }
}

main().catch((err) => {
  console.error('Fatal:', err);
  process.exit(2);
});
