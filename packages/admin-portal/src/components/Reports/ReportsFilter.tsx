'use client';

import { es } from '../../locales/es';

interface ReportsFilterProps {
  filters: {
    status: string;
    attackType: string;
    isAnonymous: string;
    dateFrom: string;
    dateTo: string;
  };
  onFilterChange: (filters: {
    status: string;
    attackType: string;
    isAnonymous: string;
    dateFrom: string;
    dateTo: string;
  }) => void;
}

export default function ReportsFilter({ filters, onFilterChange }: ReportsFilterProps) {
  const handleStatusChange = (status: string) => {
    onFilterChange({ ...filters, status });
  };

  const handleAttackTypeChange = (attackType: string) => {
    onFilterChange({ ...filters, attackType });
  };

  const handleIsAnonymousChange = (isAnonymous: string) => {
    onFilterChange({ ...filters, isAnonymous });
  };

  const handleDateFromChange = (dateFrom: string) => {
    onFilterChange({ ...filters, dateFrom });
  };

  const handleDateToChange = (dateTo: string) => {
    onFilterChange({ ...filters, dateTo });
  };

  const clearFilters = () => {
    onFilterChange({
      status: '',
      attackType: '',
      isAnonymous: '',
      dateFrom: '',
      dateTo: ''
    });
  };

  return (
    <div className="bg-white p-4 rounded-lg shadow mb-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        {}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
            {es.reports.filterByStatus}
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) => handleStatusChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los estados</option>
            <option value="nuevo">{es.reports.status.nuevo}</option>
            <option value="revisado">{es.reports.status.revisado}</option>
            <option value="en_investigacion">{es.reports.status.en_investigacion}</option>
            <option value="cerrado">{es.reports.status.cerrado}</option>
          </select>
        </div>

        {}
        <div>
          <label htmlFor="attackType" className="block text-sm font-medium text-gray-700 mb-1">
            {es.reports.filterByAttackType}
          </label>
          <select
            id="attackType"
            value={filters.attackType}
            onChange={(e) => handleAttackTypeChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos los tipos</option>
            <option value="email">{es.reports.attackTypes.email}</option>
            <option value="SMS">{es.reports.attackTypes.SMS}</option>
            <option value="whatsapp">{es.reports.attackTypes.whatsapp}</option>
            <option value="llamada">{es.reports.attackTypes.llamada}</option>
            <option value="redes_sociales">{es.reports.attackTypes.redes_sociales}</option>
            <option value="otro">{es.reports.attackTypes.otro}</option>
          </select>
        </div>

        {}
        <div>
          <label htmlFor="isAnonymous" className="block text-sm font-medium text-gray-700 mb-1">
            Tipo de Usuario
          </label>
          <select
            id="isAnonymous"
            value={filters.isAnonymous}
            onChange={(e) => handleIsAnonymousChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="">Todos</option>
            <option value="true">Anónimo</option>
            <option value="false">Identificado</option>
          </select>
        </div>

        {}
        <div>
          <label htmlFor="dateFrom" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Desde
          </label>
          <input
            type="date"
            id="dateFrom"
            value={filters.dateFrom}
            onChange={(e) => handleDateFromChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        {}
        <div>
          <label htmlFor="dateTo" className="block text-sm font-medium text-gray-700 mb-1">
            Fecha Hasta
          </label>
          <input
            type="date"
            id="dateTo"
            value={filters.dateTo}
            onChange={(e) => handleDateToChange(e.target.value)}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>
      </div>

      {}
      <div className="mt-4 flex justify-end">
        <button
          onClick={clearFilters}
          className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          {es.common.clear}
        </button>
      </div>

      {}
      {(filters.status || filters.attackType || filters.isAnonymous || filters.dateFrom || filters.dateTo) && (
        <div className="mt-4 pt-4 border-t border-gray-200">
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-gray-500">Filtros activos:</span>
            {filters.status && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                Estado: {es.reports.status[filters.status as keyof typeof es.reports.status]}
              </span>
            )}
            {filters.attackType && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                Tipo: {es.reports.attackTypes[filters.attackType as keyof typeof es.reports.attackTypes]}
              </span>
            )}
            {filters.isAnonymous && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                Usuario: {filters.isAnonymous === 'true' ? 'Anónimo' : 'Identificado'}
              </span>
            )}
            {filters.dateFrom && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Desde: {filters.dateFrom}
              </span>
            )}
            {filters.dateTo && (
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                Hasta: {filters.dateTo}
              </span>
            )}
          </div>
        </div>
      )}
    </div>
  );
}