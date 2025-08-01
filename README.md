# 📊 Financial Data Analysis - MongoDB MCP Server with ReAct Agent Demo

A real-time chat application that demonstrates the power of the **MongoDB MCP Server** combined with an **AI-powered ReAct Agent** to enable intelligent natural language queries to financial data stored in MongoDB Atlas.

## 🎯 **Demo Purpose**

This application showcases how **Model Context Protocol (MCP)** enables AI assistants to directly interact with databases through standardized tools, enhanced with intelligent natural language processing via AWS Bedrock and the ReAct (Reasoning and Acting) framework for financial data analysis.

## 🚀 **Key Features**

### ✅ **AI-Powered ReAct Agent**
- **Natural Language Understanding** - Ask questions in plain English
- **Intelligent Tool Selection** - Automatically chooses the right MCP tools
- **Complex Query Handling** - Can combine multiple tools for comprehensive answers
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

The ReAct Agent can handle a wide variety of natural language queries:

### **Cryptocurrency Data**
- `"What is the latest BTC price?"` → Uses `find` tool
- `"BTC daily statistics"` → Uses `aggregate` tool
- `"Bitcoin price today"` → Uses `find` tool
- `"Show me ETH price trend"` → Uses `find` tool with sorting
- `"Calculate volatility for ETH over the last 30 days"` → Uses `aggregate` tool

### **Stock Data**
- `"Show me Apple stock price"` → Uses `find` tool
- `"EEM stock price"` → Uses `find` tool
- `"AAPL latest price"` → Uses `find` tool
- `"Show me trading volume patterns for QQQ"` → Uses `aggregate` tool

### **Complex Analysis**
- `"Compare BTC and ETH performance over the last week"` → Uses multiple `aggregate` tools
- `"What are the average trading volumes for SPY?"` → Uses `aggregate` tool
- `"Show me price trends for GLD"` → Uses `find` tool with date filtering

### **Database Information**
- `"What collections are available?"` → Uses `list-collections` tool
- `"Show me database info"` → Uses `list-collections` tool

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

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+ installed
- Access to MongoDB Atlas cluster
- AWS account with Bedrock access
- AWS CLI configured with SSO

### **Installation**
```bash
cd demo-app
npm install
```

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
Create a `.env.local` file in the project root:
```bash
# MongoDB MCP Server Configuration
NEXT_PUBLIC_MCP_CONNECTION_STRING=mongodb+srv://fsi-demos:...@ist-shared.n0kts.mongodb.net/agentic_capital_markets
NEXT_PUBLIC_MCP_API_CLIENT_ID=your-api-client-id
NEXT_PUBLIC_MCP_API_CLIENT_SECRET=your-api-client-secret

# AWS Bedrock Configuration
CHAT_COMPLETIONS_MODEL_ID=anthropic.claude-3-sonnet-20240229-v1:0
AWS_REGION=us-east-1
AWS_PROFILE=default
```

### **Running the Demo**
```bash
npm start
```

Open `http://localhost:3000` in your browser.

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

### **AWS SSO Issues**
```bash
# Check SSO login status
aws sts get-caller-identity --profile default

# Re-login if needed
aws sso login --profile default

# Verify Bedrock access
aws bedrock list-foundation-models --region us-east-1 --profile default
```

### **MCP Server Issues**
- Check MongoDB Atlas connection string
- Verify API credentials are correct
- Ensure read-only mode is enabled
- Check console logs for detailed error messages

### **ReAct Agent Issues**
- Verify AWS Bedrock access and model availability
- Check SSO authentication is active
- Review system prompt configuration
- Monitor tool call execution in console logs

## 🤝 **Contributing**

This demo is designed to showcase MongoDB MCP Server capabilities with ReAct Agent integration. Contributions that improve the educational value or demonstrate additional MCP features are welcome.

## 📄 **License**

This project is for educational and demonstration purposes. 