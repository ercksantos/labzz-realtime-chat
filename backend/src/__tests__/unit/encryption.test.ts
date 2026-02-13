import { describe, it, expect } from '@jest/globals';
import {
  encrypt,
  decrypt,
  hash,
  compareHash,
  encryptJson,
  decryptJson,
  maskSensitiveData,
  maskEmail,
  generateSecureToken,
} from '../../utils/encryption';

describe('Encryption Utils', () => {
  describe('encrypt and decrypt', () => {
    it('deve criptografar e descriptografar texto', () => {
      const originalText = 'sensitive data';
      const encrypted = encrypt(originalText);
      const decrypted = decrypt(encrypted);

      expect(encrypted).not.toBe(originalText);
      expect(encrypted).toContain(':'); // IV:authTag:encrypted
      expect(decrypted).toBe(originalText);
    });

    it('deve gerar criptografias diferentes para o mesmo texto', () => {
      const text = 'test data';
      const encrypted1 = encrypt(text);
      const encrypted2 = encrypt(text);

      expect(encrypted1).not.toBe(encrypted2); // IV diferente
      expect(decrypt(encrypted1)).toBe(text);
      expect(decrypt(encrypted2)).toBe(text);
    });

    it('deve lançar erro ao descriptografar texto inválido', () => {
      expect(() => decrypt('invalid-encrypted-text')).toThrow();
    });
  });

  describe('hash and compareHash', () => {
    it('deve gerar hash consistente', () => {
      const text = 'data to hash';
      const hash1 = hash(text);
      const hash2 = hash(text);

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(text);
    });

    it('deve comparar hashes corretamente', () => {
      const text = 'original data';
      const hashed = hash(text);

      expect(compareHash(text, hashed)).toBe(true);
      expect(compareHash('wrong data', hashed)).toBe(false);
    });
  });

  describe('encryptJson and decryptJson', () => {
    it('deve criptografar e descriptografar objetos JSON', () => {
      const obj = {
        apiKey: 'secret-key-123',
        token: 'access-token-xyz',
        userId: 'user-123',
      };

      const encrypted = encryptJson(obj);
      const decrypted = decryptJson<typeof obj>(encrypted);

      expect(encrypted).not.toContain('secret-key-123');
      expect(decrypted).toEqual(obj);
    });

    it('deve lidar com objetos complexos', () => {
      const obj = {
        user: {
          id: '123',
          data: ['a', 'b', 'c'],
          meta: {
            created: '2024-01-01',
          },
        },
      };

      const encrypted = encryptJson(obj);
      const decrypted = decryptJson(encrypted);

      expect(decrypted).toEqual(obj);
    });
  });

  describe('maskSensitiveData', () => {
    it('deve mascarar dados sensíveis', () => {
      expect(maskSensitiveData('secret123456')).toBe('secr********');
      expect(maskSensitiveData('1234567890', 2)).toBe('12********');
    });

    it('deve mascarar completamente strings curtas', () => {
      expect(maskSensitiveData('abc')).toBe('***');
    });
  });

  describe('maskEmail', () => {
    it('deve mascarar emails', () => {
      expect(maskEmail('user@example.com')).toBe('us***@example.com');
      const masked = maskEmail('long.email.name@domain.com');
      expect(masked).toContain('lo');
      expect(masked).toContain('@domain.com');
      expect(masked).toContain('*');
    });

    it('deve lidar com emails inválidos', () => {
      const masked = maskEmail('not-an-email');
      expect(masked).toContain('*');
    });
  });

  describe('generateSecureToken', () => {
    it('deve gerar tokens seguros', () => {
      const token1 = generateSecureToken();
      const token2 = generateSecureToken();

      expect(token1).not.toBe(token2);
      expect(token1.length).toBeGreaterThan(0);
      expect(token2.length).toBeGreaterThan(0);
    });

    it('deve gerar tokens com tamanho personalizado', () => {
      const token = generateSecureToken(16);
      expect(token.length).toBeGreaterThan(0);
    });
  });
});
