

import { useState, useEffect } from 'react';
import catalogService from '../services/CatalogService';
import { CatalogData, CatalogMaps, CatalogOption } from '../types/catalog.types';

export interface UseCatalogsResult {
  catalogs: CatalogData | null;
  maps: CatalogMaps | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
  getDisplayName: (type: 'attackTypes' | 'impacts' | 'statuses', id: number) => Promise<string>;
  getId: (type: 'attackTypes' | 'impacts' | 'statuses', name: string) => Promise<number | null>;
}

export const useCatalogs = (): UseCatalogsResult => {
  const [catalogs, setCatalogs] = useState<CatalogData | null>(null);
  const [maps, setMaps] = useState<CatalogMaps | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadCatalogs = async () => {
    try {
      setLoading(true);
      setError(null);

      const catalogData = await catalogService.getCatalogs();
      const catalogMaps = await catalogService.getCatalogMaps();

      setCatalogs(catalogData);
      setMaps(catalogMaps);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error loading catalogs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCatalogs();
  }, []);

  const refetch = async () => {
    await catalogService.refreshCatalogs();
    await loadCatalogs();
  };

  const getDisplayName = async (type: 'attackTypes' | 'impacts' | 'statuses', id: number): Promise<string> => {
    return catalogService.getDisplayName(type, id);
  };

  const getId = async (type: 'attackTypes' | 'impacts' | 'statuses', name: string): Promise<number | null> => {
    return catalogService.getId(type, name);
  };

  return {
    catalogs,
    maps,
    loading,
    error,
    refetch,
    getDisplayName,
    getId
  };
};

export const useCatalogOptions = () => {
  const { catalogs, loading, error } = useCatalogs();

  const getAttackTypeOptions = async (): Promise<CatalogOption[]> => {
    return catalogService.getAttackTypeOptions();
  };

  const getImpactOptions = async (): Promise<CatalogOption[]> => {
    return catalogService.getImpactOptions();
  };

  const getStatusOptions = async (): Promise<CatalogOption[]> => {
    return catalogService.getStatusOptions();
  };

  return {
    loading,
    error,
    getAttackTypeOptions,
    getImpactOptions,
    getStatusOptions
  };
};

export const useLegacyConversion = () => {
  const convertLegacyAttackType = async (legacyValue: string): Promise<number | null> => {
    return catalogService.convertLegacyAttackType(legacyValue);
  };

  const convertLegacyImpact = async (legacyValue: string): Promise<number | null> => {
    return catalogService.convertLegacyImpact(legacyValue);
  };

  const convertLegacyStatus = async (legacyValue: string): Promise<number | null> => {
    return catalogService.convertLegacyStatus(legacyValue);
  };

  return {
    convertLegacyAttackType,
    convertLegacyImpact,
    convertLegacyStatus
  };
};