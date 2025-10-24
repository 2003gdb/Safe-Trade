import { Body, Controller, Get, Post, Put, Param, UseGuards, Query, HttpException, HttpStatus } from "@nestjs/common";
import { AdminService } from "./admin.service";
import { AdminAuthGuard } from "src/common/guards/admin-auth.guard";
import { AuthService } from "src/auth/auth.service";
import { ApiBearerAuth, ApiResponse, ApiTags, ApiProperty, ApiQuery } from "@nestjs/swagger";
import { IsEmail, IsString, IsOptional, MinLength, IsArray, IsIn } from "class-validator";

export class AdminLoginDto {
    @ApiProperty({ example: "admin@safetrade.com", required: true })
    @IsEmail({}, { message: "Ingrese un correo electrónico válido" })
    email!: string;

    @ApiProperty({ example: "admin123", required: true })
    @IsString({ message: "La contraseña debe ser una cadena de texto válida" })
    password!: string;
}

export class ReportFilterDto {
    @ApiProperty({ example: "nuevo", required: false })
    @IsOptional()
    @IsString()
    status?: string;

    @ApiProperty({ example: "email", required: false })
    @IsOptional()
    @IsString()
    attack_type?: string;

    @ApiProperty({ example: "true", required: false })
    @IsOptional()
    @IsString()
    is_anonymous?: string;

    @ApiProperty({ example: "2025-01-01", required: false })
    @IsOptional()
    @IsString()
    date_from?: string;

    @ApiProperty({ example: "2025-12-31", required: false })
    @IsOptional()
    @IsString()
    date_to?: string;

    @ApiProperty({ example: 1, required: false })
    @IsOptional()
    @IsString()
    page?: string;

    @ApiProperty({ example: 10, required: false })
    @IsOptional()
    @IsString()
    limit?: string;
}

export class SearchReportsDto extends ReportFilterDto {
    @ApiProperty({ example: "phishing", required: false })
    @IsOptional()
    @IsString()
    q?: string;

    @ApiProperty({ example: "robo_dinero", required: false })
    @IsOptional()
    @IsString()
    impact_level?: string;

    @ApiProperty({ example: "Mexico", required: false })
    @IsOptional()
    @IsString()
    location?: string;
}


export class UpdateStatusDto {
    @ApiProperty({ example: "revisado", required: true })
    @IsString()
    @IsIn(['nuevo', 'revisado', 'en_investigacion', 'cerrado'])
    status!: string;

    @ApiProperty({ example: "Updated by admin", required: false })
    @IsOptional()
    @IsString()
    adminNotes?: string;
}

export class AddNoteDto {
    @ApiProperty({ example: "Investigation note", required: true })
    @IsString()
    content!: string;

    @ApiProperty({ example: false, required: false })
    @IsOptional()
    isTemplate?: boolean;

    @ApiProperty({ example: "Investigation Template", required: false })
    @IsOptional()
    @IsString()
    templateName?: string;
}

@ApiTags('Administración')
@Controller('admin')
export class AdminController {
    constructor(
        private readonly adminService: AdminService,
        private readonly authService: AuthService
    ) {}

    @Post('login')
    @ApiResponse({ status: 200, description: 'Login de administrador exitoso' })
    @ApiResponse({ status: 401, description: 'Credenciales de administrador inválidas' })
    async adminLogin(@Body() adminLoginDto: AdminLoginDto) {
        const result = await this.authService.loginAdmin(adminLoginDto.email, adminLoginDto.password);

        if (result.error) {
            throw new HttpException(
                { message: result.error },
                HttpStatus.UNAUTHORIZED
            );
        }

        return result;
    }

    @Get('users/list')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Lista de usuarios obtenida exitosamente' })
    @ApiResponse({ status: 401, description: 'Token de administrador requerido' })
    @ApiResponse({ status: 403, description: 'Permisos insuficientes' })
    async getUsersList() {
        const users = await this.adminService.getAllUsers();
        return {
            success: true,
            message: "Lista de usuarios obtenida exitosamente",
            users: users,
            total: users.length
        };
    }

    @Get('users/:id')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Usuario obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Usuario no encontrado' })
    @ApiResponse({ status: 401, description: 'Token de administrador requerido' })
    async getUserById(@Param('id') id: string) {
        const userId = parseInt(id);
        const user = await this.adminService.getUserById(userId);

        if (!user) {
            return {
                success: false,
                message: "Usuario no encontrado"
            };
        }

        return {
            success: true,
            user: user
        };
    }

    @Get('dashboard')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Estadísticas del dashboard obtenidas exitosamente' })
    async getDashboard() {
        const stats = await this.adminService.getDashboardStats();

        return {
            total_reports: stats.total_reports,
            reports_today: stats.reports_today,
            critical_reports: stats.critical_reports,
            recent_trends: stats.recentTrends
        };
    }

    @Get('dashboard/enhanced')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Estadísticas detalladas del dashboard obtenidas exitosamente' })
    async getEnhancedDashboard() {
        return await this.adminService.getEnhancedDashboardStats();
    }

    @Get('validate-token')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Token válido' })
    @ApiResponse({ status: 401, description: 'Token inválido' })
    async validateToken() {
        return {
            valid: true,
            message: "Token válido"
        };
    }

    @Get('reports')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'attack_type', required: false })
    @ApiQuery({ name: 'is_anonymous', required: false })
    @ApiQuery({ name: 'date_from', required: false })
    @ApiQuery({ name: 'date_to', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiResponse({ status: 200, description: 'Lista de reportes obtenida exitosamente' })
    async getReports(@Query() filters: ReportFilterDto) {
        const reports = await this.adminService.getFilteredReportsForAdmin(filters);
        const page = parseInt(filters.page || '1');
        const limit = parseInt(filters.limit || '10');
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;

        const paginatedReports = reports.slice(startIndex, endIndex);

        return {
            data: paginatedReports,
            total: reports.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(reports.length / limit)
        };
    }

    @Get('reports/search')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiQuery({ name: 'q', required: false })
    @ApiQuery({ name: 'status', required: false })
    @ApiQuery({ name: 'attack_type', required: false })
    @ApiQuery({ name: 'impact_level', required: false })
    @ApiQuery({ name: 'is_anonymous', required: false })
    @ApiQuery({ name: 'date_from', required: false })
    @ApiQuery({ name: 'date_to', required: false })
    @ApiQuery({ name: 'location', required: false })
    @ApiQuery({ name: 'page', required: false })
    @ApiQuery({ name: 'limit', required: false })
    @ApiResponse({ status: 200, description: 'Resultados de búsqueda obtenidos exitosamente' })
    async searchReports(@Query() searchDto: SearchReportsDto) {
        const results = await this.adminService.searchReports(searchDto);
        return results;
    }

    @Get('reports/:id')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Reporte obtenido exitosamente' })
    @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
    async getReportById(@Param('id') id: string) {
        const reportId = parseInt(id);
        const report = await this.adminService.getReportByIdForAdmin(reportId);

        if (!report) {
            throw new HttpException(
                { message: "Reporte no encontrado" },
                HttpStatus.NOT_FOUND
            );
        }

        return report;
    }

    @Put('reports/:id/status')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Estado del reporte actualizado exitosamente' })
    @ApiResponse({ status: 404, description: 'Reporte no encontrado' })
    async updateReportStatus(@Param('id') id: string, @Body() updateDto: UpdateStatusDto) {
        const reportId = parseInt(id);
        const updatedReport = await this.adminService.updateReportStatus(reportId, updateDto.status, updateDto.adminNotes);

        if (!updatedReport) {
            throw new HttpException(
                { message: "Reporte no encontrado" },
                HttpStatus.NOT_FOUND
            );
        }

        return updatedReport;
    }


    @Get('reports/:id/notes')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Notas del reporte obtenidas exitosamente' })
    async getReportNotes(@Param('id') id: string) {
        const reportId = parseInt(id);
        const notes = await this.adminService.getReportNotes(reportId);
        return notes;
    }

    @Post('reports/:id/notes')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 201, description: 'Nota agregada exitosamente' })
    async addReportNote(@Param('id') id: string, @Body() noteDto: AddNoteDto) {
        const reportId = parseInt(id);
        const note = await this.adminService.addReportNote(
            reportId,
            noteDto.content,
            noteDto.isTemplate || false,
            noteDto.templateName
        );
        return note;
    }

    @Put('notes/:id')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Nota actualizada exitosamente' })
    async updateNote(@Param('id') id: string, @Body() body: { content: string }) {
        const noteId = parseInt(id);
        const updatedNote = await this.adminService.updateNote(noteId, body.content);
        return updatedNote;
    }

    @Post('notes/:id')
    @UseGuards(AdminAuthGuard)
    @ApiBearerAuth()
    @ApiResponse({ status: 200, description: 'Nota eliminada exitosamente' })
    async deleteNote(@Param('id') id: string) {
        const noteId = parseInt(id);
        await this.adminService.deleteNote(noteId);
        return { message: "Nota eliminada exitosamente" };
    }
}