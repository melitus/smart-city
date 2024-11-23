import { BusLocationSchema, WeatherUpdateSchema, WeatherType } from "../../models";
import { InsightType } from "../../models/actionableInsight.model";
import { saveActionableInsight } from "../data-storage-layer";

// This function correlate Bus Locations with Weather Data to 
// identify delays caused by adverse weather (e.g., rain, snow).
export const processBusWeatherCorrelation = (
  busData: BusLocationSchema[],
  weatherData: WeatherUpdateSchema[]
): void => {
  busData.forEach((bus) => {
    const weatherAtBusLocation = weatherData.find(
      (weather) =>
        weather.lat === bus.lat &&
        weather.lon === bus.lon &&
        new Date(weather.timestamp).getTime() === new Date(bus.timestamp).getTime()
    );

    if (weatherAtBusLocation && (weatherAtBusLocation.precipitation === WeatherType.SNOW || weatherAtBusLocation.precipitation === WeatherType.RAIN)) {
      saveActionableInsight({
        vehicleId: `${bus.bus_id}-${bus.timestamp}`,
        type: InsightType.BUS_DELAY,
        detail: `Bus ${bus.bus_id} delayed due to ${weatherAtBusLocation.precipitation}`,
        location: `(${bus.lat}, ${bus.lon})`,
        timestamp: bus.timestamp,
      });
    }
  });
};
