import { Injectable } from "@nestjs/common";
import { ReportsRepository, LegacyReport, CreateLegacyReportData, ReportFilterDto } from "./reports.repository";
import { AdjuntosRepository } from "./adjuntos.repository";

@Injectable()
export class ReportesService {
    constructor(
        private readonly reportsRepository: ReportsRepository,
        private readonly adjuntosRepository: AdjuntosRepository
    ) {}

    async createReporte(reporteData: CreateLegacyReportData): Promise<LegacyReport | null> {
        if (!reporteData.attack_type || !reporteData.incident_date || !reporteData.attack_origin || !reporteData.impact_level) {
            throw new Error('Campos requeridos: tipo de ataque, fecha del incidente, origen del ataque, nivel de impacto');
        }

        const validAttackTypes = ['email', 'SMS', 'whatsapp', 'llamada', 'redes_sociales', 'otro'];
        if (!validAttackTypes.includes(reporteData.attack_type)) {
            throw new Error('Tipo de ataque inválido');
        }

        const validImpactLevels = ['ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida'];
        if (!validImpactLevels.includes(reporteData.impact_level)) {
            throw new Error('Nivel de impacto inválido');
        }

        return this.reportsRepository.createReport(reporteData);
    }

    async getReporteById(id: number): Promise<LegacyReport | null> {
        return this.reportsRepository.findById(id);
    }

    async getUserReports(userId: number): Promise<LegacyReport[]> {
        return this.reportsRepository.findUserReports(userId);
    }

    async getAllReports(filters?: ReportFilterDto): Promise<{ reports: LegacyReport[], total: number, page: number, limit: number, totalPages: number }> {
        const page = filters?.page ? parseInt(filters.page) : 1;
        const limit = filters?.limit ? parseInt(filters.limit) : 10;

        const { reports, total } = await this.reportsRepository.findAllReports(filters);

        const totalPages = Math.ceil(total / limit);

        return {
            reports,
            total,
            page,
            limit,
            totalPages
        };
    }

    async getRecentReports(limit: number = 10): Promise<LegacyReport[]> {
        return this.reportsRepository.findRecentReports(limit);
    }

    async getReportStats() {
        return this.reportsRepository.getReportStats();
    }

    async getCatalogData() {
        return this.reportsRepository.getAllCatalogData();
    }

    async generateRecommendations(reporte: LegacyReport): Promise<string[]> {
        const recommendations: string[] = [];

        // Based on attack type
        switch (reporte.attack_type) {
            case 'email':
                recommendations.push('Verifica siempre la dirección del remitente antes de abrir enlaces o archivos adjuntos');
                recommendations.push('No proporciones información personal o financiera por correo electrónico');
                recommendations.push('Utiliza un filtro de spam en tu cliente de correo');
                break;
            case 'whatsapp':
                recommendations.push('No hagas clic en enlaces sospechosos enviados por WhatsApp');
                recommendations.push('Verifica la identidad del remitente antes de compartir información');
                recommendations.push('Activa la verificación en dos pasos en WhatsApp');
                break;
            case 'SMS':
                recommendations.push('No respondas a mensajes SMS de números desconocidos');
                recommendations.push('No hagas clic en enlaces recibidos por SMS');
                recommendations.push('Verifica directamente con la empresa si recibes mensajes que parecen oficiales');
                break;
            case 'llamada':
                recommendations.push('No proporciones información personal por teléfono');
                recommendations.push('Cuelga y llama directamente a la empresa si alguien solicita datos sensibles');
                recommendations.push('Desconfía de llamadas que crean urgencia o presión');
                break;
            case 'redes_sociales':
                recommendations.push('Revisa la configuración de privacidad en tus redes sociales');
                recommendations.push('No aceptes solicitudes de amistad de personas desconocidas');
                recommendations.push('Desconfía de ofertas demasiado buenas para ser verdad');
                break;
            default:
                recommendations.push('Mantén siempre actualizados tus sistemas y aplicaciones');
                recommendations.push('Usa contraseñas fuertes y diferentes para cada servicio');
                break;
        }

        // Based on impact level
        switch (reporte.impact_level) {
            case 'robo_dinero':
                recommendations.push('Contacta inmediatamente a tu banco para reportar el incidente');
                recommendations.push('Cambia las contraseñas de todas tus cuentas bancarias y financieras');
                recommendations.push('Solicita el bloqueo temporal de tus tarjetas si es necesario');
                break;
            case 'robo_datos':
                recommendations.push('Cambia inmediatamente las contraseñas de las cuentas comprometidas');
                recommendations.push('Activa la autenticación de dos factores donde sea posible');
                recommendations.push('Monitorea tus cuentas regularmente en busca de actividad sospechosa');
                break;
            case 'cuenta_comprometida':
                recommendations.push('Cambia la contraseña de la cuenta comprometida inmediatamente');
                recommendations.push('Revisa la configuración de seguridad de la cuenta');
                recommendations.push('Verifica si hay sesiones activas no autorizadas');
                break;
        }

        // Additional recommendations based on suspicious URL presence
        if (reporte.suspicious_url) {
            recommendations.push('Evita hacer clic en la URL reportada y comparte esta información con tu red');
            recommendations.push('Considera reportar la URL maliciosa a servicios de seguridad como Google Safe Browsing');
        }

        // Additional recommendations based on message content
        if (reporte.message_content) {
            recommendations.push('Guarda el contenido del mensaje como evidencia para futuras investigaciones');
            const messageContent = reporte.message_content.toLowerCase();
            if (messageContent.includes('urgente') || messageContent.includes('inmediato') || messageContent.includes('inmediata')) {
                recommendations.push('Desconfía de mensajes que crean sensación de urgencia - es una táctica común de atacantes');
            }
        }

        return recommendations;
    }

    async getVictimSupport(reporte: LegacyReport): Promise<{
        title: string;
        steps: string[];
        resources: string[];
    }> {
        const support = {
            title: 'Pasos inmediatos para víctimas de ciberataques',
            steps: [] as string[],
            resources: [] as string[]
        };

        // Immediate steps based on impact
        if (reporte.impact_level === 'robo_dinero') {
            support.title = 'Pasos urgentes para víctimas de robo financiero';
            support.steps = [
                'Contacta inmediatamente a tu banco (24/7)',
                'Reporta el fraude a las autoridades locales',
                'Documenta todas las transacciones no autorizadas',
                'Solicita el bloqueo de tarjetas comprometidas',
                'Cambia todas las contraseñas bancarias'
            ];
            support.resources = [
                'Línea directa del banco: disponible 24/7',
                'Policía Nacional - Unidad de Delitos Informáticos',
                'Condusef (México) - Comisión Nacional para la Protección de Usuarios'
            ];
        } else if (reporte.impact_level === 'robo_datos') {
            support.title = 'Pasos para proteger datos comprometidos';
            support.steps = [
                'Cambia inmediatamente todas las contraseñas',
                'Activa la autenticación de dos factores',
                'Revisa todas las cuentas en busca de actividad sospechosa',
                'Considera congelar tu reporte crediticio',
                'Documenta el incidente para futura referencia'
            ];
            support.resources = [
                'Generador de contraseñas seguras',
                'Guías de autenticación de dos factores',
                'Servicios de monitoreo de identidad'
            ];
        } else {
            support.steps = [
                'Documenta el incidente con capturas de pantalla',
                'No interactúes más con el atacante',
                'Reporta el incidente en esta plataforma',
                'Comparte la información con tu comunidad',
                'Mantente alerta ante futuros intentos'
            ];
            support.resources = [
                'Centro de ayuda de SafeTrade',
                'Comunidad de usuarios para soporte',
                'Recursos educativos sobre ciberseguridad'
            ];
        }

        return support;
    }
}