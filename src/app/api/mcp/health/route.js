import { NextResponse } from 'next/server';
import { MCPServerManager } from '@/lib/mcp-server';
import { getOrCreateGlobalMCPServer } from '@/lib/global-mcp-store';

export async function GET() {
  try {
    const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
    
    if (!mcpServer) {
      return NextResponse.json({
        status: 'unavailable',
        timestamp: new Date().toISOString(),
        mcpServer: 'not available',
        note: 'MCP Server initialization failed'
      });
    }
    
    const healthStatus = mcpServer.getHealthStatus();
    return NextResponse.json(healthStatus);
  } catch (error) {
    console.error('Error getting health status:', error);
    return NextResponse.json({
      status: 'error',
      timestamp: new Date().toISOString(),
      mcpServer: 'error',
      error: error.message,
      note: 'Error occurred while getting health status'
    }, { status: 500 });
  }
}