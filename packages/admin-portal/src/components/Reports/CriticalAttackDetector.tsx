'use client';

import { useState, useEffect } from 'react';
import { ReportSummary, SearchResult } from '../../types';
import { es } from '../../locales/es';

interface CriticalAttackPattern {
  id: string;
  name: string;
  description: string;
  weight: number;
  rules: {
    impactLevel?: string[];
    attackType?: string[];
    frequency?: number; // Reports per day
    location?: string[];
    keywords?: string[];
  };
}

interface CriticalAttackDetectorProps {
  reports: (ReportSummary | SearchResult)[];
  onCriticalDetected: (criticalReports: (ReportSummary | SearchResult)[], patterns: CriticalAttackPattern[]) => void;
}

export default function CriticalAttackDetector({ reports, onCriticalDetected }: CriticalAttackDetectorProps) {
  const [detectedPatterns, setDetectedPatterns] = useState<CriticalAttackPattern[]>([]);
  const [criticalReports, setCriticalReports] = useState<(ReportSummary | SearchResult)[]>([]);

  // Pattern definitions for critical attack detection
  const patterns: CriticalAttackPattern[] = [
    {
      id: 'high_financial_impact',
      name: 'Alto Impacto Financiero',
      description: 'Reportes con robo de dinero o cuentas comprometidas',
      weight: 10,
      rules: {
        impactLevel: ['robo_dinero', 'cuenta_comprometida']
      }
    },
    {
      id: 'phishing_campaign',
      name: 'Campaña de Phishing',
      description: 'Múltiples reportes de phishing en corto período',
      weight: 8,
      rules: {
        attackType: ['email'],
        frequency: 5 // 5 or more reports per day
      }
    },
    {
      id: 'coordinated_attack',
      name: 'Ataque Coordinado',
      description: 'Ataques simultáneos desde múltiples vectores',
      weight: 9,
      rules: {
        attackType: ['email', 'sms', 'whatsapp'],
        frequency: 3
      }
    },
    {
      id: 'geographic_cluster',
      name: 'Clúster Geográfico',
      description: 'Múltiples ataques en la misma región',
      weight: 7,
      rules: {
        frequency: 4,
        location: [] // Will be dynamically populated
      }
    },
    {
      id: 'advanced_persistent_threat',
      name: 'Amenaza Persistente Avanzada',
      description: 'Ataques sofisticados con palabras clave específicas',
      weight: 10,
      rules: {
        keywords: [
          'banco', 'tarjeta', 'contraseña', 'verificar', 'suspendida',
          'urgente', 'inmediato', 'actualizar', 'confirmar', 'seguridad'
        ],
        impactLevel: ['robo_datos', 'robo_dinero', 'cuenta_comprometida']
      }
    },
    {
      id: 'social_engineering',
      name: 'Ingeniería Social',
      description: 'Ataques que explotan confianza humana',
      weight: 8,
      rules: {
        attackType: ['llamada', 'redes_sociales'],
        keywords: ['familiar', 'emergencia', 'ayuda', 'urgente', 'dinero']
      }
    }
  ];

  useEffect(() => {
    analyzeReports();
  }, [reports]);

  const analyzeReports = () => {
    const today = new Date();
    const yesterday = new Date(today.getTime() - 24 * 60 * 60 * 1000);

    // Filter reports from last 24 hours
    const recentReports = reports.filter(report => {
      const reportDate = new Date(report.createdAt);
      return reportDate >= yesterday;
    });

    const detected: CriticalAttackPattern[] = [];
    const critical: (ReportSummary | SearchResult)[] = [];

    patterns.forEach(pattern => {
      const matchingReports = analyzePattern(pattern, recentReports);

      if (matchingReports.length > 0) {
        const isPatternDetected = validatePattern(pattern, matchingReports);

        if (isPatternDetected) {
          detected.push(pattern);
          critical.push(...matchingReports);
        }
      }
    });

    // Remove duplicates from critical reports
    const uniqueCritical = critical.filter((report, index, self) =>
      index === self.findIndex(r => r.id === report.id)
    );

    setDetectedPatterns(detected);
    setCriticalReports(uniqueCritical);

    if (detected.length > 0 || uniqueCritical.length > 0) {
      onCriticalDetected(uniqueCritical, detected);
    }
  };

  const analyzePattern = (pattern: CriticalAttackPattern, reportsToAnalyze: (ReportSummary | SearchResult)[]) => {
    return reportsToAnalyze.filter(report => {
      let matches = 0;
      let totalRules = 0;

      // Impact Level check
      if (pattern.rules.impactLevel) {
        totalRules++;
        if (pattern.rules.impactLevel.includes(report.impactLevel)) {
          matches++;
        }
      }

      // Attack Type check
      if (pattern.rules.attackType) {
        totalRules++;
        if (pattern.rules.attackType.includes(report.attackType)) {
          matches++;
        }
      }

      // Location check
      if (pattern.rules.location && pattern.rules.location.length > 0) {
        totalRules++;
        const reportLocation = report.location.toLowerCase();
        const hasLocationMatch = pattern.rules.location.some(loc =>
          reportLocation.includes(loc.toLowerCase())
        );
        if (hasLocationMatch) {
          matches++;
        }
      }

      // Keywords check (if description is available in SearchResult)
      if (pattern.rules.keywords && 'highlights' in report) {
        totalRules++;
        const searchResult = report as SearchResult;
        if (searchResult.highlights?.description) {
          const hasKeywordMatch = pattern.rules.keywords.some(keyword =>
            searchResult.highlights!.description!.some(desc =>
              desc.toLowerCase().includes(keyword.toLowerCase())
            )
          );
          if (hasKeywordMatch) {
            matches++;
          }
        }
      }

      // Return true if at least 50% of rules match
      return totalRules > 0 && (matches / totalRules) >= 0.5;
    });
  };

  const validatePattern = (pattern: CriticalAttackPattern, matchingReports: (ReportSummary | SearchResult)[]) => {
    // Frequency validation
    if (pattern.rules.frequency) {
      if (matchingReports.length < pattern.rules.frequency) {
        return false;
      }
    }

    // Geographic clustering validation
    if (pattern.id === 'geographic_cluster') {
      const locationGroups = groupReportsByLocation(matchingReports);
      return Object.values(locationGroups).some(group => group.length >= (pattern.rules.frequency || 4));
    }

    // Coordinated attack validation
    if (pattern.id === 'coordinated_attack') {
      const attackTypes = new Set(matchingReports.map(r => r.attackType));
      return attackTypes.size >= 2 && matchingReports.length >= (pattern.rules.frequency || 3);
    }

    return true;
  };

  const groupReportsByLocation = (reportsToGroup: (ReportSummary | SearchResult)[]) => {
    return reportsToGroup.reduce((groups, report) => {
      const location = report.location.toLowerCase().trim();
      if (!groups[location]) {
        groups[location] = [];
      }
      groups[location].push(report);
      return groups;
    }, {} as Record<string, (ReportSummary | SearchResult)[]>);
  };

  const getPriorityLevel = (weight: number) => {
    if (weight >= 9) return { level: 'CRÍTICO', color: 'bg-red-100 text-red-800 border-red-200' };
    if (weight >= 7) return { level: 'ALTO', color: 'bg-orange-100 text-orange-800 border-orange-200' };
    if (weight >= 5) return { level: 'MEDIO', color: 'bg-yellow-100 text-yellow-800 border-yellow-200' };
    return { level: 'BAJO', color: 'bg-gray-100 text-gray-800 border-gray-200' };
  };

  const formatTimestamp = (date: Date) => {
    return date.toLocaleString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (detectedPatterns.length === 0 && criticalReports.length === 0) {
    return null;
  }

  return (
    <div className="bg-white border-l-4 border-red-400 shadow-lg rounded-md">
      <div className="p-4">
        {/* Header */}
        <div className="flex items-center mb-4">
          <div className="flex-shrink-0">
            <svg className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.96-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-medium text-red-800">
              ⚠️ Ataques Críticos Detectados
            </h3>
            <p className="text-sm text-red-600">
              El sistema ha identificado patrones de actividad sospechosa que requieren atención inmediata.
            </p>
          </div>
        </div>

        {/* Detected Patterns */}
        {detectedPatterns.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">Patrones Detectados</h4>
            <div className="space-y-2">
              {detectedPatterns.map(pattern => {
                const priority = getPriorityLevel(pattern.weight);
                return (
                  <div key={pattern.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${priority.color}`}>
                          {priority.level}
                        </span>
                        <span className="text-sm font-medium text-gray-900">{pattern.name}</span>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">{pattern.description}</p>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium text-gray-900">
                        Peso: {pattern.weight}/10
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Critical Reports Summary */}
        {criticalReports.length > 0 && (
          <div className="mb-4">
            <h4 className="text-sm font-medium text-gray-900 mb-2">
              Reportes Críticos ({criticalReports.length})
            </h4>
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="font-medium text-red-800">Alto Impacto:</span>
                  <div className="text-red-600">
                    {criticalReports.filter(r => ['robo_dinero', 'cuenta_comprometida'].includes(r.impactLevel)).length} reportes
                  </div>
                </div>
                <div>
                  <span className="font-medium text-red-800">Tipos de Ataque:</span>
                  <div className="text-red-600">
                    {[...new Set(criticalReports.map(r => r.attackType))].join(', ')}
                  </div>
                </div>
                <div>
                  <span className="font-medium text-red-800">Últimas 24h:</span>
                  <div className="text-red-600">
                    {criticalReports.filter(r => {
                      const reportDate = new Date(r.createdAt);
                      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
                      return reportDate >= yesterday;
                    }).length} reportes nuevos
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Recommendations */}
        <div className="bg-blue-50 border border-blue-200 rounded-md p-3">
          <h4 className="text-sm font-medium text-blue-800 mb-2">Recomendaciones de Acción</h4>
          <ul className="text-sm text-blue-700 space-y-1">
            <li>• Revisar inmediatamente todos los reportes marcados como críticos</li>
            <li>• Contactar a usuarios afectados para verificar información adicional</li>
            <li>• Considerar alertas públicas si el patrón indica una campaña masiva</li>
            <li>• Documentar patrones para mejorar detección futura</li>
            {detectedPatterns.some(p => p.weight >= 9) && (
              <li className="font-medium">• ⚠️ Considerar escalación a autoridades competentes</li>
            )}
          </ul>
        </div>

        {/* Timestamp */}
        <div className="mt-3 text-xs text-gray-500 text-right">
          Última actualización: {formatTimestamp(new Date())}
        </div>
      </div>
    </div>
  );
}