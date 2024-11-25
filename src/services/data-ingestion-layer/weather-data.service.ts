import createError from "http-errors";
import { weatherUpdatesPublisherEvent } from "../../message-broker/kafka/producers";
import { WeatherUpdateSchema } from "../../models";
import { logError, sendAlert } from "../../utils/monitoring";
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
    // Log the error details
    logError(`Critical error in weather data ingestion: ${error.message}`, error);
    sendAlert(`Weather Data Error: ${error.message}`);

    // Categorize and handle specific errors
    if (error.name === "KafkaError") {
      const kafkaError = createError(502, "Failed to publish weather data to Kafka");
      logError(`Critical error in Kafka publishing: ${kafkaError.message}`, kafkaError);
      sendAlert(`Kafka Error: ${kafkaError.message}`);
      throw kafkaError;
    } else if (error.statusCode === 400) {
      console.error("Bad Request:", error.message);
      throw error;
    } else {
      const serverError = createError(500, "Internal server error during weather data ingestion");
      logError(`Critical error in weather data ingestion: ${serverError.message}`, serverError);
      sendAlert(`Server Error: ${serverError.message}`);
      throw serverError;
    }
  }
};
