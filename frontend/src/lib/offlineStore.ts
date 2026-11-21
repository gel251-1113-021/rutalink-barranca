// Servicio de Caché Local Offline (IndexedDB / LocalStorage) para Modo Fuera de Línea
// Permite a ciudadanos y estudiantes de Barranca consultar paraderos y rutas sin conexión de datos

import { StopPoint, VehicleUnit, RouteCorridor } from '../types';

const STORAGE_KEYS = {
  STOPS: 'rutalink_cache_stops',
  VEHICLES: 'rutalink_cache_vehicles',
  ROUTES: 'rutalink_cache_routes',
  LAST_SYNC: 'rutalink_cache_last_sync',
};

export const offlineStore = {
  saveStops(stops: StopPoint[]) {
    try {
      if (typeof window !== 'undefined' && stops?.length > 0) {
        localStorage.setItem(STORAGE_KEYS.STOPS, JSON.stringify(stops));
        localStorage.setItem(STORAGE_KEYS.LAST_SYNC, new Date().toISOString());
      }
    } catch (e) {
      console.warn('[OfflineStore SaveStops]:', e);
    }
  },

  getStops(): StopPoint[] {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.STOPS);
        if (data) return JSON.parse(data);
      }
    } catch (e) {
      console.warn('[OfflineStore GetStops]:', e);
    }
    return [];
  },

  saveVehicles(vehicles: VehicleUnit[]) {
    try {
      if (typeof window !== 'undefined' && vehicles?.length > 0) {
        localStorage.setItem(STORAGE_KEYS.VEHICLES, JSON.stringify(vehicles));
      }
    } catch (e) {
      console.warn('[OfflineStore SaveVehicles]:', e);
    }
  },

  getVehicles(): VehicleUnit[] {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.VEHICLES);
        if (data) return JSON.parse(data);
      }
    } catch (e) {
      console.warn('[OfflineStore GetVehicles]:', e);
    }
    return [];
  },

  saveRoutes(routes: RouteCorridor[]) {
    try {
      if (typeof window !== 'undefined' && routes?.length > 0) {
        localStorage.setItem(STORAGE_KEYS.ROUTES, JSON.stringify(routes));
      }
    } catch (e) {
      console.warn('[OfflineStore SaveRoutes]:', e);
    }
  },

  getRoutes(): RouteCorridor[] {
    try {
      if (typeof window !== 'undefined') {
        const data = localStorage.getItem(STORAGE_KEYS.ROUTES);
        if (data) return JSON.parse(data);
      }
    } catch (e) {
      console.warn('[OfflineStore GetRoutes]:', e);
    }
    return [];
  },

  getLastSync(): string | null {
    try {
      if (typeof window !== 'undefined') {
        return localStorage.getItem(STORAGE_KEYS.LAST_SYNC);
      }
    } catch (e) {}
    return null;
  }
};
