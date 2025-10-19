/**
 * useReports Hook
 *
 * React hook for loading reports with catalog integration.
 * Handles filtering, pagination, and enrichment with catalog names.
 */

import { useState, useEffect } from 'react';
import { adminAPIService } from '../services/AdminAPIService';
import { useCatalogs } from './useCatalogs';
import { ReportWithDetails, AdminPortalFilters } from '../types/normalized.types';
import { PaginatedResponse, ReportSummary } from '../types';

export interface UseReportsFilters extends AdminPortalFilters {
  // Additional filters specific to the hook
  query?: string;
}

export interface UseReportsResult {
  reports: ReportWithDetails[];
  total: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  setFilters: (filters: UseReportsFilters) => void;
  filters: UseReportsFilters;
}

export const useReports = (initialFilters: UseReportsFilters = {}): UseReportsResult => {
  const [reports, setReports] = useState<ReportWithDetails[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState<UseReportsFilters>(initialFilters);

  const { catalogs, maps, loading: catalogsLoading } = useCatalogs();

  const loadReports = async () => {
    try {
      setLoading(true);
      setError(null);

      // Wait for catalogs to load before fetching reports
      if (catalogsLoading || !catalogs || !maps) {
        return;
      }

      // Convert filters for API call
      const apiFilters = {
        page: filters.page || 1,
        limit: filters.limit || 10,
        status: filters.status?.toString(),
        attackType: filters.attack_type?.toString(),
        isAnonymous: filters.is_anonymous?.toString(),
        dateFrom: filters.date_from,
        dateTo: filters.date_to
      };

      const response: PaginatedResponse<ReportSummary> = await adminAPIService.getReports(apiFilters);

      // Enrich reports with catalog names if they don't already have them
      const enrichedReports: ReportWithDetails[] = response.data.map((report: ReportSummary) => {
        // If the report already has enriched data (attack_type_name, etc.), use it
        // Otherwise, enrich it using our catalog maps
        const enriched: ReportWithDetails = {
          id: report.id,
          user_id: report.userId || null,
          is_anonymous: report.isAnonymous,
          attack_type: getAttackTypeId(report.attackType, maps),
          incident_date: report.incidentDate,
          evidence_url: null, // Not provided in summary
          attack_origin: report.location || '',
          sos_cont: null, // Not provided in summary
          description: null, // Not provided in summary
          impact: getImpactId(report.impactLevel, maps),
          status: getStatusId(report.status, maps),
          admin_note: null, // Not provided in summary
          created_at: report.createdAt,
          updated_at: report.createdAt, // Use createdAt as fallback
          attack_type_name: report.attackType,
          impact_name: report.impactLevel,
          status_name: report.status,
          user_email: undefined,
          user_name: undefined
        };

        return enriched;
      });

      setReports(enrichedReports);
      setTotal(response.total);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading reports';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  // Helper functions to get IDs from catalog maps
  const getAttackTypeId = (name: string, catalogMaps: any): number => {
    return catalogMaps.attackTypeNameMap.get(name) || 0;
  };

  const getImpactId = (name: string, catalogMaps: any): number => {
    return catalogMaps.impactNameMap.get(name) || 0;
  };

  const getStatusId = (name: string, catalogMaps: any): number => {
    return catalogMaps.statusNameMap.get(name) || 0;
  };

  useEffect(() => {
    loadReports();
  }, [filters, catalogs, catalogsLoading]); // Re-run when filters or catalogs change

  const refetch = async () => {
    await loadReports();
  };

  const updateFilters = (newFilters: UseReportsFilters) => {
    setFilters(prevFilters => ({ ...prevFilters, ...newFilters }));
  };

  return {
    reports,
    total,
    loading: loading || catalogsLoading,
    error,
    refetch,
    setFilters: updateFilters,
    filters
  };
};

/**
 * Hook for loading a single report by ID with catalog enrichment
 */
export const useReport = (reportId: number) => {
  const [report, setReport] = useState<ReportWithDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { catalogs, maps, loading: catalogsLoading } = useCatalogs();

  const loadReport = async () => {
    try {
      setLoading(true);
      setError(null);

      if (catalogsLoading || !catalogs || !maps) {
        return;
      }

      const reportData = await adminAPIService.getReportById(reportId);

      // If the report comes pre-enriched, use it as-is
      // Otherwise, enrich it with catalog data
      const enrichedReport: ReportWithDetails = {
        ...reportData,
        attack_type_name: reportData.attackType || maps.attackTypeMap.get(reportData.id) || 'Desconocido',
        impact_name: reportData.impactLevel || maps.impactMap.get(reportData.id) || 'Desconocido',
        status_name: reportData.status || maps.statusMap.get(reportData.id) || 'Desconocido'
      } as ReportWithDetails;

      setReport(enrichedReport);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading report';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReport();
  }, [reportId, catalogs, catalogsLoading]);

  const refetch = async () => {
    await loadReport();
  };

  return {
    report,
    loading: loading || catalogsLoading,
    error,
    refetch
  };
};

/**
 * Hook for report statistics with catalog integration
 */
export const useReportStats = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const { catalogs, maps, loading: catalogsLoading } = useCatalogs();

  const loadStats = async () => {
    try {
      setLoading(true);
      setError(null);

      if (catalogsLoading || !catalogs || !maps) {
        return;
      }

      const enhancedMetrics = await adminAPIService.getEnhancedDashboardMetrics();

      // Enrich stats with catalog names if needed
      const enrichedStats = {
        ...enhancedMetrics,
        attack_types: enhancedMetrics.attack_types?.map((item: any) => ({
          ...item,
          attack_type_name: item.attack_type_name || maps.attackTypeMap.get(item.attack_type_id) || 'Desconocido'
        })),
        impact_distribution: enhancedMetrics.impact_distribution?.map((item: any) => ({
          ...item,
          impact_name: item.impact_name || maps.impactMap.get(item.impact_id) || 'Desconocido'
        })),
        status_distribution: enhancedMetrics.status_distribution?.map((item: any) => ({
          ...item,
          status_name: item.status_name || maps.statusMap.get(item.status_id) || 'Desconocido'
        }))
      };

      setStats(enrichedStats);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading statistics';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [catalogs, catalogsLoading]);

  const refetch = async () => {
    await loadStats();
  };

  return {
    stats,
    loading: loading || catalogsLoading,
    error,
    refetch
  };
};