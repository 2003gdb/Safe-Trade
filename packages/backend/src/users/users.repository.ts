// Repositorio de usuarios con queries parametrizadas para prevenir SQL injection

/* eslint-disable prettier/prettier */

import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export type User = {
    id: number;
    email: string;
    name: string;
    pass_hash: string;
    salt: string;
    created_at: Date;
};

@Injectable()
export class UsersRepository{
    constructor(private readonly db: DbService) {}

    async createUser(email: string, name: string, password_hash: string, salt: string | null): Promise<User | null>{
        const sql = `INSERT INTO users (email, name, pass_hash, salt) VALUES (?, ?, ?, ?)`;
        const [result] = await this.db.getPool().query(sql, [email, name, password_hash, salt]);
        const insertResult = result as { insertId: number };

        return this.findById(insertResult.insertId);
    }

    async findByEmail(email: string): Promise<User | null> {
        const sql = `SELECT * FROM users WHERE email = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [email]);
        const result = rows as User[];
        return result[0] || null;
    }

    async findById(id: number): Promise<User | null> {
        const sql = `SELECT * FROM users WHERE id = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [id]);
        const result = rows as User[];
        return result[0] || null;
    }

    async findAll(): Promise<User[]> {
        const sql = `SELECT id, email, name, created_at FROM users ORDER BY created_at DESC`;
        const [rows] = await this.db.getPool().query(sql);
        return rows as User[];
    }

    async updateUser(id: number, updates: Partial<Pick<User, 'email' | 'name'>>): Promise<User | null> {
        const allowedFields: Array<keyof Pick<User, 'email' | 'name'>> = ['email', 'name'];
        const fields: string[] = [];
        const values: any[] = [];

        for (const key of allowedFields) {
            if (key in updates && updates[key] !== undefined) {
                fields.push(`${key} = ?`);
                values.push(updates[key]);
            }
        }

        if (fields.length === 0) {
            return this.findById(id);
        }

        values.push(id);
        const sql = `UPDATE users SET ${fields.join(', ')} WHERE id = ?`;
        await this.db.getPool().query(sql, values);

        return this.findById(id);
    }

    async deleteUser(id: number): Promise<boolean> {
        const sql = `DELETE FROM users WHERE id = ?`;
        const [result] = await this.db.getPool().query(sql, [id]);
        const deleteResult = result as { affectedRows: number };
        return deleteResult.affectedRows > 0;
    }


    async updatePassword(id: number, passwordHash: string, salt: string | null): Promise<boolean> {
        const sql = `UPDATE users SET pass_hash = ?, salt = ? WHERE id = ?`;
        const [result] = await this.db.getPool().query(sql, [passwordHash, salt, id]);
        const updateResult = result as { affectedRows: number };
        return updateResult.affectedRows > 0;
    }
}
