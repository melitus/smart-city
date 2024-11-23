/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { KafkaBroker } from '../adapter';
import config from '../../../config';
import { TopicNames, EventType } from '../enums';

const producerInstance = new KafkaBroker(config.kafka as any, EventType.PRODUCER);

export const vanLocationDataPublisherEvent = async (data): Promise<void> => {
  // await producerInstance.createTopic(TopicNames.VAN_LOCATION_DATA)

  console.log('Publishing data to kafka topic', TopicNames.VAN_LOCATION_DATA);
  try {
    await producerInstance.publishToKafka(TopicNames.VAN_LOCATION_DATA, data);
  } catch (error) {
    console.error('Error occurred while publishing  create new user data to a kafka topic', TopicNames.VAN_LOCATION_DATA);
  }
};
