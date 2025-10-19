'use client';

import { useState, useEffect } from 'react';
import { SearchFilters, SavedSearch, SearchHistory } from '../../types';
import { es } from '../../locales/es';
import { adminAPIService } from '../../services/AdminAPIService';

interface AdvancedSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (filters: SearchFilters) => void;
  initialFilters?: SearchFilters;
}

export default function AdvancedSearchModal({
  isOpen,
  onClose,
  onSearch,
  initialFilters = {}
}: AdvancedSearchModalProps) {
  const [filters, setFilters] = useState<SearchFilters>(initialFilters);
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [saveSearchName, setSaveSearchName] = useState('');

  useEffect(() => {
    if (isOpen) {
      loadSavedSearches();
      loadSearchHistory();
    }
  }, [isOpen]);

  const loadSavedSearches = async () => {
    try {
      const searches = await adminAPIService.getSavedSearches();
      setSavedSearches(searches);
    } catch (error) {
      console.error('Error loading saved searches:', error);
    }
  };

  const loadSearchHistory = async () => {
    try {
      const history = await adminAPIService.getSearchHistory();
      setSearchHistory(history.slice(0, 10)); // Show only last 10
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const handleFilterChange = (key: keyof SearchFilters, value: string | boolean | undefined) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handleSearch = () => {
    onSearch(filters);
    onClose();
  };

  const handleSaveSearch = async () => {
    if (!saveSearchName.trim()) return;

    try {
      await adminAPIService.saveSearch(saveSearchName, filters);
      setSaveSearchName('');
      setShowSaveDialog(false);
      loadSavedSearches();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  };

  const handleLoadSavedSearch = (savedSearch: SavedSearch) => {
    setFilters(savedSearch.filters);
  };

  const handleLoadFromHistory = (historyItem: SearchHistory) => {
    setFilters(historyItem.filters);
  };

  const clearFilters = () => {
    setFilters({});
  };

  const clearHistory = async () => {
    try {
      await adminAPIService.clearSearchHistory();
      setSearchHistory([]);
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-gray-600 bg-opacity-50 overflow-y-auto h-full w-full z-50">
      <div className="relative top-20 mx-auto p-5 border w-11/12 max-w-4xl shadow-lg rounded-md bg-white">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-gray-900">
            {es.reports.search.title}
          </h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
          >
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Search Form */}
          <div className="lg:col-span-2">
            <div className="space-y-4">
              {/* Query */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {es.reports.search.placeholder}
                </label>
                <input
                  type="text"
                  value={filters.query || ''}
                  onChange={(e) => handleFilterChange('query', e.target.value)}
                  placeholder={es.reports.search.placeholder}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              {/* Filters Row 1 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Status */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {es.reports.filterByStatus}
                  </label>
                  <select
                    value={filters.status || ''}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  >
                    <option value="">Todos los estados</option>
                    <option value="nuevo">{es.reports.status.nuevo}</option>
                    <option value="revisado">{es.reports.status.revisado}</option>
                    <option value="en_investigacion">{es.reports.status.en_investigacion}</option>
                    <option value="cerrado">{es.reports.status.cerrado}</option>
                  </select>
                </div>

                {/* Attack Type */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    {es.reports.filterByAttackType}
                  </label>
                  <select
                    value={filters.attackType || ''}
                    onChange={(e) => handleFilterChange('attackType', e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
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
              </div>

              {/* Impact Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  {es.reports.search.impactLevel}
                </label>
                <select
                  value={filters.impactLevel || ''}
                  onChange={(e) => handleFilterChange('impactLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Todos los niveles</option>
                  <option value="ninguno">Ninguno</option>
                  <option value="robo_datos">Robo de Datos</option>
                  <option value="robo_dinero">Robo de Dinero</option>
                  <option value="cuenta_comprometida">Cuenta Comprometida</option>
                </select>
              </div>

              {/* Date Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  {es.reports.search.dateRange}
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {es.reports.search.from}
                    </label>
                    <input
                      type="date"
                      value={filters.dateFrom || ''}
                      onChange={(e) => handleFilterChange('dateFrom', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-gray-500 mb-1">
                      {es.reports.search.to}
                    </label>
                    <input
                      type="date"
                      value={filters.dateTo || ''}
                      onChange={(e) => handleFilterChange('dateTo', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    />
                  </div>
                </div>
              </div>

              {/* Anonymous Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tipo de Usuario
                </label>
                <div className="space-y-2">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="anonymousFilter"
                      checked={filters.isAnonymous === undefined}
                      onChange={() => handleFilterChange('isAnonymous', undefined)}
                      className="mr-2"
                    />
                    Todos los usuarios
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="anonymousFilter"
                      checked={filters.isAnonymous === true}
                      onChange={() => handleFilterChange('isAnonymous', true)}
                      className="mr-2"
                    />
                    {es.reports.search.anonymousOnly}
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="anonymousFilter"
                      checked={filters.isAnonymous === false}
                      onChange={() => handleFilterChange('isAnonymous', false)}
                      className="mr-2"
                    />
                    {es.reports.search.identifiedOnly}
                  </label>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Saved Searches */}
            <div>
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                {es.reports.search.savedSearches}
              </h4>
              {savedSearches.length > 0 ? (
                <div className="space-y-2">
                  {savedSearches.slice(0, 5).map((search) => (
                    <button
                      key={search.id}
                      onClick={() => handleLoadSavedSearch(search)}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md"
                    >
                      {search.name}
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {es.reports.search.noSavedSearches}
                </p>
              )}
            </div>

            {/* Search History */}
            <div>
              <div className="flex justify-between items-center mb-3">
                <h4 className="text-sm font-medium text-gray-900">
                  {es.reports.search.searchHistory}
                </h4>
                {searchHistory.length > 0 && (
                  <button
                    onClick={clearHistory}
                    className="text-xs text-blue-600 hover:text-blue-800"
                  >
                    {es.reports.search.clearHistory}
                  </button>
                )}
              </div>
              {searchHistory.length > 0 ? (
                <div className="space-y-2">
                  {searchHistory.map((history) => (
                    <button
                      key={history.id}
                      onClick={() => handleLoadFromHistory(history)}
                      className="w-full text-left px-3 py-2 text-sm bg-gray-50 hover:bg-gray-100 rounded-md"
                    >
                      <div className="truncate">{history.query || 'Búsqueda sin texto'}</div>
                      <div className="text-xs text-gray-500">
                        {history.resultCount} resultados
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500">
                  {es.reports.search.noHistory}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-6 pt-4 border-t border-gray-200">
          <div className="flex space-x-3">
            <button
              onClick={clearFilters}
              className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
            >
              {es.common.clear}
            </button>
            <button
              onClick={() => setShowSaveDialog(true)}
              disabled={!filters.query && !filters.status && !filters.attackType}
              className="px-4 py-2 text-sm text-blue-600 hover:text-blue-800 disabled:text-gray-400"
            >
              {es.reports.search.saveSearch}
            </button>
          </div>
          <div className="flex space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              {es.common.cancel}
            </button>
            <button
              onClick={handleSearch}
              className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
            >
              {es.common.search}
            </button>
          </div>
        </div>

        {/* Save Search Dialog */}
        {showSaveDialog && (
          <div className="absolute inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center">
            <div className="bg-white p-6 rounded-lg shadow-lg max-w-md w-full mx-4">
              <h4 className="text-lg font-medium mb-4">
                {es.reports.search.saveSearch}
              </h4>
              <input
                type="text"
                value={saveSearchName}
                onChange={(e) => setSaveSearchName(e.target.value)}
                placeholder={es.reports.search.saveSearchName}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 mb-4"
              />
              <div className="flex justify-end space-x-3">
                <button
                  onClick={() => setShowSaveDialog(false)}
                  className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                >
                  {es.common.cancel}
                </button>
                <button
                  onClick={handleSaveSearch}
                  disabled={!saveSearchName.trim()}
                  className="px-4 py-2 bg-blue-600 text-white rounded-md text-sm font-medium hover:bg-blue-700 disabled:bg-gray-400"
                >
                  {es.common.save}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}