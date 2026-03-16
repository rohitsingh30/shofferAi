import { describe, it, expect, vi, beforeEach } from 'vitest';
import { mockDeep } from 'vitest-mock-extended';
import type { PrismaClient } from '@prisma/client';
import { CredentialVault } from './vault';

vi.mock('./encryption', () => ({
  encrypt: vi.fn((plaintext: string) => ({
    encrypted: 'enc_' + plaintext,
    iv: 'iv_123',
    authTag: 'tag_456',
  })),
  decrypt: vi.fn((_encrypted: string) => {
    // Return a default; tests override via mockReturnValueOnce
    return '{"cardNumber":"4111","cvv":"123","expiryMonth":"12","expiryYear":"2025","nameOnCard":"Test"}';
  }),
}));

describe('CredentialVault', () => {
  let prisma: ReturnType<typeof mockDeep<PrismaClient>>;
  let vault: CredentialVault;

  beforeEach(() => {
    prisma = mockDeep<PrismaClient>();
    vault = new CredentialVault(prisma);
    vi.clearAllMocks();
  });

  describe('store', () => {
    it('encrypts data and creates credential record', async () => {
      prisma.credential.create.mockResolvedValue({ id: 'cred-1' } as any);
      const data = { cardNumber: '4111', cvv: '123', expiryMonth: '12', expiryYear: '2025', nameOnCard: 'Test' };

      const id = await vault.store('user-1', 'card', 'My Card', data, '4111');
      expect(id).toBe('cred-1');

      expect(prisma.credential.create).toHaveBeenCalledWith({
        data: {
          userId: 'user-1',
          type: 'card',
          label: 'My Card',
          lastFour: '4111',
          encryptedData: expect.stringContaining('enc_'),
          iv: 'iv_123',
          authTag: 'tag_456',
        },
      });
    });

    it('passes null for lastFour when not provided', async () => {
      prisma.credential.create.mockResolvedValue({ id: 'cred-1' } as any);
      await vault.store('user-1', 'upi', 'My UPI', { upiId: 'test@upi' });
      expect(prisma.credential.create.mock.calls[0][0].data.lastFour).toBeNull();
    });
  });

  describe('retrieve', () => {
    it('fetches credential and decrypts', async () => {
      prisma.credential.findFirst.mockResolvedValue({
        id: 'cred-1',
        userId: 'user-1',
        encryptedData: 'enc_data',
        iv: 'iv_123',
        authTag: 'tag_456',
      } as any);

      const result = await vault.retrieve('cred-1', 'user-1');
      expect(result).toHaveProperty('cardNumber');
    });

    it('throws when credential not found', async () => {
      prisma.credential.findFirst.mockResolvedValue(null);
      await expect(vault.retrieve('cred-99', 'user-1')).rejects.toThrow('Credential cred-99 not found');
    });
  });

  describe('list', () => {
    it('returns credentials without encrypted data', async () => {
      prisma.credential.findMany.mockResolvedValue([
        { id: 'c1', type: 'card', label: 'Visa', lastFour: '4242', createdAt: new Date() },
      ] as any);

      const result = await vault.list('user-1');
      expect(result).toHaveLength(1);
      expect(result[0]).toHaveProperty('label', 'Visa');
    });

    it('passes correct select and orderBy', async () => {
      prisma.credential.findMany.mockResolvedValue([]);
      await vault.list('user-1');
      expect(prisma.credential.findMany).toHaveBeenCalledWith({
        where: { userId: 'user-1' },
        select: {
          id: true,
          type: true,
          label: true,
          lastFour: true,
          createdAt: true,
        },
        orderBy: { createdAt: 'desc' },
      });
    });
  });

  describe('delete', () => {
    it('calls deleteMany with id and userId', async () => {
      prisma.credential.deleteMany.mockResolvedValue({ count: 1 } as any);
      await vault.delete('cred-1', 'user-1');
      expect(prisma.credential.deleteMany).toHaveBeenCalledWith({
        where: { id: 'cred-1', userId: 'user-1' },
      });
    });
  });

  describe('getFieldValue', () => {
    beforeEach(() => {
      prisma.credential.findFirst.mockResolvedValue({
        id: 'c1', userId: 'u1', encryptedData: 'e', iv: 'i', authTag: 'a',
      } as any);
    });

    it('extracts card_number from card data', async () => {
      const { decrypt } = await import('./encryption');
      vi.mocked(decrypt).mockReturnValueOnce(
        JSON.stringify({ cardNumber: '4111111111111111', cvv: '123', expiryMonth: '12', expiryYear: '25', nameOnCard: 'Test' })
      );
      const val = await vault.getFieldValue('c1', 'u1', 'card_number');
      expect(val).toBe('4111111111111111');
    });

    it('extracts upi_id from UPI data', async () => {
      const { decrypt } = await import('./encryption');
      vi.mocked(decrypt).mockReturnValueOnce(JSON.stringify({ upiId: 'test@ybl' }));
      const val = await vault.getFieldValue('c1', 'u1', 'upi_id');
      expect(val).toBe('test@ybl');
    });

    it('extracts password from site_login data', async () => {
      const { decrypt } = await import('./encryption');
      vi.mocked(decrypt).mockReturnValueOnce(JSON.stringify({ username: 'user', password: 'pass123' }));
      const val = await vault.getFieldValue('c1', 'u1', 'password');
      expect(val).toBe('pass123');
    });

    it('extracts city from address data', async () => {
      const { decrypt } = await import('./encryption');
      vi.mocked(decrypt).mockReturnValueOnce(
        JSON.stringify({ line1: '123 Main', city: 'Mumbai', state: 'MH', pincode: '400001' })
      );
      const val = await vault.getFieldValue('c1', 'u1', 'city');
      expect(val).toBe('Mumbai');
    });

    it('throws for unknown field type', async () => {
      await expect(vault.getFieldValue('c1', 'u1', 'ssn')).rejects.toThrow('Unknown field type: ssn');
    });

    it('throws when field not found in credential data', async () => {
      const { decrypt } = await import('./encryption');
      vi.mocked(decrypt).mockReturnValueOnce(JSON.stringify({ upiId: 'test@ybl' }));
      await expect(vault.getFieldValue('c1', 'u1', 'card_number')).rejects.toThrow('Field card_number not found');
    });
  });
});
