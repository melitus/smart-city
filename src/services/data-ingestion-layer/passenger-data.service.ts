import createError from "http-errors";
import { passengerWaitingDataPublisherEvent } from "../../message-broker/kafka/producers";
import { PassengerWaitingDataSchema } from "../../models";

/**
 * Publishes passenger waiting data to a Kafka topic with error handling.
 * @param passengerData - Array of passenger waiting schema objects.
 */
export const ingestPassengerData = async (passengerData: PassengerWaitingDataSchema[]) => {
  try {
    // Validate input data
    if (!Array.isArray(passengerData) || passengerData.length === 0) {
      const validationError = createError(400, "Invalid or empty passenger data provided");
      console.error(validationError.message);
      throw validationError;
    }

    console.log("Publishing passenger data to Kafka:", passengerData);

    // Attempt to publish data to Kafka
    await passengerWaitingDataPublisherEvent(passengerData);

    console.log("Successfully published passenger data.");
  } catch (error: any) {
    // Log the error details
    console.error("Error during passenger data ingestion:", error.message, error.stack);

    // Categorize and handle specific errors
    if (error.name === "KafkaError") {
      const kafkaError = createError(502, "Failed to publish passenger data to Kafka");
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
