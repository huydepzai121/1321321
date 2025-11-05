#!/usr/bin/env node

/**
 * MCP Server for Augment Context Engine
 *
 * This server exposes Augment's context engine (via Auggie CLI) as MCP tools
 * that can be consumed by other AI agents following the Model Context Protocol.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { allTools, handleToolCall } from './tools.js';

/**
 * Server Information
 */
const SERVER_INFO = {
  name: 'mcp-augment-server',
  version: '1.0.0',
};

/**
 * Create and configure the MCP server
 */
async function createServer() {
  const server = new Server(
    {
      name: SERVER_INFO.name,
      version: SERVER_INFO.version,
    },
    {
      capabilities: {
        tools: {},
      },
    }
  );

  /**
   * Handler for listing available tools
   */
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools,
    };
  });

  /**
   * Handler for tool execution
   */
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;

    try {
      const result = await handleToolCall(name, args || {});
      return result;
    } catch (error: any) {
      throw new Error(`Error executing tool ${name}: ${error.message}`);
    }
  });

  return server;
}

/**
 * Main entry point
 */
async function main() {
  try {
    const server = await createServer();

    // Use stdio transport for communication
    const transport = new StdioServerTransport();

    // Connect server to transport
    await server.connect(transport);

    // Log server start (to stderr to not interfere with stdio communication)
    console.error('MCP Augment Server started successfully');
    console.error(`Server: ${SERVER_INFO.name} v${SERVER_INFO.version}`);
    console.error(`Tools available: ${allTools.length}`);
    console.error('Waiting for MCP client connections...');

  } catch (error: any) {
    console.error('Failed to start MCP server:', error.message);
    process.exit(1);
  }
}

// Handle graceful shutdown
process.on('SIGINT', () => {
  console.error('Received SIGINT, shutting down...');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.error('Received SIGTERM, shutting down...');
  process.exit(0);
});

// Start the server
main().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
