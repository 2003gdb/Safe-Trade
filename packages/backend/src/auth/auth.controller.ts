
import { Body, Controller, Post, Get, UseGuards, Req, HttpException, HttpStatus } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { AuthenticatedRequest } from "src/common/interfaces/authenticated-request";
import { ApiBearerAuth, ApiResponse, ApiTags, ApiProperty } from "@nestjs/swagger";
import { IsEmail, IsString, MinLength } from "class-validator";

export class LoginDto {
    @ApiProperty({ example: "usuario@example.com", required: true })
    @IsEmail({}, { message: "Ingrese un correo electrónico válido" })
    email!: string;

    @ApiProperty({ example: "password123", required: true })
    @IsString({ message: "La contraseña debe ser una cadena de texto válida" })
    @MinLength(1, { message: "La contraseña es requerida" })
    password!: string;
}

export class AdminLoginDto {
    @ApiProperty({ example: "admin@safetrade.com", required: true })
    email!: string;

    @ApiProperty({ example: "admin123", required: true })
    password!: string;
}

export class RefreshDto {
    @ApiProperty({ example: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...", required: true })
    @IsString({ message: "El token de renovación debe ser una cadena de texto válida" })
    @MinLength(1, { message: "El token de renovación es requerido" })
    token!: string;
}

@ApiTags('Autenticación')
@Controller("auth")
export class AuthController {
    constructor(private readonly authService: AuthService) {}

    @Post("login")
    @ApiResponse({ status: 200, description: 'Login exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales inválidas' })
    async login(@Body() loginDto: LoginDto) {
        try {
            const result = await this.authService.loginUser(loginDto.email, loginDto.password);

            if (result.error) {
                throw new HttpException(result.error, HttpStatus.UNAUTHORIZED);
            }

            return {
                success: true,
                message: "Inicio de sesión exitoso",
                ...result
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Post("refresh")
    @ApiResponse({ status: 200, description: 'Token renovado exitosamente' })
    @ApiResponse({ status: 401, description: 'Token de renovación inválido' })
    async refresh(@Body() refreshDto: RefreshDto) {
        try {
            const result = await this.authService.refresh(refreshDto.token);

            if (result.error) {
                throw new HttpException(result.error, HttpStatus.UNAUTHORIZED);
            }

            return {
                success: true,
                message: "Token renovado exitosamente",
                ...result
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @Get("profile")
    @UseGuards(JwtAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Perfil de usuario obtenido exitosamente' })
    @ApiResponse({ status: 401, description: 'Token inválido o no proporcionado' })
    getProfile(@Req() req: AuthenticatedRequest) {
        return {
            success: true,
            profile: req.user.profile
        };
    }
}