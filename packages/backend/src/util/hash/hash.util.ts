
import { randomBytes, createHash } from 'crypto';

/**
 * Generate a unique cryptographic salt for password hashing
 * @returns {string} Hex-encoded salt
 */
export const generateSalt = (): string => {
    return randomBytes(32).toString('hex');
};

/**
 * Hash password using SHA256 with unique salt
 * @param {string} password - Plain text password
 * @param {string} salt - Unique salt for this user
 * @returns {Promise<string>} SHA256 hash
 */
export const hashPassword = async (password: string, salt: string): Promise<string> => {
    const saltedPassword = password + salt;
    return createHash('sha256').update(saltedPassword).digest('hex');
};

/**
 * Verify password against stored hash
 * @param {string} password - Plain text password
 * @param {string} salt - User's unique salt
 * @param {string} hash - Stored SHA256 hash
 * @returns {Promise<boolean>} True if password matches
 */
export const verifyPassword = async (password: string, salt: string, hash: string): Promise<boolean> => {
    const saltedPassword = password + salt;
    const computedHash = createHash('sha256').update(saltedPassword).digest('hex');
    return computedHash === hash;
};