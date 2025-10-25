

import React from 'react';
import { useCatalogOptions } from '../../contexts/CatalogContext';
import { CatalogFilterProps } from '../../types/catalog.types';

export function CatalogFilter({
  type,
  value,
  onChange,
  placeholder = 'Seleccionar...',
  className = ''
}: CatalogFilterProps) {
  const { getAttackTypeOptions, getImpactOptions, getStatusOptions, loading } = useCatalogOptions();

  const getOptions = () => {
    switch (type) {
      case 'attackTypes':
        return getAttackTypeOptions();
      case 'impacts':
        return getImpactOptions();
      case 'statuses':
        return getStatusOptions();
      default:
        return [];
    }
  };

  const getFilterLabel = () => {
    switch (type) {
      case 'attackTypes':
        return 'Tipo de Ataque';
      case 'impacts':
        return 'Impacto';
      case 'statuses':
        return 'Estado';
      default:
        return 'Filtro';
    }
  };

  const options = getOptions();

  if (loading) {
    return (
      <div className={`filter-container ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {getFilterLabel()}
        </label>
        <select
          disabled
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
        >
          <option>Cargando...</option>
        </select>
      </div>
    );
  }

  return (
    <div className={`filter-container ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {getFilterLabel()}
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-safetrade-orange focus:border-safetrade-orange focus:outline-none sm:text-sm"
      >
        <option value="">{placeholder}</option>
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.displayName || option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function CatalogSelect({
  type,
  value,
  onChange,
  placeholder = 'Todos',
  className = ''
}: CatalogFilterProps) {
  const { getAttackTypeOptions, getImpactOptions, getStatusOptions, loading } = useCatalogOptions();

  const getOptions = () => {
    switch (type) {
      case 'attackTypes':
        return getAttackTypeOptions();
      case 'impacts':
        return getImpactOptions();
      case 'statuses':
        return getStatusOptions();
      default:
        return [];
    }
  };

  const options = getOptions();

  if (loading) {
    return (
      <select
        disabled
        className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none ${className}`}
      >
        <option>Cargando...</option>
      </select>
    );
  }

  return (
    <select
      value={value || ''}
      onChange={(e) => onChange(e.target.value ? Number(e.target.value) : null)}
      className={`px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-safetrade-orange focus:border-safetrade-orange focus:outline-none sm:text-sm ${className}`}
    >
      <option value="">{placeholder}</option>
      {options.map(option => (
        <option key={option.value} value={option.value}>
          {option.displayName || option.label}
        </option>
      ))}
    </select>
  );
}

interface CatalogMultiSelectProps extends Omit<CatalogFilterProps, 'value' | 'onChange'> {
  value: number[];
  onChange: (value: number[]) => void;
}

export function CatalogMultiSelect({
  type,
  value,
  onChange,
  placeholder = 'Seleccionar múltiples...',
  className = ''
}: CatalogMultiSelectProps) {
  const { getAttackTypeOptions, getImpactOptions, getStatusOptions, loading } = useCatalogOptions();

  const getOptions = () => {
    switch (type) {
      case 'attackTypes':
        return getAttackTypeOptions();
      case 'impacts':
        return getImpactOptions();
      case 'statuses':
        return getStatusOptions();
      default:
        return [];
    }
  };

  const getFilterLabel = () => {
    switch (type) {
      case 'attackTypes':
        return 'Tipos de Ataque';
      case 'impacts':
        return 'Impactos';
      case 'statuses':
        return 'Estados';
      default:
        return 'Filtros';
    }
  };

  const options = getOptions();

  const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selectedOptions = Array.from(e.target.selectedOptions, option => Number(option.value));
    onChange(selectedOptions);
  };

  if (loading) {
    return (
      <div className={`filter-container ${className}`}>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          {getFilterLabel()}
        </label>
        <select
          disabled
          multiple
          className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-100 text-gray-500 cursor-not-allowed focus:outline-none"
        >
          <option>Cargando...</option>
        </select>
      </div>
    );
  }

  return (
    <div className={`filter-container ${className}`}>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {getFilterLabel()}
      </label>
      <select
        multiple
        value={value.map(String)}
        onChange={handleChange}
        className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-white focus:ring-safetrade-orange focus:border-safetrade-orange focus:outline-none sm:text-sm"
        size={Math.min(options.length, 4)}
      >
        {options.map(option => (
          <option key={option.value} value={option.value}>
            {option.displayName || option.label}
          </option>
        ))}
      </select>
      <p className="mt-1 text-xs text-gray-500">
        Mantén Ctrl/Cmd presionado para seleccionar múltiples opciones
      </p>
    </div>
  );
}

export default CatalogFilter;