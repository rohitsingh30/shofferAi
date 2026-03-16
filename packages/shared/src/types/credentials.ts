import { z } from 'zod';

export const CredentialType = z.enum(['card', 'upi', 'site_login', 'address']);
export type CredentialType = z.infer<typeof CredentialType>;

export const CredentialFieldType = z.enum([
  'card_number',
  'cvv',
  'expiry_month',
  'expiry_year',
  'name_on_card',
  'upi_id',
  'username',
  'password',
  'address_line1',
  'address_line2',
  'city',
  'state',
  'pincode',
  'phone',
  'email',
]);
export type CredentialFieldType = z.infer<typeof CredentialFieldType>;

export interface EncryptedCredential {
  id: string;
  userId: string;
  type: CredentialType;
  label: string;
  lastFour?: string;
  encryptedData: string;
  iv: string;
  authTag: string;
}

export interface FillCredentialRequest {
  credentialId: string;
  fieldSelector: string;
  fieldType: CredentialFieldType;
}

export interface CardData {
  cardNumber: string;
  expiryMonth: string;
  expiryYear: string;
  cvv: string;
  nameOnCard: string;
}

export interface UPIData {
  upiId: string;
}

export interface SiteLoginData {
  username: string;
  password: string;
}

export interface AddressData {
  line1: string;
  line2?: string;
  city: string;
  state: string;
  pincode: string;
  phone?: string;
}

export type CredentialData = CardData | UPIData | SiteLoginData | AddressData;

export interface CredentialInjectorLike {
  fill(
    request: FillCredentialRequest,
    mcpHost: { callTool(name: string, args: Record<string, unknown>): Promise<unknown> }
  ): Promise<{ success: boolean; error?: string }>;
}
