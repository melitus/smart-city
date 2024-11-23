import * as readline from "readline";
import chalk from "chalk";
import express from 'express';
import axios, { Method } from 'axios';
import bodyParser from 'body-parser'

import busLocationRoutes from './routes/busLocation.route';
import weatherUpdatesRoutes from './routes/weatherUpdates.route';
import vanLocationRoutes from './routes/vanLocation.route';
import passengerWaitingRoutes from './routes/passengerWaiting.route';
import insightRouter from './routes/insights.route'
import { loadValidatedJSON, readCsvFile } from "./utils/validation";
import { PassengerWaitingDataSchema } from "./models";
import { connectMongoWithRetry } from "./utils/datastore";
import { dashboardInsight } from "./utils/table";

// Initialize Express app
const app = express();
const port = 3000;

app.use(bodyParser.json())
// Use the imported routes
app.use(busLocationRoutes);
app.use(weatherUpdatesRoutes);
app.use(vanLocationRoutes);
app.use(passengerWaitingRoutes);
app.use(insightRouter);

const realTimeDataStreamingConsoleInterface = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

async function fetchData(method: Method, endpoint: string, data?: any) {
  const url = `http://localhost:${port}${endpoint}`;
  console.log(`Fetching data, data: ${data}`);
  try {

    const response = await axios({
      method,
      url,
      data, // Optional for POST, PUT, PATCH, etc.
    });

    console.log(`Response from ${url}:`, response.data);
    return response.data;
  } catch (error) {
    console.error(`Error during ${method} request to ${url}:`, error);
    // throw error;
    startDataProcessingSystemConsoleApp()
  }
}

const  startDataProcessingSystemConsoleApp = () => {
  console.log(
    chalk.bgBlue.bold("🚀 Welcome to mini data processing system for real-time data integration and analytics within a smart mobility platform!")
  );
  console.log(chalk.green.bold("Functions to call:"));
  console.log(chalk.green.bold("1: Data-injection: Ingest the bus location data "));
  console.log(chalk.green.bold("2:  Data-injection: Ingest the passenger waiting location data "));
  console.log(chalk.green.bold("3:  Data-injection: Ingest the weather updates data "));
  console.log(chalk.green.bold("4:  Data-injection: Ingest the van location data "));
  console.log(chalk.green.bold("5:  Data-Insight: call the data insight api "));
  console.log(
    chalk.green.bold(
      'Please enter the number of the task you want to perform or enter "exit" to quit.'
    )
  );

  realTimeDataStreamingConsoleInterface.question("> ", async (answer) => {
    switch (answer) {
      case "1":
        const locationInput = await loadValidatedJSON("bus-location", "bus");
        const locationData = await fetchData("POST","/api/bus-location" , locationInput.rawData)
        console.log("Location data: " + locationData)
        break;
      case "2":
        const passengerInput: PassengerWaitingDataSchema | any = await readCsvFile("passenger-waiting")
        const passengerData = await fetchData("POST","/api/passenger-waiting", passengerInput )
        console.log(passengerData);
        break;
      case "3":
        const weatherInput = await loadValidatedJSON("weather-updates", "weather");
        const weatherData = await fetchData("POST","/api/weather-updates", weatherInput.rawData )
        console.log(weatherData);
        break;
      case "4":
        const vanInput = await loadValidatedJSON("van-location", "van");
        const vanLocationData = await fetchData("POST","/api/van-location", vanInput.rawData)
        console.log(vanLocationData);
        break;
      case "5":
        const insightData = await fetchData("GET","/api/dashboard/insights")
        const dashboardInsightValueTable = await dashboardInsight(
          insightData
        );
        console.log("Dashboard Insights:")
        console.log(dashboardInsightValueTable);
        break;
      case "exit":
        console.log("Exiting...");
        realTimeDataStreamingConsoleInterface.close();
        return;
      default:
        console.log(
          'Invalid option. Please enter a valid number or "exit" to quit.'
        );
    }

    startDataProcessingSystemConsoleApp(); // Restart the app after performing the selected task
  });
}


// Start the Express server
const startServer = async () => {
  await connectMongoWithRetry()
app.listen(port, () => {
  console.log(chalk.green(`Server is running on http://localhost:${port}`));
  startDataProcessingSystemConsoleApp(); // Start the console app
});
}

startServer()