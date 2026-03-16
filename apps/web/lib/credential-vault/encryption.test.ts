import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { randomBytes } from 'crypto';

// Generate a valid 32-byte key for tests
const TEST_KEY = randomBytes(32).toString('hex');

describe('encryption', () => {
  let encrypt: typeof import('./encryption').encrypt;
  let decrypt: typeof import('./encryption').decrypt;

  beforeEach(async () => {
    vi.resetModules();
    vi.stubEnv('CREDENTIAL_ENCRYPTION_KEY', TEST_KEY);
    const mod = await import('./encryption');
    encrypt = mod.encrypt;
    decrypt = mod.decrypt;
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('encrypt returns object with encrypted, iv, authTag fields', () => {
    const result = encrypt('hello');
    expect(result).toHaveProperty('encrypted');
    expect(result).toHaveProperty('iv');
    expect(result).toHaveProperty('authTag');
  });

  it('encrypt output is hex-encoded strings', () => {
    const result = encrypt('test');
    const hexRegex = /^[0-9a-f]+$/;
    expect(result.encrypted).toMatch(hexRegex);
    expect(result.iv).toMatch(hexRegex);
    expect(result.authTag).toMatch(hexRegex);
  });

  it('roundtrip: decrypt(encrypt(plaintext)) returns original', () => {
    const original = 'sensitive data 123!@#';
    const { encrypted, iv, authTag } = encrypt(original);
    expect(decrypt(encrypted, iv, authTag)).toBe(original);
  });

  it('roundtrip works with JSON data', () => {
    const json = JSON.stringify({ cardNumber: '4111111111111111', cvv: '123' });
    const { encrypted, iv, authTag } = encrypt(json);
    expect(decrypt(encrypted, iv, authTag)).toBe(json);
  });

  it('roundtrip works with unicode/special characters', () => {
    const unicode = '🔐 पासवर्ड café naïve';
    const { encrypted, iv, authTag } = encrypt(unicode);
    expect(decrypt(encrypted, iv, authTag)).toBe(unicode);
  });

  it('different encrypt calls produce different IVs', () => {
    const r1 = encrypt('same text');
    const r2 = encrypt('same text');
    expect(r1.iv).not.toBe(r2.iv);
    expect(r1.encrypted).not.toBe(r2.encrypted);
  });

  it('decrypt with wrong authTag throws', () => {
    const { encrypted, iv } = encrypt('test');
    const wrongTag = randomBytes(16).toString('hex');
    expect(() => decrypt(encrypted, iv, wrongTag)).toThrow();
  });

  it('decrypt with wrong iv throws', () => {
    const { encrypted, authTag } = encrypt('test');
    const wrongIv = randomBytes(16).toString('hex');
    expect(() => decrypt(encrypted, wrongIv, authTag)).toThrow();
  });
});

describe('encryption key validation', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('throws when CREDENTIAL_ENCRYPTION_KEY is not set', async () => {
    vi.stubEnv('CREDENTIAL_ENCRYPTION_KEY', '');
    const { encrypt } = await import('./encryption');
    expect(() => encrypt('test')).toThrow('CREDENTIAL_ENCRYPTION_KEY environment variable is required');
  });

  it('throws when key is wrong length', async () => {
    vi.stubEnv('CREDENTIAL_ENCRYPTION_KEY', 'deadbeef'); // Only 4 bytes
    const { encrypt } = await import('./encryption');
    expect(() => encrypt('test')).toThrow('32-byte hex string');
  });
});
