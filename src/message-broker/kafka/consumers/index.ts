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



// export const registerAllConsumersListeners = async () => {
//   // create topics if they don't exist
//   await createTopics()
//   console.log('Registering all kafka consumer listeners');
//   try {
//     // Register the listeners to their respective topics
//     await Promise.all([
//       onNewVanLocationDataConsumerListener(),
//       onNewWeatherUpdatesListener(),
//       onNewPassengerWaitingDataListener(),
//       onNewBusLocationDataListener(),

//     ]);
//   } catch (error) {
//     console.error('Error registering consumers', error);
//   }
// };


export const registerAllConsumersListeners = async () => {
  // create topics if they don't exist
  await connectMongoWithRetry()
  await createTopics();
  console.log('Registering all Kafka consumer listeners');
  
  // Create state to hold incoming data
  let currentBusData: any = null;
  let currentPassengerData: any = null;
  let currentWeatherData: any = null;
  let averagePassengers: number | null = null;

  try {
    // Register the listeners to their respective topics
    await Promise.all([
      onNewVanLocationDataConsumerListener((data) => {
        currentBusData = data; // Save incoming bus data
        // Call process when both bus and passenger data are available
        if (currentBusData && currentPassengerData && averagePassengers !== null) {
          processVanDispatchDecision(currentBusData, currentPassengerData, averagePassengers);
        }
      }),

      onNewWeatherUpdatesListener((data) => {
        currentWeatherData = data; // Save incoming weather data
        // Call process when both bus and weather data are available
        if (currentBusData && currentWeatherData) {
          console.log("Processing weather data new data")
          processBusWeatherCorrelation(currentBusData, currentWeatherData);
        }
      }),

      onNewPassengerWaitingDataListener((data) => {
        console.log({passerferdate: data})
        currentPassengerData = data; // Save incoming passenger data
        // Calculate average passengers when possible
        averagePassengers = calculateAveragePassengers(currentPassengerData);
        console.log({averagePassengers})
        console.log({currentBusData, currentPassengerData, averagePassengers})
        // Call process when both bus and passenger data are available
        if (currentBusData && currentPassengerData && averagePassengers !== null) {
          console.log("Processing bus and passenger data on new passenger")

          processVanDispatchDecision(currentBusData, currentPassengerData, averagePassengers);
        }
        
      }),

      onNewBusLocationDataListener((data) => {
        currentBusData = data; // Save incoming bus data
        // Call process when both bus and passenger data are available
        if (currentBusData && currentPassengerData && averagePassengers !== null) {
          console.log("Processing bus and passenger data on new bus data")
          processVanDispatchDecision(currentBusData, currentPassengerData, averagePassengers);
        }
      })
    ]);
  } catch (error) {
    console.error('Error registering consumers', error);
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


