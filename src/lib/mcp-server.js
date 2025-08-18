import { spawn } from 'child_process';
import { getMCPServerInstance, setMCPServerInstance, getInitializationPromise, setInitializationPromise, clearMCPServerInstance } from './mcp-store';

export class MCPServerManager {
  constructor() {
    this.mcpProcess = null;
    this.mcpMessageId = 1;
    this.availableTools = [];
    this.toolCallCount = 0;
    this.toolCallHistory = [];
    this.consoleLogs = [];
    this.initialized = false;
  }

  trackToolCall(toolName, params = {}) {
    this.toolCallCount++;
    const call = {
      id: this.toolCallCount,
      timestamp: new Date().toISOString(),
      tool: toolName,
      params,
      status: 'executing'
    };
    this.toolCallHistory.push(call);
    
    // Keep only last 20 calls for demo
    if (this.toolCallHistory.length > 20) {
      this.toolCallHistory.shift();
    }
    
    console.log(`🔧 MCP Tool Call #${this.toolCallCount}: ${toolName}`, params);
    this.addConsoleLog(`🔧 MCP Tool Call #${this.toolCallCount}: ${toolName}`, params);
    return call;
  }

  updateToolCallStatus(callId, status, result = null) {
    const call = this.toolCallHistory.find(c => c.id === callId);
    if (call) {
      call.status = status;
      call.result = result;
      call.completedAt = new Date().toISOString();
      
      // Add console log for status update
      if (status === 'completed') {
        this.addConsoleLog(`✅ Tool Call #${callId} completed successfully`);
      } else if (status === 'error') {
        this.addConsoleLog(`❌ Tool Call #${callId} failed:`, result);
      }
    }
  }

  addConsoleLog(message, data = null) {
    const log = {
      timestamp: new Date().toISOString(),
      message: message,
      data: data
    };
    this.consoleLogs.push(log);
    
    // Keep only last 50 logs for demo
    if (this.consoleLogs.length > 50) {
      this.consoleLogs.shift();
    }
    
    // Log to console with full details
    if (data) {
      console.log(message, data);
    } else {
      console.log(message);
    }
  }

  // Method to reset server state for fresh demo
  resetForDemo() {
    this.reset();
    console.log('🔄 MCP Server state reset for fresh demo');
  }

  async initialize() {
    // Only initialize in runtime environment, not during build
    if (typeof window === 'undefined' && process.env.NODE_ENV === 'production' && process.env.NEXT_PHASE === 'phase-production-build') {
      console.log('🔄 Skipping MCP initialization during build process');
      return Promise.resolve();
    }

    // Always restart the MCP server for fresh demo state
    if (this.mcpProcess) {
      console.log('🔄 Restarting MCP Server for fresh demo state...');
      this.cleanup();
    }
    
    // Reset all state for fresh demo
    this.reset();

    return new Promise((resolve, reject) => {
      try {
        // Get configuration from environment variables
        const connectionString = process.env.NEXT_PUBLIC_MCP_CONNECTION_STRING;
        const apiClientId = process.env.NEXT_PUBLIC_MCP_API_CLIENT_ID;
        const apiClientSecret = process.env.NEXT_PUBLIC_MCP_API_CLIENT_SECRET;

        if (!connectionString || !apiClientId || !apiClientSecret) {
          console.log('⚠️ MCP configuration not found. MCP server will not be initialized.');
          console.log('ℹ️ This is normal for ReAct Agent mode which doesn\'t require MCP server.');
          resolve();
          return;
        }

        // Connect to the MongoDB MCP Server running in separate container
        // The server is started by Docker Compose and runs on a standard port
        this.mcpProcess = spawn('mongodb-mcp-server', [
          '--connectionString',
          connectionString,
          '--apiClientId',
          apiClientId,
          '--apiClientSecret',
          apiClientSecret,
          '--readOnly'
        ], {
          stdio: ['pipe', 'pipe', 'pipe']
        });

        console.log('🚀 MongoDB MCP Server process started');

        // Handle MCP server output
        this.mcpProcess.stdout.on('data', (data) => {
          console.log('📤 MCP Server output:', data.toString());
        });

        this.mcpProcess.stderr.on('data', (data) => {
          console.log('⚠️ MCP Server error:', data.toString());
        });

        this.mcpProcess.on('close', (code) => {
          console.log(`❌ MCP Server process exited with code ${code}`);
          this.mcpProcess = null;
        });

        // Wait for the server to initialize
        setTimeout(async () => {
          console.log('✅ MCP Server initialized');
          try {
            // Check if process is still available before proceeding
            if (!this.mcpProcess) {
              console.log('⚠️ MCP Server process is no longer available');
              resolve();
              return;
            }
            
            await this.getAvailableTools();
            this.initialized = true;
            resolve();
          } catch (error) {
            console.error('❌ Failed to get available tools:', error);
            reject(error);
          }
        }, 3000);

      } catch (error) {
        console.error('❌ Failed to start MCP Server:', error);
        reject(error);
      }
    });
  }

  async getAvailableTools() {
    return new Promise((resolve, reject) => {
      if (!this.mcpProcess) {
        return reject(new Error('MCP Server not available'));
      }

      const request = {
        jsonrpc: '2.0',
        id: this.mcpMessageId++,
        method: 'tools/list',
        params: {}
      };

      console.log('🔍 Getting available tools...');
      console.log('📤 Sending tools/list request:', JSON.stringify(request, null, 2));

      this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');

      let buffer = '';
      const responseHandler = (data) => {
        try {
          buffer += data.toString();
          
          // Split by newlines to handle multiple JSON responses
          const lines = buffer.split('\n');
          
          // Process all complete lines except the last one (which might be incomplete)
          for (let i = 0; i < lines.length - 1; i++) {
            const line = lines[i].trim();
            if (line) {
              try {
                const response = JSON.parse(line);
                
                // Check if this is the tools/list response we're looking for
                if (response.id === request.id) {
                  console.log('📥 Tools list response received');
                  
                  // Remove the listener to avoid memory leaks
                  this.mcpProcess.stdout.removeListener('data', responseHandler);
                  
                  if (response.error) {
                    reject(new Error(response.error.message || 'Failed to get tools list'));
                  } else {
                    this.availableTools = response.result.tools || [];
                    console.log('✅ Available tools:', this.availableTools.map(t => t.name));
                    resolve(this.availableTools);
                  }
                  return; // Exit since we found our response
                }
              } catch (parseError) {
                // Skip malformed JSON lines
                console.log('⚠️ Skipping malformed JSON line:', line);
              }
            }
          }
          
          // Keep the last line (which might be incomplete) in the buffer
          buffer = lines[lines.length - 1];
          
        } catch (error) {
          console.log('⚠️ Error processing MCP response:', error);
        }
      };

      this.mcpProcess.stdout.on('data', responseHandler);

      // Increase timeout to 15 seconds for Docker environment
      setTimeout(() => {
        // Check if process is still available before removing listener
        if (this.mcpProcess && this.mcpProcess.stdout) {
          this.mcpProcess.stdout.removeListener('data', responseHandler);
        }
        reject(new Error('Tools list request timeout'));
      }, 15000);
    });
  }

  async callTool(toolName, params = {}) {
    return new Promise((resolve, reject) => {
      const call = this.trackToolCall(toolName, params);
      
      if (!this.mcpProcess) {
        this.updateToolCallStatus(call.id, 'error', 'MCP Server not available');
        return reject(new Error('MCP Server not available'));
      }

      // Create MCP request
      const request = {
        jsonrpc: '2.0',
        id: this.mcpMessageId++,
        method: 'tools/call',
        params: {
          name: toolName,
          arguments: params
        }
      };

      console.log('📤 Sending MCP request:', JSON.stringify(request, null, 2));
      this.addConsoleLog('📤 Sending MCP request:', request);

      // Send request to MCP server
      this.mcpProcess.stdin.write(JSON.stringify(request) + '\n');

      let isResolved = false; // Flag to prevent multiple resolutions

      // Set up response handler
      const responseHandler = (data) => {
        if (isResolved) return; // Prevent multiple handlers from processing
        
        const lines = data.toString().split('\n');
        
        for (const line of lines) {
          if (line.trim()) {
            try {
              const response = JSON.parse(line);
              
              // Handle different types of responses
              if (response.method === 'notifications/message') {
                // This is a notification, not the result - continue
                const notificationData = response.params?.data;
                
                // Skip logging notifications containing error-related text
                const errorTerms = ["error", "Error", "ERROR"];
                const containsErrorTerm = errorTerms.some(term => 
                  typeof notificationData === 'string' ? 
                    notificationData.includes(term) : 
                    JSON.stringify(notificationData).includes(term)
                );
                
                if (!containsErrorTerm) {
                  console.log('📢 MCP notification:', notificationData);
                  this.addConsoleLog('📢 MCP notification:', notificationData);
                }
                continue;
              }
              
              // Check if this is the result we're looking for
              if (response.id === request.id) {
                console.log('📥 MCP result received');
                this.addConsoleLog('📥 MCP result received:', response.result);
                
                // Mark as resolved to prevent multiple handlers
                isResolved = true;
                
                // Remove the listener to avoid memory leaks
                this.mcpProcess.stdout.removeListener('data', responseHandler);
                
                // Clear the timeout since we got our response
                if (timeoutId) {
                  clearTimeout(timeoutId);
                  timeoutId = null;
                }
                
                if (response.error) {
                  this.updateToolCallStatus(call.id, 'error', response.error);
                  reject(new Error(response.error.message || 'MCP Server error'));
                } else {
                  this.updateToolCallStatus(call.id, 'completed', response.result);
                  resolve(response.result);
                }
                return; // Exit since we found our result
              }
            } catch (parseError) {
              // Skip malformed JSON lines
              console.log('⚠️ Skipping malformed JSON line:', line);
              this.addConsoleLog('⚠️ Skipping malformed JSON line:', line);
            }
          }
        }
      };

      // Listen for response
      this.mcpProcess.stdout.on('data', responseHandler);

      // Timeout after 15 seconds
      let timeoutId = setTimeout(() => {
        if (!isResolved) {
          isResolved = true;
          // Check if process is still available before removing listener
          if (this.mcpProcess && this.mcpProcess.stdout) {
            this.mcpProcess.stdout.removeListener('data', responseHandler);
          }
          this.updateToolCallStatus(call.id, 'error', 'Request timeout');
          reject(new Error('Request timeout'));
        }
      }, 15000);
    });
  }

  getToolCalls() {
    return {
      totalCalls: this.toolCallCount,
      recentCalls: this.toolCallHistory,
      stats: {
        completed: this.toolCallHistory.filter(c => c.status === 'completed').length,
        executing: this.toolCallHistory.filter(c => c.status === 'executing').length,
        error: this.toolCallHistory.filter(c => c.status === 'error').length
      }
    };
  }

  getConsoleLogs() {
    return {
      logs: this.consoleLogs,
      totalLogs: this.consoleLogs.length,
      stats: {
        info: this.consoleLogs.filter(l => l.message.includes('📤') || l.message.includes('📥')).length,
        notifications: this.consoleLogs.filter(l => l.message.includes('📢')).length,
        errors: this.consoleLogs.filter(l => l.message.includes('❌') || l.message.includes('⚠️')).length,
        success: this.consoleLogs.filter(l => l.message.includes('✅')).length
      }
    };
  }

  getHealthStatus() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      mcpServer: this.mcpProcess ? 'running' : 'not running',
      availableTools: this.availableTools.length,
      toolCalls: {
        total: this.toolCallCount,
        recent: this.toolCallHistory.length,
        completed: this.toolCallHistory.filter(c => c.status === 'completed').length,
        error: this.toolCallHistory.filter(c => c.status === 'error').length
      },
      consoleLogs: {
        total: this.consoleLogs.length,
        recent: this.consoleLogs.slice(-10).length
      },
      uptime: process.uptime(),
      note: 'This demo uses the real MongoDB MCP Server'
    };
  }

  reset() {
    // Reset all counters and logs for fresh demo state
    this.toolCallHistory = [];
    this.toolCallCount = 0;
    this.consoleLogs = [];
    this.availableTools = [];
    this.mcpMessageId = 1;
    console.log('🔄 MCP Server state reset for fresh demo');
  }

  cleanup() {
    if (this.mcpProcess) {
      this.mcpProcess.kill();
      this.mcpProcess = null;
    }
    this.initialized = false;
  }
}

export async function getMCPServer() {
  // Skip initialization only during actual build process
  if (typeof window === 'undefined' && process.env.NEXT_PHASE === 'phase-production-build') {
    console.log('🔄 Skipping MCP server initialization during build');
    return null;
  }

  // If already initialized, return the instance
  const existingInstance = getMCPServerInstance();
  if (existingInstance && existingInstance.initialized) {
    return existingInstance;
  }

  // If initialization is in progress, wait for it
  const existingPromise = getInitializationPromise();
  if (existingPromise) {
    try {
      await existingPromise;
      return getMCPServerInstance();
    } catch (error) {
      console.error('MCP Server initialization failed:', error);
      return null;
    }
  }

  // Start initialization
  const initPromise = (async () => {
    try {
      console.log('🚀 Initializing MCP Server...');
      const newInstance = new MCPServerManager();
      await newInstance.initialize();
      setMCPServerInstance(newInstance);
      console.log('✅ MCP Server initialized successfully');
      return newInstance;
    } catch (error) {
      console.error('❌ MCP Server initialization failed:', error);
      clearMCPServerInstance();
      // Don't throw error, just return null for graceful degradation
      return null;
    } finally {
      setInitializationPromise(null);
    }
  })();

  setInitializationPromise(initPromise);

  try {
    await initPromise;
    return getMCPServerInstance();
  } catch (error) {
    return null;
  }
}

export function cleanupMCPServer() {
  if (mcpServerInstance) {
    mcpServerInstance.cleanup();
    mcpServerInstance = null;
  }
}