# Expo dev server — connects via Expo Go on a physical device
FROM node:20-alpine
WORKDIR /app

# Install dependencies first (layer cache)
COPY package*.json ./
RUN npm install

COPY . .

# Metro bundler (8081) + Expo Go connection (19000)
EXPOSE 8081 19000

# LAN mode so the QR code uses the host machine IP — works with Expo Go on device
CMD ["npx", "expo", "start", "--host", "lan"]
