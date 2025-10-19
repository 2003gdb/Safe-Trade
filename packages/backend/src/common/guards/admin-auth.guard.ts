
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException, ForbiddenException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedRequest, AccessPayload, AdminProfile } from "../interfaces/authenticated-request";
import { EnvValidationService } from "../config/env-validation.service";
import { Request } from 'express';

@Injectable()
export class AdminAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest<Request>();
        const auth = req.headers.authorization ?? "";
        const [scheme, token] = auth.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new UnauthorizedException("Token de administrador requerido");
        }

        try {
            const payload = await this.jwtService.verifyAsync<AccessPayload>(token, {
                secret: EnvValidationService.getJwtSecret(),
            });

            if (payload.type !== "admin") {
                throw new ForbiddenException("Se requieren permisos de administrador");
            }

            const adminProfile = payload.profile as AdminProfile;
            if (!adminProfile.isAdmin) {
                throw new ForbiddenException("Acceso denegado - permisos insuficientes");
            }

            (req as AuthenticatedRequest).user = {
                userId: payload.sub,
                profile: payload.profile,
                raw: payload
            };

            return true;
        } catch (error) {
            if (error instanceof ForbiddenException || error instanceof UnauthorizedException) {
                throw error;
            }
            throw new UnauthorizedException("Token de administrador inválido");
        }
    }
}