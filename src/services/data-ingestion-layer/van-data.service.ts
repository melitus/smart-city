import createError from "http-errors";
import { vanLocationDataPublisherEvent } from "../../message-broker/kafka/producers";
import { VanLocationSchema } from "../../models";

/**
 * Publishes van location data to a Kafka topic with error handling.
 * @param vanData - Array of van location schema objects.
 */
export const ingestVanData = async (vanData: VanLocationSchema[]) => {
  try {
    // Validate input data
    if (!Array.isArray(vanData) || vanData.length === 0) {
      const validationError = createError(400, "Invalid or empty van data provided");
      console.error(validationError.message);
      throw validationError;
    }

    console.log("Publishing van data to Kafka:", vanData);

    // Attempt to publish data to Kafka
    await vanLocationDataPublisherEvent(vanData);

    console.log("Successfully published van data.");
  } catch (error: any) {
    // Log the error details
    console.error("Error during van data ingestion:", error.message, error.stack);

    // Categorize and handle specific errors
    if (error.name === "KafkaError") {
      const kafkaError = createError(502, "Failed to publish van data to Kafka");
      console.error(kafkaError.message);
      throw kafkaError;
    } else if (error.statusCode === 400) {
      console.error("Bad Request:", error.message);
      throw error; // Re-throw client-side errors
    } else {
      const serverError = createError(500, "Internal server error during van data ingestion");
      console.error(serverError.message);
      throw serverError;
    }
  }
};
