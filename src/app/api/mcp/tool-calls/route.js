import { NextResponse } from 'next/server';
import { MCPServerManager } from '@/lib/mcp-server';
import { getOrCreateGlobalMCPServer } from '@/lib/global-mcp-store';

// Mark this route as dynamic to prevent static rendering
export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
    
    if (!mcpServer) {
      return NextResponse.json({
        totalCalls: 0,
        recentCalls: [],
        stats: { completed: 0, executing: 0, error: 0 },
        note: 'MCP Server initialization failed'
      });
    }
    
    const toolCalls = mcpServer.getToolCalls();
    return NextResponse.json(toolCalls);
  } catch (error) {
    console.error('Error getting tool calls:', error);
    return NextResponse.json({
      totalCalls: 0,
      recentCalls: [],
      stats: { completed: 0, executing: 0, error: 0 },
      error: error.message,
      note: 'Error occurred while getting tool calls'
    }, { status: 500 });
  }
}