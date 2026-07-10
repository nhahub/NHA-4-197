#!/bin/sh

# Start backend in the background
echo "Starting FastAPI backend on port 8000..."
cd /app/backend
uvicorn main:app --host 0.0.0.0 --port 8000 &

# Start frontend in the foreground
echo "Starting Next.js frontend on port 3000..."
cd /app/frontend
npm start
