import { NextResponse } from 'next/server';
import { MCPServerManager } from '@/lib/mcp-server';
import { getOrCreateGlobalMCPServer } from '@/lib/global-mcp-store';

export async function GET() {
  try {
    const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
    
    if (!mcpServer) {
      return NextResponse.json({
        logs: [],
        totalLogs: 0,
        stats: { info: 0, notifications: 0, errors: 0, success: 0 },
        note: 'MCP Server initialization failed'
      });
    }
    
    const consoleLogs = mcpServer.getConsoleLogs();
    return NextResponse.json(consoleLogs);
  } catch (error) {
    console.error('Error getting console logs:', error);
    return NextResponse.json({
      logs: [],
      totalLogs: 0,
      stats: { info: 0, notifications: 0, errors: 0, success: 0 },
      error: error.message,
      note: 'Error occurred while getting console logs'
    }, { status: 500 });
  }
}