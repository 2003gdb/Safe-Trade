
import { Body, Controller, Post, Get, Put, UseGuards, Req, HttpException, HttpStatus } from "@nestjs/common";
import { UsersService } from "./users.service";
import { ApiOperation, ApiProperty, ApiTags, ApiBearerAuth } from "@nestjs/swagger";
import { JwtAuthGuard } from "src/common/guards/jwt-auth.guard";
import type { AuthenticatedRequest, UserProfile } from "src/common/interfaces/authenticated-request";
import { TokenService } from "src/auth/token.service";
import { IsEmail, IsString, MinLength, IsOptional } from "class-validator";

export class CreateUserDto {
    @ApiProperty({ example: "juan@example.com", required: true })
    @IsEmail({}, { message: "Ingrese un correo electrónico válido" })
    email!: string;

    @ApiProperty({ example: "Juan Pérez", required: false })
    @IsOptional()
    @IsString({ message: "El nombre debe ser una cadena de texto válida" })
    name!: string;

    @ApiProperty({ example: "password123", required: true })
    @IsString({ message: "La contraseña debe ser una cadena de texto válida" })
    @MinLength(8, { message: "La contraseña debe tener al menos 8 caracteres" })
    password!: string;
}

export class UpdateEmailDto {
    @ApiProperty({ example: "nuevo@example.com", required: true })
    @IsEmail({}, { message: "Ingrese un correo electrónico válido" })
    new_email!: string;

    @ApiProperty({ example: "password123", required: true })
    @IsString({ message: "La contraseña debe ser una cadena de texto válida" })
    @MinLength(1, { message: "La contraseña es requerida" })
    password!: string;
}

export class UpdateNameDto {
    @ApiProperty({ example: "Carlos Nuevo", required: true })
    @IsString({ message: "El nombre debe ser una cadena de texto válida" })
    @MinLength(2, { message: "El nombre debe tener al menos 2 caracteres" })
    new_name!: string;

    @ApiProperty({ example: "password123", required: true })
    @IsString({ message: "La contraseña debe ser una cadena de texto válida" })
    @MinLength(1, { message: "La contraseña es requerida" })
    password!: string;
}

export class ChangePasswordDto {
    @ApiProperty({ example: "password123", required: true })
    @IsString({ message: "La contraseña actual debe ser una cadena de texto válida" })
    @MinLength(1, { message: "La contraseña actual es requerida" })
    current_password!: string;

    @ApiProperty({ example: "newPassword123", required: true })
    @IsString({ message: "La nueva contraseña debe ser una cadena de texto válida" })
    @MinLength(8, { message: "La nueva contraseña debe tener al menos 8 caracteres" })
    new_password!: string;
}

@ApiTags('Módulo de Usuarios')
@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly tokenService: TokenService
    ) {}

    @ApiOperation({ summary: "Endpoint de registro de usuarios" })
    @Post('register')
    async createUser(@Body() createUserDto: CreateUserDto) {
        try {
            const existingUser = await this.usersService.findByEmail(createUserDto.email);
            if (existingUser) {
                throw new HttpException("El correo electrónico ya está registrado", HttpStatus.CONFLICT);
            }

            const user = await this.usersService.createUser(
                createUserDto.email,
                createUserDto.name || '',
                createUserDto.password,
            );

            if (user) {
                const userProfile: UserProfile = {
                    id: user.id,
                    email: user.email,
                    name: user.name
                };

                const accessToken = await this.tokenService.generateAccessToken(userProfile);
                const refreshToken = await this.tokenService.generateRefreshToken(userProfile);

                const { pass_hash: _pass_hash, salt: _salt, ...safeUser } = user;

                return {
                    success: true,
                    message: "Usuario registrado exitosamente",
                    user: safeUser,
                    access_token: accessToken,
                    refresh_token: refreshToken
                };
            }

            throw new HttpException("Error al registrar usuario", HttpStatus.INTERNAL_SERVER_ERROR);
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }

            throw new HttpException("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Obtener perfil del usuario autenticado" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Req() req: AuthenticatedRequest) {
        return {
            success: true,
            profile: req.user.profile
        };
    }

    @ApiOperation({ summary: "Actualizar correo electrónico del usuario" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('profile/email')
    async updateEmail(@Req() req: AuthenticatedRequest, @Body() updateEmailDto: UpdateEmailDto) {
        try {
            const user = await this.usersService.validateUser(req.user.profile.email, updateEmailDto.password);
            if (!user) {
                throw new HttpException("Contraseña incorrecta", HttpStatus.UNAUTHORIZED);
            }

            const existingUser = await this.usersService.findByEmail(updateEmailDto.new_email);
            if (existingUser && existingUser.id !== user.id) {
                throw new HttpException("El correo electrónico ya está registrado", HttpStatus.CONFLICT);
            }

            const updatedUser = await this.usersService.updateUser(user.id, { email: updateEmailDto.new_email });
            if (!updatedUser) {
                throw new HttpException("Error al actualizar correo", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const { pass_hash: _pass_hash, salt: _salt, ...safeUser } = updatedUser;

            return {
                success: true,
                message: "Correo actualizado exitosamente",
                user: safeUser
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Actualizar nombre del usuario" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('profile/name')
    async updateName(@Req() req: AuthenticatedRequest, @Body() updateNameDto: UpdateNameDto) {
        try {
            console.log('updateName called with:', { email: req.user.profile.email, new_name: updateNameDto.new_name });

            const user = await this.usersService.validateUser(req.user.profile.email, updateNameDto.password);
            console.log('User validation result:', user ? 'valid' : 'invalid');

            if (!user) {
                throw new HttpException("Contraseña incorrecta", HttpStatus.UNAUTHORIZED);
            }

            console.log('Updating user with id:', user.id, 'new name:', updateNameDto.new_name);
            const updatedUser = await this.usersService.updateUser(user.id, { name: updateNameDto.new_name });
            console.log('Update result:', updatedUser ? 'success' : 'failed');

            if (!updatedUser) {
                throw new HttpException("Error al actualizar nombre", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            const { pass_hash: _pass_hash, salt: _salt, ...safeUser } = updatedUser;

            return {
                success: true,
                message: "Nombre actualizado exitosamente",
                user: safeUser
            };
        } catch (error) {
            console.error('Error in updateName:', error);
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }

    @ApiOperation({ summary: "Cambiar contraseña del usuario" })
    @ApiBearerAuth()
    @UseGuards(JwtAuthGuard)
    @Put('profile/password')
    async changePassword(@Req() req: AuthenticatedRequest, @Body() changePasswordDto: ChangePasswordDto) {
        try {
            const user = await this.usersService.findById(req.user.profile.id);
            if (!user) {
                throw new HttpException("Usuario no encontrado", HttpStatus.NOT_FOUND);
            }

            const isValidPassword = await this.usersService.validateUser(user.email, changePasswordDto.current_password);
            if (!isValidPassword) {
                throw new HttpException("Contraseña actual incorrecta", HttpStatus.UNAUTHORIZED);
            }

            const success = await this.usersService.changePassword(user.id, changePasswordDto.new_password);
            if (!success) {
                throw new HttpException("Error al cambiar contraseña", HttpStatus.INTERNAL_SERVER_ERROR);
            }

            return {
                success: true,
                message: "Contraseña cambiada exitosamente"
            };
        } catch (error) {
            if (error instanceof HttpException) {
                throw error;
            }
            throw new HttpException("Error interno del servidor", HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
}