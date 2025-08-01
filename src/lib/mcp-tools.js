import { DynamicStructuredTool } from "@langchain/core/tools";
import { z } from "zod";
import { getOrCreateGlobalMCPServer } from "./global-mcp-store";
import { MCPServerManager } from "./mcp-server";

// Define the allowed assets for validation
const ALLOWED_CRYPTO_ASSETS = ['BTC', 'ETH', 'XRP', 'SOL', 'DOGE', 'ADA'];
const ALLOWED_STOCK_ASSETS = ['HYG', 'LQD', 'TLT', 'GLD', 'USO', 'EEM', 'QQQ', 'SPY', 'XLE', 'VNQ'];

// Helper function to validate assets
function validateAsset(symbol, assetType) {
  const upperSymbol = symbol.toUpperCase();
  if (assetType === 'crypto') {
    return ALLOWED_CRYPTO_ASSETS.includes(upperSymbol);
  } else if (assetType === 'stock') {
    return ALLOWED_STOCK_ASSETS.includes(upperSymbol);
  }
  return false;
}

// Helper function to determine asset type
function getAssetType(symbol) {
  const upperSymbol = symbol.toUpperCase();
  if (ALLOWED_CRYPTO_ASSETS.includes(upperSymbol)) {
    return 'crypto';
  } else if (ALLOWED_STOCK_ASSETS.includes(upperSymbol)) {
    return 'stock';
  }
  return null;
}

// Tool to find data from MongoDB collections
export const mcpFindTool = new DynamicStructuredTool({
  name: "mcp_find",
  description: "Find documents from MongoDB collections. Use this to get current prices, historical data, or specific records for crypto (BTC, ETH, XRP, SOL, DOGE, ADA) or stock (HYG, LQD, TLT, GLD, USO, EEM, QQQ, SPY, XLE, VNQ) assets.",
  schema: z.object({
    symbol: z.string().describe("The asset symbol to search for (e.g., 'BTC', 'ETH', 'SPY', 'QQQ')"),
    limit: z.number().optional().default(10).describe("Maximum number of documents to return"),
    sortBy: z.string().optional().default("timestamp").describe("Field to sort by"),
    sortOrder: z.number().optional().default(-1).describe("Sort order: -1 for descending, 1 for ascending"),
    fields: z.string().optional().describe("Comma-separated list of fields to include (e.g., 'symbol,close,timestamp')")
  }),
  func: async ({ symbol, limit, sortBy, sortOrder, fields }) => {
    try {
      const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
      if (!mcpServer) {
        throw new Error("MCP Server not available");
      }

      const upperSymbol = symbol.toUpperCase();
      const assetType = getAssetType(upperSymbol);
      
      if (!assetType) {
        throw new Error(`Asset '${symbol}' is not supported. Supported crypto: ${ALLOWED_CRYPTO_ASSETS.join(', ')}. Supported stocks: ${ALLOWED_STOCK_ASSETS.join(', ')}`);
      }

      const collection = assetType === 'crypto' ? 'binanceCryptoData' : 'yfinanceMarketData';
      
      // Build projection
      let projection = {};
      if (fields) {
        const fieldList = fields.split(',').map(f => f.trim());
        fieldList.forEach(field => {
          projection[field] = 1;
        });
      }

      const params = {
        database: 'agentic_capital_markets',
        collection: collection,
        filter: { symbol: upperSymbol },
        projection: Object.keys(projection).length > 0 ? projection : {},
        sort: { [sortBy]: sortOrder },
        limit: limit
      };

      const result = await mcpServer.callTool('find', params);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});

// Tool to aggregate data from MongoDB collections
export const mcpAggregateTool = new DynamicStructuredTool({
  name: "mcp_aggregate",
  description: "Perform aggregation operations on MongoDB collections. Use this for calculating averages, statistics, trends, or complex analysis for crypto (BTC, ETH, XRP, SOL, DOGE, ADA) or stock (HYG, LQD, TLT, GLD, USO, EEM, QQQ, SPY, XLE, VNQ) assets.",
  schema: z.object({
    symbol: z.string().describe("The asset symbol to analyze (e.g., 'BTC', 'ETH', 'SPY', 'QQQ')"),
    operation: z.string().describe("The aggregation operation: 'stats' (basic statistics), 'trend' (price trends), 'volatility' (price volatility), 'volume' (volume analysis), 'custom' (custom pipeline)"),
    days: z.number().optional().default(30).describe("Number of days to analyze (for time-based operations)"),
    customPipeline: z.string().optional().describe("Custom aggregation pipeline in JSON format (only for 'custom' operation)")
  }),
  func: async ({ symbol, operation, days, customPipeline }) => {
    try {
      const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
      if (!mcpServer) {
        throw new Error("MCP Server not available");
      }

      const upperSymbol = symbol.toUpperCase();
      const assetType = getAssetType(upperSymbol);
      
      if (!assetType) {
        throw new Error(`Asset '${symbol}' is not supported. Supported crypto: ${ALLOWED_CRYPTO_ASSETS.join(', ')}. Supported stocks: ${ALLOWED_STOCK_ASSETS.join(', ')}`);
      }

      const collection = assetType === 'crypto' ? 'binanceCryptoData' : 'yfinanceMarketData';
      
      let pipeline = [];
      
      // Add symbol filter
      pipeline.push({ $match: { symbol: upperSymbol } });

      // Add date filter if specified
      if (days && days > 0) {
        const cutoffDate = new Date();
        cutoffDate.setDate(cutoffDate.getDate() - days);
        pipeline.push({
          $match: {
            timestamp: { $gte: { $date: cutoffDate.toISOString() } }
          }
        });
      }

      // Add operation-specific stages
      switch (operation) {
        case 'stats':
          pipeline.push({
            $group: {
              _id: null,
              avgClose: { $avg: '$close' },
              minClose: { $min: '$close' },
              maxClose: { $max: '$close' },
              avgVolume: { $avg: '$volume' },
              totalRecords: { $sum: 1 },
              latestPrice: { $last: '$close' },
              latestTimestamp: { $last: '$timestamp' }
            }
          });
          break;
          
        case 'trend':
          pipeline.push({
            $group: {
              _id: {
                year: { $year: '$timestamp' },
                month: { $month: '$timestamp' },
                day: { $dayOfMonth: '$timestamp' }
              },
              avgClose: { $avg: '$close' },
              avgVolume: { $avg: '$volume' }
            }
          });
          pipeline.push({ $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 } });
          break;
          
        case 'volatility':
          pipeline.push({
            $group: {
              _id: null,
              avgClose: { $avg: '$close' },
              stdDev: { $stdDevPop: '$close' },
              volatility: {
                $multiply: [
                  { $divide: [{ $stdDevPop: '$close' }, { $avg: '$close' }] },
                  100
                ]
              }
            }
          });
          break;
          
        case 'volume':
          pipeline.push({
            $group: {
              _id: null,
              totalVolume: { $sum: '$volume' },
              avgVolume: { $avg: '$volume' },
              maxVolume: { $max: '$volume' },
              minVolume: { $min: '$volume' }
            }
          });
          break;
          
        case 'custom':
          if (!customPipeline) {
            throw new Error("Custom pipeline is required for 'custom' operation");
          }
          try {
            const customStages = JSON.parse(customPipeline);
            if (Array.isArray(customStages)) {
              pipeline = pipeline.concat(customStages);
            } else {
              throw new Error("Custom pipeline must be an array of aggregation stages");
            }
          } catch (parseError) {
            throw new Error(`Invalid custom pipeline JSON: ${parseError.message}`);
          }
          break;
          
        default:
          throw new Error(`Unknown operation: ${operation}. Supported operations: stats, trend, volatility, volume, custom`);
      }

      const params = {
        database: 'agentic_capital_markets',
        collection: collection,
        pipeline: pipeline
      };

      const result = await mcpServer.callTool('aggregate', params);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});

// Tool to list collections and get database information
export const mcpListCollectionsTool = new DynamicStructuredTool({
  name: "mcp_list_collections",
  description: "List available collections in the MongoDB database. Use this to understand what data is available.",
  schema: z.object({
    database: z.string().optional().default("agentic_capital_markets").describe("Database name to list collections from")
  }),
  func: async ({ database }) => {
    try {
      const mcpServer = await getOrCreateGlobalMCPServer(MCPServerManager);
      if (!mcpServer) {
        throw new Error("MCP Server not available");
      }

      const params = { database };
      const result = await mcpServer.callTool('list-collections', params);
      return JSON.stringify(result, null, 2);
    } catch (error) {
      return `Error: ${error.message}`;
    }
  }
});

// Export all tools as an array for the React agent
export const mcpTools = [mcpFindTool, mcpAggregateTool, mcpListCollectionsTool]; 