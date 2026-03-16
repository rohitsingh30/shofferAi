import { describe, it, expect } from 'vitest';
import { CredentialType, CredentialFieldType } from './credentials';

describe('CredentialType schema', () => {
  it('accepts all valid types', () => {
    for (const t of ['card', 'upi', 'site_login', 'address']) {
      expect(CredentialType.parse(t)).toBe(t);
    }
  });

  it('rejects invalid type', () => {
    expect(() => CredentialType.parse('bank_account')).toThrow();
  });
});

describe('CredentialFieldType schema', () => {
  it('accepts all 15 field types', () => {
    const fields = [
      'card_number', 'cvv', 'expiry_month', 'expiry_year', 'name_on_card',
      'upi_id', 'username', 'password',
      'address_line1', 'address_line2', 'city', 'state', 'pincode', 'phone', 'email',
    ];
    for (const f of fields) {
      expect(CredentialFieldType.parse(f)).toBe(f);
    }
    expect(fields).toHaveLength(15);
  });

  it('rejects invalid field type', () => {
    expect(() => CredentialFieldType.parse('ssn')).toThrow();
  });
});
