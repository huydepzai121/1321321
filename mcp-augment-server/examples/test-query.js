#!/usr/bin/env node
/**
 * Simple test script to verify MCP server works
 * Usage: node examples/test-query.js
 */

import { spawn } from 'child_process';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function testMCPServer() {
  console.log('🧪 Testing MCP Augment Server\n');

  const serverPath = join(__dirname, '..', 'dist', 'index.js');

  // Test 1: List tools
  console.log('Test 1: List available tools');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━');

  const listToolsRequest = {
    jsonrpc: '2.0',
    id: 1,
    method: 'tools/list',
    params: {}
  };

  await sendRequest(serverPath, listToolsRequest);

  console.log('\n✅ Test completed!\n');
  console.log('📝 Available MCP tools:');
  console.log('  1. autonomous_editor - AI tự sửa code');
  console.log('  2. autonomous_agent - AI tự query codebase');
  console.log('  3. adaptive_agent - Advanced autonomous mode');
  console.log('  4. execute_editing_task - Direct editing');
  console.log('  5. create_custom_command - Create slash commands');
  console.log('  6. list_custom_commands - List commands');
  console.log('  7. execute_slash_command - Execute slash command');
  console.log('  8. query_codebase - Query với natural language');
  console.log('  9. analyze_code - Analyze specific files');
  console.log(' 10. search_codebase - Search patterns');
  console.log(' 11. get_codebase_structure - Get architecture');
  console.log(' 12. find_usages - Find identifier usages');
  console.log('');
  console.log('🎉 MCP server is ready to use!');
}

function sendRequest(serverPath, request) {
  return new Promise((resolve, reject) => {
    const server = spawn('node', [serverPath], {
      stdio: ['pipe', 'pipe', 'inherit']
    });

    let output = '';

    server.stdout.on('data', (data) => {
      output += data.toString();
    });

    server.on('close', (code) => {
      if (code === 0 || output.length > 0) {
        try {
          const response = JSON.parse(output);
          console.log(JSON.stringify(response, null, 2));
          resolve(response);
        } catch (e) {
          console.log(output);
          resolve(output);
        }
      } else {
        reject(new Error(`Server exited with code ${code}`));
      }
    });

    server.on('error', reject);

    // Send request
    server.stdin.write(JSON.stringify(request) + '\n');
    server.stdin.end();
  });
}

testMCPServer().catch(console.error);
