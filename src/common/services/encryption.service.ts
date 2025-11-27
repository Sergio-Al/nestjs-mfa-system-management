import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

@Injectable()
export class EncryptionService {
  private readonly algorithm = 'aes-256-gcm';
  private readonly keyLength = 32; // 256 bits
  private readonly ivLength = 16; // 128 bits
  private readonly tagLength = 16; // 128 bits
  private readonly key: Buffer;

  constructor(private configService: ConfigService) {
    const encryptionKey = this.configService.get<string>('ENCRYPTION_KEY');

    if (!encryptionKey) {
      throw new Error(
        'ENCRYPTION_KEY must be set in environment variables. Generate one with: openssl rand -hex 32',
      );
    }

    // Derive a 256-bit key from the provided key using SHA-256
    this.key = crypto.createHash('sha256').update(encryptionKey).digest();
  }

  /**
   * Encrypts a plaintext string using AES-256-GCM
   * Returns: iv:authTag:encryptedData (all in hex)
   */
  encrypt(plaintext: string): string {
    if (!plaintext) {
      return null;
    }

    const iv = crypto.randomBytes(this.ivLength);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);

    let encrypted = cipher.update(plaintext, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    // Format: iv:authTag:encryptedData
    return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
  }

  /**
   * Decrypts an encrypted string using AES-256-GCM
   * Expects format: iv:authTag:encryptedData (all in hex)
   */
  decrypt(encryptedData: string): string {
    if (!encryptedData) {
      return null;
    }

    try {
      const parts = encryptedData.split(':');
      if (parts.length !== 3) {
        throw new Error('Invalid encrypted data format');
      }

      const iv = Buffer.from(parts[0], 'hex');
      const authTag = Buffer.from(parts[1], 'hex');
      const encrypted = parts[2];

      const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt data: Invalid or tampered data');
    }
  }

  /**
   * Hash a value using SHA-256 (one-way, for comparison purposes)
   */
  hash(value: string): string {
    return crypto.createHash('sha256').update(value).digest('hex');
  }

  /**
   * Generate a secure random string
   */
  generateSecureRandom(length = 32): string {
    return crypto.randomBytes(length).toString('hex');
  }
}
