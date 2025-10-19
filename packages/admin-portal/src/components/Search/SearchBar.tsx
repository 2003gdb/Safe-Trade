'use client';

import { useState, useRef, useEffect } from 'react';
import { SearchFilters, SearchHistory } from '../../types';
import { es } from '../../locales/es';
import { adminAPIService } from '../../services/AdminAPIService';

interface SearchBarProps {
  onSearch: (filters: SearchFilters) => void;
  onAdvancedSearch: () => void;
  initialQuery?: string;
}

export default function SearchBar({ onSearch, onAdvancedSearch, initialQuery = '' }: SearchBarProps) {
  const [query, setQuery] = useState(initialQuery);
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    loadSearchHistory();
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        !inputRef.current?.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const loadSearchHistory = async () => {
    try {
      const history = await adminAPIService.getSearchHistory();
      setSearchHistory(history.slice(0, 5));
    } catch (error) {
      console.error('Error loading search history:', error);
    }
  };

  const handleSearch = (searchQuery: string = query) => {
    if (!searchQuery.trim()) return;

    const filters: SearchFilters = { query: searchQuery.trim() };
    onSearch(filters);
    setShowSuggestions(false);

    // Save to history
    adminAPIService.saveSearchToHistory(searchQuery, filters, 0);
    loadSearchHistory();
  };

  const handleInputChange = (value: string) => {
    setQuery(value);
    setShowSuggestions(value.length > 0 && searchHistory.length > 0);
  };

  const handleInputFocus = () => {
    if (query.length > 0 || searchHistory.length > 0) {
      setShowSuggestions(true);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleSearch();
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(suggestion);
  };

  const getFilteredSuggestions = () => {
    if (!query.trim()) return searchHistory;

    return searchHistory.filter(history =>
      history.query.toLowerCase().includes(query.toLowerCase())
    );
  };

  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;

    const parts = text.split(new RegExp(`(${query})`, 'gi'));
    return parts.map((part, index) =>
      part.toLowerCase() === query.toLowerCase() ? (
        <span key={index} className="font-semibold text-blue-600">{part}</span>
      ) : part
    );
  };

  return (
    <div className="relative">
      <div className="flex items-center space-x-2">
        {/* Main Search Input */}
        <div className="relative flex-1">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            placeholder={es.reports.search.placeholder}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />

          {/* Search Suggestions Dropdown */}
          {showSuggestions && (
            <div
              ref={suggestionsRef}
              className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base ring-1 ring-black ring-opacity-5 overflow-auto focus:outline-none sm:text-sm"
            >
              {getFilteredSuggestions().length > 0 ? (
                <>
                  <div className="px-3 py-2 text-xs font-medium text-gray-500 uppercase tracking-wide">
                    {es.reports.search.searchHistory}
                  </div>
                  {getFilteredSuggestions().map((history) => (
                    <button
                      key={history.id}
                      onClick={() => handleSuggestionClick(history.query)}
                      className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center justify-between"
                    >
                      <div className="flex items-center space-x-2">
                        <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="truncate">
                          {highlightMatch(history.query, query)}
                        </span>
                      </div>
                      <span className="text-xs text-gray-400">
                        {history.resultCount} resultados
                      </span>
                    </button>
                  ))}
                </>
              ) : query.trim() && (
                <div className="px-3 py-2 text-sm text-gray-500">
                  Presiona Enter para buscar &quot;{query}&quot;
                </div>
              )}
            </div>
          )}
        </div>

        {/* Search Button */}
        <button
          onClick={() => handleSearch()}
          disabled={!query.trim()}
          className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-gray-400"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          {es.common.search}
        </button>

        {/* Advanced Search Button */}
        <button
          onClick={onAdvancedSearch}
          className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <svg className="h-4 w-4 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
          </svg>
          {es.reports.search.advancedSearch}
        </button>
      </div>

    </div>
  );
}