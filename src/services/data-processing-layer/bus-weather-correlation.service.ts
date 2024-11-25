import {
  BusLocationSchema,
  WeatherUpdateSchema,
  WeatherType,
} from "../../models";
import { InsightType } from "../../models/actionableInsight.model";
import { logError, sendAlert } from "../../utils/monitoring";
import { validateDataArray } from "../../utils/validation";
import { saveActionableInsight } from "../data-storage-layer";

// This function correlate Bus Locations with Weather Data to
// identify delays caused by adverse weather (e.g., rain, snow).
export const processBusWeatherCorrelation = (
  busData: BusLocationSchema[],
  weatherData: WeatherUpdateSchema[]
): void => {
  try {
    validateDataArray(busData, "Bus data");
    validateDataArray(weatherData, "Weather data");

    busData.forEach((bus) => {
      try {
        // Validate bus data
        if (!bus.bus_id || !bus.lat || !bus.lon || !bus.timestamp) {
          throw new Error(`Invalid bus data: ${JSON.stringify(bus)}`);
        }

        // Find matching weather data
        const weatherAtBusLocation = weatherData.find(
          (weather) =>
            weather.lat === bus.lat &&
            weather.lon === bus.lon &&
            new Date(weather.timestamp).getTime() ===
              new Date(bus.timestamp).getTime()
        );

        if (
          weatherAtBusLocation &&
          (weatherAtBusLocation.precipitation === WeatherType.SNOW ||
            weatherAtBusLocation.precipitation === WeatherType.RAIN)
        ) {
          saveActionableInsight({
            vehicleId: `${bus.bus_id}-${bus.timestamp}`,
            type: InsightType.BUS_DELAY,
            detail: `Bus ${bus.bus_id} delayed due to ${weatherAtBusLocation.precipitation}`,
            location: `(${bus.lat}, ${bus.lon})`,
            timestamp: bus.timestamp,
          });
        } else if (!weatherAtBusLocation) {
          console.log(
            `No weather data found for bus at (${bus.lat}, ${bus.lon}) at ${bus.timestamp}`
          );
        }
      } catch (busError) {
        logError(
          `Error processing bus ${bus.bus_id} at (${bus.lat}, ${bus.lon}): ${busError.message}`,
          busError
        );
      }
    });
  } catch (criticalError) {
    logError(
      `Critical error in bus-weather correlation process: ${criticalError.message}`,
      criticalError
    );
    sendAlert(`Bus-Weather Correlation Error: ${criticalError.message}`);
    throw new Error("Process aborted due to critical error.");
  }
};
