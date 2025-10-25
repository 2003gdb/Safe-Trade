'use client';

import MetricsCard from './MetricsCard';
import { EnhancedDashboardMetrics } from '../../types';

interface EnhancedMetricsCardsProps {
  metrics: EnhancedDashboardMetrics | null;
  isLoading: boolean;
}

export default function EnhancedMetricsCards({ metrics, isLoading }: EnhancedMetricsCardsProps) {
  const formatNumber = (num: number) => {
    return num.toLocaleString('es-ES');
  };

  const formatPercentage = (num: number, total: number) => {
    if (total === 0) return '0%';
    return `${Math.round((num / total) * 100)}%`;
  };

  return (
    <div className="space-y-6">
      {}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Total de Reportes"
          value={isLoading ? '-' : formatNumber(metrics?.total_reports || 0)}
          color="blue"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />

        <MetricsCard
          title="Reportes Hoy"
          value={isLoading ? '-' : formatNumber(metrics?.reports_today || 0)}
          color="green"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricsCard
          title="Reportes Esta Semana"
          value={isLoading ? '-' : formatNumber(metrics?.reports_this_week || 0)}
          color="purple"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
            </svg>
          }
        />

        <MetricsCard
          title="Reportes Este Mes"
          value={isLoading ? '-' : formatNumber(metrics?.reports_this_month || 0)}
          color="indigo"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
          }
        />
      </div>

      {}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
        <MetricsCard
          title="Reportes Críticos"
          value={isLoading ? '-' : formatNumber(metrics?.critical_reports || 0)}
          color="red"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.464 0L4.34 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          }
        />

        <MetricsCard
          title="Reportes Pendientes"
          value={isLoading ? '-' : formatNumber(metrics?.pending_reports || 0)}
          color="yellow"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricsCard
          title="Reportes Resueltos"
          value={isLoading ? '-' : formatNumber(metrics?.resolved_reports || 0)}
          color="green"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />

        <MetricsCard
          title="Tiempo Promedio de Resolución"
          value={isLoading ? '-' : `${Math.round(metrics?.response_times.avg_resolution_time || 0)} días`}
          color="blue"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          }
        />
      </div>

      {}
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <MetricsCard
          title="Reportes Anónimos"
          value={isLoading ? '-' : `${formatNumber(metrics?.anonymous_reports || 0)} (${formatPercentage(metrics?.anonymous_reports || 0, metrics?.total_reports || 0)})`}
          color="gray"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          }
        />

        <MetricsCard
          title="Reportes Identificados"
          value={isLoading ? '-' : `${formatNumber(metrics?.identified_reports || 0)} (${formatPercentage(metrics?.identified_reports || 0, metrics?.total_reports || 0)})`}
          color="teal"
          icon={
            <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V4a2 2 0 114 0v2m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" />
            </svg>
          }
        />
      </div>
    </div>
  );
}