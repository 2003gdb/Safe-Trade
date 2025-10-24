import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";
import { generateSalt, hashPassword, verifyPassword } from "src/util/hash/hash.util";

export type AdminUser = {
    id: number;
    email: string;
    pass_hash: string;
    salt: string;
    created_at: Date;
};

@Injectable()
export class AdminRepository {
    constructor(private readonly db: DbService) {}

    async findByEmail(email: string): Promise<AdminUser | null> {
        const sql = `SELECT * FROM admin_users WHERE email = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [email]);
        const result = rows as AdminUser[];
        return result[0] || null;
    }

    async findById(id: number): Promise<AdminUser | null> {
        const sql = `SELECT * FROM admin_users WHERE id = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [id]);
        const result = rows as AdminUser[];
        return result[0] || null;
    }

    async validateAdmin(email: string, password: string): Promise<AdminUser | null> {
        const admin = await this.findByEmail(email);
        if (!admin) {
            return null;
        }

        const isValid = await verifyPassword(password, admin.salt, admin.pass_hash);
        return isValid ? admin : null;
    }


    async createAdmin(email: string, password: string): Promise<AdminUser | null> {
        const salt = generateSalt();
        const hashedPassword = await hashPassword(password, salt);
        const sql = `INSERT INTO admin_users (email, pass_hash, salt) VALUES (?, ?, ?)`;

        try {
            const [result] = await this.db.getPool().query(sql, [email, hashedPassword, salt]);
            const insertResult = result as { insertId: number };
            return this.findById(insertResult.insertId);
        } catch (error) {
            return null;
        }
    }
}
