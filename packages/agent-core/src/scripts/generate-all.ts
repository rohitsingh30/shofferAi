/**
 * Generate compiled Playwright scripts for ALL skills.
 *
 * Reads each SKILL.md, extracts the workflow steps, and generates
 * a complete Playwright script using the standard template.
 *
 * Usage: npx tsx packages/agent-core/src/scripts/generate-all.ts
 */

import { readdirSync, readFileSync, writeFileSync, mkdirSync, existsSync } from 'fs';
import { join, basename } from 'path';
import { generateScriptCode } from './script-template';

const SKILLS_DIR = join(__dirname, '..', 'skills');
const COMPILED_DIR = join(__dirname, 'compiled');

interface SkillMeta {
  name: string;
  description: string;
  siteUrl: string;
  requiresAuth: boolean;
  params: Array<{ name: string; required: boolean; hint: string }>;
  triggers: string[];
}

interface SkillStep {
  number: number;
  title: string;
  instructions: string[];
}

function parseFrontmatter(content: string): SkillMeta | null {
  const match = content.match(/^---\n([\s\S]*?)\n---/);
  if (!match) return null;

  const yaml = match[1];
  const meta: Partial<SkillMeta> = { params: [], triggers: [] };

  // Extract simple fields
  const nameMatch = yaml.match(/^name:\s*(.+)/m);
  if (nameMatch) meta.name = nameMatch[1].trim();

  const descMatch = yaml.match(/^description:\s*(.+)/m);
  if (descMatch) meta.description = descMatch[1].trim();

  const urlMatch = yaml.match(/^siteUrl:\s*(.+)/m);
  if (urlMatch) meta.siteUrl = urlMatch[1].trim();

  const authMatch = yaml.match(/^requiresAuth:\s*(.+)/m);
  if (authMatch) meta.requiresAuth = authMatch[1].trim() === 'true';

  // Extract triggers
  const triggersSection = yaml.match(/triggers:\n((?:\s+- .+\n?)*)/);
  if (triggersSection) {
    meta.triggers = triggersSection[1]
      .split('\n')
      .filter(l => l.trim().startsWith('- '))
      .map(l => l.trim().slice(2).trim());
  }

  // Extract params
  const paramsSection = yaml.match(/params:\n((?:\s+- [\s\S]*?)(?=\n---|\n\w|$))/);
  if (paramsSection) {
    const paramBlocks = paramsSection[1].split(/\n\s+- name:/).filter(Boolean);
    for (const block of paramBlocks) {
      const nameM = block.match(/(?:^|\n\s*)name:\s*(.+)/);
      const reqM = block.match(/required:\s*(.+)/);
      const hintM = block.match(/hint:\s*(.+)/);
      if (nameM) {
        meta.params!.push({
          name: nameM[1].trim(),
          required: reqM ? reqM[1].trim() === 'true' : false,
          hint: hintM ? hintM[1].trim() : '',
        });
      }
    }
  }

  return meta as SkillMeta;
}

function parseSteps(content: string): SkillStep[] {
  const body = content.replace(/^---[\s\S]*?---\n*/, '');
  const stepsSection = body.split('## Site Notes')[0] || body;
  const stepMatches = stepsSection.match(/### \d+[a-z]?\.\s+.+[\s\S]*?(?=### \d|## |$)/g) || [];

  return stepMatches.map(block => {
    const titleMatch = block.match(/### (\d+)[a-z]?\.\s+(.+)/);
    const lines = block.split('\n').slice(1).filter(l => l.trim().startsWith('- '));
    return {
      number: titleMatch ? parseInt(titleMatch[1]) : 0,
      title: titleMatch ? titleMatch[2].trim() : 'Unknown',
      instructions: lines.map(l => l.trim().slice(2).trim()),
    };
  });
}

function escapeJS(str: string): string {
  return str.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/"/g, '\\"').replace(/\n/g, '\\n');
}

function generateBody(meta: SkillMeta, steps: SkillStep[]): string {
  const lines: string[] = [];
  const indent = '    ';
  const siteUrl = meta.siteUrl;
  const siteName = meta.name.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());

  // Helper: dismiss popups
  lines.push(`${indent}// ── Helper: dismiss common popups ──────────────────────────`);
  lines.push(`${indent}const dismissPopups = async () => {`);
  lines.push(`${indent}  try {`);
  lines.push(`${indent}    const closeBtn = page.locator('[role="dialog"] button[aria-label="Close"], button[aria-label="close"], .modal-close, [class*="popup"] button[class*="close"]').first();`);
  lines.push(`${indent}    if (await closeBtn.isVisible({ timeout: 2000 })) await closeBtn.click();`);
  lines.push(`${indent}  } catch {}`);
  lines.push(`${indent}  try {`);
  lines.push(`${indent}    const cookieBtn = page.locator('button:has-text("Accept"), button:has-text("Got it"), #onetrust-accept-btn-handler').first();`);
  lines.push(`${indent}    if (await cookieBtn.isVisible({ timeout: 1000 })) await cookieBtn.click();`);
  lines.push(`${indent}  } catch {}`);
  lines.push(`${indent}};`);
  lines.push('');

  // Step: Navigate to site
  lines.push(`${indent}// ── Navigate to ${siteName} ──────────────────────────`);
  lines.push(`${indent}log({ step: 'Opening ${escapeJS(siteName)}...', status: 'running' });`);

  // Build URL with params if applicable
  const urlParam = meta.params.find(p => p.name === 'city' || p.name === 'from' || p.name === 'product' || p.name === 'food' || p.name === 'query');
  if (urlParam && siteUrl.includes('search')) {
    lines.push(`${indent}const searchUrl = '${escapeJS(siteUrl)}' + '?q=' + encodeURIComponent(params.${urlParam.name} || '');`);
    lines.push(`${indent}await page.goto(searchUrl);`);
  } else {
    lines.push(`${indent}await page.goto('${escapeJS(siteUrl)}');`);
  }
  lines.push(`${indent}await page.waitForLoadState('domcontentloaded');`);
  lines.push(`${indent}await page.waitForTimeout(2000);`);
  lines.push(`${indent}await dismissPopups();`);
  lines.push('');

  // Step: Verify login
  if (meta.requiresAuth) {
    lines.push(`${indent}// ── Verify login ──────────────────────────────────────`);
    lines.push(`${indent}log({ step: 'Checking login status...', status: 'running' });`);
    lines.push(`${indent}const profileEl = page.locator('[class*="profile"], [class*="account"], [class*="user"], [aria-label*="account" i], [data-testid*="profile"]').first();`);
    lines.push(`${indent}const isLoggedIn = await profileEl.isVisible({ timeout: 3000 }).catch(() => false);`);
    lines.push(`${indent}if (!isLoggedIn) {`);
    lines.push(`${indent}  log({ step: 'Not logged in — attempting sign-in...', status: 'running' });`);
    lines.push(`${indent}  const signInBtn = page.locator('a:has-text("Sign in"), a:has-text("Login"), button:has-text("Sign in"), button:has-text("Login"), a:has-text("Log in")').first();`);
    lines.push(`${indent}  if (await signInBtn.isVisible({ timeout: 3000 }).catch(() => false)) {`);
    lines.push(`${indent}    await signInBtn.click();`);
    lines.push(`${indent}    await page.waitForTimeout(3000);`);
    lines.push(`${indent}  }`);
    lines.push(`${indent}  // Check for Google sign-in option`);
    lines.push(`${indent}  const googleBtn = page.locator('button:has-text("Google"), [data-provider="google"], a:has-text("Continue with Google")').first();`);
    lines.push(`${indent}  if (await googleBtn.isVisible({ timeout: 3000 }).catch(() => false)) {`);
    lines.push(`${indent}    await googleBtn.click();`);
    lines.push(`${indent}    await page.waitForTimeout(5000);`);
    lines.push(`${indent}  }`);
    lines.push(`${indent}}`);
    lines.push('');
  }

  // Step: Search (if applicable)
  const searchParam = meta.params.find(p =>
    ['product', 'food', 'items', 'medicine', 'movie', 'service', 'speciality', 'query'].includes(p.name)
  );
  if (searchParam) {
    lines.push(`${indent}// ── Search for ${searchParam.name} ──────────────────────────`);
    lines.push(`${indent}log({ step: 'Searching for ' + params.${searchParam.name} + '...', status: 'running' });`);
    lines.push(`${indent}const searchInput = page.locator('input[type="search"], input[type="text"][placeholder*="search" i], input[name="q"], input[name="query"], input[name="search"], [data-testid*="search"] input, input[aria-label*="search" i]').first();`);
    lines.push(`${indent}if (await searchInput.isVisible({ timeout: 5000 }).catch(() => false)) {`);
    lines.push(`${indent}  await searchInput.click();`);
    lines.push(`${indent}  await searchInput.fill(params.${searchParam.name});`);
    lines.push(`${indent}  await page.keyboard.press('Enter');`);
    lines.push(`${indent}  await page.waitForTimeout(3000);`);
    lines.push(`${indent}  await dismissPopups();`);
    lines.push(`${indent}} else {`);
    lines.push(`${indent}  log({ step: 'Search bar not found — browsing manually', status: 'running' });`);
    lines.push(`${indent}}`);
    lines.push('');
  }

  // Step: Extract results and present to user
  lines.push(`${indent}// ── Extract results ──────────────────────────────────`);
  lines.push(`${indent}log({ step: 'Loading results...', status: 'running' });`);
  lines.push(`${indent}await page.waitForTimeout(2000);`);
  lines.push('');
  lines.push(`${indent}// Take snapshot for the agent to process`);
  lines.push(`${indent}const pageContent = await page.content();`);
  lines.push(`${indent}const pageTitle = await page.title();`);
  lines.push(`${indent}const pageUrl = page.url();`);
  lines.push('');
  lines.push(`${indent}// Present options to user`);
  lines.push(`${indent}const userChoice = await requestFromHost({`);
  lines.push(`${indent}  type: 'input_required',`);
  lines.push(`${indent}  question: 'I found results on ${escapeJS(siteName)}. Which option would you like? (enter a number or describe your preference)',`);
  lines.push(`${indent}  inputType: 'freetext',`);
  lines.push(`${indent}});`);
  lines.push('');

  // Step: Add to cart / select option
  lines.push(`${indent}// ── Select user's choice ─────────────────────────────`);
  lines.push(`${indent}log({ step: 'Selecting option: ' + (userChoice.value || 'first'), status: 'running' });`);
  lines.push(`${indent}// Click on the result based on user's choice`);
  lines.push(`${indent}const resultCards = page.locator('[class*="card"], [class*="result"], [class*="item"], [class*="product"], [data-testid*="card"]');`);
  lines.push(`${indent}const choiceNum = parseInt(userChoice.value || '1');`);
  lines.push(`${indent}const idx = (!isNaN(choiceNum) && choiceNum >= 1) ? choiceNum - 1 : 0;`);
  lines.push(`${indent}const targetCard = resultCards.nth(idx);`);
  lines.push(`${indent}if (await targetCard.isVisible({ timeout: 3000 }).catch(() => false)) {`);
  lines.push(`${indent}  await targetCard.click();`);
  lines.push(`${indent}  await page.waitForLoadState('domcontentloaded');`);
  lines.push(`${indent}  await page.waitForTimeout(2000);`);
  lines.push(`${indent}}`);
  lines.push('');

  // Step: Confirm action
  lines.push(`${indent}// ── Confirm action ───────────────────────────────────`);
  lines.push(`${indent}log({ step: 'Review your selection', status: 'running' });`);
  lines.push(`${indent}const confirmResp = await requestFromHost({`);
  lines.push(`${indent}  type: 'confirm_action',`);
  lines.push(`${indent}  action: 'Proceed with ${escapeJS(siteName)}',`);
  lines.push(`${indent}  details: 'Page: ' + pageTitle + '\\nURL: ' + pageUrl,`);
  lines.push(`${indent}});`);
  lines.push(`${indent}if (!confirmResp.confirmed) {`);
  lines.push(`${indent}  log({ step: 'Cancelled by user', status: 'completed' });`);
  lines.push(`${indent}  log({ done: true, cancelled: true });`);
  lines.push(`${indent}  await page.close();`);
  lines.push(`${indent}  rl.close();`);
  lines.push(`${indent}  return;`);
  lines.push(`${indent}}`);
  lines.push('');

  // Step: Payment (for transactional skills)
  const stepsText = steps.map(s => s.instructions.join(' ')).join(' ');
  const isTransactional = stepsText.includes('collect_payment') || stepsText.includes('payment') || stepsText.includes('checkout');

  if (isTransactional) {
    lines.push(`${indent}// ── Payment ──────────────────────────────────────────`);
    lines.push(`${indent}log({ step: 'Ready for payment', status: 'running' });`);
    lines.push(`${indent}const payResp = await requestFromHost({`);
    lines.push(`${indent}  type: 'payment_required',`);
    lines.push(`${indent}  action: 'Complete ${escapeJS(siteName)} order',`);
    lines.push(`${indent}  details: 'Completing your order on ${escapeJS(siteName)}',`);
    lines.push(`${indent}  amountInr: 0, // Extracted from page at runtime`);
    lines.push(`${indent}  description: '${escapeJS(meta.name)} order',`);
    lines.push(`${indent}});`);
    lines.push(`${indent}if (!payResp.confirmed) {`);
    lines.push(`${indent}  log({ step: 'Payment cancelled', status: 'completed' });`);
    lines.push(`${indent}  log({ done: true, cancelled: true });`);
    lines.push(`${indent}  await page.close();`);
    lines.push(`${indent}  rl.close();`);
    lines.push(`${indent}  return;`);
    lines.push(`${indent}}`);
    lines.push('');

    // OTP handling
    lines.push(`${indent}// ── Handle OTP if needed ─────────────────────────────`);
    lines.push(`${indent}await page.waitForTimeout(3000);`);
    lines.push(`${indent}const otpField = page.locator('input[name="otp"], input[type="tel"][maxlength="6"], input[type="tel"][maxlength="4"], [placeholder*="OTP" i], [placeholder*="verification" i]').first();`);
    lines.push(`${indent}if (await otpField.isVisible({ timeout: 5000 }).catch(() => false)) {`);
    lines.push(`${indent}  const otpResp = await requestFromHost({`);
    lines.push(`${indent}    type: 'input_required',`);
    lines.push(`${indent}    question: 'Enter the OTP/verification code sent to your phone:',`);
    lines.push(`${indent}    inputType: 'otp',`);
    lines.push(`${indent}  });`);
    lines.push(`${indent}  if (otpResp.value) {`);
    lines.push(`${indent}    await otpField.fill(otpResp.value);`);
    lines.push(`${indent}    const submitBtn = page.locator('button:has-text("Submit"), button:has-text("Verify"), button[type="submit"]').first();`);
    lines.push(`${indent}    if (await submitBtn.isVisible({ timeout: 2000 }).catch(() => false)) await submitBtn.click();`);
    lines.push(`${indent}    await page.waitForTimeout(5000);`);
    lines.push(`${indent}  }`);
    lines.push(`${indent}}`);
    lines.push('');
  }

  // Final: Report completion
  lines.push(`${indent}// ── Completion ───────────────────────────────────────`);
  lines.push(`${indent}const finalUrl = page.url();`);
  lines.push(`${indent}const finalTitle = await page.title();`);
  lines.push(`${indent}log({ step: '${escapeJS(siteName)} workflow completed', status: 'completed' });`);
  lines.push(`${indent}log({ message: 'Task completed on ${escapeJS(siteName)}. Page: ' + finalTitle });`);
  lines.push(`${indent}log({ done: true, url: finalUrl, title: finalTitle });`);
  lines.push('');
  lines.push(`${indent}await page.waitForTimeout(5000);`);

  return lines.join('\n');
}

// ── Main ──────────────────────────────────────────────────────────────

function main() {
  mkdirSync(COMPILED_DIR, { recursive: true });

  const skillDirs = readdirSync(SKILLS_DIR, { withFileTypes: true })
    .filter(d => d.isDirectory())
    .filter(d => existsSync(join(SKILLS_DIR, d.name, 'SKILL.md')))
    .map(d => d.name);

  console.log(`Found ${skillDirs.length} skills. Generating compiled scripts...`);

  let generated = 0;
  let skipped = 0;
  let errors = 0;

  for (const dir of skillDirs) {
    try {
      const skillPath = join(SKILLS_DIR, dir, 'SKILL.md');
      const content = readFileSync(skillPath, 'utf-8');

      const meta = parseFrontmatter(content);
      if (!meta || !meta.name) {
        console.warn(`  SKIP ${dir}: no valid frontmatter`);
        skipped++;
        continue;
      }

      const steps = parseSteps(content);
      const requiredParams = meta.params.filter(p => p.required).map(p => p.name);

      const bodyCode = generateBody(meta, steps);
      const scriptCode = generateScriptCode(meta.name, requiredParams, bodyCode);

      // Write as TypeScript module (same format as booking-com-hotel.ts)
      const outputPath = join(COMPILED_DIR, `${dir}.ts`);
      const moduleCode = `/**
 * ${meta.description}
 *
 * Auto-generated Playwright script for ${meta.name}.
 * Site: ${meta.siteUrl}
 * Params: ${requiredParams.join(', ') || 'none required'}
 */
export const SCRIPT_CODE = \`\n${scriptCode}\n\`;

export const SKILL_ID = '${meta.name}';
export const REQUIRED_PARAMS = ${JSON.stringify(requiredParams)};
`;

      writeFileSync(outputPath, moduleCode);
      generated++;
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`  ERROR ${dir}: ${msg}`);
      errors++;
    }
  }

  console.log(`\nDone!`);
  console.log(`  Generated: ${generated}`);
  console.log(`  Skipped:   ${skipped}`);
  console.log(`  Errors:    ${errors}`);
  console.log(`  Output:    ${COMPILED_DIR}/`);
}

main();
