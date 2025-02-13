// This ensure data quality by filtering out incomplete or malformed data.
import * as fs from 'fs';
import { parse } from 'csv-parse';
import Ajv from 'ajv';
import path from 'path';
import { PassengerWaitingDataSchema } from '../../models';
import createError from "http-errors";
import { logError, sendAlert } from "../../utils/monitoring";

// JSON Schema Validator
const ajv = new Ajv();

// Define Schemas
const busSchema = {
  type: 'object',
  properties: {
    bus_id: { type: 'string' },
    lat: { type: 'number' },
    lon: { type: 'number' },
    timestamp: { type: 'string' },
  },
  required: ['bus_id', 'lat', 'lon', 'timestamp'],
  additionalProperties: false,
};

const vanSchema = {
  type: 'object',
  properties: {
    van_id: { type: 'string' },
    lat: { type: 'number' },
    lon: { type: 'number' },
    timestamp: { type: 'string' },
  },
  required: ['van_id', 'lat', 'lon', 'timestamp'],
  additionalProperties: false,
};

const weatherSchema = {
  type: 'object',
  properties: {
    lat: { type: 'number' },
    lon: { type: 'number' },
    temp: { type: 'number' },
    precipitation: { type: 'string' },
    timestamp: { type: 'string' },
  },
  required: ['lat', 'lon', 'temp', 'precipitation', 'timestamp'],
  additionalProperties: false,
};

const validate = {
  bus: ajv.compile(busSchema),
  van: ajv.compile(vanSchema),
  weather: ajv.compile(weatherSchema),
};

export const readJsonFile = async (filename: string): Promise< [] | undefined> => {
    const filePath = path.join(__dirname, `../../datastore/${filename}.json`)
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    // parse JSON string to JSON object
    const rawData = JSON.parse(data);
    return rawData
    }
  catch (err) {
    console.log(`Error reading file from disk: ${err}`);
}
}

// Function to read CSV file
export const readCsvFile = async (filename: string): Promise<any[] | undefined> => {
  const filePath = path.join(__dirname, `../../datastore/${filename}.csv`);

  const records: any[] = [];

  return new Promise<PassengerWaitingDataSchema[]>((resolve, reject) => {
    const parser = fs.createReadStream(filePath)
      .pipe(parse({
        columns: true,  // Automatically parse the first row as columns
        skip_empty_lines: true, // Skip empty lines
      }))
      .on('data', (data)  => {
        records.push(data);
      })
      .on('end', () => {
        resolve(records);
      })
      .on('error', (err) => {
        console.log(`Error reading CSV file: ${err}`);
        reject(err);
      });
  });
};

// Load JSON with validation
export const loadValidatedJSON = async <T>(
  filename: string,
  schemaType: 'bus' | 'van' | 'weather'
): Promise<boolean | any> => {
  const rawData = await readJsonFile(filename) as T[];

  if (!rawData) {
    return false; // No data means invalid
  }

  let allValid = true;

  rawData.forEach((item, index) => {
    // Validate data against the schema
    if (!validate[schemaType](item)) {
      allValid = false;
      console.log('ingestion_errors.log', `Invalid data in ${filename}, index ${index}: ${JSON.stringify(item)}`);
    }
  });

  return {rawData, allValid}; // Return true if all records are valid, false otherwise
};

/**
 * Helper function to validate the data array and ensure it is not empty.
 * Logs error and sends an alert if validation fails.
 * @param data - The data to validate
 * @param dataName - The name of the data being validated (for error messages)
 * @throws - Throws a validation error if validation fails
 */
export const validateDataArray = (data: any[], dataName: string): void => {
  if (!Array.isArray(data) || data.length === 0) {
    const validationError = createError(400, `${dataName} is invalid or empty`);
    logError(`Critical error in ${dataName} ingestion: ${validationError.message}`, validationError);
    sendAlert(`${dataName} Error: ${validationError.message}`);
    throw validationError;
  }
};