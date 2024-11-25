import createError from "http-errors";
import { vanLocationDataPublisherEvent } from "../../message-broker/kafka/producers";
import { VanLocationSchema } from "../../models";
import { logError, sendAlert } from "../../utils/monitoring";
import { validateDataArray } from "../../utils/validation";

/**
 * Publishes van location data to a Kafka topic with error handling.
 * @param vanData - Array of van location schema objects.
 */
export const ingestVanData = async (vanData: VanLocationSchema[]) => {
  try {
    // Validate input data
    validateDataArray(vanData, "Van data");

    console.log("Publishing van data to Kafka:", vanData);

    // Attempt to publish data to Kafka
    await vanLocationDataPublisherEvent(vanData);

    console.log("Successfully published van data.");
  } catch (error: any) {
    // Log the error details
    logError(`Critical error in van data ingestion: ${error.message}`, error);
    sendAlert(`Van Data Error: ${error.message}`);

    // Categorize and handle specific errors
    if (error.name === "KafkaError") {
      const kafkaError = createError(502, "Failed to publish van data to Kafka");
      logError(`Critical error in Kafka publishing: ${kafkaError.message}`, kafkaError);
      sendAlert(`Kafka Error: ${kafkaError.message}`);
      throw kafkaError;
    } else if (error.statusCode === 400) {
      console.error("Bad Request:", error.message);
      throw error; 
    } else {
      const serverError = createError(500, "Internal server error during van data ingestion");
      logError(`Critical error in van data ingestion: ${serverError.message}`, serverError);
      sendAlert(`Server Error: ${serverError.message}`);
      throw serverError;
    }
  }
};
