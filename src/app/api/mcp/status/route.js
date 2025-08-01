import { NextResponse } from 'next/server';
import { getOrCreateGlobalMCPServer, resetGlobalMCPServer } from '@/lib/global-mcp-store';
import { MCPServerManager } from '@/lib/mcp-server';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const reset = searchParams.get('reset');
    
    // If reset parameter is provided, reset the MCP server
    if (reset === 'true') {
      console.log('🔄 Resetting MCP Server for fresh demo...');
      resetGlobalMCPServer();
    }
    
    // Get MCP server instance
    const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
    
    if (!mcpServer) {
      return NextResponse.json({
        health: { status: 'unavailable', message: 'MCP Server not available' },
        toolCalls: { totalCalls: 0, recentCalls: [] },
        consoleLogs: { totalLogs: 0, logs: [] },
        availableTools: []
      });
    }
    
    // Get status data
    const healthStatus = mcpServer.getHealthStatus();
    const toolCalls = mcpServer.getToolCalls();
    const consoleLogs = mcpServer.getConsoleLogs();
    const availableTools = mcpServer.availableTools;
    
    return NextResponse.json({
      health: healthStatus,
      toolCalls: toolCalls,
      consoleLogs: consoleLogs,
      availableTools: availableTools
    });
    
  } catch (error) {
    console.error('❌ Error getting MCP status:', error);
    return NextResponse.json({
      health: { status: 'error', message: error.message },
      toolCalls: { totalCalls: 0, recentCalls: [] },
      consoleLogs: { totalLogs: 0, logs: [] },
      availableTools: []
    }, { status: 500 });
  }
} 