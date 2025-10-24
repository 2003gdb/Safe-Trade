
import { CanActivate, ExecutionContext, Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { AuthenticatedRequest, AccessPayload } from "../interfaces/authenticated-request";
import { EnvValidationService } from "../config/env-validation.service";
import { Request } from 'express';

@Injectable()
export class AnonymousAuthGuard implements CanActivate {
    constructor(private readonly jwtService: JwtService) {}

    async canActivate(ctx: ExecutionContext): Promise<boolean> {
        const req = ctx.switchToHttp().getRequest<Request>();
        const auth = req.headers.authorization ?? "";
        const [scheme, token] = auth.split(" ");

        if (scheme !== "Bearer" || !token) {
            (req as AuthenticatedRequest).user = {
                userId: "anonymous",
                profile: {
                    id: 0,
                    email: "anonymous@safetrade.com",
                    name: "Usuario Anónimo"
                },
                raw: {
                    sub: "anonymous",
                    type: "access",
                    profile: {
                        id: 0,
                        email: "anonymous@safetrade.com",
                        name: "Usuario Anónimo"
                    }
                }
            };
            return true;
        }

        try {
            const payload = await this.jwtService.verifyAsync<AccessPayload>(token, {
                secret: EnvValidationService.getJwtSecret(),
            });

            if (payload.type === "access") {
                (req as AuthenticatedRequest).user = {
                    userId: payload.sub,
                    profile: payload.profile,
                    raw: payload
                };
            }

            return true;
        } catch (error) {
            (req as AuthenticatedRequest).user = {
                userId: "anonymous",
                profile: {
                    id: 0,
                    email: "anonymous@safetrade.com",
                    name: "Usuario Anónimo"
                },
                raw: {
                    sub: "anonymous",
                    type: "access",
                    profile: {
                        id: 0,
                        email: "anonymous@safetrade.com",
                        name: "Usuario Anónimo"
                    }
                }
            };
            return true;
        }
    }
}