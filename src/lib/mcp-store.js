// Global store for MCP server instance that persists across API routes
let mcpServerInstance = null;
let initializationPromise = null;

export function getMCPServerInstance() {
  return mcpServerInstance;
}

export function setMCPServerInstance(instance) {
  mcpServerInstance = instance;
}

export function getInitializationPromise() {
  return initializationPromise;
}

export function setInitializationPromise(promise) {
  initializationPromise = promise;
}

export function clearMCPServerInstance() {
  mcpServerInstance = null;
  initializationPromise = null;
} 