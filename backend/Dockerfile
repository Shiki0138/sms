FROM node:18-alpine

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install production dependencies
RUN npm ci --production || npm install express cors bcryptjs jsonwebtoken firebase-admin

# Copy server files
COPY src/firestore-server.js ./src/
COPY src/simple-server.js ./src/
COPY src/test-server.js ./src/

# Expose port
EXPOSE 8080

# Start server
CMD ["node", "src/test-server.js"]