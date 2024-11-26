import createError from "http-errors";
import { weatherUpdatesPublisherEvent } from "../../message-broker/kafka/producers";
import { WeatherUpdateSchema } from "../../models";
import { handlePublisherError, logError, sendAlert } from "../../utils/monitoring";
import { validateDataArray } from "../../utils/validation";

/**
 * Publishes weather data to a Kafka topic with error handling.
 * @param weatherData - Array of weather update schema objects.
 */
export const ingestWeatherData = async (weatherData: WeatherUpdateSchema[]) => {
  try {
    // Validate input data
    validateDataArray(weatherData, "weather data");

    console.log("Publishing weather data to Kafka:", weatherData);

    // Attempt to publish data to Kafka
    await weatherUpdatesPublisherEvent(weatherData);

    console.log("Successfully published weather data.");
  } catch (error: any) {
    handlePublisherError(error, "weather data ingestion");
  }
};
