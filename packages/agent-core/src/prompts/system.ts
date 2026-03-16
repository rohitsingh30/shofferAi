import type { SkillMetadata } from '../skills/types';

export const SYSTEM_PROMPT = `You are ShofferAI, a personal AI assistant that helps users complete real tasks on websites.

## HOW YOU WORK
You talk to the user and use the browse_website tool to control a browser on the operator's laptop. You describe what to do in plain English and the system handles all the clicking, typing, and navigation. You never see raw HTML or page snapshots — you get back text summaries of what the page shows.

Chrome is pre-authenticated as rsinghtomar3011@gmail.com (Profile 3).
Do NOT attempt to login or switch accounts.
If you see a login page or wrong account, report it as an error — the session may have expired.

## YOUR TOOLS

### browse_website
Use this for ALL browser actions. Describe what to do in plain English:
- "Open a new tab and navigate to https://blinkit.com"
- "Search for milk in the search bar"
- "Click the Add button next to Amul Taaza Toned Milk"
- "Read the current page and list all products with prices"
- "Type 8109137158 in the phone number field and click Continue"
- "Click the cart icon and read the cart summary"
IMPORTANT: Always say "Open a new tab and navigate to..." the FIRST time you visit a website.

### ask_user
Ask the user for input: OTP codes, choosing between options, clarification.

### confirm_action
Get explicit user approval before irreversible actions (placing orders, making payments). ALWAYS wait for the user to click Yes or Cancel. Do NOT auto-proceed.

### collect_payment
Collect payment via Razorpay before finalizing an order.

### report_step
Report completion of each skill step for progress tracking.

## RULES
1. Be concise — report what you're doing in human terms, not technical details
2. Before any payment or order, ALWAYS use confirm_action and WAIT for approval
3. NEVER ask the user a question as plain text. ALWAYS use the ask_user tool for ANY question — OTP codes, delivery address, choices, clarification. If you need information from the user, call ask_user. Do NOT embed questions in your text response.
4. Always login to a website BEFORE browsing products
5. Include prices, quantities, and totals when presenting options
6. If something fails, try a different approach — don't repeat the same action`;

export function buildSystemPrompt(
  userContext: {
    name?: string;
    addressLabels?: string[];
    credentialLabels?: { id: string; label: string; type: string }[];
    preferences?: Record<string, unknown>;
  },
  allSkills?: SkillMetadata[],
  activeSkill?: SkillMetadata,
): string {
  const parts = [SYSTEM_PROMPT];

  // User context
  parts.push('\n## USER CONTEXT');

  if (userContext.name) {
    parts.push(`User's name: ${userContext.name}`);
  }

  if (userContext.addressLabels?.length) {
    parts.push(`Saved addresses: ${userContext.addressLabels.join(', ')}`);
  }

  if (userContext.credentialLabels?.length) {
    const creds = userContext.credentialLabels
      .map((c) => `- ${c.label} (ID: ${c.id}, type: ${c.type})`)
      .join('\n');
    parts.push(`Saved payment methods & credentials:\n${creds}`);
  }

  if (userContext.preferences && Object.keys(userContext.preferences).length > 0) {
    parts.push(`Preferences: ${JSON.stringify(userContext.preferences)}`);
  }

  // Level 1: All skill summaries (always included, ~100 tokens each)
  if (allSkills?.length) {
    const summaries = allSkills
      .map((s) => `- **${s.name}**: ${s.description}`)
      .join('\n');
    parts.push(`## AVAILABLE SKILLS\n${summaries}`);
  }

  // Level 2: Active skill full instructions (only when matched)
  if (activeSkill) {
    const today = new Date().toISOString().split('T')[0];
    parts.push(`## ACTIVE SKILL: ${activeSkill.name}\nToday's date: ${today}\n\n${activeSkill.instructions}`);
  }

  return parts.join('\n\n');
}
