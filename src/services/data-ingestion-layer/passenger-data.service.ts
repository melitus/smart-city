
import createError from "http-errors";

import { PassengerWaitingDataSchema } from "../../models";
import { passengerWaitingDataPublisherEvent } from "../../message-broker/kafka/producers";

export const ingestPassengerData = async (passengerWaitingData: PassengerWaitingDataSchema[]) => {
  try {
    if (passengerWaitingData) {
      await passengerWaitingDataPublisherEvent(passengerWaitingData);
    } else {
      createError(400, "Invalid Passenger Data:");
    }
  } catch (error) {
    createError(501, "Ingest passenger data error");
  }
};

