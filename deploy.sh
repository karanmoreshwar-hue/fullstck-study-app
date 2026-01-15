#!/bin/bash

# Ensure Docker is running
if ! docker info > /dev/null 2>&1; then
  echo "Error: Docker is not running."
  exit 1
fi

echo "🚀 Deploying Full Stack Application..."

# Build and start containers
# --build ensures we pick up latest changes
docker-compose up -d --build

echo ""
echo "✅ Application deployed successfully!"
echo "------------------------------------"
echo "Frontend: http://localhost:5173"
echo "Backend:  http://localhost:8000"
echo "------------------------------------"
echo "Logs: docker-compose logs -f"
