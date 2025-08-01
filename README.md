# 📊 Financial Data Analysis - MongoDB MCP Server Demo

A real-time chat application that demonstrates the power of the **MongoDB MCP Server** combined with an **AI-powered ReAct Agent** to enable intelligent natural language queries to financial data stored in MongoDB Atlas.

## 🚨 **IMPORTANT: Docker Required**

The application requires the `mongodb-mcp-server` npm package which is installed and configured within the Docker container. Running this locally without Docker is not supported as it would require manual installation and configuration of the MCP server dependencies.

## 🎯 **Demo Purpose**

This application showcases how **Model Context Protocol (MCP)** enables AI assistants to directly interact with databases through standardized tools, enhanced with intelligent natural language processing via AWS Bedrock and the ReAct (Reasoning and Acting) framework for financial data analysis.

## 📋 **Demo Limitations**

This is a **demonstration application** with the following constraints:

### **Read-Only Operations**
- Only `find`, `aggregate`, and `list-collections` operations are supported
- No create, update, or delete operations for security
- Limited to querying existing financial time series data

### **Supported Assets Only**
- **Cryptocurrencies**: BTC, ETH, XRP, SOL, DOGE, ADA (in `binanceCryptoData` collection)
- **Stocks/ETFs**: HYG, LQD, TLT, GLD, USO, EEM, QQQ, SPY, XLE, VNQ (in `yfinanceMarketData` collection)
- Only these specific symbols can be queried from the provided sample data

### **Basic Calculations Only**
- Simple aggregations (averages, sums, counts)
- Price trends and comparisons
- **NOT supported**: Complex calculations like volatility, moving averages, RSI, technical indicators

### **Time Range Limits**
- Default: Last 7 days when not specified
- Maximum: 60 days (8 weeks or 2 months)
- All prices rounded to 2 decimal places

## 🚀 **Key Features**

### ✅ **AI-Powered ReAct Agent**
- **Natural Language Understanding** - Ask questions in plain English
- **Intelligent Tool Selection** - Automatically chooses the right MCP tools
- **AWS Bedrock Integration** - Powered by Claude models via SSO authentication
- **Real-time Tool Tracking** - See exactly which tools are used for each query

### ✅ **Pure MCP Protocol Implementation**
- **NO MongoDB client connections** - Uses only MCP protocol
- **JSON-RPC communication** with MongoDB MCP Server
- **Real-time tool calling** with live status tracking
- **Transparent MCP communication** logs

### ✅ **Real-time Monitoring**
- **Live MCP tool calls** tracking with status updates
- **Console logs panel** showing all MCP communication
- **Statistics dashboard** for calls and logs
- **Auto-refresh** every 2 seconds

### ✅ **Robust Response Handling**
- **Always shows raw MCP response** for transparency
- **Attempts to parse when possible** for user-friendly display
- **Graceful fallback** when parsing fails
- **Educational value** - see exactly what MCP returns

## 🛠 **Architecture**

```
┌─────────────────┐    JSON-RPC    ┌──────────────────┐    MongoDB    ┌─────────────────┐
│   Web UI        │ ◄────────────► │  MCP Server      │ ◄────────────► │  MongoDB Atlas  │
│   (Chat)        │                │  (Child Process) │                │  (Database)     │
└─────────────────┘                └──────────────────┘                └─────────────────┘
         │                                   │
         │                                   │
         ▼                                   ▼
┌─────────────────┐                ┌──────────────────┐
│  ReAct Agent    │                │  Tool Tracking   │
│  (AWS Bedrock)  │                │  & Logging       │
└─────────────────┘                └──────────────────┘
```

### **No Direct Database Connections**
- ✅ Uses **MCP protocol only**
- ✅ **ReAct Agent** for intelligent query processing
- ❌ No `mongodb` npm package
- ❌ No `MongoClient` connections
- ❌ No direct database queries

## 📊 **Supported Queries**

The ReAct Agent can handle these specific query patterns:

### **1. List Collections**
- `"List collections in the database"`
- Shows all available collections
- Explains that only `yfinanceMarketData` and `binanceCryptoData` support queries

### **2. Latest Prices**
- `"What is the latest available BTC close price?"`
- `"What is the latest available GLD close price?"`
- Returns the most recent closing price for any supported asset

### **3. Price Trends**
- `"Show me price trends for ETH over the last 7 days"`
- `"Show me price trends for GLD"`
- Displays daily price averages over the specified period

### **4. Volume Analysis**
- `"What are the average trading volumes for SPY on the last 7 days?"`
- Calculates average trading volumes for the period

### **5. Price Comparisons**
- `"Compare BTC and ETH prices over the last week"`
- Shows price ranges and comparisons between two assets

### **Important Notes:**
- All queries must use the **exact asset symbols** listed in limitations
- Time ranges default to 7 days if not specified
- Maximum time range is 60 days
- All prices are rounded to 2 decimal places

## 🎨 **User Interface**

### **Chat Panel (Left)**
- **Natural language input** with suggestion chips
- **Real-time responses** with tool usage indicators
- **Parsed data display** when available
- **Raw MCP response** for transparency

### **MCP Tool Calls Panel (Top Right)**
- **Live tool call tracking** with status indicators
- **Call parameters** display
- **Timing information** (start/completion)
- **Statistics summary** (completed/executing/errors)

### **MCP Console Logs Panel (Bottom Right)**
- **Real-time MCP communication** logs
- **Color-coded entries** (info/notifications/success/errors)
- **Raw JSON-RPC messages** for debugging
- **Auto-scrolling** to latest entries

## 🔧 **Technical Implementation**

### **AWS Bedrock Client**
The application uses a `BedrockClient` class that:
- Supports AWS SSO authentication (primary method)
- Falls back to AWS credentials file or environment variables
- Automatically picks up credentials from the mounted `~/.aws` directory
- Uses the model specified in `CHAT_COMPLETIONS_MODEL_ID`

### **ReAct Agent Integration**
```javascript
// Create ReAct agent with MCP tools
const agent = createReactAgent({
  llm: bedrockClient,
  tools: mcpTools,
  systemMessage: systemPrompt,
});

// Process user question
const stream = await agent.stream({
  messages: [new HumanMessage({ content: userQuestion })],
});
```

### **MCP Server Communication**
```javascript
// Spawn MongoDB MCP Server process
mcpProcess = spawn('npx', [
  '-y', 'mongodb-mcp-server',
  '--connectionString', 'mongodb+srv://...',
  '--readOnly'
]);

// Send JSON-RPC request
const request = {
  jsonrpc: '2.0',
  id: mcpMessageId++,
  method: 'tools/call',
  params: { name: 'find', arguments: params }
};
mcpProcess.stdin.write(JSON.stringify(request) + '\n');
```

### **Tool Call Tracking**
- **Unique call IDs** for each MCP tool invocation
- **Status tracking** (executing → completed/error)
- **Parameter logging** for transparency
- **Timing information** for performance monitoring

## 🚀 **Quick Start with Docker**

### **Prerequisites**
- Docker and Docker Compose installed
- MongoDB Atlas cluster with database created
- AWS account with Bedrock access
- AWS CLI configured with SSO on your host machine

### **MongoDB Data Setup**

This demo requires financial time series data to be loaded into your MongoDB database. Sample data files are provided in the `src/public` directory:

- **`binanceCryptoData.json`** - cryptocurrency OHLCV data (BTC, ETH, XRP, SOL, DOGE, ADA)
- **`yfinanceMarketData.json`** - stock/ETF OHLCV data (HYG, LQD, TLT, GLD, USO, EEM, QQQ, SPY, XLE, VNQ)

#### **Import Data to MongoDB Atlas**

1. **Using MongoDB Compass or mongosh:**
```bash
# Import crypto data
mongoimport --uri "mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_NAME>.mongodb.net/<DATABASE_NAME>" \
  --collection binanceCryptoData \
  --file src/public/binanceCryptoData.json \
  --jsonArray

# Import stock data
mongoimport --uri "mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_NAME>.mongodb.net/<DATABASE_NAME>" \
  --collection yfinanceMarketData \
  --file src/public/yfinanceMarketData.json \
  --jsonArray
```

2. **Or use MongoDB Atlas UI:**
   - Navigate to your cluster in MongoDB Atlas
   - Click on "Collections"
   - Create two collections: `binanceCryptoData` and `yfinanceMarketData`
   - Use the "Import Data" feature to upload the JSON files

**Important**: The demo will only work with these exact collection names as they are hardcoded in the React Agent.

#### **Data Structure**

Both collections follow the OHLCV (Open, High, Low, Close, Volume) format:
```json
{
  "_id": "ObjectId",
  "symbol": "BTC",              // Asset symbol
  "timestamp": "2025-07-01T00:00:00Z",  // ISO timestamp
  "open": 65432.10,            // Opening price
  "high": 65500.00,            // Highest price
  "low": 65400.00,             // Lowest price
  "close": 65450.25,           // Closing price
  "volume": 12345.67           // Trading volume
}
```

### **Why Docker?**
The MongoDB MCP Server (`mongodb-mcp-server`) is a specialized npm package that:
- Implements the Model Context Protocol for MongoDB
- Requires specific Node.js runtime configuration
- Needs proper process management for spawning and communication
- Is pre-installed and configured in the Docker image

Without Docker, you would need to manually install and configure the MCP server, which is not supported for this demo.

### **AWS SSO Authentication Setup**

#### **1. Configure AWS SSO**
```bash
# Configure AWS SSO
aws configure sso

# Enter the following information when prompted:
# SSO start URL: https://your-sso-portal.awsapps.com/start
# SSO Region: us-east-1 (or your preferred region)
# Account ID: your-aws-account-id
# Role name: your-role-name
# CLI default client Region: us-east-1 (or your preferred region)
# CLI default output format: json
```

#### **2. Login to AWS SSO**
```bash
# Login to AWS SSO
aws sso login --profile default

# This will open a browser window for authentication
# Complete the SSO login process
```

#### **3. Verify Bedrock Access**
```bash
# Test Bedrock access
aws bedrock list-foundation-models --region us-east-1 --profile default

# You should see a list of available models including Claude
```

#### **4. Set Environment Variables**
Create a `.env` file in the project root:
```bash
# MongoDB MCP Server Configuration
NEXT_PUBLIC_MCP_CONNECTION_STRING=mongodb+srv://<USERNAME>:<PASSWORD>@<CLUSTER_NAME>.mongodb.net/<DATABASE_NAME>
NEXT_PUBLIC_MCP_API_CLIENT_ID=<YOUR_API_CLIENT_ID>
NEXT_PUBLIC_MCP_API_CLIENT_SECRET=<YOUR_API_CLIENT_SECRET>
# AWS Bedrock Configuration
NEXT_PUBLIC_AWS_REGION=us-east-1
NEXT_PUBLIC_CHAT_COMPLETIONS_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

Replace the placeholders:
- `<USERNAME>`: Your MongoDB Atlas username
- `<PASSWORD>`: Your MongoDB Atlas password
- `<CLUSTER_NAME>`: Your MongoDB Atlas cluster name
- `<DATABASE_NAME>`: Your database name (e.g., `financial_data`)
- `<YOUR_API_CLIENT_ID>`: Your API client ID
- `<YOUR_API_CLIENT_SECRET>`: Your API client secret

### **Running the Demo with Docker**

#### **1. Clone the Repository**
```bash
git clone <repository-url>
cd leafy-bank-capitalmarkets-mcp
```

#### **2. Configure Environment Variables**
Create a `.env` file in the project root (NOT in the src directory):
```bash
# MongoDB MCP Server Configuration
NEXT_PUBLIC_MCP_CONNECTION_STRING=mongodb+srv://username:password@cluster.mongodb.net/database
NEXT_PUBLIC_MCP_API_CLIENT_ID=your-api-client-id
NEXT_PUBLIC_MCP_API_CLIENT_SECRET=your-api-client-secret

# AWS Bedrock Configuration
CHAT_COMPLETIONS_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
AWS_REGION=us-east-1
AWS_PROFILE=default
```

#### **3. Build and Run with Docker Compose**
```bash
# Build the Docker image
make build

# Start the application
make up

# Or use docker-compose directly
docker-compose up --build
```

#### **4. Access the Application**
Open `http://localhost:3000` in your browser.

#### **5. Stop the Application**
```bash
# Stop the containers
make down

# Or use docker-compose directly
docker-compose down
```

### **Docker Configuration Details**

The `docker-compose.yml` file:
- Mounts your AWS credentials for SSO authentication
- Installs the `mongodb-mcp-server` package
- Configures the Node.js environment
- Exposes port 3000 for the web interface

**Important**: The application runs entirely within Docker. Do not attempt to run `npm install` or `npm start` locally.

## 📡 **API Endpoints**

### **POST /api/mcp/react-agent**
Process questions using the ReAct agent.

**Request:**
```json
{
  "question": "What is the latest BTC price?"
}
```

**Response:**
```json
{
  "success": true,
  "question": "What is the latest BTC price?",
  "toolCalls": [
    {
      "name": "mcp_find",
      "arguments": {
        "database": "agentic_capital_markets",
        "collection": "binanceCryptoData",
        "filter": { "symbol": "BTC" },
        "projection": { "symbol": 1, "close": 1, "timestamp": 1, "_id": 0 },
        "sort": { "timestamp": -1 },
        "limit": 1
      }
    }
  ],
  "toolResults": [
    {
      "tool": "mcp_find",
      "arguments": {...},
      "result": {...}
    }
  ],
  "finalAnswer": "The latest BTC price is $119,415.55 as of 7/28/2025, 1:59:00 AM.",
  "timestamp": "2025-07-31T09:46:11.000Z",
  "status": {
    "health": {...},
    "toolCalls": {...},
    "consoleLogs": {...},
    "availableTools": [...]
  }
}
```

### **GET /api/mcp/tool-calls**
Get real-time information about MCP tool calls.

### **GET /api/mcp/console-logs**
Get MCP server communication logs.

### **GET /api/mcp/health**
Health check with MCP server status.

## 🎯 **Demo Scenarios**

### **Scenario 1: Basic Price Query**
1. Ask: `"What is the latest BTC price?"`
2. Watch ReAct Agent analyze the question
3. See MCP tool call execute in real-time
4. View parsed answer + raw MCP response
5. Observe console logs showing the communication

### **Scenario 2: Complex Aggregation**
1. Ask: `"Calculate volatility for ETH over the last 30 days"`
2. Watch ReAct Agent choose the `aggregate` tool
3. See complex aggregation pipeline in action
4. View formatted statistics + raw data
5. Monitor performance in console logs

### **Scenario 3: Multi-Tool Analysis**
1. Ask: `"Compare BTC and ETH performance over the last week"`
2. Watch ReAct Agent make multiple tool calls
3. See data from both cryptocurrencies
4. View comprehensive comparison analysis
5. Understand how ReAct Agent combines tools

### **Scenario 4: Database Exploration**
1. Ask: `"What collections are available?"`
2. See ReAct Agent choose `list-collections` tool
3. View available database collections
4. Understand MCP tool capabilities

## 🔍 **Educational Value**

This demo demonstrates:

### **ReAct Agent Benefits**
- **Natural language to database queries** conversion
- **Intelligent tool selection** based on context
- **Complex query decomposition** into multiple tool calls
- **Real-time reasoning and acting** process

### **MCP Protocol Benefits**
- **Standardized tool interface** for database access
- **No direct database dependencies** in applications
- **Real-time communication** with database servers
- **Transparent tool calling** for debugging

### **Production Readiness**
- **Read-only mode** for safety
- **Process lifecycle management**
- **Comprehensive logging** and monitoring
- **Graceful error handling**

## 🛡 **Security Features**

- **Read-only database access** - No write operations
- **Process isolation** - MCP server runs in separate process
- **No direct credentials** in application code
- **Timeout protection** - Prevents hanging requests
- **AWS SSO authentication** - Secure access to Bedrock

## 📈 **Performance Monitoring**

- **Tool call timing** - Track MCP server performance
- **ReAct Agent response time** - Monitor AI processing speed
- **Response parsing** - Monitor success rates
- **Error tracking** - Identify issues quickly
- **Real-time statistics** - Live performance dashboard

## 🔄 **Future Enhancements**

- **Additional MCP tools** support (db-stats, etc.)
- **More data sources** (stocks, crypto, news)
- **Advanced query parsing** for complex questions
- **User authentication** and personalization
- **Export capabilities** for analysis results
- **Custom ReAct Agent prompts** for specific domains

## 📝 **Troubleshooting**

### **Docker Issues**
```bash
# Check if containers are running
docker ps

# View container logs
docker logs leafy-bank-capitalmarkets-mcp-app-1

# Rebuild if needed
docker-compose down
docker-compose build --no-cache
docker-compose up
```

### **AWS SSO Issues**
```bash
# On your HOST machine (not in Docker):
# Check SSO login status
aws sts get-caller-identity --profile default

# Re-login if needed
aws sso login --profile default

# Verify Bedrock access
aws bedrock list-foundation-models --region us-east-1 --profile default
```

**Note**: AWS credentials are mounted from your host machine into the Docker container. Ensure you're logged in via SSO on your host before starting Docker.

### **MCP Server Issues**
- **Connection refused**: Check MongoDB Atlas connection string in `.env`
- **Authentication failed**: Verify API credentials are correct
- **No data returned**: Ensure you're querying supported assets only
- **Check logs**: Use `docker logs` to see detailed MCP server output

### **Common Docker Problems**
- **Port already in use**: Another service is using port 3000
- **Permission denied**: Check Docker daemon is running
- **AWS credentials not found**: Ensure `~/.aws` directory exists on host
- **Environment variables not loaded**: Check `.env` file is in project root

## 🤝 **Contributing**

This demo is designed to showcase MongoDB MCP Server capabilities with ReAct Agent integration. Contributions that improve the educational value or demonstrate additional MCP features are welcome.

## 📄 **License**

This project is for educational and demonstration purposes. 