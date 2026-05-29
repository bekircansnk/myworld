# app/web/Dockerfile
FROM node:20-alpine

# Install libc6-compat for Next.js compatibility on alpine
RUN apk add --no-cache libc6-compat

WORKDIR /app

# Copy dependency configs
COPY package*.json ./

# Install dependencies (ignoring scripts if capacitor/native scripts trigger and fail)
RUN npm install

# Copy rest of the application
COPY . .

# Expose Next.js port
EXPOSE 3000

# Start in development mode (supports turbopack hot reload in docker volumes)
CMD ["npm", "run", "dev"]
