
import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedRequest, AccessPayload } from "../interfaces/authenticated-request";
import { EnvValidationService } from "../config/env-validation.service";
import { Request } from 'express';

@Injectable()
export class JwtAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest<Request>();
        const auth = req.headers.authorization ?? "";
        const [scheme, token] = auth.split(" ");

        if (scheme !== "Bearer" || !token) {
            throw new UnauthorizedException("Token de autenticación requerido");
        }

        try {
            const payload = await this.jwtService.verifyAsync<AccessPayload>(token, {
                secret: EnvValidationService.getJwtSecret(),
            });

            if (payload.type !== "access") {
                throw new UnauthorizedException("Tipo de token inválido");
            }

            (req as AuthenticatedRequest).user = {
                userId: payload.sub,
                profile: payload.profile,
                raw: payload
            };

            return true;
        } catch (error) {
            throw new UnauthorizedException("Token inválido o expirado");
        }
    }
}