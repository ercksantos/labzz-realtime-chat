import crypto from 'crypto';

/**
 * Serviço de criptografia para dados sensíveis
 * Usa AES-256-GCM para criptografia simétrica
 */

// Chave de criptografia (deve estar em variável de ambiente)
const ENCRYPTION_KEY = process.env.ENCRYPTION_KEY || crypto.randomBytes(32).toString('hex');

// Converter chave para Buffer de 32 bytes
const getEncryptionKey = (): Buffer => {
    if (ENCRYPTION_KEY.length !== 64) {
        throw new Error('ENCRYPTION_KEY deve ter 64 caracteres hexadecimais (32 bytes)');
    }
    return Buffer.from(ENCRYPTION_KEY, 'hex');
};

/**
 * Criptografar dados
 */
export const encrypt = (text: string): string => {
    try {
        // Gerar IV (Initialization Vector) aleatório
        const iv = crypto.randomBytes(16);

        // Criar cipher
        const cipher = crypto.createCipheriv('aes-256-gcm', getEncryptionKey(), iv);

        // Criptografar
        let encrypted = cipher.update(text, 'utf8', 'hex');
        encrypted += cipher.final('hex');

        // Obter authentication tag
        const authTag = cipher.getAuthTag();

        // Retornar: iv:authTag:encrypted
        return `${iv.toString('hex')}:${authTag.toString('hex')}:${encrypted}`;
    } catch (error) {
        throw new Error(`Erro ao criptografar dados: ${error}`);
    }
};

/**
 * Descriptografar dados
 */
export const decrypt = (encryptedText: string): string => {
    try {
        // Separar iv, authTag e dados criptografados
        const parts = encryptedText.split(':');
        if (parts.length !== 3) {
            throw new Error('Formato de dados criptografados inválido');
        }

        const [ivHex, authTagHex, encrypted] = parts;
        const iv = Buffer.from(ivHex, 'hex');
        const authTag = Buffer.from(authTagHex, 'hex');

        // Criar decipher
        const decipher = crypto.createDecipheriv('aes-256-gcm', getEncryptionKey(), iv);
        decipher.setAuthTag(authTag);

        // Descriptografar
        let decrypted = decipher.update(encrypted, 'hex', 'utf8');
        decrypted += decipher.final('utf8');

        return decrypted;
    } catch (error) {
        throw new Error(`Erro ao descriptografar dados: ${error}`);
    }
};

/**
 * Hash de senha (one-way)
 * Usar bcrypt para senhas, este é para outros casos
 */
export const hash = (text: string): string => {
    return crypto.createHash('sha256').update(text).digest('hex');
};

/**
 * Comparar hash
 */
export const compareHash = (text: string, hashedText: string): boolean => {
    return hash(text) === hashedText;
};

/**
 * Gerar chave aleatória
 */
export const generateKey = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * Gerar salt aleatório
 */
export const generateSalt = (length: number = 16): string => {
    return crypto.randomBytes(length).toString('hex');
};

/**
 * HMAC para assinatura de dados
 */
export const createHmac = (data: string, secret?: string): string => {
    const hmacSecret = secret || process.env.HMAC_SECRET || ENCRYPTION_KEY;
    return crypto.createHmac('sha256', hmacSecret).update(data).digest('hex');
};

/**
 * Verificar HMAC
 */
export const verifyHmac = (data: string, signature: string, secret?: string): boolean => {
    const expectedSignature = createHmac(data, secret);
    return crypto.timingSafeEqual(
        Buffer.from(signature),
        Buffer.from(expectedSignature)
    );
};

/**
 * Criptografar objeto JSON
 */
export const encryptJson = (obj: any): string => {
    const json = JSON.stringify(obj);
    return encrypt(json);
};

/**
 * Descriptografar objeto JSON
 */
export const decryptJson = <T = any>(encryptedText: string): T => {
    const json = decrypt(encryptedText);
    return JSON.parse(json) as T;
};

/**
 * Mascarar dados sensíveis (para logs)
 */
export const maskSensitiveData = (data: string, visibleChars: number = 4): string => {
    if (data.length <= visibleChars) {
        return '*'.repeat(data.length);
    }
    return data.slice(0, visibleChars) + '*'.repeat(data.length - visibleChars);
};

/**
 * Mascarar email (para logs)
 */
export const maskEmail = (email: string): string => {
    const [username, domain] = email.split('@');
    if (!domain) return maskSensitiveData(email);

    const maskedUsername = username.slice(0, 2) + '*'.repeat(Math.max(username.length - 2, 3));
    return `${maskedUsername}@${domain}`;
};

/**
 * Gerar token seguro
 */
export const generateSecureToken = (length: number = 32): string => {
    return crypto.randomBytes(length).toString('base64url');
};

// Validar se a chave de criptografia está configurada
if (!process.env.ENCRYPTION_KEY) {
    console.warn(
        '⚠️  ENCRYPTION_KEY não configurada! Usando chave temporária. ' +
        'Configure ENCRYPTION_KEY no .env em produção.'
    );
}

export default {
    encrypt,
    decrypt,
    hash,
    compareHash,
    generateKey,
    generateSalt,
    createHmac,
    verifyHmac,
    encryptJson,
    decryptJson,
    maskSensitiveData,
    maskEmail,
    generateSecureToken,
};
