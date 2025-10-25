'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { ImpactDistribution } from '../../types';
import { useCatalogDisplayNames } from '../../contexts/CatalogContext';

interface ImpactChartProps {
  data: ImpactDistribution[];
  isLoading?: boolean;
}

const IMPACT_COLORS = {
  'ninguno': '#10B981',           
  'robo_datos': '#F59E0B',        
  'robo_dinero': '#EF4444',       
  'cuenta_comprometida': '#A1CDF4' 
};

export default function ImpactChart({ data, isLoading }: ImpactChartProps) {
  const { getImpactName, loading: catalogLoading } = useCatalogDisplayNames();

  
  const getDisplayName = (name: string): string => {
    const displayNames: Record<string, string> = {
      'ninguno': 'Sin Impacto',
      'robo_datos': 'Robo de Datos',
      'robo_dinero': 'Robo de Dinero',
      'cuenta_comprometida': 'Cuenta Comprometida'
    };
    return displayNames[name] || name;
  };

  
  if (isLoading || catalogLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm shadow border border-safetrade-blue/30 p-6">
        <h3 className="text-lg font-medium text-safetrade-dark mb-4">Nivel de Impacto</h3>
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
    
    let displayName = '';
    let impactKey = '';

    
    const normalizedItem = item as any;

    if (normalizedItem.impact_name && normalizedItem.impact_name !== 'Desconocido') {
      
      displayName = getDisplayName(normalizedItem.impact_name);
      impactKey = normalizedItem.impact_name;
    } else if (normalizedItem.impact && typeof normalizedItem.impact === 'number') {
      
      displayName = getImpactName(normalizedItem.impact);
      impactKey = getImpactName(normalizedItem.impact);
    } else if (item.impact_level && typeof item.impact_level === 'string') {
      
      displayName = getDisplayName(item.impact_level);
      impactKey = item.impact_level;
    } else {
      
      displayName = 'Desconocido';
      impactKey = 'unknown';
    }

    return {
      name: displayName,
      value: item.count,
      percentage: item.percentage,
      color: IMPACT_COLORS[impactKey as keyof typeof IMPACT_COLORS] || '#6B7280',
      originalImpact: item.impact_level || item.impact_name
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
      <h3 className="text-lg font-medium text-gray-900 mb-4">Nivel de Impacto</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
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