/**
 * Catalog Repository - Handles catalog table operations
 *
 * Provides access to attack_types, impacts, and status tables
 * for normalized foreign key relationships.
 */

import { Injectable } from '@nestjs/common';
import { DbService } from '../db/db.service';
import { AttackType, Impact, Status } from './catalog.types';

@Injectable()
export class CatalogRepository {
  constructor(private readonly db: DbService) {}

  // ========== Attack Types ==========
  async getAllAttackTypes(): Promise<AttackType[]> {
    const sql = 'SELECT * FROM attack_types ORDER BY name';
    const [rows] = await this.db.getPool().query(sql);
    return rows as AttackType[];
  }

  async getAttackTypeById(id: number): Promise<AttackType | null> {
    const sql = 'SELECT * FROM attack_types WHERE id = ? LIMIT 1';
    const [rows] = await this.db.getPool().query(sql, [id]);
    const result = rows as AttackType[];
    return result[0] || null;
  }

  async getAttackTypeByName(name: string): Promise<AttackType | null> {
    const sql = 'SELECT * FROM attack_types WHERE name = ? LIMIT 1';
    const [rows] = await this.db.getPool().query(sql, [name]);
    const result = rows as AttackType[];
    return result[0] || null;
  }

  // ========== Impacts ==========
  async getAllImpacts(): Promise<Impact[]> {
    const sql = 'SELECT * FROM impacts ORDER BY name';
    const [rows] = await this.db.getPool().query(sql);
    return rows as Impact[];
  }

  async getImpactById(id: number): Promise<Impact | null> {
    const sql = 'SELECT * FROM impacts WHERE id = ? LIMIT 1';
    const [rows] = await this.db.getPool().query(sql, [id]);
    const result = rows as Impact[];
    return result[0] || null;
  }

  async getImpactByName(name: string): Promise<Impact | null> {
    const sql = 'SELECT * FROM impacts WHERE name = ? LIMIT 1';
    const [rows] = await this.db.getPool().query(sql, [name]);
    const result = rows as Impact[];
    return result[0] || null;
  }

  // ========== Status ==========
  async getAllStatuses(): Promise<Status[]> {
    const sql = 'SELECT * FROM status ORDER BY name';
    const [rows] = await this.db.getPool().query(sql);
    return rows as Status[];
  }

  async getStatusById(id: number): Promise<Status | null> {
    const sql = 'SELECT * FROM status WHERE id = ? LIMIT 1';
    const [rows] = await this.db.getPool().query(sql, [id]);
    const result = rows as Status[];
    return result[0] || null;
  }

  async getStatusByName(name: string): Promise<Status | null> {
    const sql = 'SELECT * FROM status WHERE name = ? LIMIT 1';
    const [rows] = await this.db.getPool().query(sql, [name]);
    const result = rows as Status[];
    return result[0] || null;
  }

  // ========== Utility Methods ==========
  /**
   * Get all catalog data in a single call for efficiency
   */
  async getAllCatalogData(): Promise<{
    attackTypes: AttackType[];
    impacts: Impact[];
    statuses: Status[];
  }> {
    const [attackTypes, impacts, statuses] = await Promise.all([
      this.getAllAttackTypes(),
      this.getAllImpacts(),
      this.getAllStatuses()
    ]);

    return { attackTypes, impacts, statuses };
  }

  /**
   * Convert legacy enum value to foreign key ID
   */
  async convertLegacyAttackType(legacyValue: string): Promise<number | null> {
    const attackType = await this.getAttackTypeByName(legacyValue);
    return attackType?.id || null;
  }

  async convertLegacyImpact(legacyValue: string): Promise<number | null> {
    const impact = await this.getImpactByName(legacyValue);
    return impact?.id || null;
  }

  async convertLegacyStatus(legacyValue: string): Promise<number | null> {
    const status = await this.getStatusByName(legacyValue);
    return status?.id || null;
  }
}