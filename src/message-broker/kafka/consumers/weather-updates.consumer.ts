import { KafkaBroker } from '../adapter';
import config from "../../../config";
import { EventType, TopicNames } from "../enums";


/**
 * This function listens to the WEATHER_UPDATES topic.
 * 
 * @param consumerInstance - The KafkaBroker instance that is responsible for consuming the messages
 * @param data - Additional data or configuration that might be needed for message processing
 */
export const onNewWeatherUpdatesListener = async (data) => {
  console.log('Subscribing to data on kafka topic', TopicNames.WEATHER_UPDATES);
  const newWeatherUpdateConsumer = new KafkaBroker(config.kafka as any, EventType.CONSUMER, TopicNames.WEATHER_UPDATES);
  try {
    await newWeatherUpdateConsumer.processConsumer(TopicNames.WEATHER_UPDATES, 'onNewWeatherUpdatesListener', data)
      console.log("from weather", data)

  } catch (error) {
    console.error('Error occurred while consuming data on a kafka topic', TopicNames.WEATHER_UPDATES);
  }
};

