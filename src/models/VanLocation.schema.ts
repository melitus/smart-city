export interface VanLocationSchema {
    van_id: string;
    lat: number;
    lon: number;
    timestamp: string;
  }
  
  export interface VanRequest {
    vehicleId: string;
    location: string;
    passengers: number;
    reason: string;
    timestamp: string;
  }