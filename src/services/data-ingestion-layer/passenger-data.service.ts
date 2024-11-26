import createError from "http-errors";
import { passengerWaitingDataPublisherEvent } from "../../message-broker/kafka/producers";
import { PassengerWaitingDataSchema } from "../../models";
import { handlePublisherError, logError, sendAlert } from "../../utils/monitoring";
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
    handlePublisherError(error, "passenger data ingestion");

  }
};
