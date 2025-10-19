/**
 * SafeTrade Database Types - Updated for Normalized Schema
 *
 * These types reflect the new normalized database structure with
 * catalog tables and foreign key relationships.
 */

// ========== Catalog Tables ==========
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

// ========== Main Tables ==========
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
  attack_type: number; // Foreign key to attack_types.id
  incident_date: Date; // Now TIMESTAMP instead of DATE + TIME
  evidence_url: string | null; // URL to evidence files/screenshots
  attack_origin: string | null;
  suspicious_url: string | null; // Malicious URL related to attack
  message_content: string | null; // Original attack message
  description: string | null;
  impact: number; // Foreign key to impacts.id
  status: number; // Foreign key to status.id
  admin_notes: string | null; // Investigation notes
  created_at: Date;
  updated_at: Date;
}

// ReportAttachment interface removed - using evidence_url column instead

// ========== Extended Types with Joins ==========
export interface ReportWithDetails extends Report {
  // Join data from catalog tables
  attack_type_name: string;
  impact_name: string;
  status_name: string;

  // Join data from users table
  user_email?: string;
  user_name?: string;
}

// ========== Create/Update DTOs ==========
export interface CreateReportData {
  user_id?: number | null;
  is_anonymous: boolean;
  attack_type: number; // Now expects foreign key ID
  incident_date: Date; // Single timestamp field
  evidence_url?: string;
  attack_origin?: string;
  suspicious_url?: string;
  message_content?: string;
  description?: string;
  impact: number; // Now expects foreign key ID
  // status defaults to 'nuevo' (ID 1)
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

// ========== Filter DTOs ==========
export interface ReportFilterDto {
  status?: number; // Now filter by status ID
  attack_type?: number; // Now filter by attack_type ID
  impact?: number; // Now filter by impact ID
  is_anonymous?: boolean;
  date_from?: string;
  date_to?: string;
  page?: number;
  limit?: number;
}

// ========== Legacy Compatibility Types ==========
// These types help with migration from old ENUM-based system
export interface LegacyReportData {
  attack_type: 'email' | 'SMS' | 'whatsapp' | 'llamada' | 'redes_sociales' | 'otro';
  impact_level: 'ninguno' | 'robo_datos' | 'robo_dinero' | 'cuenta_comprometida';
  status: 'nuevo' | 'revisado' | 'en_investigacion' | 'cerrado';
}

// ========== Mapping Constants ==========
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