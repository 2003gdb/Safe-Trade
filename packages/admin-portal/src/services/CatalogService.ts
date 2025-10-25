

import {
  CatalogData,
  CatalogMaps,
  CatalogOption,
  CatalogServiceConfig,
  CatalogAPIResponse,
  CatalogError,
  CatalogType
} from '../types/catalog.types';
import { AttackType, Impact, Status } from '../types/normalized.types';

export class CatalogService {
  private catalogCache: CatalogData | null = null;
  private catalogMaps: CatalogMaps | null = null;
  private lastCacheTime: number = 0;
  private config: CatalogServiceConfig;

  constructor(config: CatalogServiceConfig) {
    this.config = {
      cacheTimeout: 5 * 60 * 1000, 
      retryAttempts: 3,
      retryDelay: 1000,
      ...config
    };
  }

  

  async getCatalogs(): Promise<CatalogData> {
    const now = Date.now();

    
    if (this.catalogCache && this.isCacheValid(now)) {
      return this.catalogCache;
    }

    
    const catalogs = await this.loadCatalogsFromAPI();
    this.catalogCache = catalogs;
    this.catalogMaps = this.createCatalogMaps(catalogs);
    this.lastCacheTime = now;

    return catalogs;
  }

  

  async getCatalogMaps(): Promise<CatalogMaps> {
    if (!this.catalogMaps) {
      await this.getCatalogs(); 
    }
    return this.catalogMaps!;
  }

  

  private async loadCatalogsFromAPI(): Promise<CatalogData> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.config.retryAttempts!; attempt++) {
      try {
        const response = await fetch(`${this.config.baseURL}/reportes/catalogs`);

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        const rawData = await response.json();

        
        let catalogData: CatalogAPIResponse;

        if (rawData.success && rawData.data) {
          catalogData = rawData.data;
        } else if (rawData.attackTypes) {
          
          catalogData = rawData;
        } else {
          throw new Error('Invalid catalog response structure');
        }

        
        if (!this.isValidCatalogResponse(catalogData)) {
          throw new Error('Invalid catalog response structure');
        }

        return {
          attackTypes: catalogData.attackTypes,
          impacts: catalogData.impacts,
          statuses: catalogData.statuses
        };
      } catch (error) {
        lastError = error instanceof Error ? error : new Error('Unknown error');

        if (attempt < this.config.retryAttempts!) {
          await this.delay(this.config.retryDelay! * attempt);
        }
      }
    }

    throw this.createCatalogError('network', `Failed to load catalogs after ${this.config.retryAttempts} attempts`, lastError!);
  }

  

  private createCatalogMaps(catalogs: CatalogData): CatalogMaps {
    return {
      attackTypeMap: new Map(catalogs.attackTypes.map(at => [at.id, at.name])),
      impactMap: new Map(catalogs.impacts.map(i => [i.id, i.name])),
      statusMap: new Map(catalogs.statuses.map(s => [s.id, s.name])),
      attackTypeNameMap: new Map(catalogs.attackTypes.map(at => [at.name, at.id])),
      impactNameMap: new Map(catalogs.impacts.map(i => [i.name, i.id])),
      statusNameMap: new Map(catalogs.statuses.map(s => [s.name, s.id]))
    };
  }

  

  async getDisplayName(type: CatalogType, id: number): Promise<string> {
    const maps = await this.getCatalogMaps();

    switch (type) {
      case 'attackTypes':
        return maps.attackTypeMap.get(id) || 'Desconocido';
      case 'impacts':
        return maps.impactMap.get(id) || 'Desconocido';
      case 'statuses':
        return maps.statusMap.get(id) || 'Desconocido';
      default:
        return 'Desconocido';
    }
  }

  

  async getId(type: CatalogType, name: string): Promise<number | null> {
    const maps = await this.getCatalogMaps();

    switch (type) {
      case 'attackTypes':
        return maps.attackTypeNameMap.get(name) || null;
      case 'impacts':
        return maps.impactNameMap.get(name) || null;
      case 'statuses':
        return maps.statusNameMap.get(name) || null;
      default:
        return null;
    }
  }

  

  async getAttackTypeOptions(): Promise<CatalogOption[]> {
    const catalogs = await this.getCatalogs();
    return catalogs.attackTypes.map(at => ({
      value: at.id,
      label: at.name,
      displayName: this.getAttackTypeDisplayName(at.name)
    }));
  }

  async getImpactOptions(): Promise<CatalogOption[]> {
    const catalogs = await this.getCatalogs();
    return catalogs.impacts.map(i => ({
      value: i.id,
      label: i.name,
      displayName: this.getImpactDisplayName(i.name)
    }));
  }

  async getStatusOptions(): Promise<CatalogOption[]> {
    const catalogs = await this.getCatalogs();
    return catalogs.statuses.map(s => ({
      value: s.id,
      label: s.name,
      displayName: this.getStatusDisplayName(s.name)
    }));
  }

  

  async convertLegacyAttackType(legacyValue: string): Promise<number | null> {
    return this.getId('attackTypes', legacyValue);
  }

  async convertLegacyImpact(legacyValue: string): Promise<number | null> {
    return this.getId('impacts', legacyValue);
  }

  async convertLegacyStatus(legacyValue: string): Promise<number | null> {
    return this.getId('statuses', legacyValue);
  }

  

  async refreshCatalogs(): Promise<CatalogData> {
    this.catalogCache = null;
    this.catalogMaps = null;
    this.lastCacheTime = 0;
    return this.getCatalogs();
  }

  

  private getAttackTypeDisplayName(name: string): string {
    const displayNames: Record<string, string> = {
      'email': 'Email',
      'SMS': 'SMS',
      'whatsapp': 'WhatsApp',
      'llamada': 'Llamada telefónica',
      'redes_sociales': 'Redes sociales',
      'otro': 'Otro'
    };
    return displayNames[name] || name;
  }

  private getImpactDisplayName(name: string): string {
    const displayNames: Record<string, string> = {
      'ninguno': 'Sin impacto',
      'robo_datos': 'Robo de datos',
      'robo_dinero': 'Robo de dinero',
      'cuenta_comprometida': 'Cuenta comprometida'
    };
    return displayNames[name] || name;
  }

  private getStatusDisplayName(name: string): string {
    const displayNames: Record<string, string> = {
      'nuevo': 'Nuevo',
      'revisado': 'Revisado',
      'en_investigacion': 'En investigación',
      'cerrado': 'Cerrado'
    };
    return displayNames[name] || name;
  }

  

  private isCacheValid(now: number): boolean {
    return (now - this.lastCacheTime) < this.config.cacheTimeout!;
  }

  private isValidCatalogResponse(data: any): data is CatalogAPIResponse {
    return (
      data &&
      Array.isArray(data.attackTypes) &&
      Array.isArray(data.impacts) &&
      Array.isArray(data.statuses) &&
      data.attackTypes.every((at: any) => at.id && at.name) &&
      data.impacts.every((i: any) => i.id && i.name) &&
      data.statuses.every((s: any) => s.id && s.name)
    );
  }

  private createCatalogError(type: CatalogError['type'], message: string, originalError?: Error): CatalogError {
    return {
      type,
      message,
      originalError
    };
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}

const catalogService = new CatalogService({
  baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000'
});

export default catalogService;