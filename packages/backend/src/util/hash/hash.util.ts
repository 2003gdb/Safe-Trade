import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';

const SALT_ROUNDS = 12;

export const generateSalt = (): string => {
    return randomBytes(32).toString('hex');
};

export const hashPassword = async (password: string, salt: string): Promise<string> => {
    const saltedPassword = password + salt;
    return bcrypt.hash(saltedPassword, SALT_ROUNDS);
};

export const verifyPassword = async (password: string, salt: string, hash: string): Promise<boolean> => {
    const saltedPassword = password + salt;
    return bcrypt.compare(saltedPassword, hash);
};
