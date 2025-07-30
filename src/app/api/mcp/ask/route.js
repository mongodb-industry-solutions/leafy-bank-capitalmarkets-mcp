import { NextResponse } from 'next/server';
import { MCPServerManager } from '@/lib/mcp-server';
import { getOrCreateGlobalMCPServer } from '@/lib/global-mcp-store';
import { processQuestion } from '@/lib/question-processor';

export async function POST(request) {
  try {
    const { question } = await request.json();
    
    if (!question) {
      return NextResponse.json({
        success: false,
        error: 'Question is required'
      }, { status: 400 });
    }
    
    console.log('🤔 User question:', question);
    
    // Get MCP server instance
    const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
    
    // Handle case where MCP server is not available
    if (!mcpServer) {
      return NextResponse.json({
        success: false,
        error: 'MCP Server not available',
        note: 'MCP Server initialization failed'
      }, { status: 503 });
    }
    
    // Process the question to determine which MCP tool to use
    const analysis = processQuestion(question);
    
    if (!analysis.tool) {
      return NextResponse.json({
        success: true,
        question: question,
        answer: analysis.response,
        toolUsed: 'none',
        data: null
      });
    }
    
    // Call the real MCP server
    const result = await mcpServer.callTool(analysis.tool, analysis.params);
    
    // Format the response based on the tool and data
    let answer = analysis.response;
    let formattedData = null;
    let rawResponse = null;
    let parsingSuccessful = false;
    
    if (result && result.content) {
      console.log('🔍 Processing MCP result content:', result.content);
      
      // Always capture the raw response for display
      rawResponse = result.content;
      
      // Parse the MCP response content
      let data = null;
      
      // Extract data from the content array
      for (const item of result.content) {
        if (item.type === 'text') {
          try {
            // Try to parse as JSON first
            const parsed = JSON.parse(item.text);
            if (parsed && typeof parsed === 'object') {
              // Check if this looks like our data
              if (parsed.symbol) {
                // This is find data (has symbol field)
                data = [parsed]; // Wrap in array since we expect an array
                console.log('✅ Found find data:', data);
                parsingSuccessful = true;
                break;
              } else if (parsed.avgClose !== undefined || parsed.minClose !== undefined || parsed.maxClose !== undefined) {
                // This is aggregate data (has avgClose, minClose, maxClose fields)
                data = [parsed]; // Wrap in array since we expect an array
                console.log('✅ Found aggregate data:', data);
                parsingSuccessful = true;
                break;
              } else if (Array.isArray(parsed)) {
                // This is already an array (like list-collections)
                data = parsed;
                console.log('✅ Found array data:', data);
                parsingSuccessful = true;
                break;
              }
            }
          } catch (e) {
            // If it's not JSON, it might be a description
            console.log('📝 Text content (not JSON):', item.text);
          }
        }
      }
      
      // If no JSON found in content, try to parse the whole result
      if (!data && result.content.length > 0) {
        try {
          data = JSON.parse(result.content[0].text);
          parsingSuccessful = true;
        } catch (e) {
          console.log('⚠️ Could not parse result content as JSON');
        }
      }
      
      if (analysis.tool === 'find' && data && data.length > 0) {
        const item = data[0];
        if (item.symbol === 'BTC' || item.symbol === 'ETH') {
          // Handle MongoDB extended JSON format for dates
          const timestamp = item.timestamp?.$date ? new Date(item.timestamp.$date) : new Date(item.timestamp);
          answer = `The latest ${item.symbol} price is $${item.close.toLocaleString()} as of ${timestamp.toLocaleString()}.`;
          console.log(`✅ Generated ${item.symbol} answer:`, answer);
        } else {
          const timestamp = item.timestamp?.$date ? new Date(item.timestamp.$date) : new Date(item.timestamp);
          answer = `The latest ${item.symbol} stock price is $${item.close.toLocaleString()} as of ${timestamp.toLocaleString()}.`;
          console.log('✅ Generated stock answer:', answer);
        }
        formattedData = data;
      } else if (analysis.tool === 'aggregate' && data && data.length > 0) {
        const stats = data[0];
        answer = `BTC Daily Statistics: Average price $${stats.avgClose.toFixed(2)}, Range $${stats.minClose.toFixed(2)} - $${stats.maxClose.toFixed(2)}, Total records: ${stats.count}.`;
        formattedData = data;
      } else if (analysis.tool === 'list-collections') {
        // For list-collections, the data might be in a different format
        if (Array.isArray(data)) {
          answer = `Available collections: ${data.join(', ')}.`;
          formattedData = data;
        } else {
          answer = `Available collections: ${result.content.map(c => c.text).join(', ')}.`;
          formattedData = result.content.map(c => c.text);
        }
      } else {
        // If we couldn't parse or format the response, show a generic message
        answer = `Received response from MCP Server. ${parsingSuccessful ? 'Data was parsed successfully.' : 'Could not parse the response format.'}`;
        formattedData = null;
      }
    } else {
      answer = 'Sorry, I could not retrieve the requested data.';
    }
    
        // Get status data from the same MCP server instance
        const healthStatus = mcpServer.getHealthStatus();
        const toolCalls = mcpServer.getToolCalls();
        const consoleLogs = mcpServer.getConsoleLogs();
        const availableTools = mcpServer.availableTools;

        return NextResponse.json({
            success: true,
            question: question,
            answer: answer,
            toolUsed: analysis.tool,
            data: formattedData,
            rawResponse: rawResponse,
            parsingSuccessful: parsingSuccessful,
            note: 'This response was generated using the real MongoDB MCP Server',
            // Include status data
            status: {
                health: healthStatus,
                toolCalls: toolCalls,
                consoleLogs: consoleLogs,
                availableTools: availableTools
            }
        });
    
  } catch (error) {
    console.error('❌ Error processing question:', error);
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 });
  }
}