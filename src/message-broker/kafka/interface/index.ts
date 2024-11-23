import {
  ProducerRecord,
  ConsumerRunConfig,
  ProducerConfig,
  KafkaConfig,
  AdminConfig,
  ConsumerConfig,
  Message,
  Transaction,
  RecordMetadata,
} from 'kafkajs';

export interface IHeaders {
  [key: string]: any;
}

export interface IKafkaModuleConfiguration {
  options: {
    client: KafkaConfig;
    consumer?: ConsumerConfig;
    consumerRun?: ConsumerRunConfig;
    producer?: ProducerConfig;
    admin?: AdminConfig;
  };
}

export interface KafkaRequest<T = any> {
  key: Buffer | string | null;
  value: T;
  topic: string;
  headers: Record<string, any>;
}

export interface KafkaResponse<T = any> {
  response: T;
  key: string;
  timestamp: string;
  offset: number;
  headers?: IHeaders;
}

export interface KafkaMessageObject extends Message {
  value: any | Buffer | string | null;
  key: any;
}

export interface KafkaMessageSend extends Omit<ProducerRecord, 'topic'> {
  messages: KafkaMessageObject[];
  topic?: string;
}

export interface KafkaTransaction extends Omit<Transaction, 'send' | 'sendBatch'> {
  send(message: KafkaMessageSend): Promise<RecordMetadata[]>;
}
