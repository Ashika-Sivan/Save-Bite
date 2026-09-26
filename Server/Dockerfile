# Stage 1: Build environment
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies (including dev dependencies for build)
RUN npm install

# Copy source code
COPY . .

# Build the TypeScript code
RUN NODE_OPTIONS=--max-old-space-size=2048 npm run build

# Stage 2: Production environment
FROM node:20-alpine

WORKDIR /app

# Set node env to production
ENV NODE_ENV=production

# Copy package files
COPY package*.json ./

# Install ONLY production dependencies
RUN npm install --production --ignore-scripts

# Copy the built dist folder from the builder stage
COPY --from=builder /app/dist ./dist

# Expose the server port (Elastic Beanstalk / ECS maps this)
EXPOSE 5000

# Start the server
CMD ["node", "dist/server.js"]