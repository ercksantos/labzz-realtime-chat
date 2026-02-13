import validator from 'validator';

/**
 * Utilitários para validação e proteção contra SQL Injection
 *
 * Nota: O Prisma ORM já oferece proteção automática contra SQL Injection
 * usando prepared statements. Estas validações são camadas adicionais de segurança.
 */

// Validar que uma string não contém padrões suspeitos de SQL injection
export const validateSqlSafe = (input: string): boolean => {
  const sqlPatterns = [
    /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|CREATE|ALTER|EXEC|EXECUTE|UNION|DECLARE)\b)/gi,
    /(--|;|\/\*|\*\/|xp_|sp_)/gi,
    /('|"|`)(.*?)(OR|AND|=|>|<)(.*?)('|"|`)/gi,
  ];

  return !sqlPatterns.some((pattern) => pattern.test(input));
};

// Validar ID (deve ser UUID ou número)
export const validateId = (id: string): boolean => {
  return validator.isUUID(id) || validator.isInt(id);
};

// Validar email
export const validateEmail = (email: string): boolean => {
  return validator.isEmail(email);
};

// Validar URL
export const validateUrl = (url: string): boolean => {
  return validator.isURL(url, {
    protocols: ['http', 'https'],
    require_protocol: true,
  });
};

// Validar que não há caracteres perigosos
export const validateNoSpecialChars = (input: string, allowSpaces = true): boolean => {
  const pattern = allowSpaces ? /^[a-zA-Z0-9\s._-]+$/ : /^[a-zA-Z0-9._-]+$/;
  return pattern.test(input);
};

// Validar comprimento de string
export const validateLength = (input: string, min: number, max: number): boolean => {
  return validator.isLength(input, { min, max });
};

// Validar formato de data
export const validateDate = (date: string): boolean => {
  return validator.isISO8601(date);
};

// Limpar string de caracteres potencialmente perigosos
export const cleanInput = (input: string): string => {
  return validator.escape(validator.trim(input));
};

// Validar que input é alfanumérico
export const validateAlphanumeric = (
  input: string,
  locale: 'pt-BR' | 'en-US' = 'pt-BR',
): boolean => {
  return validator.isAlphanumeric(input, locale);
};

// Validar número inteiro positivo
export const validatePositiveInt = (input: string | number): boolean => {
  const num = typeof input === 'string' ? parseInt(input, 10) : input;
  return Number.isInteger(num) && num > 0;
};

// Validar range numérico
export const validateNumberRange = (input: number, min: number, max: number): boolean => {
  return input >= min && input <= max;
};

// Whitelist de caracteres permitidos para nomes de usuário
export const validateUsername = (username: string): boolean => {
  // Permite letras, números, underscores e hífens, 3-30 caracteres
  return /^[a-zA-Z0-9_-]{3,30}$/.test(username);
};

// Validar senha forte
export const validateStrongPassword = (
  password: string,
): {
  isValid: boolean;
  errors: string[];
} => {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push('Senha deve ter no mínimo 8 caracteres');
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra maiúscula');
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Senha deve conter pelo menos uma letra minúscula');
  }

  if (!/[0-9]/.test(password)) {
    errors.push('Senha deve conter pelo menos um número');
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.push('Senha deve conter pelo menos um caractere especial');
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
};

// Validar JSON
export const validateJson = (input: string): boolean => {
  try {
    JSON.parse(input);
    return true;
  } catch {
    return false;
  }
};

// Prevenir path traversal
export const validateNoPathTraversal = (path: string): boolean => {
  const dangerousPatterns = [
    /\.\./, // ".."
    /~\//, // "~/"
    /\\/, // backslash
  ];

  return !dangerousPatterns.some((pattern) => pattern.test(path));
};
