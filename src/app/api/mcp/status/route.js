import { NextResponse } from 'next/server';
import { MCPServerManager } from '@/lib/mcp-server';
import { getOrCreateGlobalMCPServer } from '@/lib/global-mcp-store';

export async function GET() {
  try {
    const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
    
    if (!mcpServer) {
      return NextResponse.json({
        health: {
          status: 'unavailable',
          timestamp: new Date().toISOString(),
          mcpServer: 'not available',
          note: 'MCP Server not initialized'
        },
        toolCalls: {
          totalCalls: 0,
          recentCalls: [],
          stats: { completed: 0, executing: 0, error: 0 }
        },
        consoleLogs: {
          logs: [],
          totalLogs: 0,
          stats: { info: 0, notifications: 0, errors: 0, success: 0 }
        },
        availableTools: []
      });
    }
    
    // Get all status data from the same instance
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
    console.error('Error getting MCP status:', error);
    return NextResponse.json({
      health: {
        status: 'error',
        timestamp: new Date().toISOString(),
        mcpServer: 'error',
        error: error.message,
        note: 'Error occurred while getting MCP status'
      },
      toolCalls: {
        totalCalls: 0,
        recentCalls: [],
        stats: { completed: 0, executing: 0, error: 0 }
      },
      consoleLogs: {
        logs: [],
        totalLogs: 0,
        stats: { info: 0, notifications: 0, errors: 0, success: 0 }
      },
      availableTools: []
    }, { status: 500 });
  }
} 