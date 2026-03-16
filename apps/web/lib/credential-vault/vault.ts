import type { PrismaClient } from '@prisma/client';
import type { CredentialType, CredentialData } from '@shofferai/shared';
import { encrypt, decrypt } from './encryption';

export class CredentialVault {
  constructor(private prisma: PrismaClient) {}

  async store(
    userId: string,
    type: CredentialType,
    label: string,
    data: CredentialData,
    lastFour?: string
  ): Promise<string> {
    const plaintext = JSON.stringify(data);
    const { encrypted, iv, authTag } = encrypt(plaintext);

    const credential = await this.prisma.credential.create({
      data: {
        userId,
        type,
        label,
        lastFour: lastFour || null,
        encryptedData: encrypted,
        iv,
        authTag,
      },
    });

    return credential.id;
  }

  async retrieve(credentialId: string, userId: string): Promise<CredentialData> {
    const credential = await this.prisma.credential.findFirst({
      where: { id: credentialId, userId },
    });

    if (!credential) {
      throw new Error(`Credential ${credentialId} not found`);
    }

    const plaintext = decrypt(credential.encryptedData, credential.iv, credential.authTag);
    return JSON.parse(plaintext) as CredentialData;
  }

  async list(userId: string) {
    const credentials = await this.prisma.credential.findMany({
      where: { userId },
      select: {
        id: true,
        type: true,
        label: true,
        lastFour: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'desc' },
    });

    return credentials;
  }

  async delete(credentialId: string, userId: string): Promise<void> {
    await this.prisma.credential.deleteMany({
      where: { id: credentialId, userId },
    });
  }

  async getFieldValue(
    credentialId: string,
    userId: string,
    fieldType: string
  ): Promise<string> {
    const data = await this.retrieve(credentialId, userId);

    const fieldMap: Record<string, (d: CredentialData) => string | undefined> = {
      card_number: (d) => 'cardNumber' in d ? d.cardNumber : undefined,
      cvv: (d) => 'cvv' in d ? d.cvv : undefined,
      expiry_month: (d) => 'expiryMonth' in d ? d.expiryMonth : undefined,
      expiry_year: (d) => 'expiryYear' in d ? d.expiryYear : undefined,
      name_on_card: (d) => 'nameOnCard' in d ? d.nameOnCard : undefined,
      upi_id: (d) => 'upiId' in d ? d.upiId : undefined,
      username: (d) => 'username' in d ? d.username : undefined,
      password: (d) => 'password' in d ? d.password : undefined,
      address_line1: (d) => 'line1' in d ? d.line1 : undefined,
      address_line2: (d) => 'line2' in d ? d.line2 : undefined,
      city: (d) => 'city' in d ? d.city : undefined,
      state: (d) => 'state' in d ? d.state : undefined,
      pincode: (d) => 'pincode' in d ? d.pincode : undefined,
      phone: (d) => 'phone' in d ? d.phone : undefined,
      email: (d) => 'username' in d ? d.username : undefined,
    };

    const extractor = fieldMap[fieldType];
    if (!extractor) {
      throw new Error(`Unknown field type: ${fieldType}`);
    }

    const value = extractor(data);
    if (value === undefined) {
      throw new Error(`Field ${fieldType} not found in credential`);
    }

    return value;
  }
}
