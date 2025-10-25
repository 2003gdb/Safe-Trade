
import { Injectable } from "@nestjs/common";
import { ComunidadRepository, TrendData } from "./comunidad.repository";
import { ReportesService } from "src/reportes/reportes.service";

@Injectable()
export class ComunidadService {
    constructor(
        private readonly comunidadRepository: ComunidadRepository,
        private readonly reportesService: ReportesService,
    ) {}

    async getTendencias(period: '7days' | '30days' | '90days' = '30days') {
        const days = period === '7days' ? 7 : period === '30days' ? 30 : 90;

        const [attackTrends, impactTrends, timeTrends, communityStats] = await Promise.all([
            this.comunidadRepository.getAttackTypeTrends(days),
            this.comunidadRepository.getImpactLevelTrends(days),
            this.comunidadRepository.getTimeBasedTrends(days),
            this.comunidadRepository.getCommunityStats(days),
        ]);

        return {
            period: period,
            community_stats: communityStats,
            attack_trends: attackTrends,
            impact_trends: impactTrends,
            time_trends: timeTrends,
            summary: this.generateTrendsSummary(attackTrends, impactTrends, communityStats as unknown as Record<string, unknown>)
        };
    }


    async getAnalytics() {
        const [stats, recentTrends, topOrigins] = await Promise.all([
            this.comunidadRepository.getCommunityStats(30),
            this.comunidadRepository.getAttackTypeTrends(7),
            this.comunidadRepository.getTopSuspiciousOrigins(30, 10)
        ]);

        return {
            community_overview: stats,
            recent_trends: recentTrends,
            suspicious_origins: topOrigins,
            insights: this.generateCommunityInsights(stats as unknown as Record<string, unknown>, recentTrends)
        };
    }

    private translateAttackTypes(trends: TrendData[]): TrendData[] {
        return trends.map(trend => ({
            ...trend,
            attack_type: this.translateAttackType(trend.attack_type)
        }));
    }

    private translateImpactLevels(trends: TrendData[]): TrendData[] {
        return trends.map(trend => ({
            ...trend,
            attack_type: this.translateImpactLevel(trend.attack_type)
        }));
    }

    private translateAttackType(type: string): string {
        const translations: Record<string, string> = {
            'email': 'Correo Electrónico',
            'SMS': 'Mensajes SMS',
            'whatsapp': 'WhatsApp',
            'llamada': 'Llamadas Telefónicas',
            'redes_sociales': 'Redes Sociales',
            'otro': 'Otros'
        };
        return translations[type] || type;
    }

    private translateImpactLevel(level: string): string {
        const translations: Record<string, string> = {
            'ninguno': 'Sin Impacto',
            'robo_datos': 'Robo de Datos',
            'robo_dinero': 'Robo de Dinero',
            'cuenta_comprometida': 'Cuenta Comprometida'
        };
        return translations[level] || level;
    }

    private generateTrendsSummary(attackTrends: TrendData[], impactTrends: TrendData[], stats: Record<string, unknown>) {
        const topAttack = attackTrends[0];
        const topImpact = impactTrends[0];

        return {
            main_threat: topAttack ? this.translateAttackType(topAttack.attack_type) : 'N/A',
            main_impact: topImpact ? this.translateImpactLevel(topImpact.attack_type) : 'N/A',
            total_reports: stats.total_reports as number,
            community_alert_level: this.calculateAlertLevel(stats, attackTrends),
            key_insight: this.generateKeyInsight(attackTrends, impactTrends, stats)
        };
    }

    private generateTrendMessage(attackType: string, trend: TrendData | undefined): string {
        if (!trend) {
            return `Los ataques de tipo ${this.translateAttackType(attackType)} son poco frecuentes en la comunidad.`;
        }

        if (trend.percentage > 30) {
            return `⚠️ ALERTA: Los ataques de ${this.translateAttackType(attackType)} representan el ${trend.percentage}% de los reportes recientes en tu comunidad.`;
        } else if (trend.percentage > 15) {
            return `⚡ Los ataques de ${this.translateAttackType(attackType)} son moderadamente comunes (${trend.percentage}% de reportes).`;
        } else {
            return `Los ataques de ${this.translateAttackType(attackType)} representan el ${trend.percentage}% de los reportes comunitarios.`;
        }
    }

    private calculateAlertLevel(stats: Record<string, unknown>, trends: TrendData[]): 'bajo' | 'medio' | 'alto' {
        const highImpactPercentage = ((stats.highest_impact_count as number) / (stats.total_reports as number)) * 100;
        const topAttackPercentage = trends[0]?.percentage || 0;

        if (highImpactPercentage > 40 || topAttackPercentage > 50) {
            return 'alto';
        } else if (highImpactPercentage > 20 || topAttackPercentage > 30) {
            return 'medio';
        }
        return 'bajo';
    }

    private generateKeyInsight(attackTrends: TrendData[], impactTrends: TrendData[], stats: Record<string, unknown>): string {
        const topAttack = attackTrends[0];
        const highImpactPercentage = ((stats.highest_impact_count as number) / (stats.total_reports as number)) * 100;

        if (highImpactPercentage > 30) {
            return `Alerta: El ${highImpactPercentage.toFixed(1)}% de los reportes recientes involucran pérdidas financieras o de datos. La comunidad necesita mayor vigilancia.`;
        } else if (topAttack && topAttack.percentage > 40) {
            return `Tendencia dominante: Los ataques por ${this.translateAttackType(topAttack.attack_type)} representan ${topAttack.percentage}% de las amenazas comunitarias.`;
        } else {
            return `La comunidad muestra diversidad en tipos de amenazas, con ${stats.anonymous_percentage as number}% de reportes anónimos indicando confianza en la plataforma.`;
        }
    }

    private generateCommunityInsights(stats: Record<string, unknown>, trends: TrendData[]): string[] {
        const insights: string[] = [];

        if ((stats.total_reports as number) > 50) {
            insights.push(`📊 Comunidad activa: ${stats.total_reports as number} reportes en los últimos 30 días demuestran alta participación.`);
        }

        if ((stats.anonymous_percentage as number) > 70) {
            insights.push(`🔒 Alta privacidad: ${stats.anonymous_percentage as number}% de usuarios prefieren reportar de forma anónima.`);
        }

        const topTrend = trends[0];
        if (topTrend && topTrend.percentage > 35) {
            insights.push(`⚠️ Amenaza predominante: ${this.translateAttackType(topTrend.attack_type)} requiere atención especial de la comunidad.`);
        }

        if (insights.length === 0) {
            insights.push('📈 La comunidad está desarrollando patrones de seguridad. Más datos permitirán mejores insights.');
        }

        return insights;
    }

    private getPreventionTips(attackType: string): string[] {
        const tips: Record<string, string[]> = {
            'email': [
                'Verifica siempre la dirección del remitente',
                'Evita hacer clic en enlaces sospechosos',
                'No descargues archivos adjuntos de fuentes desconocidas'
            ],
            'whatsapp': [
                'No compartas códigos de verificación',
                'Verifica la identidad del contacto',
                'Desconfía de ofertas demasiado buenas para ser verdad'
            ],
            'SMS': [
                'Los bancos nunca piden información por SMS',
                'No hagas clic en enlaces de mensajes no solicitados',
                'Verifica directamente con la empresa si recibes mensajes oficiales'
            ],
            'llamada': [
                'Nunca proporciones información personal por teléfono',
                'Los bancos no llaman pidiendo contraseñas',
                'Cuelga y llama directamente a la empresa'
            ],
            'redes_sociales': [
                'Configura tu perfil como privado',
                'No aceptes solicitudes de desconocidos',
                'Verifica la autenticidad de ofertas y promociones'
            ]
        };

        return tips[attackType] || [
            'Mantén siempre actualizado tu software',
            'Usa contraseñas fuertes y únicas',
            'Desconfía de comunicaciones no solicitadas'
        ];
    }

}