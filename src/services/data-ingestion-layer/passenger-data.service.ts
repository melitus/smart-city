import createError from "http-errors";
import { passengerWaitingDataPublisherEvent } from "../../message-broker/kafka/producers";
import { PassengerWaitingDataSchema } from "../../models";
import { logError, sendAlert } from "../../utils/monitoring";
import { validateDataArray } from "../../utils/validation";

/**
 * Publishes passenger waiting data to a Kafka topic with error handling.
 * @param passengerData - Array of passenger waiting schema objects.
 */
export const ingestPassengerData = async (passengerData: PassengerWaitingDataSchema[]) => {
  try {
    // Validate input data
    validateDataArray(passengerData, "Passenger data");

    console.log("Publishing passenger data to Kafka:", passengerData);

    // Attempt to publish data to Kafka
    await passengerWaitingDataPublisherEvent(passengerData);

    console.log("Successfully published passenger data.");
  } catch (error: any) {
    // Log the error details
    logError(`Critical error in passenger data ingestion: ${error.message}`, error);
    sendAlert(`Passenger Data Error: ${error.message}`);

    // Categorize and handle specific errors
    if (error.name === "KafkaError") {
      const kafkaError = createError(502, "Failed to publish passenger data to Kafka");
      logError(`Critical error in Kafka publishing: ${kafkaError.message}`, kafkaError);
      sendAlert(`Kafka Error: ${kafkaError.message}`);
      throw kafkaError;
    } else if (error.statusCode === 400) {
      console.error("Bad Request:", error.message);
      throw error;
    } else {
      const serverError = createError(500, "Internal server error during data ingestion");
      logError(`Critical error in passenger data ingestion: ${serverError.message}`, serverError);
      sendAlert(`Server Error: ${serverError.message}`);
      throw serverError;
    }
  }
};
