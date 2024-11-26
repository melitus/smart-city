import createError from "http-errors";
import { vanLocationDataPublisherEvent } from "../../message-broker/kafka/producers";
import { VanLocationSchema } from "../../models";
import { handlePublisherError, logError, sendAlert } from "../../utils/monitoring";
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
    handlePublisherError(error, "van data ingestion");

  }
};
