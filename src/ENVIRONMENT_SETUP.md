# Environment Setup for React Agent

This application uses AWS SSO authentication for accessing Bedrock services, with a clean `BedrockClient` class implementation that mirrors the Python `bedrock_client.py`.

## Required Environment Variables

### MongoDB MCP Server Configuration
```bash
NEXT_PUBLIC_MCP_CONNECTION_STRING=your_mongodb_connection_string_here
NEXT_PUBLIC_MCP_API_CLIENT_ID=your_mcp_api_client_id_here
NEXT_PUBLIC_MCP_API_CLIENT_SECRET=your_mcp_api_client_secret_here
```

### AWS Bedrock Configuration
```bash
AWS_REGION=us-east-1
CHAT_COMPLETIONS_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
# AWS credentials will be picked up automatically from SSO or credentials file
```

## BedrockClient Architecture

The application uses a `BedrockClient` class (`src/lib/bedrock-client.js`) that mirrors your Python implementation:

### Key Features
- **AWS SSO Support** - Primary authentication method
- **Profile-based Authentication** - Uses AWS profiles
- **Environment Variable Fallback** - For explicit credentials
- **Connection Testing** - Built-in connectivity tests
- **Status Monitoring** - Real-time client status information
- **Dynamic Model Selection** - Uses `CHAT_COMPLETIONS_MODEL_ID` environment variable

### Authentication Flow
1. **AWS SSO Profile** (primary method)
2. **AWS Credentials File** (`~/.aws/credentials`)
3. **Environment Variables** (fallback)
4. **IAM Roles** (if running in AWS)

## AWS SSO Setup

The application is configured to use AWS SSO authentication, similar to the Python `bedrock_client.py`. 

### 1. Configure AWS SSO
```bash
# Configure AWS SSO
aws configure sso

# Set up your SSO profile (e.g., "default")
SSO start URL: [your-sso-start-url]
SSO Region: [your-sso-region]
SSO registration scopes: [your-scopes]
```

### 2. Login to AWS SSO
```bash
# Login to your SSO profile
aws sso login --profile default
```

### 3. Verify Access to Bedrock
```bash
# Test Bedrock access
aws bedrock list-foundation-models --region us-east-1 --profile default
```

## Docker Setup

The `docker-compose.yml` file is configured to mount your AWS credentials:

```yaml
volumes:
  - ~/.aws/credentials:/root/.aws/credentials:ro
  - ~/.aws/config:/root/.aws/config:ro
  - ~/.aws/sso/cache:/root/.aws/sso/cache:rw
```

This allows the container to access your AWS SSO credentials and cache.

## Setup Instructions

1. **Configure AWS SSO** (if not already done):
   ```bash
   aws configure sso
   ```

2. **Login to AWS SSO**:
   ```bash
   aws sso login --profile default
   ```

3. **Create `.env.local`** in the `src` directory with all required configuration:
   ```bash
   NEXT_PUBLIC_MCP_CONNECTION_STRING=your_mongodb_connection_string_here
   NEXT_PUBLIC_MCP_API_CLIENT_ID=your_mcp_api_client_id_here
   NEXT_PUBLIC_MCP_API_CLIENT_SECRET=your_mcp_api_client_secret_here
   AWS_REGION=us-east-1
   CHAT_COMPLETIONS_MODEL_ID=anthropic.claude-3-haiku-20240307-v1:0
   ```

4. **Start the application**:
   ```bash
   npm run dev
   ```

## Testing and Debugging

### 1. Test BedrockClient
```bash
# Run the comprehensive test script
node test-react-agent.js
```

### 2. Check BedrockClient Status
```bash
# Via API endpoint
curl http://localhost:3000/api/mcp/bedrock-status
```

### 3. Monitor BedrockClient Status
The API endpoint `/api/mcp/bedrock-status` provides:
- Client configuration status
- Connection test results
- Environment variable status
- AWS profile information
- Model ID configuration

## Testing the Setup

Once configured:

1. Navigate to the application
2. Toggle the "React Agent" button in the header
3. Ask questions about supported assets (BTC, ETH, SPY, QQQ, etc.)

## Supported Assets

The React Agent is configured to work with specific assets:

### Cryptocurrencies
- BTC, ETH, XRP, SOL, DOGE, ADA

### Stocks/ETFs
- HYG, LQD, TLT, GLD, USO, EEM, QQQ, SPY, XLE, VNQ

## Troubleshooting

### AWS SSO Issues
1. **Session expired**: Run `aws sso login --profile default`
2. **Profile not found**: Check `~/.aws/config` for profile configuration
3. **Permission denied**: Ensure your SSO profile has Bedrock access

### Bedrock Access Issues
1. **Model not available**: Check if the model specified in `CHAT_COMPLETIONS_MODEL_ID` is available in your region
2. **Access denied**: Verify Bedrock permissions in your AWS account
3. **Region issues**: Ensure `AWS_REGION` is set correctly

### BedrockClient Issues
1. **Check status**: Use `/api/mcp/bedrock-status` endpoint
2. **Test connection**: Run `node test-react-agent.js`
3. **Review logs**: Check console for detailed error messages
4. **Verify model**: Ensure `CHAT_COMPLETIONS_MODEL_ID` is set correctly

### General Issues
1. Check browser console for error messages
2. Verify MongoDB MCP Server is running
3. Ensure all environment variables are set correctly
4. Use the test script for comprehensive diagnostics

## Code Structure

```
src/lib/
├── bedrock-client.js      # BedrockClient class (mirrors Python implementation)
├── react-agent.js         # React agent using BedrockClient
├── mcp-tools.js          # MCP tools for MongoDB operations
└── mcp-server.js         # MCP server manager

test-react-agent.js        # Comprehensive test script
```

The `BedrockClient` class provides a clean, reusable interface for AWS Bedrock operations, making it easy to manage authentication and connection state across the application. All configuration is now driven by environment variables, eliminating hardcoded values. 