export type UserRole = 
  | 'PASAJERO'
  | 'CONDUCTOR_AFILIADO'
  | 'CONDUCTOR_INDEPENDIENTE'
  | 'ADMIN_EMPRESA'
  | 'ADMIN_GRUPO_PASAJEROS'
  | 'ENCARGADO_PARADERO'
  | 'SUPERADMIN';

export type AccountStatus = 'ACTIVO' | 'EN_ESPERA' | 'SUSPENDIDO';

export type VehicleStatus = 'DISPONIBLE' | 'EN_RUTA' | 'LLENO' | 'FUERA_SERVICIO';

export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone?: string;
  avatar_url?: string;
  active_role: UserRole;
  account_status: AccountStatus;
  rating: number;
  total_trips: number;
  emergency_contact_name?: string;
  emergency_contact_phone?: string;
  created_at: string;
}

export interface StopPoint {
  id: string;
  name: string;
  type: 'BASE' | 'ZONA_TRANQUILA' | 'HABITUAL';
  latitude: number;
  longitude: number;
  address_reference: string;
  group_id?: string;
  group_name?: string;
  queued_vehicles_count: number;
  status_note?: string;
  photo_url?: string;
  last_status_update?: string;
}

export type VehicleType = 'SEDAN' | 'SUV' | 'STATION_WAGON' | 'MINIVAN' | 'COMBI' | 'MOTOTAXI';

export interface VehicleUnit {
  id: string;
  plate: string;
  brand_model: string;
  vehicle_type: VehicleType | string;
  seat_layout: any[];
  capacity: number;
  roof_rack: boolean;
  max_cargo_kg: number;
  cargo_status: string;
  status: VehicleStatus;
  latitude: number;
  longitude: number;
  current_heading?: number;
  driver_name: string;
  driver_phone?: string;
  driver_rating: number;
  group_name?: string;
  route_name?: string;
  last_location_update: string;
}

export interface TransportGroup {
  id: string;
  name: string;
  type: 'EMPRESARIAL' | 'COMUNITARIO';
  description: string;
  base_address: string;
  base_latitude: number;
  base_longitude: number;
  contact_phone: string;
  fare_range: string;
}

export interface RouteCorridor {
  id: string;
  name: string;
  origin_name: string;
  destination_name: string;
  distance_km: number;
  estimated_duration_min: number;
  geojson?: {
    type: string;
    coordinates: [number, number][]; // [lng, lat]
  };
  group_name?: string;
  is_active?: boolean;
}

