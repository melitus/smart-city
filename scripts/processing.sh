#!/bin/bash

# Define variables
IMAGE_NAME="data-processing-service"
CONTAINER_NAME="data-processing-service"
DOCKERFILE="Dockerfile.processing"
ENV_FILE=".env"

# Stop and remove any existing container
echo "Stopping any existing $CONTAINER_NAME container..."
sudo docker stop $CONTAINER_NAME 2>/dev/null || true
sudo docker rm $CONTAINER_NAME 2>/dev/null || true

# Build the Docker image
echo "Building Docker image: $IMAGE_NAME..."
sudo docker build -t $IMAGE_NAME -f $DOCKERFILE .

# Run the Docker container with environment variables
echo "Running Docker container: $CONTAINER_NAME..."
sudo docker run --env-file $ENV_FILE --rm -it --name $CONTAINER_NAME $IMAGE_NAME
