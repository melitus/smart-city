import createError from "http-errors";

import { vanLocationDataPublisherEvent } from "../../message-broker/kafka/producers";
import { VanLocationSchema } from "../../models";

export const ingestVanData = async (vanData: VanLocationSchema[]) => {
  try {
    if (vanData) {
      await vanLocationDataPublisherEvent(vanData);
    } else {
      createError(400, "Invalid Van Data:");
    }
  } catch (error) {
    createError(501, "Ingest van data error");
  }
};

