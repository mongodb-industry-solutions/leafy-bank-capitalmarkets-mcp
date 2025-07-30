import { NextResponse } from 'next/server';
import { getMCPServer } from '@/lib/mcp-server';

export async function GET() {
  try {
    const mcpServer = await getMCPServer();
    
    // Handle case where MCP server is not available (e.g., during build)
    if (!mcpServer) {
      return NextResponse.json({
        count: 0,
        tools: [],
        note: 'MCP Server not available during build process'
      });
    }
    
    const tools = mcpServer.availableTools;
    return NextResponse.json({
      count: tools.length,
      tools: tools
    });
  } catch (error) {
    console.error('Error getting available tools:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}