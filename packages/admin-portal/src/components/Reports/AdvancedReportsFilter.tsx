'use client';

import { useState, useEffect } from 'react';
import { SearchFilters } from '../../types';
import { es } from '../../locales/es';

interface FilterCriteria {
  field: string;
  operator: 'equals' | 'contains' | 'between' | 'in' | 'not_equals';
  value: string | string[] | { from: string; to: string };
  logic?: 'AND' | 'OR';
}

interface AdvancedReportsFilterProps {
  onFilterChange: (filters: SearchFilters, criteria: FilterCriteria[]) => void;
  initialFilters?: SearchFilters;
}

export default function AdvancedReportsFilter({
  onFilterChange,
  initialFilters = {}
}: AdvancedReportsFilterProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [filterCriteria, setFilterCriteria] = useState<FilterCriteria[]>([]);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [activePreset, setActivePreset] = useState<string>('');

  // Filter presets for common workflows
  const presets = {
    critical_today: {
      name: 'Críticos de Hoy',
      filters: {
        impactLevel: 'robo_dinero,cuenta_comprometida',
        dateFrom: new Date().toISOString().split('T')[0],
        status: 'nuevo,revisado'
      }
    },
    pending_review: {
      name: 'Pendientes de Revisión',
      filters: {
        status: 'nuevo',
        dateFrom: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    },
    high_impact_anonymous: {
      name: 'Anónimos Alto Impacto',
      filters: {
        isAnonymous: true,
        impactLevel: 'robo_dinero,cuenta_comprometida'
      }
    },
    investigation_needed: {
      name: 'Requieren Investigación',
      filters: {
        status: 'revisado',
        impactLevel: 'robo_datos,robo_dinero,cuenta_comprometida'
      }
    },
    recent_phishing: {
      name: 'Phishing Reciente',
      filters: {
        attackType: 'email',
        dateFrom: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
      }
    }
  };

  const fieldOptions = [
    { value: 'status', label: 'Estado', type: 'select', options: ['nuevo', 'revisado', 'en_investigacion', 'cerrado'] },
    { value: 'attackType', label: 'Tipo de Ataque', type: 'select', options: ['email', 'sms', 'whatsapp', 'llamada', 'redes_sociales', 'otro'] },
    { value: 'impactLevel', label: 'Nivel de Impacto', type: 'select', options: ['ninguno', 'robo_datos', 'robo_dinero', 'cuenta_comprometida'] },
    { value: 'location', label: 'Ubicación', type: 'text' },
    { value: 'incidentDate', label: 'Fecha del Incidente', type: 'date' },
    { value: 'createdAt', label: 'Fecha de Creación', type: 'date' },
    { value: 'isAnonymous', label: 'Es Anónimo', type: 'boolean' }
  ];

  const operators = {
    text: [
      { value: 'contains', label: 'Contiene' },
      { value: 'equals', label: 'Igual a' },
      { value: 'not_equals', label: 'No igual a' }
    ],
    select: [
      { value: 'equals', label: 'Igual a' },
      { value: 'in', label: 'En' },
      { value: 'not_equals', label: 'No igual a' }
    ],
    date: [
      { value: 'equals', label: 'En fecha' },
      { value: 'between', label: 'Entre fechas' }
    ],
    boolean: [
      { value: 'equals', label: 'Es' }
    ]
  };

  useEffect(() => {
    applyFilters();
  }, [filters, filterCriteria]);

  const applyFilters = () => {
    onFilterChange(filters, filterCriteria);
  };

  const handleBasicFilterChange = (key: keyof SearchFilters, value: any) => {
    setFilters(prev => ({ ...prev, [key]: value }));
    setActivePreset('');
  };

  const handlePresetClick = (presetKey: string) => {
    const preset = presets[presetKey as keyof typeof presets];
    if (preset) {
      const newFilters: SearchFilters = {};

      // Convert preset filters to SearchFilters format
      Object.entries(preset.filters).forEach(([key, value]) => {
        if (key === 'isAnonymous') {
          newFilters[key] = value as boolean;
        } else if (value !== undefined) {
          (newFilters as any)[key] = value as string;
        }
      });

      setFilters(newFilters);
      setActivePreset(presetKey);
      setFilterCriteria([]);
    }
  };

  const addFilterCriteria = () => {
    const newCriteria: FilterCriteria = {
      field: 'status',
      operator: 'equals',
      value: '',
      logic: filterCriteria.length > 0 ? 'AND' : undefined
    };
    setFilterCriteria(prev => [...prev, newCriteria]);
  };

  const updateFilterCriteria = (index: number, updates: Partial<FilterCriteria>) => {
    setFilterCriteria(prev => prev.map((criteria, i) =>
      i === index ? { ...criteria, ...updates } : criteria
    ));
  };

  const removeFilterCriteria = (index: number) => {
    setFilterCriteria(prev => prev.filter((_, i) => i !== index));
  };

  const clearAllFilters = () => {
    setFilters({});
    setFilterCriteria([]);
    setActivePreset('');
  };

  const renderValueInput = (criteria: FilterCriteria, index: number) => {
    const field = fieldOptions.find(f => f.value === criteria.field);

    if (criteria.operator === 'between' && field?.type === 'date') {
      const dateRange = typeof criteria.value === 'object' && 'from' in criteria.value
        ? criteria.value
        : { from: '', to: '' };

      return (
        <div className="grid grid-cols-2 gap-2">
          <input
            type="date"
            value={dateRange.from}
            onChange={(e) => updateFilterCriteria(index, {
              value: { ...dateRange, from: e.target.value }
            })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
          <input
            type="date"
            value={dateRange.to}
            onChange={(e) => updateFilterCriteria(index, {
              value: { ...dateRange, to: e.target.value }
            })}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      );
    }

    if (criteria.operator === 'in' && field?.options) {
      const selectedValues = Array.isArray(criteria.value) ? criteria.value : [];

      return (
        <div className="space-y-2">
          {field.options.map(option => (
            <label key={option} className="flex items-center">
              <input
                type="checkbox"
                checked={selectedValues.includes(option)}
                onChange={(e) => {
                  const newValues = e.target.checked
                    ? [...selectedValues, option]
                    : selectedValues.filter(v => v !== option);
                  updateFilterCriteria(index, { value: newValues });
                }}
                className="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm">{option}</span>
            </label>
          ))}
        </div>
      );
    }

    if (field?.type === 'select' && field.options) {
      return (
        <select
          value={typeof criteria.value === 'string' ? criteria.value : ''}
          onChange={(e) => updateFilterCriteria(index, { value: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Seleccionar...</option>
          {field.options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      );
    }

    if (field?.type === 'boolean') {
      return (
        <select
          value={typeof criteria.value === 'string' ? criteria.value : ''}
          onChange={(e) => updateFilterCriteria(index, { value: e.target.value })}
          className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        >
          <option value="">Seleccionar...</option>
          <option value="true">Sí</option>
          <option value="false">No</option>
        </select>
      );
    }

    return (
      <input
        type={field?.type === 'date' ? 'date' : 'text'}
        value={typeof criteria.value === 'string' ? criteria.value : ''}
        onChange={(e) => updateFilterCriteria(index, { value: e.target.value })}
        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
        placeholder="Ingrese valor..."
      />
    );
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      {/* Filter Presets */}
      <div className="mb-4">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Filtros Predefinidos</h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(presets).map(([key, preset]) => (
            <button
              key={key}
              onClick={() => handlePresetClick(key)}
              className={`px-3 py-1 rounded-full text-sm font-medium ${
                activePreset === key
                  ? 'bg-blue-100 text-blue-800 border-blue-200'
                  : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-gray-200'
              } border`}
            >
              {preset.name}
            </button>
          ))}
        </div>
      </div>

      {/* Basic Filters */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 mb-4">
        {/* Status */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {es.reports.filterByStatus}
          </label>
          <select
            value={filters.status || ''}
            onChange={(e) => handleBasicFilterChange('status', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="nuevo">Nuevo</option>
            <option value="revisado">Revisado</option>
            <option value="en_investigacion">En Investigación</option>
            <option value="cerrado">Cerrado</option>
          </select>
        </div>

        {/* Attack Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            {es.reports.filterByAttackType}
          </label>
          <select
            value={filters.attackType || ''}
            onChange={(e) => handleBasicFilterChange('attackType', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="email">Email</option>
            <option value="sms">SMS</option>
            <option value="whatsapp">WhatsApp</option>
            <option value="llamada">Llamada</option>
            <option value="redes_sociales">Redes Sociales</option>
            <option value="otro">Otro</option>
          </select>
        </div>

        {/* Impact Level */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nivel de Impacto
          </label>
          <select
            value={filters.impactLevel || ''}
            onChange={(e) => handleBasicFilterChange('impactLevel', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los niveles</option>
            <option value="ninguno">Ninguno</option>
            <option value="robo_datos">Robo de Datos</option>
            <option value="robo_dinero">Robo de Dinero</option>
            <option value="cuenta_comprometida">Cuenta Comprometida</option>
          </select>
        </div>

        {/* Anonymous Filter */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Usuario
          </label>
          <select
            value={filters.isAnonymous === undefined ? '' : filters.isAnonymous.toString()}
            onChange={(e) => handleBasicFilterChange('isAnonymous',
              e.target.value === '' ? undefined : e.target.value === 'true'
            )}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="true">Solo Anónimos</option>
            <option value="false">Solo Identificados</option>
          </select>
        </div>
      </div>

      {/* Date Range */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Desde
          </label>
          <input
            type="date"
            value={filters.dateFrom || ''}
            onChange={(e) => handleBasicFilterChange('dateFrom', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Hasta
          </label>
          <input
            type="date"
            value={filters.dateTo || ''}
            onChange={(e) => handleBasicFilterChange('dateTo', e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {/* Advanced Filter Builder */}
      <div className="border-t border-gray-200 pt-4">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-medium text-gray-700">
            Constructor de Filtros Avanzados
          </h4>
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            {showAdvanced ? 'Ocultar' : 'Mostrar'} filtros avanzados
          </button>
        </div>

        {showAdvanced && (
          <div className="space-y-4">
            {filterCriteria.map((criteria, index) => (
              <div key={index} className="flex items-center space-x-2 p-3 bg-gray-50 rounded-md">
                {/* Logic Operator */}
                {index > 0 && (
                  <select
                    value={criteria.logic || 'AND'}
                    onChange={(e) => updateFilterCriteria(index, { logic: e.target.value as 'AND' | 'OR' })}
                    className="w-20 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                  >
                    <option value="AND">Y</option>
                    <option value="OR">O</option>
                  </select>
                )}

                {/* Field */}
                <select
                  value={criteria.field}
                  onChange={(e) => updateFilterCriteria(index, { field: e.target.value })}
                  className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {fieldOptions.map(field => (
                    <option key={field.value} value={field.value}>{field.label}</option>
                  ))}
                </select>

                {/* Operator */}
                <select
                  value={criteria.operator}
                  onChange={(e) => updateFilterCriteria(index, { operator: e.target.value as any })}
                  className="w-32 rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
                >
                  {operators[fieldOptions.find(f => f.value === criteria.field)?.type as keyof typeof operators]?.map(op => (
                    <option key={op.value} value={op.value}>{op.label}</option>
                  ))}
                </select>

                {/* Value */}
                <div className="flex-1">
                  {renderValueInput(criteria, index)}
                </div>

                {/* Remove Button */}
                <button
                  onClick={() => removeFilterCriteria(index)}
                  className="text-red-600 hover:text-red-800"
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}

            <div className="flex space-x-2">
              <button
                onClick={addFilterCriteria}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <svg className="mr-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Agregar Criterio
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="flex justify-between items-center pt-4 border-t border-gray-200">
        <button
          onClick={clearAllFilters}
          className="text-sm text-gray-600 hover:text-gray-800"
        >
          {es.common.clear} Todos los Filtros
        </button>

        <div className="text-sm text-gray-500">
          {Object.keys(filters).filter(key => filters[key as keyof SearchFilters]).length + filterCriteria.length} filtros activos
        </div>
      </div>
    </div>
  );
}