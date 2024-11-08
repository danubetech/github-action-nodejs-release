FROM node:18-slim

# Install git and clean up apt cache to keep image size down
RUN apt-get update && \
    apt-get install -y git && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app
COPY package*.json ./
COPY src ./src
COPY entrypoint.sh ./

# Make entrypoint script executable
RUN chmod +x /app/entrypoint.sh

# Install dependencies
RUN npm ci --only=production

ENTRYPOINT ["/app/entrypoint.sh"]