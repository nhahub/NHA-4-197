# --- STAGE 1: Build the Next.js Frontend ---
FROM node:20-alpine AS frontend-builder
WORKDIR /app/frontend
COPY GreenCycle/frontend/package*.json ./
RUN npm ci
COPY GreenCycle/frontend/ ./
ARG NEXT_PUBLIC_API_URL
ENV NEXT_PUBLIC_API_URL=${NEXT_PUBLIC_API_URL:-http://localhost:8000}
RUN npm run build

# --- STAGE 2: Final Run Image (Python + Node.js) ---
FROM python:3.11-slim AS runner

# Install Node.js inside the Python runner container
RUN apt-get update && apt-get install -y curl && \
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash - && \
    apt-get install -y nodejs && \
    apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy and install Backend dependencies
COPY GreenCycle/backend/requirements.txt ./backend/
RUN pip install --no-cache-dir -r ./backend/requirements.txt

# Copy Backend source code
COPY GreenCycle/backend/ ./backend/

# Copy Frontend built assets and package config from builder stage
COPY --from=frontend-builder /app/frontend/package*.json ./frontend/
COPY --from=frontend-builder /app/frontend/next.config.js ./frontend/
COPY --from=frontend-builder /app/frontend/.next ./frontend/.next
COPY --from=frontend-builder /app/frontend/node_modules ./frontend/node_modules

# Copy startup script
COPY start.sh ./
RUN chmod +x start.sh

# Expose ports (3000 for frontend, 8000 for backend)
EXPOSE 3000
EXPOSE 8000

CMD ["./start.sh"]
