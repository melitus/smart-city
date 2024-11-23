import { KafkaBroker } from '../adapter';
import config from "../../../config";
import { EventType, TopicNames } from "../enums";

export const onNewPassengerWaitingDataListener = async (data) => {
  console.log('Subscribing to data on kafka topic', TopicNames.PASSENGER_WAITING_DATA);
  const newPassengerWaitingConsumer = new KafkaBroker(config.kafka as any, EventType.CONSUMER, TopicNames.PASSENGER_WAITING_DATA);
  try {
    await newPassengerWaitingConsumer.processConsumer(TopicNames.PASSENGER_WAITING_DATA, 'onNewPassengerWaitingDataListener',  data)
      console.log("from passenger", data)
  } catch (error) {
    console.error('Error occurred while consuming data on a kafka topic', TopicNames.PASSENGER_WAITING_DATA);
  }
};
