# A mini data processing system for real-time data integration and analytics within a smart mobility platform

## Objectives
Design and development of a simplified version of a data integration framework for a smart mobility platform. The system will process mobility data streams (e.g., bus location, van location, weather updates, and the number of waiting passengers at a bus stop) in real-time and generate actionable insights.
- Data Sources:

   -  Bus Location Data: Stream of JSON objects providing bus IDs, coordinates, and timestamps.
   - Van Location Data: Stream of JSON objects providing van IDs, coordinates, and timestamps.
   - Weather Updates: Stream of JSON objects with temperature, precipitation, and timestamp data
   - Passenger Waiting Data: A batch file (CSV) with the number of waiting passengers at various bus stops.

- Tasks:

   - System Design: 
      -  Design a system to ingest and integrate these data streams
      - Include an architectural diagram in your solution.

   - Real-Time Processing: 
       - Correlate bus locations with weather data to identify delays caused by adverse weather conditions.
       - Correlate van services with bus locations and passenger waiting numbers. A van is needed when: 1. A bus will be more than 5 minutes late. 2. The number of waiting passengers exceeds 50% of the average waiting passengers at the same location and time. 
       - Build a real-time dashboard mock-up (console or web-based) to output actionable insights, such as delays or the need for van services.
- Requirements:

  - Handle high-velocity data streams efficiently.
  - Ensure data quality by filtering out incomplete or malformed data.
  - Provide meaningful error-handling for failed data ingestion or processing.

- Deliverables:

    - Provide all scripts, functions, and libraries used.
    - Document the code with comments and instructions for running the system with sample data.
    - Include a brief report (1-2 pages) explaining design decisions, challenges faced, and scalability considerations with increased data volume.


## High-Level Architecture
#### Components
- Data Ingestion Layer:
    - Handles high-velocity data streams (Bus, Van, Weather) and batch data (Passenger).
    - Filters and validates incoming data.
    - Queues validated data for further processing.

- Data Processing Layer:

    - Performs real-time correlations between data streams.
    - Implements business rules for actionable insights (e.g., van dispatch decisions and bus weather correlation).
    - Aggregates data for the dashboard.

- Dashboard/API Layer:

    - Provides REST APIs for external access.
    - Streams insights to a real-time dashboard using console interface. Websocket can be used if it is connected to a web application.

- Storage Layer:

    - Maintains historical data for analytics and replaying streams.
    - Uses MongoDB to supports indexing efficient querying of recent data as well as historical data over time.

- Message Broker:

    - Manages communication between components for scalability and fault tolerance with Kafka
    - This is separated into consumers and producers
    - Different topics are defined for different events trigger

## Real-Time Processing Steps:
- Bus Location & Weather Data Correlation:

   - If the bus is delayed (based on timestamp), and the delay is caused by adverse weather conditions (e.g., rain, snow), we need to detect this.

- Van Dispatch Decision:
   - A van is needed when:
       - The next bus will be delayed by more than 5 minutes.
       - The number of waiting passengers exceeds 50% of the average number of waiting passengers at the same location and time.

## Default Technologies:

- Typescript

- Node.js

- Json data.


### Data models gotten from this endpoint:
- https://cdn.recapture.io/coding-task/demo-carts.json
- https://cdn.recapture.io/coding-task/demo-orders.json


 ## Set Up

The easiest way to get started is to clone the repository:

# Unzip the file
```
and copy file to any location
```

# Change directory

```
open in any coding editor of your choice and cd recapture-coding-challenge
```

# Install NPM dependencies

```
yarn install or npm install
```

# start the server 

```
yarn run dev or npm run dev
```

# # start the server when the project is build

```
yarn run start or npm run start
```


## Follow the prompt on the console

- Enter "1" to run the Abandoned cart rate
- Enter "2" to run the Average order value
- Enter "3" to run the Top products purchased
- Enter "4" to run the Top products abandoned
- Enter "5" to run the Breakdown of orders/sales per day


## Reference
- https://www.bigcommerce.com/articles/ecommerce/abandoned-carts/
- https://www.bigcommerce.com/articles/ecommerce/average-order-value/
- https://www.shopify.com/ng/blog/average-order-value
