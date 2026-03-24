import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createCipheriv, createDecipheriv, createHash, randomBytes } from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const VERSION_PREFIX = 'enc:v1';

@Injectable()
export class SecretsService {
  private readonly key: Buffer;

  constructor(private readonly configService: ConfigService) {
    const rawKey = this.configService.getOrThrow<string>('CREDENTIALS_ENCRYPTION_KEY');
    this.key = createHash('sha256').update(rawKey).digest();
  }

  encrypt(plainText: string): string {
    const iv = randomBytes(12);
    const cipher = createCipheriv(ALGORITHM, this.key, iv);
    const encrypted = Buffer.concat([cipher.update(plainText, 'utf8'), cipher.final()]);
    const authTag = cipher.getAuthTag();

    return [VERSION_PREFIX, iv.toString('base64'), authTag.toString('base64'), encrypted.toString('base64')].join(':');
  }

  decrypt(encryptedText: string): string {
    const [prefix, version, ivBase64, authTagBase64, dataBase64] = encryptedText.split(':');
    if (`${prefix}:${version}` !== VERSION_PREFIX) {
      throw new Error('Unsupported encrypted secret version');
    }

    const decipher = createDecipheriv(ALGORITHM, this.key, Buffer.from(ivBase64, 'base64'));
    decipher.setAuthTag(Buffer.from(authTagBase64, 'base64'));

    const decrypted = Buffer.concat([
      decipher.update(Buffer.from(dataBase64, 'base64')),
      decipher.final()
    ]);

    return decrypted.toString('utf8');
  }

  isEncrypted(value?: string | null): boolean {
    return !!value && value.startsWith(VERSION_PREFIX);
  }
}
