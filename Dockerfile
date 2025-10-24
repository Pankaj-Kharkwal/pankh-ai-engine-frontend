# Minimal build for development
FROM node:22-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package.json ./

# Install dependencies (with optional dependencies for platform-specific modules)
RUN npm install --legacy-peer-deps

# Copy source code AFTER npm install (exclude node_modules via .dockerignore)
COPY . .

# Expose port
EXPOSE 3000

# Start development server
CMD ["npm", "run", "dev", "--", "--host", "0.0.0.0"]
