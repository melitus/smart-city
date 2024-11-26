import {
  BusLocationSchema,
  WeatherUpdateSchema,
  WeatherType,
} from "../../models";
import { InsightType } from "../../models/actionableInsight.model";
import { haversineDistance } from "../../utils/distance";
import { logError, sendAlert } from "../../utils/monitoring";
import { validateDataArray } from "../../utils/validation";
import { saveActionableInsight } from "../data-storage-layer";

// Tolerance constants
const LOCATION_TOLERANCE_KM = 0.5; // 500 meters
const TIME_TOLERANCE_MS = 60 * 1000; // 1 minute in milliseconds

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
        if (!bus.bus_id || !bus.lat || !bus.lon || !bus.timestamp) {
          throw new Error(`Invalid bus data: ${JSON.stringify(bus)}`);
        }

        // Find matching weather data within tolerance
        const weatherAtBusLocation = weatherData.find((weather) => {
          const distance = haversineDistance(
            bus.lat,
            bus.lon,
            weather.lat,
            weather.lon
          );
          const timeDifference = Math.abs(
            new Date(weather.timestamp).getTime() -
              new Date(bus.timestamp).getTime()
          );

          return distance <= LOCATION_TOLERANCE_KM && timeDifference <= TIME_TOLERANCE_MS;
        });

        if (weatherAtBusLocation) {
          if (
            weatherAtBusLocation.precipitation === WeatherType.SNOW ||
            weatherAtBusLocation.precipitation === WeatherType.RAIN
          ) {
            saveActionableInsight({
              vehicleId: `${bus.bus_id}`,
              type: InsightType.BUS_DELAY,
              detail: `Bus ${bus.bus_id} delayed due to ${weatherAtBusLocation.precipitation}`,
              location: `(${bus.lat}, ${bus.lon})`,
              timestamp: bus.timestamp,
            });
          } else {
            console.log(
              `Bus ${bus.bus_id} operating under normal weather: ${weatherAtBusLocation.precipitation}.`
            );
          }
        } else {
          console.log(
            `No weather data found for bus ${bus.bus_id} at (${bus.lat}, ${bus.lon}) at ${bus.timestamp}.`
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
