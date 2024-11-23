export interface VanLocationSchema {
    van_id: string;
    lat: number;
    lon: number;
    timestamp: string;
  }
  
  export interface VanRequest {
    location: string;
    passengers: number;
    reason: string;
    timestamp: string;
  }