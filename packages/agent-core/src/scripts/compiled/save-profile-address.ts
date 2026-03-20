/**
 * Save a user's address to their ShofferAI profile — fast, no browser needed.
 *
 * This is a utility script called by the agent whenever a user provides a new
 * delivery/billing address during any conversation. Instead of slow LLM tool
 * calls, this runs instantly via the ScriptPlayer child-process protocol.
 *
 * Params (passed as JSON in argv[2]):
 *   label           — "Home" | "Office" | "Other" | custom (required)
 *   line1           — Street, building, area (required)
 *   pincode         — 6-digit Indian PIN code (required)
 *   flatNo          — Flat / house number (optional)
 *   line2           — Address line 2 (optional)
 *   city            — City / district (optional — auto-filled from pincode)
 *   state           — State (optional — auto-filled from pincode)
 *   contactNumber   — Phone for this address (optional)
 *
 * Protocol: communicates with ScriptPlayer via JSON lines on stdin/stdout.
 *   Sends:    { type: "save_address", address: { ... } }
 *   Receives: { saved: true, addresses: [...] } or { error: "..." }
 *
 * Also callable from any other compiled script via:
 *   requestFromHost({ type: 'save_address', address: { label, line1, pincode, ... } })
 */
export const SCRIPT_CODE = `
const readline = require('readline');

(async () => {
  // ── Parse inputs ─────────────────────────────────────────────────
  const params = JSON.parse(process.argv[2] || '{}');
  const userContext = process.argv[3] ? JSON.parse(process.argv[3]) : {};

  const log = (data) => console.log(JSON.stringify(data));

  // ── Messaging protocol (same as other compiled scripts) ──────────
  const rl = readline.createInterface({ input: process.stdin });
  const pendingReads = [];

  rl.on('line', (line) => {
    try {
      const data = JSON.parse(line);
      if (pendingReads.length > 0) {
        const resolve = pendingReads.shift();
        resolve(data);
      }
    } catch {}
  });

  function requestFromHost(msg) {
    return new Promise((resolve) => {
      pendingReads.push(resolve);
      log(msg);
    });
  }

  try {
    // ── Validate required fields ────────────────────────────────────
    const label = (params.label || '').trim();
    const line1 = (params.line1 || '').trim();
    const pincode = (params.pincode || '').trim();

    if (!line1) {
      log({ error: 'Missing required param: line1 (street address)' });
      process.exit(1);
    }
    if (!pincode || !/^\\d{6}$/.test(pincode)) {
      log({ error: 'Missing or invalid param: pincode (must be 6-digit Indian PIN)' });
      process.exit(1);
    }

    log({ step: 'Saving address to profile...', status: 'running' });

    // ── Build address object ────────────────────────────────────────
    const address = {
      label: label || 'Home',
      flatNo: (params.flatNo || '').trim() || undefined,
      line1,
      line2: (params.line2 || '').trim() || undefined,
      city: (params.city || '').trim() || undefined,
      state: (params.state || '').trim() || undefined,
      pincode,
      contactNumber: (params.contactNumber || params.phone || '').trim() || undefined,
    };

    // Build the concatenated address string
    address.address = [
      address.flatNo, address.line1, address.line2,
      address.city, address.state, address.pincode,
    ].filter(Boolean).join(', ');

    // ── Auto-fill city/state from pincode if not provided ───────────
    if (!address.city || !address.state) {
      try {
        const https = require('https');
        const pinData = await new Promise((resolve, reject) => {
          https.get('https://api.postalpincode.in/pincode/' + pincode, (res) => {
            let body = '';
            res.on('data', (chunk) => body += chunk);
            res.on('end', () => {
              try { resolve(JSON.parse(body)); } catch { resolve(null); }
            });
          }).on('error', reject);
        });

        if (pinData && pinData[0] && pinData[0].Status === 'Success' && pinData[0].PostOffice?.length) {
          const po = pinData[0].PostOffice[0];
          if (!address.city) address.city = po.District || po.Division;
          if (!address.state) address.state = po.State;
          // Rebuild concatenated address with auto-filled city/state
          address.address = [
            address.flatNo, address.line1, address.line2,
            address.city, address.state, address.pincode,
          ].filter(Boolean).join(', ');
        }
      } catch {
        // Pincode lookup failed — city/state stay empty, non-blocking
      }
    }

    // ── Ask host (ScriptPlayer) to save the address ─────────────────
    log({ step: 'Updating profile with new address...', status: 'running' });

    const result = await requestFromHost({
      type: 'save_address',
      address,
    });

    if (result.error) {
      log({ error: 'Failed to save address: ' + result.error });
      process.exit(1);
    }

    const savedCount = result.addressCount || '?';
    log({
      message: '✅ Address saved to your profile — ' +
        address.label + ': ' + address.address +
        ' (you now have ' + savedCount + ' saved address' + (savedCount === 1 ? '' : 'es') + ')',
    });
    log({ step: 'Address saved successfully', status: 'done' });
    log({ done: true });
  } catch (err) {
    log({ error: 'Unexpected error: ' + (err.message || err) });
    process.exit(1);
  } finally {
    rl.close();
  }
})();
`;

export const SKILL_ID = 'save-profile-address';
export const REQUIRED_PARAMS = ['line1', 'pincode'];
