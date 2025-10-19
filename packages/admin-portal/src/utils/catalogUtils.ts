/**
 * Catalog Utility Functions
 *
 * Utility functions for working with catalog data, transformations,
 * and legacy compatibility in the admin portal.
 */

import { CatalogData, CatalogMaps } from '../types/catalog.types';
import {
  ReportWithDetails,
  NormalizedReport,
  LegacyReport,
  NormalizedSearchFilters,
  LEGACY_ATTACK_TYPES,
  LEGACY_IMPACTS,
  LEGACY_STATUSES
} from '../types/normalized.types';

export class CatalogUtils {
  /**
   * Create efficient lookup maps from catalog data
   */
  static createLookupMaps(catalogs: CatalogData): CatalogMaps {
    return {
      attackTypeMap: new Map(catalogs.attackTypes.map(at => [at.id, at.name])),
      impactMap: new Map(catalogs.impacts.map(i => [i.id, i.name])),
      statusMap: new Map(catalogs.statuses.map(s => [s.id, s.name])),
      attackTypeNameMap: new Map(catalogs.attackTypes.map(at => [at.name, at.id])),
      impactNameMap: new Map(catalogs.impacts.map(i => [i.name, i.id])),
      statusNameMap: new Map(catalogs.statuses.map(s => [s.name, s.id]))
    };
  }

  /**
   * Get display name by ID and type
   */
  static getDisplayName(
    catalogs: CatalogData,
    type: 'attackTypes' | 'impacts' | 'statuses',
    id: number
  ): string {
    const item = catalogs[type].find(item => item.id === id);
    return item?.name || 'Desconocido';
  }

  /**
   * Get ID by name and type
   */
  static getId(
    catalogs: CatalogData,
    type: 'attackTypes' | 'impacts' | 'statuses',
    name: string
  ): number | null {
    const item = catalogs[type].find(item => item.name === name);
    return item?.id || null;
  }

  /**
   * Convert normalized report to legacy format for compatibility
   */
  static convertToLegacyReport(
    report: ReportWithDetails,
    catalogs: CatalogData
  ): LegacyReport {
    return {
      id: report.id,
      user_id: report.user_id,
      attack_type: report.attack_type_name || this.getDisplayName(catalogs, 'attackTypes', report.attack_type),
      incident_date: report.incident_date,
      impact_level: report.impact_name || this.getDisplayName(catalogs, 'impacts', report.impact),
      description: report.description || '',
      attack_origin: report.attack_origin || '',
      device_info: null, // Legacy field no longer used
      is_anonymous: report.is_anonymous,
      status: report.status_name || this.getDisplayName(catalogs, 'statuses', report.status),
      admin_notes: report.admin_note,
      evidence_urls: report.evidence_url ? [report.evidence_url] : [],
      created_at: report.created_at,
      updated_at: report.updated_at
    };
  }

  /**
   * Convert legacy report to normalized format
   */
  static convertFromLegacyReport(
    legacyReport: LegacyReport,
    catalogs: CatalogData
  ): NormalizedReport {
    return {
      id: legacyReport.id,
      user_id: legacyReport.user_id,
      is_anonymous: legacyReport.is_anonymous,
      attack_type: this.getId(catalogs, 'attackTypes', legacyReport.attack_type) || 1,
      incident_date: legacyReport.incident_date,
      evidence_url: legacyReport.evidence_urls[0] || null,
      attack_origin: legacyReport.attack_origin,
      sos_cont: null, // Legacy field mapping
      description: legacyReport.description,
      impact: this.getId(catalogs, 'impacts', legacyReport.impact_level) || 1,
      status: this.getId(catalogs, 'statuses', legacyReport.status) || 1,
      admin_note: legacyReport.admin_notes,
      created_at: legacyReport.created_at,
      updated_at: legacyReport.updated_at
    };
  }

  /**
   * Enrich a normalized report with display names
   */
  static enrichReportWithNames(
    report: NormalizedReport,
    catalogs: CatalogData
  ): ReportWithDetails {
    return {
      ...report,
      attack_type_name: this.getDisplayName(catalogs, 'attackTypes', report.attack_type),
      impact_name: this.getDisplayName(catalogs, 'impacts', report.impact),
      status_name: this.getDisplayName(catalogs, 'statuses', report.status)
    };
  }

  /**
   * Convert legacy filter values to normalized IDs
   */
  static convertLegacyFilters(
    legacyFilters: Record<string, any>,
    catalogs: CatalogData
  ): NormalizedSearchFilters {
    const normalized: NormalizedSearchFilters = {
      query: legacyFilters.query,
      is_anonymous: legacyFilters.isAnonymous,
      date_from: legacyFilters.dateFrom,
      date_to: legacyFilters.dateTo,
      page: legacyFilters.page,
      limit: legacyFilters.limit
    };

    // Convert string values to IDs
    if (legacyFilters.status && typeof legacyFilters.status === 'string') {
      normalized.status = this.getId(catalogs, 'statuses', legacyFilters.status);
    }

    if (legacyFilters.attackType && typeof legacyFilters.attackType === 'string') {
      normalized.attack_type = this.getId(catalogs, 'attackTypes', legacyFilters.attackType);
    }

    if (legacyFilters.impactLevel && typeof legacyFilters.impactLevel === 'string') {
      normalized.impact = this.getId(catalogs, 'impacts', legacyFilters.impactLevel);
    }

    return normalized;
  }

  /**
   * Validate that all required catalog items exist
   */
  static validateCatalogCompleteness(catalogs: CatalogData): {
    isValid: boolean;
    missingItems: string[];
  } {
    const missingItems: string[] = [];

    // Check for essential attack types
    const requiredAttackTypes = ['email', 'SMS', 'whatsapp', 'llamada'];
    requiredAttackTypes.forEach(type => {
      if (!catalogs.attackTypes.find(at => at.name === type)) {
        missingItems.push(`Attack type: ${type}`);
      }
    });

    // Check for essential impacts
    const requiredImpacts = ['ninguno', 'robo_datos', 'robo_dinero'];
    requiredImpacts.forEach(impact => {
      if (!catalogs.impacts.find(i => i.name === impact)) {
        missingItems.push(`Impact: ${impact}`);
      }
    });

    // Check for essential statuses
    const requiredStatuses = ['nuevo', 'revisado', 'cerrado'];
    requiredStatuses.forEach(status => {
      if (!catalogs.statuses.find(s => s.name === status)) {
        missingItems.push(`Status: ${status}`);
      }
    });

    return {
      isValid: missingItems.length === 0,
      missingItems
    };
  }

  /**
   * Get user-friendly display names for catalog items
   */
  static getDisplayNames() {
    return {
      attackTypes: {
        'email': 'Email',
        'SMS': 'SMS',
        'whatsapp': 'WhatsApp',
        'llamada': 'Llamada telefónica',
        'redes_sociales': 'Redes sociales',
        'otro': 'Otro'
      },
      impacts: {
        'ninguno': 'Sin impacto',
        'robo_datos': 'Robo de datos',
        'robo_dinero': 'Robo de dinero',
        'cuenta_comprometida': 'Cuenta comprometida'
      },
      statuses: {
        'nuevo': 'Nuevo',
        'revisado': 'Revisado',
        'en_investigacion': 'En investigación',
        'cerrado': 'Cerrado'
      }
    };
  }

  /**
   * Create default catalog structure for testing/fallback
   */
  static createDefaultCatalogs(): CatalogData {
    const now = new Date().toISOString();

    return {
      attackTypes: [
        { id: 1, name: 'email', created_at: now },
        { id: 2, name: 'SMS', created_at: now },
        { id: 3, name: 'whatsapp', created_at: now },
        { id: 4, name: 'llamada', created_at: now },
        { id: 5, name: 'redes_sociales', created_at: now },
        { id: 6, name: 'otro', created_at: now }
      ],
      impacts: [
        { id: 1, name: 'ninguno', created_at: now },
        { id: 2, name: 'robo_datos', created_at: now },
        { id: 3, name: 'robo_dinero', created_at: now },
        { id: 4, name: 'cuenta_comprometida', created_at: now }
      ],
      statuses: [
        { id: 1, name: 'nuevo', created_at: now },
        { id: 2, name: 'revisado', created_at: now },
        { id: 3, name: 'en_investigacion', created_at: now },
        { id: 4, name: 'cerrado', created_at: now }
      ]
    };
  }

  /**
   * Format catalog data for analytics/reporting
   */
  static formatForAnalytics(catalogs: CatalogData) {
    return {
      summary: {
        totalAttackTypes: catalogs.attackTypes.length,
        totalImpacts: catalogs.impacts.length,
        totalStatuses: catalogs.statuses.length
      },
      attackTypes: catalogs.attackTypes.map(at => ({
        id: at.id,
        name: at.name,
        displayName: (this.getDisplayNames().attackTypes as Record<string, string>)[at.name] || at.name
      })),
      impacts: catalogs.impacts.map(i => ({
        id: i.id,
        name: i.name,
        displayName: (this.getDisplayNames().impacts as Record<string, string>)[i.name] || i.name
      })),
      statuses: catalogs.statuses.map(s => ({
        id: s.id,
        name: s.name,
        displayName: (this.getDisplayNames().statuses as Record<string, string>)[s.name] || s.name
      }))
    };
  }

  /**
   * Check if catalog data is fresh enough (not stale)
   */
  static isCatalogDataFresh(lastUpdated: number, maxAge: number = 5 * 60 * 1000): boolean {
    return (Date.now() - lastUpdated) < maxAge;
  }

  /**
   * Sort catalog items by usage frequency or alphabetically
   */
  static sortCatalogItems<T extends { id: number; name: string }>(
    items: T[],
    sortBy: 'alphabetical' | 'usage' = 'alphabetical',
    usageData?: Record<number, number>
  ): T[] {
    if (sortBy === 'usage' && usageData) {
      return [...items].sort((a, b) => (usageData[b.id] || 0) - (usageData[a.id] || 0));
    }

    return [...items].sort((a, b) => a.name.localeCompare(b.name, 'es'));
  }
}