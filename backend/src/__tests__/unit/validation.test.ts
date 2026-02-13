import { describe, it, expect } from '@jest/globals';
import {
  validateSqlSafe,
  validateId,
  validateEmail,
  validateUrl,
  validateUsername,
  validateStrongPassword,
  validateNoPathTraversal,
} from '../../utils/validation';

describe('Validation Utils', () => {
  describe('validateSqlSafe', () => {
    it('deve retornar true para strings seguras', () => {
      expect(validateSqlSafe('normal text')).toBe(true);
      expect(validateSqlSafe('user123')).toBe(true);
      expect(validateSqlSafe('test@example.com')).toBe(true);
    });

    it('deve retornar false para padrões SQL perigosos', () => {
      expect(validateSqlSafe('SELECT * FROM users')).toBe(false);
      expect(validateSqlSafe("' OR 1=1 --")).toBe(false);
      expect(validateSqlSafe('DROP TABLE users')).toBe(false);
      expect(validateSqlSafe('UNION SELECT')).toBe(false);
    });
  });

  describe('validateId', () => {
    it('deve validar UUIDs', () => {
      expect(validateId('123e4567-e89b-12d3-a456-426614174000')).toBe(true);
    });

    it('deve validar números inteiros', () => {
      expect(validateId('123')).toBe(true);
      expect(validateId('999')).toBe(true);
    });

    it('deve rejeitar IDs inválidos', () => {
      expect(validateId('abc')).toBe(false);
      expect(validateId('12.5')).toBe(false);
    });
  });

  describe('validateEmail', () => {
    it('deve validar emails válidos', () => {
      expect(validateEmail('test@example.com')).toBe(true);
      expect(validateEmail('user.name+tag@example.co.uk')).toBe(true);
    });

    it('deve rejeitar emails inválidos', () => {
      expect(validateEmail('invalid')).toBe(false);
      expect(validateEmail('@example.com')).toBe(false);
      expect(validateEmail('test@')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('deve validar URLs válidas', () => {
      expect(validateUrl('https://example.com')).toBe(true);
      expect(validateUrl('http://test.example.com/path')).toBe(true);
    });

    it('deve rejeitar URLs inválidas', () => {
      expect(validateUrl('not-a-url')).toBe(false);
      expect(validateUrl('ftp://example.com')).toBe(false);
    });
  });

  describe('validateUsername', () => {
    it('deve validar usernames válidos', () => {
      expect(validateUsername('user123')).toBe(true);
      expect(validateUsername('test_user')).toBe(true);
      expect(validateUsername('user-name')).toBe(true);
    });

    it('deve rejeitar usernames inválidos', () => {
      expect(validateUsername('ab')).toBe(false); // muito curto
      expect(validateUsername('a'.repeat(31))).toBe(false); // muito longo
      expect(validateUsername('user@name')).toBe(false); // caractere inválido
      expect(validateUsername('user name')).toBe(false); // espaço
    });
  });

  describe('validateStrongPassword', () => {
    it('deve validar senha forte', () => {
      const result = validateStrongPassword('StrongP@ss123');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('deve rejeitar senha fraca - muito curta', () => {
      const result = validateStrongPassword('Weak1@');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve ter no mínimo 8 caracteres');
    });

    it('deve rejeitar senha sem maiúscula', () => {
      const result = validateStrongPassword('weak@pass123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos uma letra maiúscula');
    });

    it('deve rejeitar senha sem caractere especial', () => {
      const result = validateStrongPassword('WeakPass123');
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Senha deve conter pelo menos um caractere especial');
    });
  });

  describe('validateNoPathTraversal', () => {
    it('deve validar paths seguros', () => {
      expect(validateNoPathTraversal('folder/file.txt')).toBe(true);
      expect(validateNoPathTraversal('images/avatar.jpg')).toBe(true);
    });

    it('deve rejeitar path traversal', () => {
      expect(validateNoPathTraversal('../../../etc/passwd')).toBe(false);
      expect(validateNoPathTraversal('~/sensitive/file')).toBe(false);
    });
  });
});
