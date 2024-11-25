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


# System Requirements:
#### Functional Requirements
1. Use Cases and User Stories
###### Use Case 1: Data Ingestion

- Description: Ingest real-time and batch data streams from multiple sources (bus, van, weather, passenger data).
- User Story 1: As a data pipeline user, I want to ingest various data streams (e.g., bus locations, weather updates, passenger data) in real-time so that I can process and correlate data for van dispatch decisions.

###### Use Case 2: Data Validation

- Description: Ensure all incoming data is validated against predefined schemas and business rules before processing.
- User Story 2: As a system administrator, I want the system to validate incoming data (e.g., bus location, passenger count) to ensure accuracy and avoid processing errors.

###### Use Case 3: Real-Time Data Correlation

- Description: Perform correlations between different data streams (e.g., bus delay, weather conditions, passenger wait time) in real-time for actionable insights.
- User Story 3: As a system analyst, I want to receive real-time correlations of bus delays, weather conditions, and passenger data to generate actionable insights for van dispatch.

###### Use Case 4: Van Dispatch Decision

- Description: Automatically trigger van dispatch based on bus delays, passenger wait times, and available vans.
- User Story 4: As a system user, I want the system to automatically request a van when bus delays exceed a threshold and there are enough waiting passengers at the station.

###### Use Case 5: Dashboard and API

- Description: Provide a dashboard and API for external systems to access real-time insights and historical data.
- User Story 5: As a user, I want to visualize the real-time bus, van, and passenger data on a dashboard and access these insights via an API.

###### Use Case 6: Data Storage and Replay

- Description: Store historical data for analytics and allow replaying data streams to simulate conditions.
- User Story 6: As a data analyst, I want to store data to perform historical analysis and replay data streams for 
debugging or testing.

2. Functional Modules and Components
- Data Ingestion Layer
   - Bus Data Ingestion: Captures real-time bus location and status data.
   - Van Data Ingestion: Captures real-time van location and status data.
   - Weather Data Ingestion: Captures real-time weather updates.
   - Passenger Data Ingestion: Captures passenger count and location data

- Data Processing Layer

  - Real-Time Correlation Engine: Correlates bus delays with weather conditions and passenger count to generate actionable insights.
  - Van Dispatch Decision Engine: Based on predefined rules (e.g., bus delay threshold, passenger count), decides when a van should be dispatched.
  - Data Aggregation: Aggregates incoming data for dashboard visualization and API access.

- Dashboard/API Layer
   - API Endpoint: Exposes a RESTful API for external systems to query data and insights.
   - Real-Time Dashboard: Displays real-time data and insights (bus delays, van requests) for operators and analysts.

- Message Broker Layer (Kafka)
   - Producers: Publish real-time data (bus, van, weather, passenger data) to Kafka topics.
   - Consumers: Process data from Kafka topics, trigger actions (e.g., van dispatch, real-time correlation).

- Storage Layer
  - Database (MongoDB): Stores historical data for replay and analytics.

#### Non-Functional Requirements
- Handle high-velocity data streams efficiently.
- Ensure data quality by filtering out incomplete or malformed data.
- Provide meaningful error-handling for failed data ingestion or processing.

# System Architecture

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

## Sequence Diagram

![Alt text](./diagrams/smartcity.jpg?raw=true "Smart City")

## Steps/Interactions for the sequence diagram:

- Data Sources (Bus, Van, Weather, Passenger) send raw data to the Data Ingestion Layer.
     - Message: Data (e.g., bus location, van location, weather data, passenger info)

- The Data Ingestion Layer filters and validates the incoming data (checks schema, missing values, etc.).
     - Message: Validated Data (Bus Location, Van Location, Weather Data, Passenger Data)

- The Data Ingestion Layer queues the validated data in the Message Broker for further processing.
   - Message: Enqueue Validated Data (Message Queue)

- The Message Broker (Kafka) sends the data to the Data Processing Layer for real-time processing and correlation.
   - Message: Process Data (Real-time data streams, Bus-Van correlation, Bus-Weather correlation)

- The Data Processing Layer performs the necessary real-time correlations, applies business rules, and aggregates data for further insights.
    - Message: Actionable Insights (e.g., Van Dispatch Decisions, Weather Correlation for Bus)

- The Data Processing Layer sends these insights to:
     - Dashboard/API Layer for real-time data display and API access.
         - Message: Stream Insights (via WebSocket or REST API)
    - Storage Layer to persist historical data for analytics.
         - Message: Store Data (MongoDB for querying)

- The Dashboard/API Layer provides access to external systems or clients (via REST APIs or WebSocket).
    - Message: Provide Insights to End User (e.g., through a Web Application or Console)

- The Message Broker handles communication between consumers and producers, where additional processing may occur (replaying data, triggering new events).
     - Message: Data Flow between Consumers and Producers

## Default Technologies:

- Typescript

- Node.js

- Javascript.

- Kafka

- MongoDB


 ## Set Up

The easiest way to get started is to clone the repository:

# Change directory

```
open in any coding editor of your choice and cd smart city
```

# Install NPM dependencies

```
yarn install or npm install
```

# start the data ingestion server 

```
yarn run dev or npm run dev
```

# To run the data processing server

```
Ensure that docker-compose is installed on your system, if yes
```
# Run docker-compose

```
sudo docker-compose up or docker-compose up 
```
depending on your setup

# run the processing server. Still in the smart city root directory

```
yarn run kafka or npm run kafka
```

## Follow the prompt on the console to ingest data in the kafka engine

- Enter "1" to ingest Bus Location
- Enter "2" to ingest the Passenger waiting location
- Enter "3" to ingest the Van Location data
- Enter "4" to ingest the Weather updates data
- Enter "5" to run the Dashboard insights 


## Reference
- https://www.bigcommerce.com/articles/ecommerce/abandoned-carts/
- https://www.bigcommerce.com/articles/ecommerce/average-order-value/
- https://www.shopify.com/ng/blog/average-order-value
