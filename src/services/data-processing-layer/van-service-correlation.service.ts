import { calculateDelayInMinutes } from "../../utils";
import { BusLocationSchema,PassengerWaitingDataSchema, VanLocationSchema, VanRequest } from "../../models";
import { saveActionableInsight } from "../data-storage-layer";
import { InsightType } from "../../models/actionableInsight.model";


const BUS_DELAY_THRESHOLD = 5; // Bus is delayed more than 5 minutes due to weather
const PASSENGER_THRESHOLD_FACTOR = 0.5; // Dispatch a van if more than 50% passengers at the station

/**
 * Checks if the bus is delayed beyond the acceptable threshold.
 * @param bus - A bus location schema object
 */
export const isBusDelayed = (bus: BusLocationSchema): boolean => {
  const delay = calculateDelayInMinutes(bus.timestamp);
    console.log('Bus Delay:', delay);
  return delay > BUS_DELAY_THRESHOLD;
};


/**
 * Checks if the number of passengers waiting exceeds the defined threshold.
 * @param passengers - Current number of passengers at the location
 * @param averagePassengers - Average passengers for the location
 */
export const exceedsPassengerThreshold = (
  passengers: number,
  averagePassengers: number
): boolean => {
  return passengers > averagePassengers * PASSENGER_THRESHOLD_FACTOR;
};


/**
 * Correlates bus and passenger data to determine if a van service is required.
 * @param busData - Array of bus location data
 * @param passengerData - Array of passenger waiting data
 * @param averagePassengers - Average number of passengers for the location
 */
export const processVanDispatchDecision = (
  vanData: VanLocationSchema[],
  busData: BusLocationSchema[],
  passengerData: PassengerWaitingDataSchema[],
  averagePassengers: number
): void => {
  console.log('Processing Van Dispatch Decision');
  console.log({ passengerData, busData, averagePassengers });

  const isWithinTolerance = (a: number, b: number, tolerance: number = 0.0001) =>
    Math.abs(a - b) < tolerance;

  passengerData.forEach((passenger) => {
    console.log('Checking passenger at:', passenger.lat, passenger.lon);

    const delayedBuses = busData.filter(
      (bus) =>
        isWithinTolerance(bus.lat, passenger.lat) &&
        isWithinTolerance(bus.lon, passenger.lon) &&
        isBusDelayed(bus)
    );

    console.log('Delayed Buses:', delayedBuses);

    if (
      delayedBuses.length > 0 &&
      exceedsPassengerThreshold(passenger.passengers, averagePassengers)
    ) {
      const vanRequest: VanRequest = {
        location: `(${passenger.lat}, ${passenger.lon})`,
        passengers: passenger.passengers,
        reason: "Next bus delayed and passengers exceed threshold",
        timestamp: passenger.timestamp,
      };

      saveActionableInsight({
        vehicleId: `${vanRequest.timestamp}`,
        type: InsightType.VAN_NEEDED,
        detail: `Van needed at ${vanRequest.location} for ${vanRequest.passengers} passengers`,
        location: vanRequest.location,
        timestamp: vanRequest.timestamp,
      });
    }
  });
};

// result: For the first passenger (at location 45.5017, -73.5673), the function will check if there is a delayed bus at this location. If the bus is delayed and the number of passengers exceeds 50% of the average, a van will be dispatched.