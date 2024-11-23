export interface WeatherUpdateSchema {
    lat: number;
    lon: number;
    temp: number;  
    precipitation: WeatherType; 
    timestamp: string;  // ISO 8601 string format, e.g., "2024-11-18T10:00:00Z"
  }
  
  export enum WeatherType {
       SNOW = 'snow',
       RAIN = 'rain',
       CLEAR = 'clear'
  }