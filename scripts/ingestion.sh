#!/bin/bash

# Define variables
IMAGE_NAME="smart-city-data-ingestion-server"
CONTAINER_NAME="smart-city-data-ingestion-server"
PORT="3000"
ENV_FILE=".env"
DOCKERFILE="Dockerfile.ingestion"

echo "🚀 Building the Docker image..."
sudo docker build -t $IMAGE_NAME -f $DOCKERFILE .

echo "🔄 Stopping and removing existing container (if running)..."
sudo docker stop $CONTAINER_NAME 2>/dev/null && docker rm $CONTAINER_NAME 2>/dev/null

echo "🐳 Running the Docker container..."
sudo docker run --env-file $ENV_FILE --rm -it --name $CONTAINER_NAME $IMAGE_NAME
