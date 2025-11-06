/**
 * Example MCP client to test the Augment server
 *
 * Usage:
 *   node examples/test-client.js
 */

import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  console.log('🚀 Testing MCP Augment Server...\n');

  // Create transport
  const transport = new StdioClientTransport({
    command: 'node',
    args: [join(__dirname, '..', 'dist', 'index.js')],
  });

  // Create client
  const client = new Client(
    {
      name: 'test-client',
      version: '1.0.0',
    },
    {
      capabilities: {},
    }
  );

  try {
    // Connect
    console.log('📡 Connecting to server...');
    await client.connect(transport);
    console.log('✅ Connected!\n');

    // List tools
    console.log('📋 Listing available tools...');
    const toolsResponse = await client.listTools();
    console.log('✅ Available tools:');
    toolsResponse.tools.forEach((tool, index) => {
      console.log(`   ${index + 1}. ${tool.name}: ${tool.description}`);
    });
    console.log();

    // Test query_codebase tool
    console.log('🔍 Testing query_codebase tool...');
    const queryResult = await client.callTool({
      name: 'query_codebase',
      arguments: {
        query: 'What is the structure of this project?',
        workingDirectory: process.cwd(),
      },
    });

    console.log('✅ Query result:');
    console.log(JSON.stringify(queryResult, null, 2));
    console.log();

    // Test get_codebase_structure tool
    console.log('🏗️  Testing get_codebase_structure tool...');
    const structureResult = await client.callTool({
      name: 'get_codebase_structure',
      arguments: {
        workingDirectory: process.cwd(),
      },
    });

    console.log('✅ Structure result:');
    console.log(JSON.stringify(structureResult, null, 2));
    console.log();

    console.log('🎉 All tests passed!');
  } catch (error) {
    console.error('❌ Error:', error.message);
    process.exit(1);
  } finally {
    await client.close();
    console.log('\n👋 Disconnected from server');
  }
}

main().catch(console.error);
