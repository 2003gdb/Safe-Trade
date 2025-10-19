
import { Injectable } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { TokenService } from "./token.service";
import { AdminRepository } from "./admin.repository";
import { generateSalt } from "src/util/hash/hash.util";

@Injectable()
export class AuthService {
    constructor(
        private readonly usersService: UsersService,
        private readonly tokenService: TokenService,
        private readonly adminRepository: AdminRepository,
    ) {}

    async loginUser(email: string, password: string) {
        const user = await this.usersService.validateUser(email, password);
        if (user) {
            const userProfile = {
                id: user.id,
                email: user.email,
                name: user.name || '',
            };

            const token = await this.tokenService.generateAccessToken(userProfile);
            const refreshToken = await this.tokenService.generateRefreshToken(userProfile);


            return {
                access_token: token,
                refresh_token: refreshToken,
                user: userProfile
            };
        }
        return { error: "Credenciales inválidas" };
    }

    async loginAdmin(email: string, password: string) {
        const admin = await this.adminRepository.validateAdmin(email, password);
        if (admin) {
            const adminProfile = {
                id: admin.id,
                email: admin.email,
                isAdmin: true,
            };

            const token = await this.tokenService.generateAdminToken(adminProfile);
            const refreshToken = await this.tokenService.generateRefreshToken(adminProfile);

            return {
                access_token: token,
                refresh_token: refreshToken,
                admin: adminProfile
            };
        }
        return { error: "Credenciales de administrador inválidas" };
    }

    async refresh(refreshToken: string) {
        try {
            const payload = await this.tokenService.verifyRefreshToken(refreshToken);

            if (payload.type === "admin") {
                const admin = await this.adminRepository.findById(Number(payload.sub));
                if (admin) {
                    const adminProfile = { id: admin.id, email: admin.email, isAdmin: true };
                    const newAccessToken = await this.tokenService.generateAdminToken(adminProfile);
                    return { access_token: newAccessToken };
                }
            } else {
                const user = await this.usersService.findById(Number(payload.sub));
                if (user) {
                    const userProfile = { id: user.id, email: user.email, name: user.name || '' };
                    const newAccessToken = await this.tokenService.generateAccessToken(userProfile);
                    return { access_token: newAccessToken };
                }
            }
        } catch (error) {
            return { error: "Token de renovación inválido" };
        }
        return { error: "No se pudo renovar el token" };
    }
}