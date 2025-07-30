# Using Node.js 20.19.0+ for MongoDB MCP Server compatibility
# Based on MongoDB MCP Server documentation requirements
FROM node:20.19-alpine
WORKDIR /app

# Install MongoDB MCP Server globally
RUN npm install -g mongodb-mcp-server@latest

# Copy package files and install dependencies
COPY src/package*.json ./
RUN npm install --legacy-peer-deps

# Copy source code
COPY src/ ./
RUN npm run build

# Expose port
EXPOSE 3000

# Start Next.js app (MCP server will be spawned by the app when needed)
CMD ["npm", "run", "start"]
