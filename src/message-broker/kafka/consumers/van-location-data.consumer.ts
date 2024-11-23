import { KafkaBroker } from '../adapter';
import config from "../../../config";
import { EventType, TopicNames } from "../enums";


/**
 * This function listens to the VAN_LOCATION_DATA topic.
 * 
 * @param consumerInstance - The KafkaBroker instance that is responsible for consuming the messages
 * @param data - Additional data or configuration that might be needed for message processing
 */
export const onNewVanLocationDataConsumerListener = async (data) => {
  console.log('Subscribing to data on kafka topic', TopicNames.VAN_LOCATION_DATA);
  const newVanLocationConsumer = new KafkaBroker(config.kafka as any, EventType.CONSUMER, TopicNames.VAN_LOCATION_DATA);
  try {
    await newVanLocationConsumer.processConsumer(TopicNames.VAN_LOCATION_DATA, 'onNewVanLocationDataConsumerListener', data) 
      console.log("from van", data)
  
     
  } catch (error) {
    console.error('Error occurred while consuming data on a kafka topic', TopicNames.VAN_LOCATION_DATA);
  }
};
