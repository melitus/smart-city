import { getOsEnv, normalizePort } from './env/index';
import path from 'path';
import * as dotenv from 'dotenv';

const envPath = path.join(
  process.cwd(),
  `.env${!process.env.ENVIRONMENT || process.env.ENVIRONMENT === 'development' ? '' : `.${process.env.NODE_ENV}`}`,
);

const loadenv = () =>
  dotenv.config({
    path: envPath,
  });

loadenv();

export default {
  appKey: {
    port: normalizePort(process.env.PORT || getOsEnv('PORT')) as number,
    env: getOsEnv('ENVIRONMENT') || 'production'
  },
    mongo: {
      uri: getOsEnv('MONGO_URI'),
      options: {
        useNewUrlParser: true,
        keepAlive: true,
        useUnifiedTopology: true,
        autoIndex: false, // Don't build indexes
        // If not connected, return errors immediately rather than waiting for reconnect
        connectTimeoutMS: 10000, // Give up initial connection after 10 seconds
        socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
        family: 4, // Use IPv4, skip trying IPv6
      },
    },
  kafka: {
    options: {
      consumer: {
        groupId: process.env.KAFKA_GROUP_ID,
      },
      admin: {},
      producer: {},
      client: {
        clientId: process.env.KAFKA_CLIENT_ID as string,
        brokers: ((process.env.KAFKA_BROKERS as string) || '').split(',').map((item) => item.trim()) as string[],
        // ssl: process.env.KAFKA_SSL,
        // sasl: {
        //   mechanism: 'scram-sha-256',
        //   username: process.env.KAFKA_USERNAME as string,
        //   password: process.env.KAFKA_PASSWORD as string,
        // },
      },
    },
    heartbeatInterval: 3000,
    connectionTimeout: 10000,
    authenticationTimeout: 1000,
    reauthenticationThreshold: 10000,
    fromBeginning: true,
  }
};
