# Using Node.js 20.19.0+ for MongoDB MCP Server compatibility
# Based on MongoDB MCP Server documentation requirements
FROM node:20.19-alpine
WORKDIR /app

# Install MongoDB MCP Server globally.
# Pinned deliberately — never float this back to @latest. v2.0.0 made
# `connectionId` a required arg on every database tool, which silently broke
# every query on the first rebuild after its release. lib/mcp-server.js sends
# the `preconfigured` id to match this major; changing this pin means changing
# that call site too.
RUN npm install -g mongodb-mcp-server@2.0.0

# Copy package files and install dependencies
COPY src/package*.json ./
RUN npm install --legacy-peer-deps && npm install sharp

# Copy source code
COPY src/ ./
RUN npm run build

# Expose port
EXPOSE 8080

# Start Next.js app (MCP server will be spawned by the app when needed)
CMD ["npm", "run", "start"]
