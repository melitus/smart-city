// this is a file to run to create topics

import { KafkaBroker } from '../adapter'; // Import the KafkaBroker class
import { TopicNames } from '../enums'; // Import the TopicNames enum
import { IKafkaModuleConfiguration } from '../interface'; // Adjust path if necessary
import { EventType } from '../enums'; // If needed for EventType.PRODUCER
import config from "../../../config";

const kafkaBroker = new KafkaBroker(config.kafka as IKafkaModuleConfiguration, EventType.CONSUMER);

// List of topics to create, using the enum
const topicsToCreate = [
  TopicNames.BUS_LOCATION_DATA,
  TopicNames.VAN_LOCATION_DATA,
  TopicNames.WEATHER_UPDATES,
  TopicNames.PASSENGER_WAITING_DATA,
];

// Function to create the topics
export const createTopics = async () => {
  try {
    console.log('Creating topics...');
    await kafkaBroker.onKafkaBrokerBootstrap(); // Initialize the Kafka connection
    await kafkaBroker.createTopic(topicsToCreate); // Create topics if they don't exist
    const createdTopics = await kafkaBroker.getAllTopics()
    console.log('Topics created successfully', createdTopics);
  } catch (error) {
    console.error('Error creating topics:', error);
  } finally {
    await kafkaBroker.onKafkaBrokerShutdown(); // Disconnect after creating topics
  }
};

// Execute the function to create topics
// createTopics();
