import { NextResponse } from 'next/server';
import { getOrCreateGlobalMCPServer } from '@/lib/global-mcp-store';
import { MCPServerManager } from '@/lib/mcp-server';
import { processQuestionWithReactAgent } from '@/lib/react-agent';

// We'll use the MCP server's tracking system instead of local variables

// Helper functions removed - we'll use MCP server's tracking directly

export async function POST(request) {
  try {
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json(
        { success: false, error: 'Question is required' },
        { status: 400 }
      );
    }

    console.log('🤖 React Agent processing question:', question);
    
    // Get MCP server instance for tracking
    const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
    
    // Handle case where MCP server is not available
    if (!mcpServer) {
      return NextResponse.json({
        success: false,
        error: 'MCP Server not available',
        note: 'MCP Server initialization failed'
      }, { status: 503 });
    }
    
    // IMPORTANT: Reset tracking for each new query to avoid context pollution
    console.log('🧹 Resetting MCP tracking for new query...');
    mcpServer.resetForDemo();

    // SIMPLIFIED APPROACH: Let the ReAct Agent make all tool calls
    let finalAnswer = '';
    let toolCalls = [];
    let toolResults = [];
    let mcpToolCallsData = null;
    let mcpConsoleLogsData = null;

    // Let the ReAct Agent handle all tool calls and reasoning
    try {
      console.log('🤖 Letting ReAct Agent handle tool calls and reasoning...');
      mcpServer.addConsoleLog('🤖 Letting ReAct Agent handle tool calls and reasoning...');
      
      const stream = await processQuestionWithReactAgent(question);
      
      // Process the ReAct Agent response and capture tool calls
      const chunks = [];
      const capturedToolCalls = [];
      const capturedToolResults = [];
      
      for await (const chunk of stream) {
        chunks.push(chunk);
      }

      console.log('🔍 Processing ReAct agent response chunks:', chunks.length);

      // Now process all chunks to extract tool calls and final answer
      for (const chunk of chunks) {
        if (chunk.agent && chunk.agent.messages) {
          for (const message of chunk.agent.messages) {
            // Debug: Log the message structure
            console.log('🔍 Message structure:', JSON.stringify(message, null, 2));
            
            // Capture tool calls from kwargs.tool_calls (the actual tool calls made by the agent)
            if (message.kwargs?.tool_calls && Array.isArray(message.kwargs.tool_calls)) {
              const toolCalls = message.kwargs.tool_calls;
              console.log('🔧 Found tool calls in kwargs:', toolCalls);
              
              for (const toolCall of toolCalls) {
                if (toolCall && toolCall.name && toolCall.args) {
                  try {
                    capturedToolCalls.push({
                      name: toolCall.name,
                      arguments: toolCall.args,
                    });
                    
                    console.log('✅ Captured tool call:', toolCall.name);
                  } catch (error) {
                    console.error('❌ Error capturing tool call:', error);
                  }
                }
              }
            }
            
            // Capture tool results from the same tool_calls array (they contain the results)
            if (message.kwargs?.tool_calls && Array.isArray(message.kwargs.tool_calls)) {
              const toolCalls = message.kwargs.tool_calls;
              console.log('📊 Found tool results in kwargs:', toolCalls);
              
              for (const toolCall of toolCalls) {
                if (toolCall && toolCall.name && toolCall.args) {
                  try {
                    capturedToolResults.push({
                      tool: toolCall.name,
                      arguments: toolCall.args,
                      result: toolCall.output || toolCall.result || null,
                      error: false
                    });
                    
                    console.log('✅ Captured tool result:', toolCall.name);
                  } catch (error) {
                    console.error('❌ Error capturing tool result:', error);
                  }
                }
              }
            }
            
            // Extract the final answer from content
            if (message.content) {
              let contentText = '';
              
              if (typeof message.content === 'string') {
                contentText = message.content;
              } else if (Array.isArray(message.content)) {
                contentText = message.content.map(item => 
                  typeof item === 'string' ? item : JSON.stringify(item)
                ).join(' ');
              } else if (typeof message.content === 'object') {
                contentText = JSON.stringify(message.content);
              }
              
              // Use the last meaningful response as the final answer
              if (contentText && contentText.length > 10) {
                finalAnswer = contentText;
              }
            }
          }
        }
      }

      console.log('🔍 Processing ReAct agent response chunks:', chunks.length);
      console.log('🔧 Captured tool calls:', capturedToolCalls.length);
      console.log('📊 Captured tool results:', capturedToolResults.length);


      
      // Get the tool calls and console logs from the MCP server
      // The MCP server tracks all tool calls made during the React Agent's execution
      console.log('🔄 Retrieving MCP server tracking data...');
      
      try {
        // Get tool calls and logs from the shared MCP server instance
        const mcpToolCallsData = mcpServer.getToolCalls();
        const mcpConsoleLogsData = mcpServer.getConsoleLogs();
        
        console.log('📊 MCP Tool Calls from server:', mcpToolCallsData);
        console.log('📊 MCP Console Logs count:', mcpConsoleLogsData.totalLogs);
        
        // Extract the actual arrays
        const mcpToolCalls = mcpToolCallsData.recentCalls || [];
        const mcpConsoleLogs = mcpConsoleLogsData.logs || [];
        
        // Format tool calls for the response
        toolCalls = mcpToolCalls.map(call => ({
          name: call.tool,
          arguments: call.params,
        }));
        
        // Format tool results from completed calls
        toolResults = mcpToolCalls
          .filter(call => call.status === 'completed' && call.result)
          .map(call => ({
            tool: call.tool,
            arguments: call.params,
            result: call.result,
            error: false
          }));
        
        // No need to update local variables - we use MCP server's tracking directly
        
        console.log('✅ Tracking data retrieved - Tool calls:', toolCalls.length, ', Results:', toolResults.length);
      } catch (error) {
        console.error('❌ Error retrieving MCP tracking data:', error);
        // Don't update tracking arrays if there's an error
      }
      
      console.log('✅ ReAct Agent processed question successfully');
      mcpServer.addConsoleLog('✅ ReAct Agent processed question successfully');
      
      // Get the tracking data if we haven't already
      if (!mcpToolCallsData) {
        mcpToolCallsData = mcpServer.getToolCalls();
      }
      if (!mcpConsoleLogsData) {
        mcpConsoleLogsData = mcpServer.getConsoleLogs();
      }
      
    } catch (error) {
      console.error('❌ ReAct Agent processing error:', error);
      mcpServer.addConsoleLog('❌ ReAct Agent processing error:', error.message);
      finalAnswer = `I encountered an error while processing your question: ${error.message}. Please try rephrasing your question or ask about a different aspect of the data.`;
    }



    // Get status data from MCP server's tracking system (may have been fetched earlier)
    if (!mcpToolCallsData) {
      mcpToolCallsData = mcpServer.getToolCalls();
    }
    if (!mcpConsoleLogsData) {
      mcpConsoleLogsData = mcpServer.getConsoleLogs();
    }
    
    const statusData = {
      health: {
        status: 'healthy',
        timestamp: new Date().toISOString(),
        mcpServer: 'running',
        availableTools: ['list-collections', 'find', 'aggregate'],
        toolCalls: {
          total: mcpToolCallsData.totalCalls,
          recent: mcpToolCallsData.recentCalls.length,
          completed: mcpToolCallsData.stats.completed,
          error: mcpToolCallsData.stats.error
        },
        consoleLogs: {
          total: mcpConsoleLogsData.totalLogs,
          recent: mcpConsoleLogsData.logs.slice(-10).length
        },
        uptime: process.uptime(),
        note: 'This demo uses the real MongoDB MCP Server with ReAct Agent'
      },
      toolCalls: mcpToolCallsData,
      consoleLogs: mcpConsoleLogsData,
      availableTools: ['list-collections', 'find', 'aggregate']
    };

    console.log('✅ React Agent response completed');
    console.log('📊 Final tool calls:', toolCalls.length);
    console.log('📊 Final tool results:', toolResults.length);
    console.log('📊 Tracked tool calls:', mcpToolCallsData.totalCalls);
    console.log('📊 Console logs:', mcpConsoleLogsData.totalLogs);

    return NextResponse.json({
      success: true,
      finalAnswer: finalAnswer,
      toolCalls: toolCalls,
      toolResults: toolResults,
      status: statusData
    });

  } catch (error) {
    console.error('❌ React Agent error:', error);
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to process question with React agent',
        details: error.message 
      },
      { status: 500 }
    );
  }
} 