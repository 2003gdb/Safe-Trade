/**
 * Report Transformer Utility
 *
 * Provides transformation functions between normalized database schema
 * and legacy admin portal format for backward compatibility.
 */

import {
  ReportWithDetails,
  LegacyReport,
  LegacyReportSummary,
  NormalizedSearchFilters,
  SearchFilters,
  CatalogData
} from '../types/normalized.types';

export class ReportTransformer {
  private catalogData: CatalogData;

  constructor(catalogData: CatalogData) {
    this.catalogData = catalogData;
  }

  /**
   * Convert normalized report to legacy format for existing components
   */
  toLegacyReport(report: ReportWithDetails): LegacyReport {
    return {
      id: report.id,
      user_id: report.user_id,
      attack_type: report.attack_type_name,
      incident_date: report.incident_date,
      impact_level: report.impact_name,
      description: report.description || '',
      attack_origin: report.attack_origin || '',
      device_info: null, // Legacy field no longer used
      is_anonymous: report.is_anonymous,
      status: report.status_name,
      admin_notes: report.admin_note,
      evidence_urls: report.evidence_url ? [report.evidence_url] : [],
      created_at: report.created_at,
      updated_at: report.updated_at
    };
  }

  /**
   * Convert normalized report to legacy summary format
   */
  toLegacyReportSummary(report: ReportWithDetails): LegacyReportSummary {
    return {
      id: report.id,
      attack_type: report.attack_type_name,
      incident_date: report.incident_date,
      impact_level: report.impact_name,
      status: report.status_name,
      is_anonymous: report.is_anonymous,
      user_id: report.user_id,
      attack_origin: report.attack_origin || '',
      created_at: report.created_at
    };
  }

  /**
   * Convert legacy string-based filters to normalized ID-based filters
   */
  fromLegacyFilters(legacyFilters: SearchFilters): NormalizedSearchFilters {
    const normalized: NormalizedSearchFilters = {
      query: legacyFilters.query,
      is_anonymous: legacyFilters.isAnonymous,
      date_from: legacyFilters.dateFrom,
      date_to: legacyFilters.dateTo
    };

    // Convert status string to ID
    if (legacyFilters.status) {
      const status = this.catalogData.statuses.find(s => s.name === legacyFilters.status);
      if (status) {
        normalized.status = status.id;
      }
    }

    // Convert attack type string to ID
    if (legacyFilters.attackType) {
      const attackType = this.catalogData.attackTypes.find(at => at.name === legacyFilters.attackType);
      if (attackType) {
        normalized.attack_type = attackType.id;
      }
    }

    // Convert impact level string to ID
    if (legacyFilters.impactLevel) {
      const impact = this.catalogData.impacts.find(i => i.name === legacyFilters.impactLevel);
      if (impact) {
        normalized.impact = impact.id;
      }
    }

    return normalized;
  }

  /**
   * Convert normalized filters back to legacy format for UI components
   */
  toLegacyFilters(normalizedFilters: NormalizedSearchFilters): SearchFilters {
    const legacy: SearchFilters = {
      query: normalizedFilters.query,
      isAnonymous: normalizedFilters.is_anonymous,
      dateFrom: normalizedFilters.date_from,
      dateTo: normalizedFilters.date_to
    };

    // Convert status ID to string
    if (normalizedFilters.status) {
      const status = this.catalogData.statuses.find(s => s.id === normalizedFilters.status);
      if (status) {
        legacy.status = status.name;
      }
    }

    // Convert attack type ID to string
    if (normalizedFilters.attack_type) {
      const attackType = this.catalogData.attackTypes.find(at => at.id === normalizedFilters.attack_type);
      if (attackType) {
        legacy.attackType = attackType.name;
      }
    }

    // Convert impact ID to string
    if (normalizedFilters.impact) {
      const impact = this.catalogData.impacts.find(i => i.id === normalizedFilters.impact);
      if (impact) {
        legacy.impactLevel = impact.name;
      }
    }

    return legacy;
  }

  /**
   * Get display options for dropdowns from catalog data
   */
  getAttackTypeOptions() {
    return this.catalogData.attackTypes.map(at => ({
      value: at.id,
      label: at.name,
      displayName: this.getAttackTypeDisplayName(at.name)
    }));
  }

  getImpactOptions() {
    return this.catalogData.impacts.map(i => ({
      value: i.id,
      label: i.name,
      displayName: this.getImpactDisplayName(i.name)
    }));
  }

  getStatusOptions() {
    return this.catalogData.statuses.map(s => ({
      value: s.id,
      label: s.name,
      displayName: this.getStatusDisplayName(s.name)
    }));
  }

  /**
   * Get user-friendly display names for Spanish enum values
   */
  private getAttackTypeDisplayName(name: string): string {
    const displayNames: Record<string, string> = {
      'email': 'Email',
      'SMS': 'SMS',
      'whatsapp': 'WhatsApp',
      'llamada': 'Llamada telefónica',
      'redes_sociales': 'Redes sociales',
      'otro': 'Otro'
    };
    return displayNames[name] || name;
  }

  private getImpactDisplayName(name: string): string {
    const displayNames: Record<string, string> = {
      'ninguno': 'Sin impacto',
      'robo_datos': 'Robo de datos',
      'robo_dinero': 'Robo de dinero',
      'cuenta_comprometida': 'Cuenta comprometida'
    };
    return displayNames[name] || name;
  }

  private getStatusDisplayName(name: string): string {
    const displayNames: Record<string, string> = {
      'nuevo': 'Nuevo',
      'revisado': 'Revisado',
      'en_investigacion': 'En investigación',
      'cerrado': 'Cerrado'
    };
    return displayNames[name] || name;
  }
}