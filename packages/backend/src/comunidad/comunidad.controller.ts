
import { Controller, Get, Query, UseGuards, Req } from "@nestjs/common";
import { ComunidadService } from "./comunidad.service";
import { AnonymousAuthGuard } from "src/common/guards/anonymous-auth.guard";
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request";
import { ApiResponse, ApiTags, ApiQuery } from "@nestjs/swagger";

@ApiTags('Comunidad e Inteligencia de Amenazas')
@Controller('comunidad')
export class ComunidadController {
    constructor(private readonly comunidadService: ComunidadService) {}

    @Get('tendencias')
    @UseGuards(AnonymousAuthGuard) // Allow both anonymous and authenticated access
    @ApiQuery({ name: 'period', enum: ['7days', '30days', '90days'], required: false })
    @ApiResponse({ status: 200, description: 'Tendencias comunitarias obtenidas exitosamente' })
    async getTendencias(
        @Query('period') period: '7days' | '30days' | '90days' = '30days',
        @Req() req: AuthenticatedRequest
    ) {
        try {
            const tendencias = await this.comunidadService.getTendencias(period);

            return {
                success: true,
                message: `Tendencias comunitarias de los últimos ${period === '7days' ? '7 días' : period === '30days' ? '30 días' : '90 días'}`,
                data: tendencias,
                user_context: {
                    access_type: req.user.userId === "anonymous" ? "anónimo" : "registrado",
                    viewing_period: period
                }
            };

        } catch (error) {
            return {
                success: false,
                message: "Error al obtener tendencias comunitarias",
                error: process.env.NODE_ENV === 'development' ? error : undefined
            };
        }
    }


    @Get('analytics')
    @UseGuards(AnonymousAuthGuard) // Community analytics available to all
    @ApiResponse({ status: 200, description: 'Analytics comunitarios obtenidos exitosamente' })
    async getAnalytics(@Req() req: AuthenticatedRequest) {
        try {
            const analytics = await this.comunidadService.getAnalytics();

            return {
                success: true,
                message: "Analytics comunitarios obtenidos exitosamente",
                data: analytics,
                metadata: {
                    generated_at: new Date().toISOString(),
                    user_access: req.user.userId === "anonymous" ? "público" : "registrado"
                }
            };

        } catch (error) {
            return {
                success: false,
                message: "Error al obtener analytics comunitarios",
                error: process.env.NODE_ENV === 'development' ? error : undefined
            };
        }
    }

    @Get('alerta')
    @UseGuards(AnonymousAuthGuard)
    @ApiResponse({ status: 200, description: 'Estado de alerta comunitario obtenido exitosamente' })
    async getAlertaComunitaria() {
        try {
            const tendencias = await this.comunidadService.getTendencias('7days');
            const analytics = await this.comunidadService.getAnalytics();

            // Generate community alert based on recent trends
            const alertLevel = this.determineAlertLevel(tendencias, analytics);
            const alertMessage = this.generateAlertMessage(alertLevel, tendencias);

            const response = {
                success: true,
                alerta: {
                    nivel: alertLevel,
                    mensaje: alertMessage,
                    ultima_actualizacion: new Date().toISOString()
                }
            };

            return response;

        } catch (error) {
            return {
                success: false,
                message: "Error al obtener alerta comunitaria",
                error: process.env.NODE_ENV === 'development' ? error : undefined
            };
        }
    }

    private determineAlertLevel(tendencias: Record<string, unknown>, analytics: Record<string, unknown>): 'verde' | 'amarillo' | 'rojo' {
        const analytics_overview = analytics.community_overview as Record<string, number>;
        const highImpactPercentage = (analytics_overview.highest_impact_count / analytics_overview.total_reports) * 100;
        const attack_trends = tendencias.attack_trends as Array<{ percentage: number }>;
        const topAttackPercentage = attack_trends?.[0]?.percentage || 0;

        if (highImpactPercentage > 40 || topAttackPercentage > 60) {
            return 'rojo';
        } else if (highImpactPercentage > 20 || topAttackPercentage > 40) {
            return 'amarillo';
        }
        return 'verde';
    }

    private generateAlertMessage(level: string, tendencias: Record<string, unknown>): string {
        switch (level) {
            case 'rojo':
                return `Se ha detectado un incremento significativo en ataques cibernéticos. ${(tendencias.summary as Record<string, string>).main_threat} es la amenaza predominante.`;
            case 'amarillo':
                return `Actividad cibernética elevada detectada. ${(tendencias.summary as Record<string, string>).main_threat} requiere atención.`;
            default:
                return `Actividad cibernética dentro de parámetros normales. Continúa con buenas prácticas de seguridad.`;
        }
    }

    private getGeneralRecommendations(level: string): string[] {
        const recommendations = {
            'rojo': [
                'Evita hacer clic en enlaces sospechosos',
                'Verifica todas las comunicaciones antes de actuar',
                'Mantén actualizados todos tus sistemas',
                'Considera usar autenticación de dos factores',
                'Reporta cualquier actividad sospechosa inmediatamente'
            ],
            'amarillo': [
                'Mantente alerta ante comunicaciones inusuales',
                'Verifica la autenticidad de mensajes importantes',
                'Revisa regularmente la configuración de privacidad',
                'Reporta incidentes para ayudar a la comunidad'
            ],
            'verde': [
                'Continúa con buenas prácticas de ciberseguridad',
                'Mantén actualizados tus sistemas',
                'Participa en la comunidad reportando incidentes',
                'Comparte conocimientos de seguridad con otros'
            ]
        };
        return recommendations[level as keyof typeof recommendations] || recommendations['verde'];
    }
}