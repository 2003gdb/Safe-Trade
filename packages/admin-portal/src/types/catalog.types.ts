

import { AttackType, Impact, Status } from './normalized.types';

export interface CatalogData {
  attackTypes: AttackType[];
  impacts: Impact[];
  statuses: Status[];
}

export interface CatalogMaps {
  attackTypeMap: Map<number, string>;
  impactMap: Map<number, string>;
  statusMap: Map<number, string>;
  
  attackTypeNameMap: Map<string, number>;
  impactNameMap: Map<string, number>;
  statusNameMap: Map<string, number>;
}

export interface CatalogOption {
  value: number;
  label: string;
  displayName?: string;
}

export interface CatalogFilterProps {
  type: 'attackTypes' | 'impacts' | 'statuses';
  value: number | null;
  onChange: (value: number | null) => void;
  placeholder?: string;
  className?: string;
}

export interface CatalogContextType {
  catalogs: CatalogData | null;
  loading: boolean;
  error: string | null;
  maps: CatalogMaps | null;
  refreshCatalogs: () => Promise<void>;
}

export interface CatalogServiceConfig {
  baseURL: string;
  cacheTimeout?: number; 
  retryAttempts?: number;
  retryDelay?: number; 
}

export type CatalogType = 'attackTypes' | 'impacts' | 'statuses';

export interface CatalogItemBase {
  id: number;
  name: string;
  created_at: string;
}

export interface FilterConversion {
  legacyValue: string;
  normalizedId: number;
  catalogType: CatalogType;
}

export interface CatalogAPIResponse {
  attackTypes: AttackType[];
  impacts: Impact[];
  statuses: Status[];
}

export interface CatalogError {
  type: 'network' | 'parsing' | 'validation' | 'unknown';
  message: string;
  originalError?: Error;
}