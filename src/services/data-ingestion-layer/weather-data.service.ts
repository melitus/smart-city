import createError from "http-errors";
import { weatherUpdatesPublisherEvent } from "../../message-broker/kafka/producers";
import { WeatherUpdateSchema } from "../../models";

/**
 * Publishes weather data to a Kafka topic with error handling.
 * @param weatherData - Array of weather update schema objects.
 */
export const ingestWeatherData = async (weatherData: WeatherUpdateSchema[]) => {
  try {
    // Validate input data
    if (!Array.isArray(weatherData) || weatherData.length === 0) {
      const validationError = createError(400, "Invalid or empty weather data provided");
      console.error(validationError.message);
      throw validationError;
    }

    console.log("Publishing weather data to Kafka:", weatherData);

    // Attempt to publish data to Kafka
    await weatherUpdatesPublisherEvent(weatherData);

    console.log("Successfully published weather data.");
  } catch (error: any) {
    // Log the error details
    console.error("Error during weather data ingestion:", error.message, error.stack);

    // Categorize and handle specific errors
    if (error.name === "KafkaError") {
      const kafkaError = createError(502, "Failed to publish weather data to Kafka");
      console.error(kafkaError.message);
      throw kafkaError;
    } else if (error.statusCode === 400) {
      console.error("Bad Request:", error.message);
      throw error; // Re-throw client-side errors
    } else {
      const serverError = createError(500, "Internal server error during weather data ingestion");
      console.error(serverError.message);
      throw serverError;
    }
  }
};
