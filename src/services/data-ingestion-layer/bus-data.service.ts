import createError from "http-errors";
import { busLocationDataPublisherEvent } from "../../message-broker/kafka/producers";
import { BusLocationSchema } from "../../models";
import { logError, sendAlert } from "../../utils/monitoring";
import { validateDataArray } from "../../utils/validation";

/**
 * Publishes bus location data to a Kafka topic with error handling.
 * @param busData - Array of bus location schema objects.
 */
export const ingestBusData = async (busData: BusLocationSchema[]) => {
  try {
    // Validate input data
    validateDataArray(busData, "Bus data");

    console.log("Publishing bus data to Kafka:", busData);

    // Attempt to publish data to Kafka
    await busLocationDataPublisherEvent(busData);

    console.log("Successfully published bus data.");
  } catch (error: any) {
    // Log the error details
    logError(`Critical error in bus data ingestion: ${error.message}`, error);
    sendAlert(`Bus Data Error: ${error.message}`);

    // Categorize and handle specific errors
    if (error.name === "KafkaError") {
      const kafkaError = createError(502, "Failed to publish bus data to Kafka");
      logError(`Critical error in Kafka publishing: ${kafkaError.message}`, kafkaError);
      sendAlert(`Kafka Error: ${kafkaError.message}`);
      throw kafkaError;
    } else if (error.statusCode === 400) {
      console.error("Bad Request:", error.message);
      throw error; 
    } else {
      const serverError = createError(500, "Internal server error during bus data ingestion");
      logError(`Critical error in bus data ingestion: ${serverError.message}`, serverError);
      sendAlert(`Server Error: ${serverError.message}`);
      throw serverError;
    }
  }
};
