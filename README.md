# Financial Data Analysis - MongoDB MCP Server Demo

A real-time chat application that demonstrates the power of the **MongoDB MCP Server** by enabling natural language queries to financial data stored in MongoDB Atlas.

## 🎯 **Demo Purpose**

This application showcases how **Model Context Protocol (MCP)** enables AI assistants to directly interact with databases through standardized tools, without requiring direct database client connections or complex query building.

## 🚀 **Key Features**

### ✅ **Pure MCP Protocol Implementation**
- **NO MongoDB client connections** - Uses only MCP protocol
- **JSON-RPC communication** with MongoDB MCP Server
- **Real-time tool calling** with live status tracking
- **Transparent MCP communication** logs

### ✅ **Natural Language Interface**
- **Ask questions in plain English** about financial data
- **Automatic tool selection** based on question content
- **Smart response parsing** with fallback to raw data
- **Multiple data types** support (BTC, stocks, collections)

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
```

### **No Direct Database Connections**
- ✅ Uses **MCP protocol only**
- ❌ No `mongodb` npm package
- ❌ No `MongoClient` connections
- ❌ No direct database queries

## 📊 **Supported Queries**

### **Cryptocurrency Data**
- `"What is the latest BTC price?"` → Uses `find` tool
- `"BTC daily statistics"` → Uses `aggregate` tool
- `"Bitcoin price today"` → Uses `find` tool

### **Stock Data**
- `"Show me Apple stock price"` → Uses `find` tool
- `"EEM stock price"` → Uses `find` tool
- `"AAPL latest price"` → Uses `find` tool

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

### **Response Handling**
- **Multiple response types** support (find, aggregate, list-collections)
- **MongoDB extended JSON** format handling
- **Graceful parsing** with fallback to raw display
- **Real-time status updates** in UI

### **Tool Call Tracking**
- **Unique call IDs** for each MCP tool invocation
- **Status tracking** (executing → completed/error)
- **Parameter logging** for transparency
- **Timing information** for performance monitoring

## 🚀 **Quick Start**

### **Prerequisites**
- Node.js 16+ installed
- Access to MongoDB Atlas cluster
- MongoDB MCP Server credentials

### **Installation**
```bash
cd demo-app
npm install
```

### **Configuration**
The app uses the same MongoDB MCP Server configuration as your Cursor IDE:
- Connection string: `mongodb+srv://fsi-demos:...@ist-shared.n0kts.mongodb.net/agentic_capital_markets`
- Read-only mode enabled for safety
- Atlas API credentials for enhanced functionality

### **Running the Demo**
```bash
npm start
```

Open `http://localhost:3000` in your browser.

## 📡 **API Endpoints**

### **POST /api/ask**
Ask questions about financial data using natural language.

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
  "answer": "The latest BTC price is $119,415.55 as of 7/28/2025, 1:59:00 AM.",
  "toolUsed": "find",
  "data": [{"symbol": "BTC", "close": 119415.55, "timestamp": {...}}],
  "rawResponse": [...],
  "parsingSuccessful": true,
  "note": "This response was generated using the real MongoDB MCP Server"
}
```

### **GET /api/tool-calls**
Get real-time information about MCP tool calls.

### **GET /api/console-logs**
Get MCP server communication logs.

### **GET /api/health**
Health check with MCP server status.

## 🎯 **Demo Scenarios**

### **Scenario 1: Basic Price Query**
1. Ask: `"What is the latest BTC price?"`
2. Watch MCP tool call execute in real-time
3. See parsed answer + raw MCP response
4. Observe console logs showing the communication

### **Scenario 2: Complex Aggregation**
1. Ask: `"BTC daily statistics"`
2. Watch `aggregate` tool call with pipeline
3. See formatted statistics + raw data
4. Monitor performance in console logs

### **Scenario 3: Database Exploration**
1. Ask: `"What collections are available?"`
2. See `list-collections` tool in action
3. View available database collections
4. Understand MCP tool capabilities

## 🔍 **Educational Value**

This demo demonstrates:

### **MCP Protocol Benefits**
- **Standardized tool interface** for database access
- **No direct database dependencies** in applications
- **Real-time communication** with database servers
- **Transparent tool calling** for debugging

### **AI Assistant Capabilities**
- **Natural language to database queries** conversion
- **Intelligent tool selection** based on context
- **Robust error handling** with fallback options
- **Real-time status updates** for user feedback

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

## 📈 **Performance Monitoring**

- **Tool call timing** - Track MCP server performance
- **Response parsing** - Monitor success rates
- **Error tracking** - Identify issues quickly
- **Real-time statistics** - Live performance dashboard

## 🔄 **Future Enhancements**

- **Additional MCP tools** support (count, db-stats, etc.)
- **More data sources** (stocks, crypto, news)
- **Advanced query parsing** for complex questions
- **User authentication** and personalization
- **Export capabilities** for analysis results

## 📝 **Troubleshooting**

See [TROUBLESHOOTING.md](./TROUBLESHOOTING.md) for common issues and solutions.

## 🤝 **Contributing**

This demo is designed to showcase MongoDB MCP Server capabilities. Contributions that improve the educational value or demonstrate additional MCP features are welcome.

## 📄 **License**

This project is for educational and demonstration purposes. 