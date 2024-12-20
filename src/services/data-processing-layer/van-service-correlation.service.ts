import { calculateDelayInMinutes } from "../../utils";
import {
  BusLocationSchema,
  PassengerWaitingDataSchema,
  VanLocationSchema,
  VanRequest,
} from "../../models";
import { saveActionableInsight } from "../data-storage-layer";
import { InsightType } from "../../models/actionableInsight.model";
import { haversineDistance } from "../../utils/distance";
import { logError, sendAlert } from "../../utils/monitoring";
import { validateDataArray } from "../../utils/validation";

// Constants
const BUS_DELAY_THRESHOLD = 5; // Bus is delayed more than 5 minutes due to weather
const PASSENGER_THRESHOLD_FACTOR = 0.5; // Dispatch a van if more than 50% passengers at the station
const VAN_PICKUP_RADIUS = 4; // Van pickup radius in kilometers

/**
 * Checks if two points are within a specified distance.
 * @param lat1 - Latitude of the first point
 * @param lon1 - Longitude of the first point
 * @param lat2 - Latitude of the second point
 * @param lon2 - Longitude of the second point
 * @param maxDistance - Maximum distance in kilometers
 */
const isWithinDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  maxDistance: number = VAN_PICKUP_RADIUS
): boolean => {
  const distance = haversineDistance(lat1, lon1, lat2, lon2);
  console.log({ distance });
  return distance <= maxDistance; // Check if the distance is within the maximum allowed distance (in kilometers)
};

/**
 * Checks if the bus is delayed beyond the acceptable threshold.
 * @param bus - A bus location schema object
 */
export const isBusDelayed = (bus: BusLocationSchema): boolean => {
  const delay = calculateDelayInMinutes(bus.timestamp);
  console.log("Bus Delay:", delay);
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
 * Correlates bus, passenger, and van data to determine if a van service is required.
 * @param vanData - Array of van location data
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
  console.log("Processing Van Dispatch Decision");

  // Maintain a set of assigned van IDs
  const assignedVans = new Set<string>();

  try {
    validateDataArray(vanData, "Van data");
    validateDataArray(busData, "Bus data");
    validateDataArray(passengerData, "Passenger data");
    passengerData.forEach((passenger) => {
      try {
        console.log("Checking passenger at:", passenger.lat, passenger.lon);

        // Find delayed buses near the passenger's location
        const delayedBuses = busData.filter(
          (bus) =>
            isWithinDistance(bus.lat, bus.lon, passenger.lat, passenger.lon) &&
            isBusDelayed(bus)
        );

        console.log("Delayed Buses:", delayedBuses);

        if (
          delayedBuses.length > 0 &&
          exceedsPassengerThreshold(passenger.passengers, averagePassengers)
        ) {
          // Iterate through vans to find the closest unassigned one
          for (const van of vanData) {
            if (
              isWithinDistance(
                van.lat,
                van.lon,
                passenger.lat,
                passenger.lon
              ) &&
              !assignedVans.has(van.van_id)
            ) {
              console.log("Available Van:", van);

              // Mark the van as assigned
              assignedVans.add(van.van_id);

              // Create a van request
              const vanRequest: VanRequest = {
                vehicleId: van.van_id,
                location: `(${passenger.lat}, ${passenger.lon})`,
                passengers: passenger.passengers,
                reason: "Next bus delayed and passengers exceed threshold",
                timestamp: passenger.timestamp,
              };

              console.log("Van requested:", vanRequest);

              // Save actionable insight
              saveActionableInsight({
                vehicleId: `${vanRequest.vehicleId}`,
                type: InsightType.VAN_NEEDED,
                detail: `Van needed at ${vanRequest.location} for ${vanRequest.passengers} passengers`,
                location: vanRequest.location,
                timestamp: vanRequest.timestamp,
              });

              // Exit loop after dispatching the first available van
              break;
            }
          }

          if (
            !Array.from(assignedVans).includes(passenger.passengers.toString())
          ) {
            console.log(
              "No unassigned van found within range for passenger at:",
              passenger.lat,
              passenger.lon
            );
          }
        }
      } catch (passengerError) {
        logError(
          `Error processing passenger at (${passenger.lat}, ${passenger.lon}): ${passengerError.message}`,
          passengerError
        );
        // Optionally: Skip this passenger and continue processing others
      }
    });
  } catch (error) {
    logError(`Critical error in van dispatch process: ${error.message}`, error);
    sendAlert(`Van Dispatch Error: ${error.message}`);
    throw new Error("Van Dispatch process aborted due to critical error.");
  }
};
