# MongoDB MCP Server Demo - NextJS

A modern Next.js application demonstrating the MongoDB MCP (Model Context Protocol) Server integration with financial data analysis capabilities.

## Features

- Real-time cryptocurrency data (BTC, ETH) from MongoDB
- Stock market information (AAPL, EEM)
- MongoDB MCP Server integration with complete transparency
- Live tool call tracking and console logs
- Beautiful UI with MongoDB Leafygreen design system

## Tech Stack

- **Next.js 14.2.30** - React framework with App Router
- **Node.js 20.19.0+** - Required for MongoDB MCP Server compatibility
- **MongoDB MCP Server** - Globally installed in Docker container
- **MongoDB MCP Server** - Direct database access through standardized protocol
- **Leafygreen UI** - MongoDB's design system components
- **Geist Font** - Modern typography

## Prerequisites

- **Node.js 20.19.0+** (Required for MongoDB MCP Server compatibility)
- **Node.js 22.12.0+** (If using Node.js 22, must be 22.12.0 or later)
- **npm 8+** or **yarn**
- **MongoDB Atlas cluster** or self-hosted MongoDB deployment

## Setup

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   - Copy `.env.local.example` to `.env.local`
   - Update with your MongoDB connection string and MCP API credentials

4. Run the development server:
   ```bash
   npm run dev
   ```

5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Environment Variables

Create a `.env.local` file with:

```env
NEXT_PUBLIC_MCP_CONNECTION_STRING=your_mongodb_connection_string
NEXT_PUBLIC_MCP_API_CLIENT_ID=your_NEXT_PUBLIC_MCP_API_CLIENT_ID
NEXT_PUBLIC_MCP_API_CLIENT_SECRET=your_NEXT_PUBLIC_MCP_API_CLIENT_SECRET
```

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
│   └── question-processor.js # Natural language processing
└── public/             # Static assets
```

## Available MCP Tools

- **find** - Query documents from MongoDB collections
- **aggregate** - Run aggregation pipelines for complex analytics
- **list-collections** - Explore available collections

## Example Queries

Try these queries in the chat interface:

- "What is the latest BTC price?"
- "Show me ETH price trend"
- "What are BTC daily statistics?"
- "Show me the latest AAPL stock price"
- "What collections are available?"

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