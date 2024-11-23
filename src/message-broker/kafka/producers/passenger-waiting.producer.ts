import { KafkaBroker } from '../adapter';
import config from '../../../config';
import { TopicNames, EventType } from '../enums';

const producerInstance = new KafkaBroker(config.kafka as any, EventType.PRODUCER);

export const passengerWaitingDataPublisherEvent = async (data): Promise<void> => {
  // await producerInstance.createTopic(TopicNames.PASSENGER_WAITING_DATA)
  console.log('Publishing data to kafka topic', TopicNames.PASSENGER_WAITING_DATA);
  try {
    await producerInstance.publishToKafka(TopicNames.PASSENGER_WAITING_DATA, data);
  } catch (error) {
    console.error('Error occurred while publishing  create new user data to a kafka topic', TopicNames.PASSENGER_WAITING_DATA);
  }
};
