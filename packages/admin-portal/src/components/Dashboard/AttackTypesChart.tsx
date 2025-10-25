'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AttackTypeData } from '../../types';
import { useCatalogDisplayNames } from '../../contexts/CatalogContext';

interface AttackTypesChartProps {
  data: AttackTypeData[];
  isLoading?: boolean;
}

export default function AttackTypesChart({ data, isLoading }: AttackTypesChartProps) {
  const { getAttackTypeName, loading: catalogLoading } = useCatalogDisplayNames();

  
  const getDisplayName = (name: string): string => {
    const displayNames: Record<string, string> = {
      'email': 'Email',
      'SMS': 'SMS',
      'whatsapp': 'WhatsApp',
      'llamada': 'Llamada',
      'redes_sociales': 'Redes Sociales',
      'otro': 'Otro'
    };
    return displayNames[name] || name;
  };

  
  if (isLoading || catalogLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm shadow border border-safetrade-blue/30 p-6">
        <h3 className="text-lg font-medium text-safetrade-dark mb-4">Tipos de Ataque</h3>
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

    
    const normalizedItem = item as any;

    if (normalizedItem.attack_type_name && normalizedItem.attack_type_name !== 'Desconocido') {
      
      displayName = getDisplayName(normalizedItem.attack_type_name);
    } else if (normalizedItem.attack_type && typeof normalizedItem.attack_type === 'number') {
      
      displayName = getAttackTypeName(normalizedItem.attack_type);
    } else if (item.attack_type && typeof item.attack_type === 'string') {
      
      displayName = getDisplayName(item.attack_type);
    } else {
      
      displayName = 'Desconocido';
    }

    return {
      name: displayName,
      count: item.count,
      percentage: item.percentage,
      originalType: item.attack_type || item.attack_type_name
    };
  });

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ payload: { count: number; percentage: number } }>; label?: string }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border border-safetrade-blue/30 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-safetrade-dark/70">
            Reportes: <span className="font-medium text-safetrade-orange">{data.count}</span>
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
      <h3 className="text-lg font-medium text-gray-900 mb-4">Tipos de Ataque</h3>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#A1CDF4" opacity={0.3} />
            <XAxis
              dataKey="name"
              tick={{ fontSize: 12 }}
              angle={-45}
              textAnchor="end"
              height={80}
            />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip content={<CustomTooltip />} />
            <Bar
              dataKey="count"
              fill="#F5853F"
              className="hover:opacity-80"
            />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}