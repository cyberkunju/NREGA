FROM node:18-alpine

WORKDIR /app

# Copy package files first (for better caching)
COPY package*.json ./

# Install dependencies (this layer will be cached if package.json doesn't change)
RUN npm ci && \
    npm cache clean --force

# Copy application code (excluding node_modules via .dockerignore)
COPY . .

# Expose port
EXPOSE 3001

# Start the application
CMD ["npm", "run", "dev"]
