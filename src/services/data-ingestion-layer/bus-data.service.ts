import createError from "http-errors";
import { busLocationDataPublisherEvent } from "../../message-broker/kafka/producers";
import { BusLocationSchema } from "../../models";

/**
 * Publishes bus location data to a Kafka topic with error handling.
 * @param busData - Array of bus location schema objects.
 */
export const ingestBusData = async (busData: BusLocationSchema[]) => {
  try {
    // Validate input data
    if (!Array.isArray(busData) || busData.length === 0) {
      const validationError = createError(400, "Invalid or empty bus data provided");
      console.error(validationError.message);
      throw validationError;
    }

    console.log("Publishing bus data to Kafka:", busData);

    // Attempt to publish data to Kafka
    await busLocationDataPublisherEvent(busData);

    console.log("Successfully published bus data.");
  } catch (error: any) {
    // Log the error details
    console.error("Error during bus data ingestion:", error.message, error.stack);

    // Categorize and handle specific errors
    if (error.name === "KafkaError") {
      const kafkaError = createError(502, "Failed to publish bus data to Kafka");
      console.error(kafkaError.message);
      throw kafkaError;
    } else if (error.statusCode === 400) {
      console.error("Bad Request:", error.message);
      throw error; // Re-throw client-side errors
    } else {
      const serverError = createError(500, "Internal server error during data ingestion");
      console.error(serverError.message);
      throw serverError;
    }
  }
};
