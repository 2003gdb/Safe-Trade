
import { Injectable } from "@nestjs/common";
import { DbService } from "src/db/db.service";

export interface TrendData {
    attack_type: string;
    count: number;
    percentage: number;
    trend_direction?: 'increasing' | 'decreasing' | 'stable';
}

export interface CommunityStats {
    total_reports: number;
    active_period: string;
    most_common_attack: string;
    highest_impact_count: number;
    anonymous_percentage: number;
}


@Injectable()
export class ComunidadRepository {
    constructor(private readonly db: DbService) {}

    async getAttackTypeTrends(days: number = 30): Promise<TrendData[]> {
        const sql = `
            SELECT
                at.name as attack_type,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reports WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY))), 2) as percentage
            FROM reports r
            JOIN attack_types at ON r.attack_type = at.id
            WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY at.name, at.id
            ORDER BY count DESC
        `;
        const [rows] = await this.db.getPool().query(sql, [days, days]);
        return rows as TrendData[];
    }

    async getImpactLevelTrends(days: number = 30): Promise<TrendData[]> {
        const sql = `
            SELECT
                i.name as attack_type,
                COUNT(*) as count,
                ROUND((COUNT(*) * 100.0 / (SELECT COUNT(*) FROM reports WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY))), 2) as percentage
            FROM reports r
            JOIN impacts i ON r.impact = i.id
            WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY i.name, i.id
            ORDER BY count DESC
        `;
        const [rows] = await this.db.getPool().query(sql, [days, days]);
        return rows as TrendData[];
    }

    async getTimeBasedTrends(days: number = 7): Promise<{ date: string; count: number }[]> {
        const sql = `
            SELECT
                DATE(created_at) as date,
                COUNT(*) as count
            FROM reports
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY DATE(created_at)
            ORDER BY date ASC
        `;
        const [rows] = await this.db.getPool().query(sql, [days]);
        return rows as { date: string; count: number }[];
    }

    async getCommunityStats(days: number = 30): Promise<CommunityStats> {
        const totalSql = `
            SELECT COUNT(*) as total FROM reports
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        const [totalRows] = await this.db.getPool().query(totalSql, [days]);
        const total = (totalRows as { total: number }[])[0].total;

        const mostCommonSql = `
            SELECT at.name as attack_type, COUNT(*) as count
            FROM reports r
            JOIN attack_types at ON r.attack_type = at.id
            WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            GROUP BY at.name, at.id
            ORDER BY count DESC
            LIMIT 1
        `;
        const [mostCommonRows] = await this.db.getPool().query(mostCommonSql, [days]);
        const mostCommon = (mostCommonRows as { attack_type: string; count: number }[])[0];

        const highImpactSql = `
            SELECT COUNT(*) as count FROM reports
            WHERE impact IN (2, 3, 4)
            AND created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        const [highImpactRows] = await this.db.getPool().query(highImpactSql, [days]);
        const highImpact = (highImpactRows as { count: number }[])[0].count;

        const anonymousSql = `
            SELECT
                COUNT(CASE WHEN is_anonymous = TRUE THEN 1 END) as anonymous_count,
                COUNT(*) as total_count
            FROM reports
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
        `;
        const [anonymousRows] = await this.db.getPool().query(anonymousSql, [days]);
        const anonymousData = (anonymousRows as { anonymous_count: number; total_count: number }[])[0];
        const anonymousPercentage = total > 0 ? Math.round((anonymousData.anonymous_count / total) * 100) : 0;

        return {
            total_reports: total,
            active_period: `${days} días`,
            most_common_attack: mostCommon?.attack_type || 'N/A',
            highest_impact_count: highImpact,
            anonymous_percentage: anonymousPercentage
        };
    }

    async getSimilarReports(attackType: number, impactLevel: number, limit: number = 5): Promise<unknown[]> {
        const sql = `
            SELECT
                id,
                attack_type,
                impact,
                description,
                created_at,
                CASE WHEN is_anonymous = TRUE THEN 'Anónimo' ELSE 'Usuario registrado' END as reporter_type
            FROM reports
            WHERE attack_type = ? AND impact = ?
            AND created_at >= DATE_SUB(NOW(), INTERVAL 90 DAY)
            ORDER BY created_at DESC
            LIMIT ?
        `;
        const [rows] = await this.db.getPool().query(sql, [attackType, impactLevel, limit]);
        return rows as unknown[];
    }

    async getTopSuspiciousOrigins(days: number = 30, limit: number = 10) {
        const sql = `
            SELECT
                attack_origin,
                COUNT(*) as report_count,
                GROUP_CONCAT(DISTINCT attack_type) as attack_types
            FROM reports
            WHERE created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
            AND attack_origin IS NOT NULL
            GROUP BY attack_origin
            HAVING report_count > 1
            ORDER BY report_count DESC
            LIMIT ?
        `;
        const [rows] = await this.db.getPool().query(sql, [days, limit]);
        return rows;
    }

}