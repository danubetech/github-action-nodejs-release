FROM node:18-slim

WORKDIR /app
COPY package*.json ./
COPY src ./src

RUN npm ci --only=production

ENTRYPOINT ["node", "/app/src/index.js"]