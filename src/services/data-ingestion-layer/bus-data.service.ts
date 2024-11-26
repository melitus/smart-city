import createError from "http-errors";
import { busLocationDataPublisherEvent } from "../../message-broker/kafka/producers";
import { BusLocationSchema } from "../../models";
import { handlePublisherError, logError, sendAlert } from "../../utils/monitoring";
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
   
    handlePublisherError(error, "bus data ingestion");

  }
};
