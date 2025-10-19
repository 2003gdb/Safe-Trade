import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export type ReporteAdjunto = {
    id: number;
    reporte_id: number;
    file_path: string;
    file_hash: string | null;
    uploaded_at: Date;
};

export interface CreateAdjuntoData {
    reporte_id: number;
    file_path: string;
    file_hash?: string;
}

@Injectable()
export class AdjuntosRepository {
    constructor(private readonly db: DbService) {}

    async createAdjunto(data: CreateAdjuntoData): Promise<ReporteAdjunto | null> {
        const sql = `
            INSERT INTO reporte_adjuntos (reporte_id, file_path, file_hash)
            VALUES (?, ?, ?)
        `;

        const values = [
            data.reporte_id,
            data.file_path,
            data.file_hash || null
        ];

        try {
            const [result] = await this.db.getPool().query(sql, values);
            const insertResult = result as { insertId: number };
            return this.findById(insertResult.insertId);
        } catch (error) {
            console.error('Error creating adjunto:', error);
            return null;
        }
    }

    async findById(id: number): Promise<ReporteAdjunto | null> {
        const sql = `SELECT * FROM reporte_adjuntos WHERE id = ? LIMIT 1`;
        const [rows] = await this.db.getPool().query(sql, [id]);
        const result = rows as ReporteAdjunto[];
        return result[0] || null;
    }

    async findByReporteId(reporteId: number): Promise<ReporteAdjunto[]> {
        const sql = `
            SELECT * FROM reporte_adjuntos
            WHERE reporte_id = ?
            ORDER BY uploaded_at DESC
        `;
        const [rows] = await this.db.getPool().query(sql, [reporteId]);
        return rows as ReporteAdjunto[];
    }

    async deleteAdjunto(id: number): Promise<boolean> {
        const sql = `DELETE FROM reporte_adjuntos WHERE id = ?`;
        const [result] = await this.db.getPool().query(sql, [id]);
        const deleteResult = result as { affectedRows: number };
        return deleteResult.affectedRows > 0;
    }

    async deleteByReporteId(reporteId: number): Promise<boolean> {
        const sql = `DELETE FROM reporte_adjuntos WHERE reporte_id = ?`;
        const [result] = await this.db.getPool().query(sql, [reporteId]);
        const deleteResult = result as { affectedRows: number };
        return deleteResult.affectedRows > 0;
    }

    async getAdjuntoStats(): Promise<{
        total: number;
        total_size: number;
        files_with_hash: number;
    }> {
        const totalSql = `SELECT COUNT(*) as count FROM reporte_adjuntos`;
        const [totalRows] = await this.db.getPool().query(totalSql);

        const hashSql = `SELECT COUNT(*) as count FROM reporte_adjuntos WHERE file_hash IS NOT NULL`;
        const [hashRows] = await this.db.getPool().query(hashSql);

        return {
            total: (totalRows as { count: number }[])[0].count,
            total_size: 0, // Would require filesystem integration to calculate
            files_with_hash: (hashRows as { count: number }[])[0].count,
        };
    }
}