'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { WeeklyTrend, MonthlyTrend } from '../../types';

interface TrendsAnalysisProps {
  weeklyData: WeeklyTrend[];
  monthlyData: MonthlyTrend[];
  isLoading?: boolean;
}

export default function TrendsAnalysis({ weeklyData, monthlyData, isLoading }: TrendsAnalysisProps) {
  if (isLoading) {
    return (
      <div className="bg-white/70 backdrop-blur-sm shadow border border-safetrade-blue/30 p-6">
        <h3 className="text-lg font-medium text-safetrade-dark mb-4">Tendencias Temporales</h3>
        <div className="h-64 flex items-center justify-center">
          <div className="animate-spin h-8 w-8 border-b-2 border-safetrade-orange"></div>
        </div>
      </div>
    );
  }

  
  const weeklyChartData = weeklyData.map(item => ({
    period: new Date(item.week_start).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
    reportes: item.count
  })).reverse(); 

  
  const monthlyChartData = monthlyData.map(item => ({
    period: new Date(item.month + '-01').toLocaleDateString('es-ES', { year: 'numeric', month: 'short' }),
    reportes: item.count
  })).reverse(); 

  const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: Array<{ value: number }>; label?: string }) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-safetrade-blue/30 shadow-lg">
          <p className="font-medium">{label}</p>
          <p className="text-sm text-safetrade-dark/70">
            Reportes: <span className="font-medium text-safetrade-orange">{payload[0].value}</span>
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="space-y-6">
      {}
      <div className="bg-white/70 backdrop-blur-sm shadow border border-safetrade-blue/30 p-6">
        <h3 className="text-lg font-medium text-safetrade-dark mb-4">Tendencia Semanal (Últimas 8 Semanas)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={weeklyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#A1CDF4" opacity={0.3} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12 }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="reportes"
                stroke="#F5853F"
                strokeWidth={2}
                dot={{ fill: '#F5853F', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#F5853F', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {}
      <div className="bg-white/70 backdrop-blur-sm shadow border border-safetrade-blue/30 p-6">
        <h3 className="text-lg font-medium text-safetrade-dark mb-4">Tendencia Mensual (Últimos 6 Meses)</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyChartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#A1CDF4" opacity={0.3} />
              <XAxis
                dataKey="period"
                tick={{ fontSize: 12 }}
              />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="reportes"
                stroke="#A1CDF4"
                strokeWidth={2}
                dot={{ fill: '#A1CDF4', strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: '#A1CDF4', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}