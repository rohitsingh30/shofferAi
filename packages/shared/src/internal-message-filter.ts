/**
 * Detect messages that are internal tool-call labels, not user-meaningful text.
 * Used by task-manager (laptop) and execute route (cloud) to suppress
 * internal Copilot CLI messages from reaching the user's chat UI.
 *
 * See docs/REPEATING-MISTAKES.md #14 for context.
 */
export function isInternalToolLabel(message: string | undefined): boolean {
  if (!message) return true;
  const trimmed = message.trim();
  if (!trimmed) return true;
  // "Browser: report_intent", "Browser: playwright-browser_navigate", etc.
  if (/^Browser:\s+[\w-]+$/i.test(trimmed)) return true;
  // Raw tool names (with or without mcp__ prefix)
  if (/^(mcp__\w+__|playwright__)?browser_\w+$/i.test(trimmed)) return true;
  if (/^report_intent$/i.test(trimmed)) return true;
  // Short status labels
  if (/^(Agent starting\.{3}|Starting\.{3}|Thinking\.{3})$/i.test(trimmed)) return true;
  return false;
}

/**
 * Detect natural language narration from the browser agent that should NOT
 * reach the user. These are Claude's "thinking out loud" observations about
 * what it sees in the browser — page state, element locations, internal plans.
 *
 * Users should only see: questions, choices, results, errors, confirmations.
 * NOT: "I can see the location change modal with saved addresses..."
 *
 * Architecture: splits multi-sentence messages and tests EACH sentence after
 * stripping filler prefixes. If ANY sentence is narration → whole message is
 * suppressed. This prevents "Good, I can see the page. Let me click..." from
 * slipping through because the `^` anchors only matched the first sentence.
 */
export function isAgentNarration(message: string | undefined): boolean {
  if (!message) return true;
  const trimmed = message.trim();
  if (!trimmed) return true;

  // Split on sentence boundaries (after . ! ?) and test each sentence.
  // If ANY sentence is narration, the whole message is narration.
  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(s => s.trim().length > 0);
  if (sentences.length === 0) return true;

  return sentences.some(s => isSentenceNarration(s.trim().toLowerCase()));
}

/** Common filler prefixes the LLM prepends before narration. Strip before testing. */
const FILLER_PREFIX = /^(good|great|perfect|excellent|nice|wonderful|alright|sure|right|interesting|cool|awesome|okay|ok|got it|done|hmm|well|ah|oh|yes|yep|yeah)[,!.:]\s*/;
/** Secondary connectors: "OK so", "Now", "Alright so" */
const CONNECTOR_PREFIX = /^(ok|okay|so|alright|right|well|now|and|also|then)[, ]+/;

function isSentenceNarration(lower: string): boolean {
  // Strip filler prefixes: "Good, ..." → "..."  / "Got it, ..." → "..."
  lower = lower.replace(FILLER_PREFIX, '');
  // Strip secondary connectors: "OK so ..." → "..."
  lower = lower.replace(CONNECTOR_PREFIX, '');

  // --- Observational narration ("I can see...", "The page shows...") ---
  const observational = [
    /^i (can )?(see|notice|observe|spot|confirm)\b/,
    /^i('m| am) (seeing|looking at|noticing|observing|checking|viewing)\b/,
    /^(the |this )?(page|screen|site|modal|popup|dialog|form|search results?|location|address|delivery|cart|checkout|menu|header|banner|button|field|input|dropdown|options?|product|tab|window|browser)\s+(shows?|displays?|has|contains?|is |looks?|appears?|loaded|opened|changed|updated|now|seem)/,
    /^(looking|glancing) at\b/,
    /^it (appears|looks like|seems|opened|redirected|loaded|shows|displayed|navigated|changed|updated|set|brought|took|went|switched|scrolled|worked|failed|returned|has)\b/,
    /^there('s| is| are| seems?)\s+/,
    /^i (can |also )?(confirm|verified?|see that)\b/,
    /^here (we|i|you) (can )?(see|have|find|notice)\b/,
    /^this (looks|seems|appears|is the|must be|should be|might be|could be)\b/,
    /^that (was|is|seems|looks|worked|should|might|could|appears)\b/,
  ];

  // --- Action narration ("Let me click...", "I'll navigate to...") ---
  const actionVerbs = 'navigate|go to|open|click|search|type|browse|check|look|read|scroll|select|visit|head to|dismiss|refresh|fill|submit|wait|load|close|handle|verify|proceed|update|change|set|switch|enter|tap|press|pick|choose|try|find|locate|expand|collapse|clear|modify|adjust|move';
  const action = [
    new RegExp(`^(let me|i'll|i will|i'm going to|now i'll|now let me|i'm now|i need to|i'm about to|first,? i'll|next,? i'll)\\s+(${actionVerbs})\\b`),
    new RegExp(`^(navigating|going|opening|clicking|searching|typing|browsing|checking|looking|reading|scrolling|loading|heading|dismissing|refreshing|filling|submitting|waiting|closing|handling|verifying|proceeding|updating|changing|setting|switching|entering|tapping|pressing)\\s+(to|for|at|on|the|through|a |an )`),
    new RegExp(`^(now |first |next )?(i('ll| will| need to| am going to|'m going to) )?(${actionVerbs})\\b`),
    /^(searching|looking) for (hotels|flights|products|items|rooms|options|dal|milk|grocery|groceries|results)/,
    /^open a new tab/,
    /^navigate to https?:\/\//,
    /^scroll (down|up|to)/,
    /^click (on |the )/,
    /^type .+ in the/,
    /^find the .+ (field|button|input|link|element)/,
    /^(take|read) (a )?snapshot/,
    /^read the (current |)page/,
    /^refresh the page/,
    /^dismiss (the |any )/,
    /^wait for /,
    /^(verify|check) (if |that |the |whether )/,
    /^look for /,
  ];

  // --- Status narration ("Location is now set to...", "I've updated the...") ---
  const status = [
    /^(location|address|delivery|delivery address|city|area|pincode) (is |has been |was )?(now |successfully )?(set|changed|updated|confirmed|selected|saved)/,
    /^i('ve| have) (successfully |now |already )?(set|changed|updated|clicked|navigated|opened|searched|typed|selected|filled|submitted|logged|signed|dismissed|scrolled|loaded|confirmed|added|removed|cleared)/,
    /^(successfully|done|completed)[.!]?\s/,
    /^(the |this )?(location|address|delivery|search|login|page|cart|order|delivery address) (is |has been )(now |)(updated|set|changed|loaded|confirmed|ready|complete|saved|submitted)/,
    /^now (i |the |let)/,
  ];

  // --- Third-person references to "the user" (always internal) ---
  const thirdPerson = [
    /\bthe user('s| wants| needs| asked| requested| said| mentioned| specified| provided| is )/,
    /\bbut the user\b/,
    /\bwhat the user\b/,
    /\buser's (requested|original|preferred|specified|chosen)/,
  ];

  // --- Browser element descriptions (modals, popups, selectors) ---
  const browserInternals = [
    /\b(modal|popup|dialog|overlay|dropdown|tooltip|sidebar|drawer|banner)\s+(is |has |with |shows?|opened|appeared|closed|displaying|containing)/,
    /\bsaved address(es)?\b/,
    /\bdelivery (time|slot|estimate|eta)\b.*\b\d+\s*min/,
    /\b(data-testid|aria-label|selector|xpath|locator)\b/,
    /\bsearch (bar|box|field|input) (is |appears?|shows?)/,
  ];

  // --- Internal reasoning / chain-of-thought (LLM thinking out loud) ---
  const reasoning = [
    /^we (need|should|must|can|have|don't|already|still)\b/,
    /\bstep\s+\d+\s*(asks?|says?|instructs?|requires?|tells?|is\b|:)/,
    /^(so|thus|therefore|hence)[, ]/,
    /\bproceed (to |with )?handoff/,
    /\bproceed to (step|the|calling|search|open|handoff)\b/,
    /^(but|however|since|because|although)\s+(the |if |we |it |user|product|budget|items?|they|this)/,
    /^let'?s\s+(handoff|proceed|skip|ask|move|continue|call|use|go|start|check|extract|parse)/,
    /\binstructions?\s+(say|require|mention|state|tell|specify|ask)/,
    /\bskill\.?md\b/i,
    /\b(product|budget|items?|address|destination|dates?|params?|required info)\s+(is |are |was )?(already |now )?(known|provided|given|specified|mentioned|set|available|clear|extracted)/,
    /\b(skip|skipping)\s+(step|this|the|asking|product|items?)/,
    /\bno\s+(ask|question|input|prompt)\s+(needed|required|necessary)/,
    /\brequired (info|information|params?|data|fields?)\b/,
    /^(additionally|furthermore|moreover|in that case|in this case|given that|note that|considering)\b/,
    /\b(extracted?|extract(ing|s)?)\s+(from|the |all |param|value|info)/,
    /^(the |this )?(user|customer|person) (wants?|needs?|is (looking|asking|trying)|requested?|said)\b.*\.\s*(so|let|but|step|we|i|now|proceed|since)/i,
  ];

  const allPatterns = [...observational, ...action, ...status, ...thirdPerson, ...browserInternals, ...reasoning];
  return allPatterns.some(p => p.test(lower));
}

/**
 * Combined check: should this message be suppressed from the user's chat UI?
 * Merges tool-label detection + natural language narration detection.
 *
 * Use this in task-manager.ts (laptop) and execute/route.ts (cloud) as the
 * single gate for message filtering before SSE dispatch.
 */
export function shouldSuppressMessage(message: string | undefined): boolean {
  return isInternalToolLabel(message) || isAgentNarration(message);
}
