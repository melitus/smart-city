import { onNewWeatherUpdatesListener } from "./weather-updates.consumer";
import { onNewPassengerWaitingDataListener } from "./passenger-waiting-data.consumer";
import { onNewBusLocationDataListener } from "./bus-location-data.consumer";
import { onNewVanLocationDataConsumerListener } from "./van-location-data.consumer";
import {
  processBusWeatherCorrelation,
  processVanDispatchDecision,
} from "../../../services/data-processing-layer";
import { createTopics } from "../topics";
import { connectMongoWithRetry } from "../../../utils/datastore";
export const registerAllConsumersListeners = async () => {
  // Create topics if they don't exist
  await connectMongoWithRetry();
  await createTopics();

  console.log("Registering all Kafka consumer listeners");

  // State variables to hold incoming data
  let currentVanData: any = null;
  let currentBusData: any = null;
  let currentPassengerData: any = null;
  let currentWeatherData: any = null;
  let averagePassengers: number | null = null;

  // Helper function to check conditions and trigger processing
  const processData = () => {
    if (currentBusData && currentWeatherData) {
      console.log({currentBusData, currentWeatherData})
      console.log("Processing bus and weather data");
      processBusWeatherCorrelation(currentBusData, currentWeatherData);
    }

    if (
      currentVanData &&
      currentBusData &&
      currentPassengerData &&
      averagePassengers !== null
    ) {
      console.log({currentBusData, currentVanData, currentPassengerData})

      console.log("Processing van, bus, and passenger data");
      processVanDispatchDecision(
        currentVanData,
        currentBusData,
        currentPassengerData,
        averagePassengers
      );
    }
  };

  try {
    // Register the listeners to their respective topics
    await Promise.all([
      onNewVanLocationDataConsumerListener((data) => {
        currentVanData = data; // Update van data
        console.log("Van data updated:", currentVanData);
        processData(); // Check and process if conditions are met
      }),

      onNewWeatherUpdatesListener((data) => {
        currentWeatherData = data; // Update weather data
        console.log("Weather data updated:", currentWeatherData);
        processData(); // Check and process if conditions are met
      }),

      onNewPassengerWaitingDataListener((data) => {
        currentPassengerData = data; // Update passenger data
        averagePassengers = calculateAveragePassengers(currentPassengerData); // Calculate average passengers
        console.log("Passenger data updated:", currentPassengerData);
        console.log("Average passengers:", averagePassengers);
        processData(); // Check and process if conditions are met
      }),

      onNewBusLocationDataListener((data) => {
        currentBusData = data; // Update bus data
        console.log("Bus data updated:", currentBusData);
        processData(); // Check and process if conditions are met
      }),
    ]);
  } catch (error) {
    console.error("Error registering consumers:", error);
  }
};

const calculateAveragePassengers = (currentPassengerData: any[]): number => {
  // Check if the data is valid
  if (!currentPassengerData || currentPassengerData.length === 0) {
    return 0;
  }

  // Sum all the passengers, ensuring each value is a number, then divide by the number of records
  const totalPassengers = currentPassengerData.reduce((sum, data) => {
    const passengers = Number(data.passengers);
    return sum + (isNaN(passengers) ? 0 : passengers); // Handle invalid numbers
  }, 0);
  // Return the average of passengers
  return totalPassengers / currentPassengerData.length;
};


