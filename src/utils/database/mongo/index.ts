/* eslint-disable @typescript-eslint/no-explicit-any */
// @ts-ignore
import mongoose, { ConnectionOptions } from 'mongoose';
import chalk from 'chalk';
import { Promise } from 'bluebird';

import config from '../../../config';

// make bluebird default Promise
(<any>mongoose).Promise = Promise;

if (config.appKey.env === 'development') {
  mongoose.set('debug', true);
}

mongoose.set('strictQuery', false)

const getConnectionUrl = () => config.mongo.uri;
const getConnectionOptions = () => config.mongo.options as unknown as ConnectionOptions;
const RECONNECT_INTERVAL = 1000;
let isConnected = false;
let isConnecting = false;

export const connectMongoWithRetry = async (): Promise<typeof mongoose> => {
  const uri: any = getConnectionUrl() as string;
  const connectionOptions: any = getConnectionOptions();
  try {
    isConnecting = true;
    const connection: any = await mongoose.connect(uri, connectionOptions);
    prepareMongooseListeners();
    graceFullShutDown();
    console.log(' 💻 Mongoose successfully connected to Real Time Streaming Smart City: ');
    isConnected = true;
    return connection.connection.db;
  } catch (error) {
    console.trace(error)
    if (error.message.code === 'ETIMEDOUT') {
      console.error(`MongoDB connection was failed: ${error.message}`, error.message);
      setTimeout(connectMongoWithRetry, RECONNECT_INTERVAL);
    } else {
      console.error(
        chalk.bgRed.bold('Error while attempting to connect to database:', {
          error,
        }),
      );
    }
  }
};

/**
 * Destroy current connection
 *
 * @return {Promise<boolean>}
 */
export const terminateMongoConnection = async (): Promise<boolean> => {
  if (!isConnected) {
    console.error('terminateConnection was called when not connected!');
    return true;
  }
  try {
    console.log(
      chalk.white.bgRed.bold(
        `Stopping the Mongodb Server from accepting new connections and finishes existing connections.`,
      ),
    );
    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error('Was unable to close the database connection! FUBAR');
    throw new Error('CRITICAL: UNABLE TO CLOSE DATABASE CONNECTION! JEXTA!: database/mongo-connection');
  }

  return true;
};

const graceFullShutDown = () => {
  enum ShutdownSignals {
    SIGHUP = 'SIGHUP',
    SIGINT = 'SIGINT',
    SIGQUIT = 'SIGQUIT',
    SIGILL = 'SIGILL',
    SIGTRAP = 'SIGTRAP',
    SIGABRT = 'SIGABRT',
    SIGBUS = 'SIGBUS',
    SIGFPE = 'SIGFPE',
    SIGSEGV = 'SIGSEGV',
    SIGUSR2 = 'SIGUSR2',
    SIGTERM = 'SIGTERM',
  }
  const shutdown = async (signal: string, code: number) => {
    console.log(`Mongo Received ${signal}. Exiting`);
    await terminateMongoConnection().then(() => process.exit(128 + code));
  };

  Object.keys(ShutdownSignals).forEach((signal) => {
    process.on(signal, () => {
      shutdown(signal, ShutdownSignals[signal]);
    });
  });
};

/**
 * Add some listeners to mongoose connection
 */
const prepareMongooseListeners = () => {
  mongoose.connection.on('connected', () => {
    isConnected = true;
    isConnecting = false;
    console.log('info', `Mongoose - connection established at ${getConnectionUrl()}`);
  });

  mongoose.connection.on('reconnected', () => {
    console.log(`MongoDB Connection Reestablished at ${getConnectionUrl()}`);
  });
  mongoose.connection.on('disconnected', () => {
    isConnected = false;
    console.error(`Database connection lost! at ${getConnectionUrl()}`);
  });

  mongoose.connection.on('error', (err: Error) => {
    console.error(`Mongo Error! ${err.message}`);
  });

  mongoose.connection.on('close', () => {
    console.log(`MongoDB Connection Closed at ${getConnectionUrl()}`);
  });
  mongoose.connection.on('reconnectFailed', () => {
    console.log(`MongoDB Connection fails to reconnect at ${getConnectionUrl()}`);
  });
};
