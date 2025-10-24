import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { CatalogMappingService } from '../admin/catalog-mapping.service';

export interface LegacyReport {
  id: number;
  user_id: number | null;
  is_anonymous: boolean;
  attack_type: string;
  incident_date: Date;
  attack_origin: string | null;
  suspicious_url: string | null;
  message_content: string | null;
  impact_level: string;
  description: string | null;
  status: string;
  admin_notes: string | null;
  created_at: Date;
  updated_at: Date;
  user_email?: string;
  user_name?: string;
  reporter_name?: string;
}

export interface CreateLegacyReportData {
  user_id?: number | null;
  is_anonymous: boolean;
  attack_type: string;
  incident_date: string | Date;
  attack_origin: string;
  evidence_url?: string;
  suspicious_url?: string;
  message_content?: string;
  impact_level: string;
  description?: string;
}

export interface ReportFilterDto {
  status?: string;
  attack_type?: string;
  is_anonymous?: string;
  date_from?: string;
  date_to?: string;
  page?: string;
  limit?: string;
}

@Injectable()
export class ReportsRepository {
  constructor(
    private readonly db: DbService,
    private readonly catalogMappingService: CatalogMappingService
  ) {}

  private convertToNormalized(data: CreateLegacyReportData) {
    const attackTypeId = this.catalogMappingService.getAttackTypeId(data.attack_type);
    const impactId = this.catalogMappingService.getImpactId(data.impact_level);

    if (!attackTypeId || !impactId) {
      throw new Error(`Invalid enum values: attack_type=${data.attack_type}, impact_level=${data.impact_level}`);
    }

    const incidentDateTime = typeof data.incident_date === 'string'
      ? new Date(data.incident_date)
      : data.incident_date;

    return {
      user_id: data.user_id ?? null,
      is_anonymous: data.is_anonymous,
      attack_type: attackTypeId,
      incident_date: incidentDateTime,
      evidence_url: data.evidence_url ?? null,
      attack_origin: data.attack_origin ?? null,
      suspicious_url: data.suspicious_url ?? null,
      message_content: data.message_content ?? null,
      description: data.description ?? null,
      impact: impactId,
      status: 1
    };
  }

  private convertToLegacy(row: any): LegacyReport {
    return {
      id: row.id,
      user_id: row.user_id,
      is_anonymous: Boolean(row.is_anonymous),
      attack_type: this.catalogMappingService.getAttackTypeString(row.attack_type),
      incident_date: new Date(row.incident_date),
      attack_origin: row.attack_origin,
      suspicious_url: row.suspicious_url,
      message_content: row.message_content,
      impact_level: this.catalogMappingService.getImpactString(row.impact),
      description: row.description,
      status: this.catalogMappingService.getStatusString(row.status),
      admin_notes: row.admin_notes,
      created_at: row.created_at,
      updated_at: row.updated_at,
      user_email: row.user_email,
      user_name: row.user_name,
      reporter_name: row.reporter_name
    };
  }

  async createReport(data: CreateLegacyReportData): Promise<LegacyReport | null> {
    const normalizedData = this.convertToNormalized(data);

    const sql = `
      INSERT INTO reports (
        user_id, is_anonymous, attack_type, incident_date,
        evidence_url, attack_origin, suspicious_url, message_content, description, impact, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const values = [
      normalizedData.user_id,
      normalizedData.is_anonymous,
      normalizedData.attack_type,
      normalizedData.incident_date,
      normalizedData.evidence_url,
      normalizedData.attack_origin,
      normalizedData.suspicious_url,
      normalizedData.message_content,
      normalizedData.description,
      normalizedData.impact,
      normalizedData.status
    ];

    try {
      const [result] = await this.db.getPool().query(sql, values);
      const insertResult = result as { insertId: number };
      return this.findById(insertResult.insertId);
    } catch (error) {
      console.error('❌ Error creating report:', error);
      return null;
    }
  }

  async findById(id: number): Promise<LegacyReport | null> {
    const sql = `
      SELECT r.*,
             u.email as user_email,
             u.name as user_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.id = ? LIMIT 1
    `;

    const [rows] = await this.db.getPool().query(sql, [id]);
    const result = rows as any[];

    if (result.length === 0) return null;

    return this.convertToLegacy(result[0]);
  }

  async findUserReports(userId: number): Promise<LegacyReport[]> {
    const sql = `
      SELECT r.*,
             u.email as user_email,
             u.name as user_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      WHERE r.user_id = ? AND r.is_anonymous = FALSE
      ORDER BY r.created_at DESC
    `;

    const [rows] = await this.db.getPool().query(sql, [userId]);
    const result = rows as any[];

    return result.map(row => this.convertToLegacy(row));
  }

  async findAllReports(filters?: ReportFilterDto): Promise<{ reports: LegacyReport[], total: number }> {
    const conditions: string[] = [];
    const countValues: any[] = [];

    if (filters?.status) {
      const statusId = this.catalogMappingService.getStatusId(filters.status);
      if (statusId) {
        conditions.push('r.status = ?');
        countValues.push(statusId);
      }
    }

    if (filters?.attack_type) {
      const attackTypeId = this.catalogMappingService.getAttackTypeId(filters.attack_type);
      if (attackTypeId) {
        conditions.push('r.attack_type = ?');
        countValues.push(attackTypeId);
      }
    }

    if (filters?.is_anonymous !== undefined) {
      conditions.push('r.is_anonymous = ?');
      countValues.push(filters.is_anonymous === 'true');
    }

    if (filters?.date_from) {
      conditions.push('DATE(r.created_at) >= ?');
      countValues.push(filters.date_from);
    }

    if (filters?.date_to) {
      conditions.push('DATE(r.created_at) <= ?');
      countValues.push(filters.date_to);
    }

    const whereClause = conditions.length > 0 ? ' WHERE ' + conditions.join(' AND ') : '';

    const countSql = `
      SELECT COUNT(*) as total
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
    `;

    const [countRows] = await this.db.getPool().query(countSql, countValues);
    const total = (countRows as { total: number }[])[0].total;

    let dataSql = `
      SELECT r.*,
             CASE
               WHEN r.is_anonymous = TRUE THEN 'Anónimo'
               ELSE u.name
             END as reporter_name,
             u.email as user_email,
             u.name as user_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      ${whereClause}
      ORDER BY r.created_at DESC
    `;

    const dataValues: any[] = [...countValues];

    if (filters?.limit) {
      const limit = parseInt(filters.limit);
      const page = filters?.page ? parseInt(filters.page) : 1;
      const offset = (page - 1) * limit;
      dataSql += ' LIMIT ? OFFSET ?';
      dataValues.push(limit, offset);
    }

    const [dataRows] = await this.db.getPool().query(dataSql, dataValues);
    const reports = (dataRows as any[]).map(row => this.convertToLegacy(row));

    return { reports, total };
  }

  async findRecentReports(limit: number = 10): Promise<LegacyReport[]> {
    const sql = `
      SELECT r.*,
             CASE
               WHEN r.is_anonymous = TRUE THEN 'Anónimo'
               ELSE u.name
             END as reporter_name,
             u.email as user_email,
             u.name as user_name
      FROM reports r
      LEFT JOIN users u ON r.user_id = u.id
      ORDER BY r.created_at DESC
      LIMIT ?
    `;

    const [rows] = await this.db.getPool().query(sql, [limit]);
    const result = rows as any[];

    return result.map(row => this.convertToLegacy(row));
  }

  async getTrendsByAttackType(days: number = 30): Promise<{ attack_type: string; count: number }[]> {
    const sql = `
      SELECT r.attack_type, COUNT(*) as count
      FROM reports r
      WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY r.attack_type
      ORDER BY count DESC
    `;

    const [rows] = await this.db.getPool().query(sql, [days]);
    const result = rows as { attack_type: number; count: number }[];

    return result.map(row => ({
      attack_type: this.catalogMappingService.getAttackTypeString(row.attack_type),
      count: row.count
    }));
  }

  async getTrendsByImpactLevel(days: number = 30): Promise<{ impact_level: string; count: number }[]> {
    const sql = `
      SELECT r.impact, COUNT(*) as count
      FROM reports r
      WHERE r.created_at >= DATE_SUB(NOW(), INTERVAL ? DAY)
      GROUP BY r.impact
      ORDER BY count DESC
    `;

    const [rows] = await this.db.getPool().query(sql, [days]);
    const result = rows as { impact: number; count: number }[];

    return result.map(row => ({
      impact_level: this.catalogMappingService.getImpactString(row.impact),
      count: row.count
    }));
  }

  async getReportStats(): Promise<{
    total: number;
    today: number;
    this_week: number;
    anonymous: number;
    identified: number;
  }> {
    const totalSql = `SELECT COUNT(*) as count FROM reports`;
    const [totalRows] = await this.db.getPool().query(totalSql);

    const todaySql = `SELECT COUNT(*) as count FROM reports WHERE DATE(created_at) = CURDATE()`;
    const [todayRows] = await this.db.getPool().query(todaySql);

    const weekSql = `SELECT COUNT(*) as count FROM reports WHERE created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)`;
    const [weekRows] = await this.db.getPool().query(weekSql);

    const anonymousSql = `SELECT COUNT(*) as count FROM reports WHERE is_anonymous = TRUE`;
    const [anonymousRows] = await this.db.getPool().query(anonymousSql);

    const identifiedSql = `SELECT COUNT(*) as count FROM reports WHERE is_anonymous = FALSE`;
    const [identifiedRows] = await this.db.getPool().query(identifiedSql);

    return {
      total: (totalRows as { count: number }[])[0].count,
      today: (todayRows as { count: number }[])[0].count,
      this_week: (weekRows as { count: number }[])[0].count,
      anonymous: (anonymousRows as { count: number }[])[0].count,
      identified: (identifiedRows as { count: number }[])[0].count,
    };
  }

  // Catalog operations
  async getAllCatalogData(): Promise<{
    attackTypes: { id: number; name: string }[];
    impacts: { id: number; name: string }[];
    statuses: { id: number; name: string }[];
  }> {
    const attackTypesSql = `SELECT id, name FROM attack_types ORDER BY name`;
    const impactsSql = `SELECT id, name FROM impacts ORDER BY name`;
    const statusesSql = `SELECT id, name FROM status ORDER BY name`;

    const [attackTypesRows] = await this.db.getPool().query(attackTypesSql);
    const [impactsRows] = await this.db.getPool().query(impactsSql);
    const [statusesRows] = await this.db.getPool().query(statusesSql);

    return {
      attackTypes: attackTypesRows as { id: number; name: string }[],
      impacts: impactsRows as { id: number; name: string }[],
      statuses: statusesRows as { id: number; name: string }[]
    };
  }
}