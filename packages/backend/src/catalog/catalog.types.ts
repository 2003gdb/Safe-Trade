export interface AttackType {
  id: number;
  name: string;
}

export interface Impact {
  id: number;
  name: string;
}

export interface Status {
  id: number;
  name: string;
}

export interface User {
  id: number;
  email: string;
  name: string;
  pass_hash: string;
  salt: string;
}

export interface AdminUser {
  id: number;
  email: string;
  pass_hash: string;
  salt: string;
  created_at: Date;
}

export interface Report {
  id: number;
  user_id: number | null;
  is_anonymous: boolean;
  attack_type: number;
  incident_date: Date;
  evidence_url: string | null;
  attack_origin: string | null;
  suspicious_url: string | null;
  message_content: string | null;
  description: string | null;
  impact: number;
  status: number;
  admin_notes: string | null;
  created_at: Date;
  updated_at: Date;
}

export interface ReportWithDetails extends Report {
  attack_type_name: string;
  impact_name: string;
  status_name: string;

  user_email?: string;
  user_name?: string;
}

export interface CreateReportData {
  user_id?: number | null;
  is_anonymous: boolean;
  attack_type: number;
  incident_date: Date;
  evidence_url?: string;
  attack_origin?: string;
  suspicious_url?: string;
  message_content?: string;
  description?: string;
  impact: number;
}

export interface UpdateReportData {
  attack_type?: number;
  incident_date?: Date;
  evidence_url?: string;
  attack_origin?: string;
  suspicious_url?: string;
  message_content?: string;
  description?: string;
  impact?: number;
  status?: number;
  admin_notes?: string;
}

export interface ReportFilterDto {
  status?: number;
  attack_type?: number;
  impact?: number;
  is_anonymous?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

export interface LegacyReportData {
  attack_type: 'email' | 'SMS' | 'whatsapp' | 'llamada' | 'redes_sociales' | 'otro';
  impact_level: 'ninguno' | 'robo_datos' | 'robo_dinero' | 'cuenta_comprometida';
  status: 'nuevo' | 'revisado' | 'en_investigacion' | 'cerrado';
}

export const ATTACK_TYPE_NAMES = {
  1: 'email',
  2: 'SMS',
  3: 'whatsapp',
  4: 'llamada',
  5: 'redes_sociales',
  6: 'otro'
} as const;

export const IMPACT_NAMES = {
  1: 'ninguno',
  2: 'robo_datos',
  3: 'robo_dinero',
  4: 'cuenta_comprometida'
} as const;

export const STATUS_NAMES = {
  1: 'nuevo',
  2: 'revisado',
  3: 'en_investigacion',
  4: 'cerrado'
} as const;
