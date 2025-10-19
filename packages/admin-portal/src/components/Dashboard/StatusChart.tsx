'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { StatusDistribution } from '../../types';
import { useCatalogDisplayNames } from '../../contexts/CatalogContext';

interface StatusChartProps {
  data: StatusDistribution[];
  isLoading?: boolean;
}

const STATUS_COLORS = {
  'nuevo': '#EF4444',       // Red - New/Urgent (status-rejected)
  'revisado': '#F59E0B',    // Amber - Under Review (status-progress)
  'en_investigacion': '#A1CDF4', // SafeTrade Blue - In Progress
  'cerrado': '#10B981'      // Green - Resolved (status-accepted)
};

export default function StatusChart({ data, isLoading }: StatusChartProps) {
  const { getStatusName, loading: catalogLoading } = useCatalogDisplayNames();

  // Helper function to get user-friendly display names
  const getDisplayName = (name: string): string => {
    const displayNames: Record<string, string> = {
      'nuevo': 'Nuevo',
      'revisado': 'Revisado',
      'en_investigacion': 'En Investigación',
      'cerrado': 'Cerrado'
    };
    return displayNames[name] || name;
  };

  // Show loading if either chart data or catalog data is loading
  if (isLoading || catalogLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm shadow border border-safetrade-blue/30 p-6">
        <h3 className="text-lg font-medium text-safetrade-dark mb-4">Estado de Reportes</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-safetrade-orange"></div>
          <span className="ml-2 text-safetrade-dark/70">
            {catalogLoading ? 'Cargando configuración...' : 'Cargando datos...'}
          </span>
        </div>
      </div>
    );
  }

  const chartData = data.map(item => {
    // Handle both old format (status string) and new format (status + status_name)
    let displayName = '';
    let statusKey = '';

    // Check if item has the new normalized format properties
    const normalizedItem = item as any;

    if (normalizedItem.status_name && normalizedItem.status_name !== 'Desconocido') {
      // New format with pre-enriched name from backend
      displayName = getDisplayName(normalizedItem.status_name);
      statusKey = normalizedItem.status_name;
    } else if (normalizedItem.status && typeof normalizedItem.status === 'number') {
      // New format with ID - use catalog lookup
      displayName = getStatusName(normalizedItem.status);
      statusKey = getStatusName(normalizedItem.status);
    } else if (item.status && typeof item.status === 'string') {
      // Legacy format - fallback to string value
      displayName = getDisplayName(item.status);
      statusKey = item.status;
    } else {
      // Fallback if no recognized format
      displayName = 'Desconocido';
      statusKey = 'unknown';
    }

    return {
      name: displayName,
      value: item.count,
      percentage: item.percentage,
      color: STATUS_COLORS[statusKey as keyof typeof STATUS_COLORS] || '#6B7280',
      originalStatus: item.status || item.status_name
    };
  });

  const CustomTooltip = ({ active, payload }: { active?: boolean; payload?: Array<{ payload: { name: string; value: number; percentage: number } }> }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-safetrade-blue/30 shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-safetrade-dark/70">
            Reportes: <span className="font-medium">{data.value}</span>
          </p>
          <p className="text-sm text-safetrade-dark/70">
            Porcentaje: <span className="font-medium">{data.percentage}%</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white/70 backdrop-blur-sm shadow border border-safetrade-blue/30 p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Estado de Reportes</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              innerRadius={40}
              outerRadius={80}
              paddingAngle={2}
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip content={<CustomTooltip />} />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value: string, entry: { color: string }) => (
                <span style={{ color: entry.color }}>{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}