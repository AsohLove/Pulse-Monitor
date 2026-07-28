# Lightweight Node image
FROM node:24-alpine

# Install only what we need
RUN apk add --no-cache postgresql-client

# Application directory
WORKDIR /app

# Copy dependency files first (better Docker layer caching)
COPY package*.json ./

# Install production dependencies only
RUN npm ci --omit=dev

# Copy the rest of the application
COPY . .

# Make entrypoint executable
RUN chmod +x docker-entrypoint.sh

# Application port
EXPOSE 3000

# Start using our entrypoint
ENTRYPOINT ["./docker-entrypoint.sh"]