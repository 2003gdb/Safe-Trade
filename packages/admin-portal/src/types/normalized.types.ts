/**
 * Admin Portal Types - Updated for Normalized Database Schema
 *
 * These types reflect the new normalized database structure
 * and provide backward compatibility with existing admin portal code.
 */

// ========== Catalog Types ==========
export interface AttackType {
  id: number;
  name: string;
  created_at: string;
}

export interface Impact {
  id: number;
  name: string;
  created_at: string;
}

export interface Status {
  id: number;
  name: string;
  created_at: string;
}

// ========== Updated Report Types ==========
export interface NormalizedReport {
  id: number;
  user_id: number | null;
  is_anonymous: boolean;
  attack_type: number; // Foreign key ID
  incident_date: string; // ISO timestamp
  evidence_url: string | null; // Renamed from suspicious_url
  attack_origin: string | null;
  sos_cont: string | null; // Renamed from message_content
  description: string | null;
  impact: number; // Foreign key ID
  status: number; // Foreign key ID
  admin_note: string | null; // Renamed from admin_notes
  created_at: string;
  updated_at: string;
}

export interface ReportWithDetails extends NormalizedReport {
  // Joined data from catalog tables
  attack_type_name: string;
  impact_name: string;
  status_name: string;

  // Joined user data
  user_email?: string;
  user_name?: string;
}

// ReportAttachment interface removed - using evidence_url column instead

// ========== Legacy Compatibility Types ==========
// These help maintain backward compatibility with existing admin portal components
export interface LegacyReportSummary {
  id: number;
  attack_type: string; // Display name from catalog
  incident_date: string;
  impact_level: string; // Display name from catalog
  status: string; // Display name from catalog
  is_anonymous: boolean;
  user_id: number | null;
  attack_origin: string;
  created_at: string;
}

export interface LegacyReport {
  id: number;
  user_id: number | null;
  attack_type: string; // Display name
  incident_date: string;
  impact_level: string; // Display name
  description: string;
  attack_origin: string;
  device_info: string | null; // Legacy field
  is_anonymous: boolean;
  status: string; // Display name
  admin_notes: string | null; // Legacy field name
  evidence_urls: string[]; // Array format for compatibility
  created_at: string;
  updated_at: string;
}

// ========== Admin Portal Specific Types ==========
export interface AdminPortalFilters {
  status?: number; // Now uses foreign key IDs
  attack_type?: number;
  impact?: number;
  is_anonymous?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface CatalogData {
  attackTypes: AttackType[];
  impacts: Impact[];
  statuses: Status[];
}

// ========== Dashboard Metrics (Updated) ==========
export interface NormalizedDashboardMetrics {
  total_reports: number;
  reports_today: number;
  reports_this_week: number;
  reports_this_month: number;
  critical_reports: number;
  pending_reports: number;
  resolved_reports: number;
  anonymous_reports: number;
  identified_reports: number;
  status_distribution: NormalizedStatusDistribution[];
  attack_types: NormalizedAttackTypeData[];
  impact_distribution: NormalizedImpactDistribution[];
  weekly_trends: WeeklyTrend[];
  monthly_trends: MonthlyTrend[];
  response_times: ResponseTimes;
}

export interface NormalizedStatusDistribution {
  status_id: number;
  status_name: string;
  count: number;
  percentage: number;
}

export interface NormalizedAttackTypeData {
  attack_type_id: number;
  attack_type_name: string;
  count: number;
  percentage: number;
}

export interface NormalizedImpactDistribution {
  impact_id: number;
  impact_name: string;
  count: number;
  percentage: number;
}

// ========== Update Request Types ==========
export interface UpdateReportRequest {
  attack_type?: number; // Foreign key ID
  incident_date?: string;
  evidence_url?: string;
  attack_origin?: string;
  sos_cont?: string;
  description?: string;
  impact?: number; // Foreign key ID
  status?: number; // Foreign key ID
  admin_note?: string;
}

export interface UpdateStatusRequest {
  status: number; // Foreign key ID instead of string
  admin_note?: string;
}

// ========== Search and Filter Types (Updated) ==========
export interface NormalizedSearchFilters {
  query?: string;
  status?: number; // Foreign key ID
  attack_type?: number; // Foreign key ID
  impact?: number; // Foreign key ID
  is_anonymous?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// ========== Data Transformation Utilities ==========
export interface ReportTransformer {
  /**
   * Convert normalized report to legacy format for backward compatibility
   */
  toLegacyReport(report: ReportWithDetails): LegacyReport;

  /**
   * Convert normalized report summary to legacy format
   */
  toLegacyReportSummary(report: ReportWithDetails): LegacyReportSummary;

  /**
   * Convert legacy filters to normalized filters
   */
  fromLegacyFilters(filters: any): NormalizedSearchFilters;
}

// ========== Constants for Mapping ==========
export const LEGACY_ATTACK_TYPES = [
  'email',
  'SMS',
  'whatsapp',
  'llamada',
  'redes_sociales',
  'otro'
] as const;

export const LEGACY_IMPACTS = [
  'ninguno',
  'robo_datos',
  'robo_dinero',
  'cuenta_comprometida'
] as const;

export const LEGACY_STATUSES = [
  'nuevo',
  'revisado',
  'en_investigacion',
  'cerrado'
] as const;