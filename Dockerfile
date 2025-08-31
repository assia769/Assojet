FROM node:18-alpine

WORKDIR /app

# Copy package files first for better caching
COPY backend/package*.json ./

# Install dependencies
RUN npm install

# Copy the rest of the backend code
COPY backend/ .

# Expose the port
EXPOSE 3000

# Start the application
CMD ["npm", "start"]