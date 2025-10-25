

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

export interface NormalizedReport {
  id: number;
  user_id: number | null;
  is_anonymous: boolean;
  attack_type: number; 
  incident_date: string; 
  evidence_url: string | null; 
  attack_origin: string | null;
  sos_cont: string | null; 
  description: string | null;
  impact: number; 
  status: number; 
  admin_note: string | null; 
  created_at: string;
  updated_at: string;
}

export interface ReportWithDetails extends NormalizedReport {
  
  attack_type_name: string;
  impact_name: string;
  status_name: string;

  
  user_email?: string;
  user_name?: string;
}

export interface LegacyReportSummary {
  id: number;
  attack_type: string; 
  incident_date: string;
  impact_level: string; 
  status: string; 
  is_anonymous: boolean;
  user_id: number | null;
  attack_origin: string;
  created_at: string;
}

export interface LegacyReport {
  id: number;
  user_id: number | null;
  attack_type: string; 
  incident_date: string;
  impact_level: string; 
  description: string;
  attack_origin: string;
  device_info: string | null; 
  is_anonymous: boolean;
  status: string; 
  admin_notes: string | null; 
  evidence_urls: string[]; 
  created_at: string;
  updated_at: string;
}

export interface AdminPortalFilters {
  status?: number; 
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

export interface UpdateReportRequest {
  attack_type?: number; 
  incident_date?: string;
  evidence_url?: string;
  attack_origin?: string;
  sos_cont?: string;
  description?: string;
  impact?: number; 
  status?: number; 
  admin_note?: string;
}

export interface UpdateStatusRequest {
  status: number; 
  admin_note?: string;
}

export interface NormalizedSearchFilters {
  query?: string;
  status?: number; 
  attack_type?: number; 
  impact?: number; 
  is_anonymous?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface ReportTransformer {
  

  toLegacyReport(report: ReportWithDetails): LegacyReport;

  

  toLegacyReportSummary(report: ReportWithDetails): LegacyReportSummary;

  

  fromLegacyFilters(filters: any): NormalizedSearchFilters;
}

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