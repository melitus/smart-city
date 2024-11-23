import { KafkaBroker } from '../adapter';
import config from "../../../config";
import { EventType, TopicNames } from "../enums";


/**
 * This function listens to the BUS_LOCATION_DATA topic.
 * 
 * @param consumerInstance - The KafkaBroker instance that is responsible for consuming the messages
 * @param data - Additional data or configuration that might be needed for message processing
 */
export const onNewBusLocationDataListener = async (data) => {
  console.log('Subscribing to data on kafka topic', TopicNames.BUS_LOCATION_DATA);
  const newBusLocationConsumer = new KafkaBroker(config.kafka as any, EventType.CONSUMER, TopicNames.BUS_LOCATION_DATA);

  try {
    await newBusLocationConsumer.processConsumer(TopicNames.BUS_LOCATION_DATA, 'onNewBusLocationListener',  data)
      console.log("from bus", data)
  } catch (error) {
    console.error('Error occurred while consuming data on a kafka topic', TopicNames.BUS_LOCATION_DATA);
  }
};
