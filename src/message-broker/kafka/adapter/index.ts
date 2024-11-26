import {
  Consumer,
  Producer,
  Kafka,
  SeekEntry,
  logLevel,
  EachMessagePayload,
  Admin,
  CompressionTypes,
  RecordMetadata,
} from "kafkajs";
import chalk from "chalk";

import {
  IKafkaModuleConfiguration,
  KafkaMessageSend,
} from "../interface";
import { kafkaRequestSerializer, kafkaResponseDeserializer } from "../helper";
import { EventType, TopicNames } from "../enums";

export class KafkaBroker {
  private readonly kafkaConsumer: Consumer;
  private readonly kafkaProducer: Producer;
  private readonly kafkaAdmin: Admin;
  private readonly kafka: Kafka;
  protected topicOffsets: Map<
    string,
    (SeekEntry & { high: string; low: string })[]
  > = new Map();

  private readonly config: IKafkaModuleConfiguration;
  private defaultGroupId: string;
 // A mapping for topic to groupId if needed.
 private readonly topicGroupIdMap: Record<TopicNames, string> = {
  [TopicNames.BUS_LOCATION_DATA]: 'bus-location-group',
  [TopicNames.VAN_LOCATION_DATA]: 'van-location-group',
  [TopicNames.WEATHER_UPDATES]: 'weather-updates-group',
  [TopicNames.PASSENGER_WAITING_DATA]: 'passenger-waiting-group',
};

  public constructor(kafkaConfig: IKafkaModuleConfiguration, type?: string, topicName?:string | any) {
    this.config = kafkaConfig;
    this.defaultGroupId = this.config.options.consumer?.groupId as any;
    console.log({
      clientId: this.config.options.client,
      groupid: this.defaultGroupId,
      broker: this.config.options.client.brokers,
    });
    this.kafka = new Kafka({
      ...this.config.options?.client,
      logLevel: logLevel.INFO,
    });

    if (type == EventType.PRODUCER) {
      this.kafkaProducer = this.createKafkaProducer();
    }
    if (type == EventType.CONSUMER) {
      const groupId = this.topicGroupIdMap[topicName] || this.defaultGroupId;
      this.kafkaConsumer = this.createKafkaConsumer(groupId);
    }
    this.kafkaAdmin = this.createKafkaAdmin();
  }

  /**
   * Bootstrap all needed data before application is started.
   * Has the good side-effect that errors are directly detected so
   * a not running or wrong configured Kafka setup does not lead to data inconsistencies.
   */
  async onKafkaBrokerBootstrap(): Promise<void> {
    try {
      if (!this.config.options?.client) {
        throw new Error(
          "Broker must be configured with kafka connection options to start"
        );
      }
      console.log(
        "Connecting to kafka broker",
        this.config.options.client.brokers
      );
      await this.connectToKafka();
    } catch (error) {
      console.trace(error);
      this.onKafkaBrokerShutdown();
    }
  }

  /**
   * Disconnect after all listeners are closed
   */
  async onKafkaBrokerShutdown(): Promise<void> {
    try {
      console.log(
        "Disconnecting from kafka broker",
        this.config.options.client.brokers
      );

      this.graceFullShutDown();
    } catch (error) {}
  }

  private async connectToKafka(): Promise<void> {
    if (this.kafkaProducer) {
      console.log("Starting kafka producer");
      await this.startProducer();
    }
    if (this.kafkaConsumer) {
      console.log("Starting kafka consumer");
      await this.startConsumer();
    }
    console.log("Starting kafka admin");
    await this.startAdmin();
  }

  private createKafkaConsumer(groupId: string): Consumer {
    const consumer = this.kafka.consumer({
      groupId: groupId,
      minBytes: 5,
      maxBytes: 1e6,
      // wait for at most 3 seconds before receiving new data
      maxWaitTimeInMs: 3000,
    });

    return consumer;
  }

  private createKafkaProducer(): Producer {
    const producer = this.kafka.producer();
    return producer;
  }

  private createKafkaAdmin(): Admin {
    const admin = this.kafka.admin();

    return admin;
  }

  /**
   * Connect the kafka service.
   */
  public async startConsumer(): Promise<void> {
    try {
      console.log(
        "Starting kafka Consumer on broker:",
        this.config.options.client.brokers
      );
      await this.kafkaConsumer.connect();
    } catch (error) {
      console.error("Error connecting the consumer: ", error);
      try {
        console.error(`Error during connect: ${error}`);
        console.log("Retrying to connect");
        await this.kafkaConsumer.connect();
      } catch (e1) {
        console.log("Error connecting the consumer: ", error);
        await this.disconnect();
      }
    }
  }
  public async startProducer(): Promise<void> {
    try {
      console.log(
        "Starting kafka Producer on broker:",
        this.config.options.client.brokers
      );
      await this.kafkaProducer.connect();
    } catch (error) {
      try {
        console.error(`Error during connect: ${error}`);
        console.error("Retrying to connect");
        await this.kafkaProducer.connect();
      } catch (e1) {
        console.error(
          `Error during final connect attempt to the producer: ${e1}`
        );
        await this.disconnect();
      }
    }
  }
  public async startAdmin(): Promise<void> {
    try {
      console.log(
        "Starting kafka Admin on broker:",
        this.config.options.client.brokers
      );
      await this.kafkaAdmin.connect();
    } catch (error) {
      try {
        console.error(`Error during connect: ${error}`);
        console.error("Retrying to connect");
        await this.kafkaAdmin.connect();
      } catch (e1) {
        console.error(
          `Error during final connect attempt to the admin: ${e1}`
        );
        await this.disconnect();
      }
    }
  }

  /**
   * Disconnect everything
   */
  private async disconnect(): Promise<void> {
    console.log(
      chalk.white.bgRed.bold(
        `Stopping the Kafka Broker from accepting new connections and finishes existing connections.`
      )
    );
    this.kafkaProducer && (await this.kafkaProducer.disconnect());
    this.kafkaConsumer && (await this.kafkaConsumer.stop());
    this.kafkaConsumer && (await this.kafkaConsumer.disconnect());
    await this.kafkaAdmin.disconnect();
  }

  graceFullShutDown() {
    enum ShutdownSignals {
      SIGHUP = "SIGHUP",
      SIGINT = "SIGINT",
      SIGQUIT = "SIGQUIT",
      SIGILL = "SIGILL",
      SIGTRAP = "SIGTRAP",
      SIGABRT = "SIGABRT",
      SIGBUS = "SIGBUS",
      SIGFPE = "SIGFPE",
      SIGSEGV = "SIGSEGV",
      SIGUSR2 = "SIGUSR2",
      SIGTERM = "SIGTERM",
    }
    const shutdown = async (signal: string, code: number) => {
      console.log(`Kafka Received ${signal}. Exiting`);
      await this.disconnect().then(() => process.exit(128 + code));
    };

    Object.keys(ShutdownSignals).forEach((signal) => {
      process.on(signal, () => {
        shutdown(signal, ShutdownSignals[signal]);
      });
    });
  }

  async getAllTopics(): Promise<Array<string> | undefined> {
    try {
      const activeTopics = await this.kafkaAdmin.listTopics();
      return activeTopics;
    } catch (error) {
      console.error('error fetching all topics', error);
    }
  }

  async createTopic(topic: string[] | any): Promise<void> {
    try {
      const activeTopics = await this.kafkaAdmin.listTopics();
      await this.kafkaAdmin.createTopics({
        topics: topic.filter((topic: any) => !activeTopics.includes(topic)),
        waitForLeaders: true,
      });
    } catch (error) {
      console.error('error creating topic', error);
    }
  }

  /**
   * Send/produce a message to a topic.
   *
   * @param message
   */
  async publishToKafka(
    topic: string,
    message: KafkaMessageSend
  ): Promise<RecordMetadata[] | undefined> {
    if (!this.kafkaProducer) {
      console.error("There is no producer, unable to send message.");
      throw new Error("Kafka producer not configured");
    }
    try {
      await this.onKafkaBrokerBootstrap();
      const serializedPacket = await kafkaRequestSerializer(message);
      const results = {
        topic: topic,
        compression: CompressionTypes.GZIP,
        messages: [serializedPacket],
      };
      console.log(
        `Produced message to Kafka Topic ${topic}: ${JSON.stringify(message)}`
      );
      return await this.kafkaProducer.send(results);
    } catch (error) {
     console.error(
        `There was an error producing the message: ${error}`
      );
    }
  }

  /**
   * Subscribe to all topics where an event handler is registered
   * @private
   */
  private async subscribeToTopics(topicName: string): Promise<void> {
    if (!this.kafkaConsumer) {
      throw new Error("Kafka consumer not configured");
    }
    try {
      await this.kafkaConsumer.subscribe({
        topic: topicName,
        fromBeginning: true,

      });
    } catch (error) {
      console.error(
        `Error while subscribing to topic ${topicName}`,
        error
      );
    }
  }

  public async processConsumer(
    topic: string,
    consumerName?: string,
    handler?: any
  ): Promise<void> {
    let counter = 1;
    const consumerNumber = process.argv[2] || "1";
    if (!this.kafkaConsumer) {
      return;
    }
    try {
      await this.onKafkaBrokerBootstrap();
      await this.subscribeToTopics(topic);
      await this.kafkaConsumer.run({
        partitionsConsumedConcurrently: 3, // Default: 1
        eachMessage: async (messagePayload: EachMessagePayload) => {
          const { topic, partition, message } = messagePayload;
          const deserializedPacket = await kafkaResponseDeserializer(message);
          console.log({ deserializedPacket });
          await handler(deserializedPacket.response);
          const prefix = `${topic}[${partition} | ${message.offset}] / ${message.timestamp}`;
          console.log(`- ${prefix} ${message.key}#${message.value}`);
          this.logMessage(
            counter,
            `${consumerName}#${consumerNumber}`,
            topic,
            partition,
            message
          );
          counter++;
        },
      });
    } catch (error) {
      console.trace({error});
      // await this.onKafkaBrokerShutdown();
      if (error.type === "REBALANCE_IN_PROGRESS") {
        await this.startConsumer();
      }
      // throw err;
      console.error(
        `Error while processing message on topic ${topic}: `,
        error
      );
    }
  }


  logMessage = (counter, consumerName, topic, partition, message) => {
    console.log( chalk.white.bgGreen.bold(
      `received a new message number: ${counter} on ${consumerName}: `,
      {
        topic,
        partition,
        message: {
          offset: message.offset,
          headers: message.headers,
          value: message.value.toString(),
        },
      }
    ));
  };
}
