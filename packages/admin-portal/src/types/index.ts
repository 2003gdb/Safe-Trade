// Admin Portal TypeScript Interfaces

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
  lastLogin: string | null;
  createdAt: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  admin: AdminUser;
}

export interface ReportSummary {
  id: number;
  attack_type: string;
  incident_date: string;
  impact_level: string;
  status: string;
  is_anonymous: boolean;
  user_id: number | null;
  attack_origin: string;
  evidence_url: string | null;
  suspicious_url: string | null;
  message_content: string | null;
  created_at: string;
}

export interface Report {
  id: number;
  user_id: number | null;
  attack_type: string;
  incident_date: string;
  impact_level: string;
  description: string;
  attack_origin: string;
  evidence_url: string | null;
  suspicious_url: string | null;
  message_content: string | null;
  is_anonymous: boolean;
  status: string;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardMetrics {
  totalReports: number;
  reportsToday: number;
  criticalReports: number;
  recentTrends: TrendData[];
}

export interface EnhancedDashboardMetrics {
  total_reports: number;
  reports_today: number;
  reports_this_week: number;
  reports_this_month: number;
  critical_reports: number;
  pending_reports: number;
  resolved_reports: number;
  anonymous_reports: number;
  identified_reports: number;
  status_distribution: StatusDistribution[];
  attack_types: AttackTypeData[];
  impact_distribution: ImpactDistribution[];
  weekly_trends: WeeklyTrend[];
  monthly_trends: MonthlyTrend[];
  response_times: ResponseTimes;
}

export interface StatusDistribution {
  status: string;
  count: number;
  percentage: number;
}

export interface AttackTypeData {
  attack_type: string;
  count: number;
  percentage: number;
}

export interface ImpactDistribution {
  impact_level: string;
  count: number;
  percentage: number;
}

export interface WeeklyTrend {
  week_start: string;
  count: number;
}

export interface MonthlyTrend {
  month: string;
  count: number;
}

export interface ResponseTimes {
  avg_resolution_time: number;
  avg_first_response_time: number;
}

export interface TrendData {
  attackType: string;
  count: number;
  percentage: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface ApiError {
  message: string;
  statusCode: number;
}

export interface UpdateStatusRequest {
  status: string;
  adminNotes?: string;
}

// Advanced Search Types
export interface SearchFilters {
  query?: string;
  status?: string;
  attackType?: string;
  impactLevel?: string;
  isAnonymous?: boolean;
  dateFrom?: string;
  dateTo?: string;
  location?: string;
  isHighlighted?: boolean;
}

export interface SearchResult extends ReportSummary {
  highlights?: {
    description?: string[];
    location?: string[];
    attack_type?: string[];
  };
  score?: number;
}

export interface SavedSearch {
  id: string;
  name: string;
  filters: SearchFilters;
  createdAt: string;
}

export interface SearchHistory {
  id: string;
  query: string;
  filters: SearchFilters;
  timestamp: string;
  resultCount: number;
}


// Admin Notes Types
export interface AdminNote {
  id: number;
  reportId: number;
  adminId: number;
  adminName: string;
  content: string;
  isTemplate: boolean;
  templateName?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NoteTemplate {
  id: string;
  name: string;
  content: string;
  category: string;
}