import createError from "http-errors";

import { busLocationDataPublisherEvent } from "../../message-broker/kafka/producers";
import { BusLocationSchema } from "../../models";

export const ingestBusData = async (busData: BusLocationSchema[]) => {
  try {
    if (busData) {
      await busLocationDataPublisherEvent(busData);
    } else {
      createError(400, "Invalid Bus Data:");
    }
  } catch (error) {
    createError(501, "Ingest bus data error");
  }
};
