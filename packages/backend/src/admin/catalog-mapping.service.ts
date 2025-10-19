import { Injectable } from '@nestjs/common';

/**
 * Centralized catalog mapping service for converting between database IDs and string values
 * Used by all admin endpoints to ensure consistent data transformation
 */
@Injectable()
export class CatalogMappingService {
    // ID to String mappings (database IDs to display strings)
    private readonly STATUS_ID_MAP = {
        1: 'nuevo',
        2: 'revisado',
        3: 'en_investigacion',
        4: 'cerrado'
    } as const;

    private readonly ATTACK_TYPE_ID_MAP = {
        1: 'email',
        2: 'SMS',
        3: 'whatsapp',
        4: 'llamada',
        5: 'redes_sociales',
        6: 'otro'
    } as const;

    private readonly IMPACT_ID_MAP = {
        1: 'ninguno',
        2: 'robo_datos',
        3: 'robo_dinero',
        4: 'cuenta_comprometida'
    } as const;

    // String to ID mappings (for incoming API requests)
    private readonly STATUS_MAP = {
        'nuevo': 1,
        'revisado': 2,
        'en_investigacion': 3,
        'cerrado': 4
    } as const;

    private readonly ATTACK_TYPE_MAP = {
        'email': 1,
        'SMS': 2,
        'whatsapp': 3,
        'llamada': 4,
        'redes_sociales': 5,
        'otro': 6
    } as const;

    private readonly IMPACT_MAP = {
        'ninguno': 1,
        'robo_datos': 2,
        'robo_dinero': 3,
        'cuenta_comprometida': 4
    } as const;

    /**
     * Convert database ID to string value for status
     */
    getStatusString(id: number): string {
        return this.STATUS_ID_MAP[id as keyof typeof this.STATUS_ID_MAP] || id.toString();
    }

    /**
     * Convert database ID to string value for attack type
     */
    getAttackTypeString(id: number): string {
        return this.ATTACK_TYPE_ID_MAP[id as keyof typeof this.ATTACK_TYPE_ID_MAP] || id.toString();
    }

    /**
     * Convert database ID to string value for impact level
     */
    getImpactString(id: number): string {
        return this.IMPACT_ID_MAP[id as keyof typeof this.IMPACT_ID_MAP] || id.toString();
    }

    /**
     * Convert string value to database ID for status
     */
    getStatusId(status: string): number {
        return this.STATUS_MAP[status as keyof typeof this.STATUS_MAP] || 0;
    }

    /**
     * Convert string value to database ID for attack type
     */
    getAttackTypeId(attackType: string): number {
        return this.ATTACK_TYPE_MAP[attackType as keyof typeof this.ATTACK_TYPE_MAP] || 0;
    }

    /**
     * Convert string value to database ID for impact level
     */
    getImpactId(impact: string): number {
        return this.IMPACT_MAP[impact as keyof typeof this.IMPACT_MAP] || 0;
    }

    /**
     * Transform raw database report to admin-friendly format with string values
     */
    transformReportForAdmin(rawReport: any): any {
        return {
            id: rawReport.id,
            user_id: rawReport.user_id,
            is_anonymous: Boolean(rawReport.is_anonymous),
            attack_type: this.getAttackTypeString(rawReport.attack_type),
            incident_date: rawReport.incident_date,
            attack_origin: rawReport.attack_origin,
            evidence_url: rawReport.evidence_url,
            suspicious_url: rawReport.suspicious_url,
            message_content: rawReport.message_content,
            impact_level: this.getImpactString(rawReport.impact),
            status: this.getStatusString(rawReport.status),
            description: rawReport.description,
            admin_notes: rawReport.admin_notes || rawReport.admin_note, // Handle both field names
            created_at: rawReport.created_at,
            updated_at: rawReport.updated_at
        };
    }

    /**
     * Transform array of raw database reports to admin-friendly format
     */
    transformReportsForAdmin(rawReports: any[]): any[] {
        return rawReports.map(report => this.transformReportForAdmin(report));
    }

    /**
     * Transform report summary for admin portal (camelCase format)
     */
    transformReportSummaryForAdmin(rawReport: any): any {
        return {
            id: rawReport.id,
            userId: rawReport.user_id,
            isAnonymous: Boolean(rawReport.is_anonymous),
            attackType: this.getAttackTypeString(rawReport.attack_type),
            incidentDate: rawReport.incident_date,
            attackOrigin: rawReport.attack_origin,
            evidenceUrl: rawReport.evidence_url,
            suspiciousUrl: rawReport.suspicious_url,
            messageContent: rawReport.message_content,
            impactLevel: this.getImpactString(rawReport.impact),
            status: this.getStatusString(rawReport.status),
            description: rawReport.description,
            location: rawReport.attack_origin || 'Ubicación no especificada',
            createdAt: rawReport.created_at,
            updatedAt: rawReport.updated_at,
            userEmail: rawReport.user_email,
            userName: rawReport.user_name
        };
    }

    /**
     * Get all status mappings for reference
     */
    getAllStatusMappings() {
        return {
            idToString: this.STATUS_ID_MAP,
            stringToId: this.STATUS_MAP
        };
    }

    /**
     * Get all attack type mappings for reference
     */
    getAllAttackTypeMappings() {
        return {
            idToString: this.ATTACK_TYPE_ID_MAP,
            stringToId: this.ATTACK_TYPE_MAP
        };
    }

    /**
     * Get all impact mappings for reference
     */
    getAllImpactMappings() {
        return {
            idToString: this.IMPACT_ID_MAP,
            stringToId: this.IMPACT_MAP
        };
    }
}