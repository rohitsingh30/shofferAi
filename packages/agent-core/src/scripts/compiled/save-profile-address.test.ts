import { describe, it, expect, vi, beforeEach } from 'vitest';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as os from 'os';
import * as path from 'path';
import { SCRIPT_CODE, SKILL_ID, REQUIRED_PARAMS } from './save-profile-address';

// Test the exports
describe('save-profile-address exports', () => {
  it('exports correct SKILL_ID', () => {
    expect(SKILL_ID).toBe('save-profile-address');
  });

  it('exports required params', () => {
    expect(REQUIRED_PARAMS).toEqual(['line1', 'pincode']);
  });

  it('exports non-empty SCRIPT_CODE', () => {
    expect(SCRIPT_CODE.length).toBeGreaterThan(100);
  });
});

// Integration test: run the script as a child process (same way ScriptPlayer does)
describe('save-profile-address script execution', () => {
  let tmpFile: string;

  beforeEach(() => {
    tmpFile = path.join(os.tmpdir(), `test-save-addr-${Date.now()}.js`);
    fs.writeFileSync(tmpFile, SCRIPT_CODE);
  });

  afterEach(() => {
    try { fs.unlinkSync(tmpFile); } catch {}
  });

  function runScript(
    params: Record<string, string>,
    userContext: Record<string, unknown> = {}
  ): Promise<{ messages: Array<Record<string, unknown>>; exitCode: number | null }> {
    return new Promise((resolve) => {
      const child = spawn('node', [tmpFile, JSON.stringify(params), JSON.stringify(userContext)], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const messages: Array<Record<string, unknown>> = [];
      let stdout = '';

      child.stdout!.on('data', (data: Buffer) => {
        stdout += data.toString();
        const lines = stdout.split('\n');
        stdout = lines.pop() || ''; // keep incomplete line
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            messages.push(msg);

            // Respond to save_address request
            if (msg.type === 'save_address') {
              child.stdin!.write(JSON.stringify({ saved: true, addressCount: 1 }) + '\n');
            }
          } catch {}
        }
      });

      child.on('close', (code) => {
        // Process any remaining stdout
        if (stdout.trim()) {
          try { messages.push(JSON.parse(stdout.trim())); } catch {}
        }
        resolve({ messages, exitCode: code });
      });
    });
  }

  it('validates missing line1', async () => {
    const { messages, exitCode } = await runScript({ pincode: '560001' });
    expect(exitCode).toBe(1);
    const errorMsg = messages.find((m) => m.error);
    expect(errorMsg?.error).toContain('line1');
  });

  it('validates missing pincode', async () => {
    const { messages, exitCode } = await runScript({ line1: '123 Main St' });
    expect(exitCode).toBe(1);
    const errorMsg = messages.find((m) => m.error);
    expect(errorMsg?.error).toContain('pincode');
  });

  it('validates invalid pincode (not 6 digits)', async () => {
    const { messages, exitCode } = await runScript({ line1: '123 Main St', pincode: '1234' });
    expect(exitCode).toBe(1);
    const errorMsg = messages.find((m) => m.error);
    expect(errorMsg?.error).toContain('pincode');
  });

  it('sends save_address to host and completes on success', async () => {
    const { messages, exitCode } = await runScript({
      label: 'Home',
      line1: 'MG Road, Indiranagar',
      pincode: '560038',
      flatNo: '42B',
      city: 'Bangalore',
      state: 'Karnataka',
    });

    expect(exitCode).toBe(0);

    // Should have sent a save_address message
    const saveMsg = messages.find((m) => m.type === 'save_address');
    expect(saveMsg).toBeDefined();
    expect(saveMsg!.address).toMatchObject({
      label: 'Home',
      line1: 'MG Road, Indiranagar',
      pincode: '560038',
      flatNo: '42B',
      city: 'Bangalore',
      state: 'Karnataka',
    });

    // Should have the concatenated address string
    const addr = saveMsg!.address as Record<string, string>;
    expect(addr.address).toContain('MG Road, Indiranagar');
    expect(addr.address).toContain('560038');

    // Should report success
    const doneMsg = messages.find((m) => m.done);
    expect(doneMsg).toBeDefined();

    // Should show user-facing message
    const userMsg = messages.find((m) => m.message);
    expect(userMsg?.message).toContain('Address saved');
    expect(userMsg?.message).toContain('Home');
  });

  it('defaults label to Home when not provided', async () => {
    const { messages, exitCode } = await runScript({
      line1: '456 Park Avenue',
      pincode: '110001',
      city: 'New Delhi',
      state: 'Delhi',
    });

    expect(exitCode).toBe(0);
    const saveMsg = messages.find((m) => m.type === 'save_address');
    expect((saveMsg!.address as Record<string, string>).label).toBe('Home');
  });

  it('handles host save failure gracefully', async () => {
    // Custom runner that returns an error from host
    const result = await new Promise<{ messages: Array<Record<string, unknown>>; exitCode: number | null }>((resolve) => {
      const child = spawn('node', [tmpFile, JSON.stringify({ line1: 'Test St', pincode: '560001', city: 'Bangalore', state: 'Karnataka' }), '{}'], {
        stdio: ['pipe', 'pipe', 'pipe'],
      });

      const messages: Array<Record<string, unknown>> = [];
      let stdout = '';

      child.stdout!.on('data', (data: Buffer) => {
        stdout += data.toString();
        const lines = stdout.split('\n');
        stdout = lines.pop() || '';
        for (const line of lines) {
          if (!line.trim()) continue;
          try {
            const msg = JSON.parse(line);
            messages.push(msg);
            if (msg.type === 'save_address') {
              child.stdin!.write(JSON.stringify({ error: 'Database connection failed' }) + '\n');
            }
          } catch {}
        }
      });

      child.on('close', (code) => {
        if (stdout.trim()) {
          try { messages.push(JSON.parse(stdout.trim())); } catch {}
        }
        resolve({ messages, exitCode: code });
      });
    });

    expect(result.exitCode).toBe(1);
    const errorMsg = result.messages.find((m) => typeof m.error === 'string' && m.error.includes('Database'));
    expect(errorMsg).toBeDefined();
  });

  it('accepts contactNumber param', async () => {
    const { messages, exitCode } = await runScript({
      label: 'Office',
      line1: 'Tech Park',
      pincode: '560103',
      contactNumber: '9876543210',
      city: 'Bangalore',
      state: 'Karnataka',
    });

    expect(exitCode).toBe(0);
    const saveMsg = messages.find((m) => m.type === 'save_address');
    expect((saveMsg!.address as Record<string, string>).contactNumber).toBe('9876543210');
  });

  it('accepts phone as alias for contactNumber', async () => {
    const { messages, exitCode } = await runScript({
      label: 'Other',
      line1: 'Warehouse 7',
      pincode: '400001',
      phone: '9123456789',
      city: 'Mumbai',
      state: 'Maharashtra',
    });

    expect(exitCode).toBe(0);
    const saveMsg = messages.find((m) => m.type === 'save_address');
    expect((saveMsg!.address as Record<string, string>).contactNumber).toBe('9123456789');
  });
});

// Test ScriptPlayer integration
describe('ScriptPlayer save_address handler', () => {
  it('is registered in COMPILED_SCRIPTS via player', async () => {
    const { ScriptPlayer } = await import('../player');
    expect(ScriptPlayer.hasScript('save-profile-address')).toBe(true);
  });
});

// Import afterEach at module level
import { afterEach } from 'vitest';
