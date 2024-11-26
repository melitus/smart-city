# Real-Time Data Processing and Insight Generation System

## System Overview

#### Objectives
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

#### Non-Functional Requirements
- Handle high-velocity data streams efficiently.
- Ensure data quality by filtering out incomplete or malformed data.
- Provide meaningful error-handling for failed data ingestion or processing.

# System Architecture

## High-Level Architecture
#### HIgh Level Diagram with C4 Model

![Alt text](./diagrams/smartcityhighlevel.jpg?raw=true "Smart City")

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
    - The system used MongoDB to supports indexing efficient querying of recent data as well as historical data over time.

- Message Broker:

    - Manages communication between components for scalability and fault tolerance with Kafka
    - This is separated into consumers and producers
    - Different topics are defined for different events trigger


## Sequence Diagram

![Alt text](./diagrams/smartcity.jpg?raw=true "Smart City")

## Steps/Interactions for the sequence diagram:

- Data Sources (Bus, Van, Weather, Passenger) send raw data to the Data Ingestion Layer.
     - Message: Sample Data was provided expect passenger which was generated based on assumption (e.g., bus location, van location, weather data, passenger info)

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

## Challenges faced:
- Faced problem with the different consumers using the same group id. But after going through kafka documentation,  i got to know that the consumer group should be assigned since they they consume different topics
- Tried using in-memory storage mechanism but data got flushed when the app restarts. Because of that , I have to switch to MongoDB to maintain the data for the insights generated.
- Had challenges with floating-point precision issues as a result of direct comparison of latitude and longitude values. This was solved with proximity checks with Haversine formula.
- Also faced issues with timestamp exact equality matching which fails if there is a slight difference. It was also solved with  time tolerance +- values
- I faced challenges with residual data in state variables was causing incorrect or duplicate processing in the kafka consumer listeners registration. The state variables (currentVanData, currentBusData, currentPassengerData, currentWeatherData, and averagePassengers) were being reused inadvertently when new data arrived, as they were not cleared after processing. I have to set them to null after the require operations is completed.

## Systems improvement suggestions:
- I will suggest horizontal scaling of the kafka cluster for high throughput even during data spikes
- The processing server can also be scaled horizontally
- Mongodb should also be scaled horizontally to ensure data stability and uptime
- For the fetching the insights, it will be great to have something like Redis for caching so that the client doesn't have to does not hit the db every time.
- Having a cloud native tool like kubernetes or AWS Lambda, or Azure functions can used  to auto-scale compute resources in response to increased workload.
- Integration websocket support can help the system streams insights to dashboards without overwhelming backend services.
- Having a monitoring system that can track system performance metrics such as throughput, latency, and resource usage.
- Integration Elasticsearch can help in searching and retrieving data in real-time, which is essential for actionable insights and dashboards.
- Using Apache Spark for streaming bulk operations in real time and  analyze the data and generate reports.
- Using time-series database (InfluxDB/TimescaleDB) will help to efficiently store and retrieve time-stamped server data.




## Default Technologies:

- Typescript

- Node.js

- Javascript.

- Kafka

- MongoDB


 ## Set Up

The easiest way to get started is to clone the repository:

#### Change directory

```
open in any coding editor of your choice and cd smart city
```
#### Create environment variable file called ".env" in the root directory and paste 
```
ENVIRONMENT = development
PORT=3000

#Kafka broker
KAFKA_GROUP_ID="real-time-processing"
KAFKA_CLIENT_ID="data-processing"
KAFKA_BROKERS=localhost:29092

#dev Database
MONGO_URI=xxxxxxxx is mongodb connection url from mongodb atlas or localhost

```
#### Install NPM dependencies

```
yarn install or npm install
```

#### start the data ingestion server 

```
yarn run dev or npm run dev
```
![Alt text](./diagrams/server.png?raw=true "Data ingest server")


#### To run the data processing server

```
Ensure that docker-compose is installed on your system, if yes
```
#### Run docker-compose

```
sudo docker-compose up or docker-compose up 
```
depending on your setup

###### Kafka and zookeeper running
![Alt text](./diagrams/kafka.png?raw=true "Data ingest server")


#### run the processing server. Still in the smart city root directory

```
yarn run kafka or npm run kafka
```
###### Data ingestion layer running
![Alt text](./diagrams/processing.png?raw=true "Data ingest server")

### Follow the prompt on the console to ingest data in the kafka engine

- Enter "1" to ingest Bus Location
- Enter "2" to ingest the Passenger waiting location
- Enter "3" to ingest the Van Location data
- Enter "4" to ingest the Weather updates data
- Enter "5" to run the Dashboard insights 

##### Dashboard Insights
![Alt text](./diagrams/dashboard.png?raw=true "Data ingest server")

## Reference
- https://www.amazon.com/Designing-Data-Intensive-Applications-Reliable-Maintainable/dp/1449373321
- https://github.com/tulios/kafkajs/issues/1040
- https://www.amazon.com/Enterprise-Integration-Patterns-Designing-Deploying/dp/0321200683
- https://www.amazon.com/Software-Architecture-Practice-3rd-Engineering/dp/0321815734
- https://www.amazon.com/Building-Event-Driven-Microservices-Leveraging-Organizational/dp/1492057894
- https://selfuel.digital/real-time-data-processing-architecture-designing/
- https://systemdesignschool.io/problems/realtime-monitoring-system/solution
- https://subhadipmitra.com/blog/2021/designing-a-real-time-data-processing-system/
