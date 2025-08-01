// Global store for MCP server instance that can be shared across API routes
// This uses a simple in-memory approach that should work within the same Node.js process

let globalMCPServerInstance = null;
let globalInitializationPromise = null;

export function getGlobalMCPServerInstance() {
  return globalMCPServerInstance;
}

export function setGlobalMCPServerInstance(instance) {
  globalMCPServerInstance = instance;
}

export function getGlobalInitializationPromise() {
  return globalInitializationPromise;
}

export function setGlobalInitializationPromise(promise) {
  globalInitializationPromise = promise;
}

export function clearGlobalMCPServerInstance() {
  globalMCPServerInstance = null;
  globalInitializationPromise = null;
}

// Function to reset the MCP server for fresh demos
export function resetGlobalMCPServer() {
  if (globalMCPServerInstance) {
    console.log('🔄 Resetting MCP Server for fresh demo...');
    globalMCPServerInstance.cleanup();
  }
  clearGlobalMCPServerInstance();
}

export async function getOrCreateGlobalMCPServer(MCPServerManagerClass) {
  // If we already have an instance and it's initialized, return it
  if (globalMCPServerInstance && globalMCPServerInstance.initialized) {
    console.log('🔄 Using existing MCP Server instance...');
    return globalMCPServerInstance;
  }

  // If initialization is in progress, wait for it
  if (globalInitializationPromise) {
    try {
      await globalInitializationPromise;
      return globalMCPServerInstance;
    } catch (error) {
      console.error('Global MCP Server initialization failed:', error);
      return null;
    }
  }

  // Start initialization
  const initPromise = (async () => {
    try {
      console.log('🚀 Initializing Global MCP Server...');
      const newInstance = new MCPServerManagerClass();
      await newInstance.initialize();
      setGlobalMCPServerInstance(newInstance);
      console.log('✅ Global MCP Server initialized successfully');
      return newInstance;
    } catch (error) {
      console.error('❌ Global MCP Server initialization failed:', error);
      clearGlobalMCPServerInstance();
      throw error;
    } finally {
      setGlobalInitializationPromise(null);
    }
  })();

  setGlobalInitializationPromise(initPromise);

  try {
    await initPromise;
    return getGlobalMCPServerInstance();
  } catch (error) {
    return null;
  }
} 