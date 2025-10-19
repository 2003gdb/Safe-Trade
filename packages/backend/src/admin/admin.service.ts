
import { Injectable } from '@nestjs/common';
import { UsersService } from 'src/users/users.service';
import { AdminRepository } from './admin.repository';
import { CatalogMappingService } from './catalog-mapping.service';

export interface ReportFilters {
    status?: string;
    attack_type?: string;
    is_anonymous?: string;
    date_from?: string;
    date_to?: string;
    page?: string;
    limit?: string;
}

export interface SearchFilters extends ReportFilters {
    q?: string;
    impact_level?: string;
    is_anonymous?: string;
    location?: string;
}


@Injectable()
export class AdminService {
    constructor(
        private readonly usersService: UsersService, // Reuse existing service
        private readonly adminRepository: AdminRepository,
        private readonly catalogMappingService: CatalogMappingService,
    ) {}

    // User management methods (reusing UsersService)
    async getAllUsers() {
        const users = await this.usersService.findAll();
        // Remove sensitive data before returning
        return users.map(user => {
            const { pass_hash: _pass_hash, salt: _salt, ...safeUser } = user;
            return safeUser;
        });
    }

    async getUserById(id: number) {
        const user = await this.usersService.findById(id);
        if (user) {
            const { pass_hash: _pass_hash, salt: _salt, ...safeUser } = user;
            return safeUser;
        }
        return null;
    }

    // Dashboard statistics
    async getDashboardStats() {
        const userCount = await this.adminRepository.getUserCount();
        const reportStats = await this.adminRepository.getReportStats();

        // Transform attack_types to recent_trends format for frontend compatibility
        const recentTrends = reportStats.attack_types.map(attackType => ({
            attackType: attackType.attack_type,
            count: attackType.count,
            percentage: Math.round((attackType.count / reportStats.total_reports) * 100)
        }));

        return {
            total_reports: reportStats.total_reports,
            reports_today: reportStats.reports_today,
            critical_reports: reportStats.critical_reports,
            recentTrends: recentTrends
        };
    }

    // Enhanced dashboard statistics
    async getEnhancedDashboardStats() {
        return await this.adminRepository.getEnhancedDashboardStats();
    }

    // Report management
    async getFilteredReports(filters: ReportFilters) {
        return this.adminRepository.getFilteredReports(filters);
    }

    // Admin Portal specific methods with data transformation
    async getFilteredReportsForAdmin(filters: ReportFilters) {
        const rawReports = await this.adminRepository.getFilteredReports(filters);

        // Transform using centralized catalog mapping service
        return (rawReports as any[]).map(row =>
            this.catalogMappingService.transformReportSummaryForAdmin(row)
        );
    }

    async updateReportStatus(reportId: number, status: string, adminNotes?: string) {
        const rawReport = await this.adminRepository.updateReportStatus(reportId, status, adminNotes);
        if (!rawReport) return null;

        // Transform using centralized catalog mapping service
        return this.catalogMappingService.transformReportForAdmin(rawReport);
    }

    // Advanced Search and Operations
    async searchReports(searchFilters: SearchFilters) {
        const page = parseInt(searchFilters.page || '1');
        const limit = parseInt(searchFilters.limit || '10');

        // For now, use basic filtering with search query applied client-side
        // In a real implementation, this would use database full-text search
        const reports = await this.adminRepository.getFilteredReports(searchFilters);

        // Apply search query filtering
        let filteredReports = reports;
        if (searchFilters.q) {
            const query = searchFilters.q.toLowerCase();
            filteredReports = reports.filter((report: any) =>
                report.description?.toLowerCase().includes(query) ||
                report.location?.toLowerCase().includes(query) ||
                report.attack_type?.toLowerCase().includes(query) ||
                report.id.toString().includes(query)
            );
        }

        // Apply additional filters
        if (searchFilters.impact_level) {
            filteredReports = filteredReports.filter((report: any) =>
                report.impact_level === searchFilters.impact_level
            );
        }

        if (searchFilters.is_anonymous !== undefined) {
            const isAnonymous = searchFilters.is_anonymous === 'true';
            filteredReports = filteredReports.filter((report: any) =>
                Boolean(report.is_anonymous) === isAnonymous
            );
        }

        if (searchFilters.location) {
            filteredReports = filteredReports.filter((report: any) =>
                report.location?.toLowerCase().includes(searchFilters.location!.toLowerCase())
            );
        }

        // Add search highlighting and scoring
        const searchResults = filteredReports.map((report: any) => ({
            ...report,
            highlights: searchFilters.q ? {
                description: [searchFilters.q],
                location: report.location?.toLowerCase().includes(searchFilters.q.toLowerCase()) ? [searchFilters.q] : undefined
            } : undefined,
            score: searchFilters.q ? this.calculateSearchScore(report, searchFilters.q) : undefined
        }));

        // Pagination
        const startIndex = (page - 1) * limit;
        const endIndex = startIndex + limit;
        const paginatedResults = searchResults.slice(startIndex, endIndex);

        return {
            data: paginatedResults,
            total: searchResults.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(searchResults.length / limit)
        };
    }

    private calculateSearchScore(report: any, query: string): number {
        let score = 0;
        const lowerQuery = query.toLowerCase();

        if (report.description?.toLowerCase().includes(lowerQuery)) score += 0.4;
        if (report.location?.toLowerCase().includes(lowerQuery)) score += 0.3;
        if (report.attack_type?.toLowerCase().includes(lowerQuery)) score += 0.2;
        if (report.id.toString().includes(query)) score += 0.1;

        return Math.min(score, 1.0);
    }

    async getReportById(reportId: number) {
        return this.adminRepository.getReportById(reportId);
    }

    async getReportByIdForAdmin(reportId: number) {
        const rawReport = await this.adminRepository.getReportById(reportId);
        if (!rawReport) return null;

        // Transform using centralized catalog mapping service
        return this.catalogMappingService.transformReportForAdmin(rawReport);
    }


    // Admin Notes Management
    async getReportNotes(reportId: number) {
        // For now, return empty array as notes table may not exist yet
        // In real implementation, would query notes table
        return [];
    }

    async addReportNote(reportId: number, content: string, isTemplate: boolean = false, templateName?: string) {
        // For now, return a mock note object
        // In real implementation, would insert into notes table
        return {
            id: Date.now(),
            reportId,
            adminId: 1,
            adminName: 'Admin User',
            content,
            isTemplate,
            templateName,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    async updateNote(noteId: number, content: string) {
        // For now, return a mock updated note
        // In real implementation, would update notes table
        return {
            id: noteId,
            reportId: 1,
            adminId: 1,
            adminName: 'Admin User',
            content,
            isTemplate: false,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
    }

    async deleteNote(noteId: number) {
        // For now, just return success
        // In real implementation, would delete from notes table
        return true;
    }
}