// Servicio de tokens JWT - requiere JWT_SECRET configurado

import { Injectable } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import { UserProfile, AdminProfile } from "src/common/interfaces/authenticated-request";
import { EnvValidationService } from "src/common/config/env-validation.service";

export type AccessPayload = {
    sub: string;
    type: "access";
    profile: UserProfile;
};

export type AdminPayload = {
    sub: string;
    type: "admin";
    profile: AdminProfile;
};

export type RefreshPayload = {
    sub: string;
    type: "refresh" | "admin";
};

@Injectable()
export class TokenService {
    constructor(private readonly jwtService: JwtService) {}

    async generateAccessToken(profile: UserProfile): Promise<string> {
        return this.jwtService.signAsync({
            sub: profile.id.toString(),
            type: "access",
            profile
        } satisfies AccessPayload, {
            secret: EnvValidationService.getJwtSecret(),
            expiresIn: "1h"
        });
    }

    async generateAdminToken(profile: AdminProfile): Promise<string> {
        return this.jwtService.signAsync({
            sub: profile.id.toString(),
            type: "admin",
            profile
        } satisfies AdminPayload, {
            secret: EnvValidationService.getJwtSecret(),
            expiresIn: "4h" // Longer session for admins
        });
    }

    async generateRefreshToken(profile: UserProfile | AdminProfile): Promise<string> {
        const isAdmin = 'isAdmin' in profile;

        return this.jwtService.signAsync({
            sub: profile.id.toString(),
            type: isAdmin ? "admin" : "refresh"
        } satisfies RefreshPayload, {
            secret: EnvValidationService.getJwtSecret(),
            expiresIn: "7d"
        });
    }

    async verifyAccessToken(token: string): Promise<AccessPayload> {
        const payload = await this.jwtService.verifyAsync<AccessPayload>(token, {
            secret: EnvValidationService.getJwtSecret()
        });

        if (payload.type !== "access") {
            throw new Error("Tipo de token inválido");
        }
        return payload;
    }

    async verifyAdminToken(token: string): Promise<AdminPayload> {
        const payload = await this.jwtService.verifyAsync<AdminPayload>(token, {
            secret: EnvValidationService.getJwtSecret()
        });

        if (payload.type !== "admin") {
            throw new Error("Tipo de token inválido");
        }
        return payload;
    }

    async verifyRefreshToken(token: string): Promise<RefreshPayload> {
        const payload = await this.jwtService.verifyAsync<RefreshPayload>(token, {
            secret: EnvValidationService.getJwtSecret()
        });

        if (payload.type !== "refresh" && payload.type !== "admin") {
            throw new Error("Tipo de token de renovación inválido");
        }
        return payload;
    }
}