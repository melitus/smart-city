/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { KafkaBroker } from '../adapter';
import config from '../../../config';
import { TopicNames, EventType } from '../enums';

const producerInstance = new KafkaBroker(config.kafka as any, EventType.PRODUCER);

export const weatherUpdatesPublisherEvent = async (data): Promise<void> => {
  // await producerInstance.createTopic(TopicNames.PASSENGER_WAITING_DATA)
  console.log('Publishing data to kafka topic', TopicNames.WEATHER_UPDATES);
  try {
    await producerInstance.publishToKafka(TopicNames.WEATHER_UPDATES, data);
  } catch (error) {
    console.error('Error occurred while publishing  create new user data to a kafka topic', TopicNames.WEATHER_UPDATES);
  }
};
