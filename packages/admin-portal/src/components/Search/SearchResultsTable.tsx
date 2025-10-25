'use client';

import { SearchResult, SearchFilters } from '../../types';
import { es } from '../../locales/es';

interface SearchResultsTableProps {
  results: SearchResult[];
  searchFilters: SearchFilters;
  isLoading: boolean;
  onViewReport: (id: number) => void;
}

export default function SearchResultsTable({
  results,
  searchFilters,
  isLoading,
  onViewReport
}: SearchResultsTableProps) {

  const highlightText = (text: string, query?: string) => {
    if (!query || !text) return text;

    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    const parts = text.split(regex);

    return parts.map((part, index) =>
      regex.test(part) ? (
        <span key={index} className="bg-yellow-200 font-semibold">
          {part}
        </span>
      ) : part
    );
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'nuevo':
        return 'bg-yellow-100 text-yellow-800';
      case 'revisado':
        return 'bg-blue-100 text-blue-800';
      case 'en_investigacion':
        return 'bg-purple-100 text-purple-800';
      case 'cerrado':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getImpactBadgeColor = (impactLevel: string) => {
    switch (impactLevel) {
      case 'ninguno':
        return 'bg-gray-100 text-gray-800';
      case 'robo_datos':
        return 'bg-orange-100 text-orange-800';
      case 'robo_dinero':
        return 'bg-red-100 text-red-800';
      case 'cuenta_comprometida':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (isLoading) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            <span className="ml-2 text-gray-600">{es.common.loading}</span>
          </div>
        </div>
      </div>
    );
  }

  if (results.length === 0) {
    return (
      <div className="bg-white shadow overflow-hidden sm:rounded-md">
        <div className="px-4 py-5 sm:p-6">
          <div className="text-center">
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
            <h3 className="mt-2 text-sm font-medium text-gray-900">
              {es.reports.noReports}
            </h3>
            <p className="mt-1 text-sm text-gray-500">
              Intenta ajustar tus criterios de búsqueda.
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white shadow overflow-hidden sm:rounded-md">
      <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
        <div className="flex items-center justify-between">
          <h3 className="text-lg leading-6 font-medium text-gray-900">
            {es.reports.search.searchResults}
          </h3>
          <span className="text-sm text-gray-500">
            {results.length} {es.reports.search.resultsCount}
          </span>
        </div>
      </div>

      <ul className="divide-y divide-gray-200">
        {results.map((result) => (
          <li key={result.id} className="px-4 py-4 hover:bg-gray-50">
            <div className="flex items-start space-x-4">

              {}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <span className="text-sm font-medium text-gray-900">
                      ID: {result.id}
                    </span>
                    {result.score && (
                      <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                        Score: {result.score.toFixed(2)}
                      </span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(result.status)}`}>
                      {es.reports.status[result.status as keyof typeof es.reports.status] || result.status}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getImpactBadgeColor(result.impact_level)}`}>
                      {es.reports.impactLevels[result.impact_level as keyof typeof es.reports.impactLevels] || result.impact_level}
                    </span>
                  </div>
                </div>

                <div className="mt-2">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm text-gray-600">
                    <div>
                      <span className="font-medium">Tipo de Ataque:</span>{' '}
                      <span>
                        {highlightText(
                          es.reports.attackTypes[result.attack_type as keyof typeof es.reports.attackTypes] || result.attack_type,
                          searchFilters.query
                        )}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Fecha:</span>{' '}
                      {formatDate(result.incident_date)}
                    </div>
                    <div>
                      <span className="font-medium">Ubicación:</span>{' '}
                      <span>
                        {highlightText(result.attack_origin, searchFilters.query)}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Usuario:</span>{' '}
                      {result.is_anonymous ? (
                        <span className="text-gray-500">Anónimo</span>
                      ) : (
                        <span>ID: {result.user_id}</span>
                      )}
                    </div>
                  </div>

                  {}
                  {result.highlights && (
                    <div className="mt-2 p-2 bg-yellow-50 rounded-md">
                      <div className="text-xs font-medium text-gray-700 mb-1">
                        {es.reports.search.highlighting}:
                      </div>
                      {result.highlights.description && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Descripción:</span>{' '}
                          {result.highlights.description.map((highlight, index) => (
                            <span key={index} dangerouslySetInnerHTML={{ __html: highlight }} />
                          ))}
                        </div>
                      )}
                      {result.highlights.location && (
                        <div className="text-sm text-gray-600 mb-1">
                          <span className="font-medium">Ubicación:</span>{' '}
                          {result.highlights.location.map((highlight, index) => (
                            <span key={index} dangerouslySetInnerHTML={{ __html: highlight }} />
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="mt-3 flex items-center justify-between">
                  <div className="text-xs text-gray-500">
                    Creado: {formatDate(result.created_at)}
                  </div>
                  <button
                    onClick={() => onViewReport(result.id)}
                    className="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-4 font-medium rounded-md text-blue-700 bg-blue-100 hover:bg-blue-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg className="mr-1 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                    {es.reports.actions.view}
                  </button>
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}