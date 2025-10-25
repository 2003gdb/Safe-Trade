'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import ProtectedRoute from '../../components/ProtectedRoute';
import Header from '../../components/Header';
import ReportsTable from '../../components/Reports/ReportsTable';
import ReportsFilter from '../../components/Reports/ReportsFilter';
import Pagination from '../../components/Pagination';
import { adminAPIService } from '../../services/AdminAPIService';
import { ReportSummary } from '../../types';
import { es } from '../../locales/es';

export default function ReportsPage() {
  const renderCount = useRef(0);
  renderCount.current += 1;

  const [reports, setReports] = useState<ReportSummary[]>([]);
  const [pagination, setPagination] = useState({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  });
  const [filters, setFilters] = useState({
    status: '',
    attackType: '',
    isAnonymous: '',
    dateFrom: '',
    dateTo: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const currentPaginationRef = useRef(pagination);
  const currentFiltersRef = useRef(filters);
  const loadingRef = useRef(false);
  const router = useRouter();

  useEffect(() => {
    currentPaginationRef.current = pagination;
  }, [pagination]);

  useEffect(() => {
    currentFiltersRef.current = filters;
  }, [filters]);

  const loadReports = useCallback(async () => {
    if (loadingRef.current) return;

    try {
      loadingRef.current = true;
      setIsLoading(true);
      setError(null);

      const params = {
        page: currentPaginationRef.current.page,
        limit: currentPaginationRef.current.limit,
        ...(currentFiltersRef.current.status && { status: currentFiltersRef.current.status }),
        ...(currentFiltersRef.current.attackType && { attackType: currentFiltersRef.current.attackType }),
        ...(currentFiltersRef.current.isAnonymous && { isAnonymous: currentFiltersRef.current.isAnonymous }),
        ...(currentFiltersRef.current.dateFrom && { dateFrom: currentFiltersRef.current.dateFrom }),
        ...(currentFiltersRef.current.dateTo && { dateTo: currentFiltersRef.current.dateTo })
      };

      const response = await adminAPIService.getReports(params);
      setReports(response.data);

      setPagination(prev => {
        if (prev.total === response.total && prev.totalPages === response.totalPages) {
          return prev;
        }
        return {
          ...prev,
          total: response.total,
          totalPages: response.totalPages
        };
      });
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Error al cargar reportes');
    } finally {
      setIsLoading(false);
      loadingRef.current = false;
    }
  }, []);

  useEffect(() => {
    loadReports();
  }, [loadReports]);

  const handleFilterChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
    setPagination(prev => ({ ...prev, page: 1 }));
    setTimeout(() => loadReports(), 0);
  };

  const handlePageChange = (page: number) => {
    setPagination(prev => ({ ...prev, page }));
    loadReports();
  };

  const handleViewReport = (id: number) => {
    router.push(`/reports/${id}`);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-50">
        <Header />

        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900">
                  {es.reports.title}
                </h1>
                <p className="mt-1 text-sm text-gray-600">
                  {es.reports.listTitle}
                </p>
              </div>
              <div className="flex items-center space-x-4">
                <div className="text-sm text-gray-500">
                  {pagination.total} {es.reports.pagination.results}
                </div>
              </div>
            </div>
          </div>

          <div className="px-4 sm:px-0">
            <ReportsFilter
              filters={filters}
              onFilterChange={handleFilterChange}
            />
          </div>

          {successMessage && (
            <div className="px-4 sm:px-0 mb-6">
              <div className="rounded-md bg-green-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-green-800">
                      {successMessage}
                    </h3>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setSuccessMessage(null)}
                      className="bg-green-50 rounded-md p-1.5 text-green-500 hover:bg-green-100"
                    >
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="px-4 sm:px-0 mb-6">
              <div className="rounded-md bg-red-50 p-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-red-800">
                      {error}
                    </h3>
                  </div>
                  <div className="ml-auto pl-3">
                    <button
                      onClick={() => setError(null)}
                      className="bg-red-50 rounded-md p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-red-50 focus:ring-red-600"
                    >
                      <span className="sr-only">Cerrar</span>
                      <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="px-4 sm:px-0">
            <ReportsTable
              reports={reports}
              isLoading={isLoading}
              onViewReport={handleViewReport}
            />
          </div>

          {!isLoading && reports.length > 0 && (
            <div className="px-4 sm:px-0 mt-6">
              <Pagination
                currentPage={pagination.page}
                totalPages={pagination.totalPages}
                totalResults={pagination.total}
                onPageChange={handlePageChange}
              />
            </div>
          )}
        </main>

      </div>
    </ProtectedRoute>
  );
}