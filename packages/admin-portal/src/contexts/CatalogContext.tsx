/**
 * Catalog Context Provider
 *
 * Provides global state management for catalog data across the admin portal.
 * Ensures catalogs are loaded once and shared between components.
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import catalogService from '../services/CatalogService';
import { CatalogData, CatalogMaps, CatalogContextType } from '../types/catalog.types';

const CatalogContext = createContext<CatalogContextType | undefined>(undefined);

interface CatalogProviderProps {
  children: React.ReactNode;
}

export function CatalogProvider({ children }: CatalogProviderProps) {
  const [catalogs, setCatalogs] = useState<CatalogData | null>(null);
  const [maps, setMaps] = useState<CatalogMaps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      setError(null);

      console.log('🔄 Loading catalog data...');

      const catalogData = await catalogService.getCatalogs();
      const catalogMaps = await catalogService.getCatalogMaps();

      setCatalogs(catalogData);
      setMaps(catalogMaps);

      console.log('✅ Catalog data loaded successfully:', {
        attackTypes: catalogData.attackTypes.length,
        impacts: catalogData.impacts.length,
        statuses: catalogData.statuses.length
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading catalogs';
      setError(errorMessage);
      console.error('❌ Error loading catalog data:', err);
    } finally {
      setLoading(false);
    }
  };

  const refreshCatalogs = async () => {
    console.log('🔄 Refreshing catalog data...');
    await catalogService.refreshCatalogs();
    await loadCatalogs();
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const contextValue: CatalogContextType = {
    catalogs,
    loading,
    error,
    maps,
    refreshCatalogs
  };

  return (
    <CatalogContext.Provider value={contextValue}>
      {children}
    </CatalogContext.Provider>
  );
}

/**
 * Hook to use the catalog context
 */
export function useCatalogContext(): CatalogContextType {
  const context = useContext(CatalogContext);

  if (context === undefined) {
    throw new Error('useCatalogContext must be used within a CatalogProvider');
  }

  return context;
}

/**
 * Hook to get catalog display names by ID
 */
export function useCatalogDisplayNames() {
  const { maps, loading } = useCatalogContext();

  const getAttackTypeName = (id: number): string => {
    if (!maps) return 'Cargando...';
    return maps.attackTypeMap.get(id) || 'Desconocido';
  };

  const getImpactName = (id: number): string => {
    if (!maps) return 'Cargando...';
    return maps.impactMap.get(id) || 'Desconocido';
  };

  const getStatusName = (id: number): string => {
    if (!maps) return 'Cargando...';
    return maps.statusMap.get(id) || 'Desconocido';
  };

  return {
    getAttackTypeName,
    getImpactName,
    getStatusName,
    loading
  };
}

/**
 * Hook to get catalog IDs by name
 */
export function useCatalogIds() {
  const { maps, loading } = useCatalogContext();

  const getAttackTypeId = (name: string): number | null => {
    if (!maps) return null;
    return maps.attackTypeNameMap.get(name) || null;
  };

  const getImpactId = (name: string): number | null => {
    if (!maps) return null;
    return maps.impactNameMap.get(name) || null;
  };

  const getStatusId = (name: string): number | null => {
    if (!maps) return null;
    return maps.statusNameMap.get(name) || null;
  };

  return {
    getAttackTypeId,
    getImpactId,
    getStatusId,
    loading
  };
}

/**
 * Hook to get catalog options for dropdowns
 */
export function useCatalogOptions() {
  const { catalogs, loading } = useCatalogContext();

  const getAttackTypeOptions = () => {
    if (!catalogs) return [];
    return catalogs.attackTypes.map(at => ({
      value: at.id,
      label: at.name,
      displayName: getAttackTypeDisplayName(at.name)
    }));
  };

  const getImpactOptions = () => {
    if (!catalogs) return [];
    return catalogs.impacts.map(i => ({
      value: i.id,
      label: i.name,
      displayName: getImpactDisplayName(i.name)
    }));
  };

  const getStatusOptions = () => {
    if (!catalogs) return [];
    return catalogs.statuses.map(s => ({
      value: s.id,
      label: s.name,
      displayName: getStatusDisplayName(s.name)
    }));
  };

  // Helper functions for display names
  const getAttackTypeDisplayName = (name: string): string => {
    const displayNames: Record<string, string> = {
      'email': 'Email',
      'SMS': 'SMS',
      'whatsapp': 'WhatsApp',
      'llamada': 'Llamada telefónica',
      'redes_sociales': 'Redes sociales',
      'otro': 'Otro'
    };
    return displayNames[name] || name;
  };

  const getImpactDisplayName = (name: string): string => {
    const displayNames: Record<string, string> = {
      'ninguno': 'Sin impacto',
      'robo_datos': 'Robo de datos',
      'robo_dinero': 'Robo de dinero',
      'cuenta_comprometida': 'Cuenta comprometida'
    };
    return displayNames[name] || name;
  };

  const getStatusDisplayName = (name: string): string => {
    const displayNames: Record<string, string> = {
      'nuevo': 'Nuevo',
      'revisado': 'Revisado',
      'en_investigacion': 'En investigación',
      'cerrado': 'Cerrado'
    };
    return displayNames[name] || name;
  };

  return {
    getAttackTypeOptions,
    getImpactOptions,
    getStatusOptions,
    loading
  };
}