import createError from "http-errors";
import {  weatherUpdatesPublisherEvent } from "../../message-broker/kafka/producers";
import { WeatherUpdateSchema } from "../../models";

export const ingestWeatherData = async (weatherData: WeatherUpdateSchema[]) => {
  try {
    if (weatherData) {
      await weatherUpdatesPublisherEvent(weatherData);
    } else {
      createError(400, "Invalid Weather Data:");
    }
  } catch (error) {
    createError(501, "Ingest weather data error");
  }
};

