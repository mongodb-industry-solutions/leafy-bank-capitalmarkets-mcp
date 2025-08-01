# MongoDB MCP Server Demo - NextJS

A modern Next.js application demonstrating the MongoDB MCP (Model Context Protocol) Server integration with AI-powered ReAct Agent for intelligent financial data analysis.

## Features

- Real-time cryptocurrency data (BTC, ETH, XRP, SOL, DOGE, ADA) from MongoDB
- Stock market information (HYG, LQD, TLT, GLD, USO, EEM, QQQ, SPY, XLE, VNQ)
- MongoDB MCP Server integration with complete transparency
- **ReAct Agent with AWS Bedrock** - AI-powered natural language processing
- Live tool call tracking and console logs
- Beautiful UI with MongoDB Leafygreen design system

## Tech Stack

- **Next.js 14.2.30** - React framework with App Router
- **Node.js 20.19.0+** - Required for MongoDB MCP Server compatibility
- **MongoDB MCP Server** - Globally installed in Docker container
- **MongoDB MCP Server** - Direct database access through standardized protocol
- **AWS Bedrock** - AI/ML service for ReAct Agent
- **LangGraph** - Framework for building stateful, multi-actor applications
- **Leafygreen UI** - MongoDB's design system components
- **Geist Font** - Modern typography

## Prerequisites

- **Node.js 20.19.0+** (Required for MongoDB MCP Server compatibility)
- **Node.js 22.12.0+** (If using Node.js 22, must be 22.12.0 or later)
- **npm 8+** or **yarn**
- **MongoDB Atlas cluster** or self-hosted MongoDB deployment
- **AWS Account** with Bedrock access (for ReAct Agent)
- **AWS CLI** configured with SSO (for ReAct Agent)

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update with your MongoDB connection string and MCP API credentials
   - For ReAct Agent: Configure AWS SSO with `aws configure sso`

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_MCP_CONNECTION_STRING=your_mongodb_connection_string_here
NEXT_PUBLIC_MCP_API_CLIENT_ID=your_mcp_api_client_id_here
NEXT_PUBLIC_MCP_API_CLIENT_SECRET=your_mcp_api_client_secret_here
AWS_REGION=us-east-1
CHAT_COMPLETIONS_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
```

## ReAct Agent Setup

The application includes a ReAct Agent powered by AWS Bedrock that can understand natural language queries and automatically choose the right MCP tools.

### AWS SSO Configuration

1. Configure AWS SSO:
   ```bash
   aws configure sso
   ```

2. Login to AWS SSO:
   ```bash
   aws sso login --profile default
   ```

3. Verify Bedrock access:
   ```bash
   aws bedrock list-foundation-models --region us-east-1 --profile default
   ```

See `ENVIRONMENT_SETUP.md` for detailed setup instructions.

## Project Structure

```
mcp-demo-nextjs/
├── app/
│   ├── api/mcp/        # API routes for MCP server
│   ├── layout.js       # Root layout with Leafygreen provider
│   └── page.js         # Main landing page
├── components/
│   └── ChatInterface/  # Chat UI with MCP integration
├── lib/
│   ├── mcp-server.js   # MCP server manager
│   ├── react-agent.js  # ReAct Agent implementation
│   └── bedrock-client.js # AWS Bedrock integration
└── public/             # Static assets
```

## Available MCP Tools

- **find** - Query documents from MongoDB collections
- **aggregate** - Run aggregation pipelines for complex analytics
- **list-collections** - Explore available collections

## Example Queries

Try these queries in the chat interface:

### ReAct Agent Queries
- "What is the latest BTC price?"
- "Show me ETH price trend"
- "What are BTC daily statistics?"
- "Show me the latest SPY stock price"
- "What collections are available?"
- "Calculate volatility for ETH over the last 30 days"
- "Show me price trends for SPY"
- "What are the average trading volumes for QQQ?"
- "Compare the performance of GLD vs USO"
- "Compare BTC and ETH performance over the last week"

## Development

The application follows Next.js best practices:

- Server-side API routes for secure database access
- Environment variables for sensitive configuration
- Modular component structure
- Responsive design with Leafygreen components

## Docker Deployment

The application uses Docker Compose to run the MongoDB MCP Server and Next.js app as separate services:

```bash
# 1. Set up environment variables
make setup
# This creates .env file from template

# 2. Edit .env with your MongoDB credentials
nano .env  # or your preferred editor

# 3. Build and start services
make build
```

**Features:**
- **Separate Services**: MCP Server and Next.js app run in separate containers
- **Auto-start MCP Server**: The MongoDB MCP Server starts immediately when containers start
- **No waiting time**: Users can ask questions immediately without initialization delays
- **Better Reliability**: Each service can be managed independently
- **Read-only mode**: Enabled by default for security

## Other Deployment Options

This application can also be deployed to:

- Vercel (recommended)
- AWS Amplify
- Netlify

Remember to set environment variables in your deployment platform.

## License

MIT