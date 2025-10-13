// src/common/crypto/crypto.service.ts
import { Injectable } from '@nestjs/common';
import * as crypto from 'crypto';

@Injectable()
export class CryptoService {
    private readonly algorithm = 'aes-256-cbc';
    private readonly key = crypto
        .createHash('sha256')
        .update(String(process.env.CRYPTO_SECRET || 'default_secret_key'))
        .digest(); // 32 bytes for AES-256
    private readonly ivLength = 16;

    encrypt(plainText: string): string {
        const iv = crypto.randomBytes(this.ivLength);
        const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
        let encrypted = cipher.update(plainText, 'utf8', 'base64');
        encrypted += cipher.final('base64');
        return iv.toString('base64') + ':' + encrypted;
    }

    decrypt(encryptedText: string): string {
        const [ivBase64, encryptedData] = encryptedText.split(':');
        const iv = Buffer.from(ivBase64, 'base64');
        const decipher = crypto.createDecipheriv(this.algorithm, this.key, iv);
        let decrypted = decipher.update(encryptedData, 'base64', 'utf8');
        decrypted += decipher.final('utf8');
        return decrypted;
    }
}
