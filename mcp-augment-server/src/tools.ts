/**
 * MCP Tools implementation for Augment context engine
 */

import type { Tool } from '@modelcontextprotocol/sdk/types.js';
import {
  queryCodebase,
  analyzeCode,
  searchCodebase,
  getCodebaseStructure,
  findUsages
} from './auggie.js';

/**
 * MCP Tool: Query Codebase
 * Allows querying the codebase using natural language via Auggie
 */
export const queryCodebaseTool: Tool = {
  name: 'query_codebase',
  description: 'Query the codebase using Augment\'s context engine. Ask questions about code structure, functionality, patterns, or any aspect of the codebase in natural language.',
  inputSchema: {
    type: 'object',
    properties: {
      query: {
        type: 'string',
        description: 'Natural language query about the codebase (e.g., "How does authentication work?", "Where is the database connection configured?")'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory. Defaults to current working directory.'
      }
    },
    required: ['query']
  }
};

/**
 * MCP Tool: Analyze Code
 * Analyzes specific files or code patterns
 */
export const analyzeCodeTool: Tool = {
  name: 'analyze_code',
  description: 'Analyze a specific file or code pattern in the codebase. Get detailed insights about implementation, dependencies, and usage.',
  inputSchema: {
    type: 'object',
    properties: {
      filePath: {
        type: 'string',
        description: 'Path to the file to analyze (relative to working directory)'
      },
      analysisQuery: {
        type: 'string',
        description: 'Specific analysis question (e.g., "What does this function do?", "What are the dependencies?", "How is this used?")'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      }
    },
    required: ['filePath', 'analysisQuery']
  }
};

/**
 * MCP Tool: Search Codebase
 * Searches for patterns, functions, classes, or functionality
 */
export const searchCodebaseTool: Tool = {
  name: 'search_codebase',
  description: 'Search the codebase for specific patterns, functions, classes, or functionality. Find implementations, usages, and related code.',
  inputSchema: {
    type: 'object',
    properties: {
      searchPattern: {
        type: 'string',
        description: 'What to search for (e.g., "API endpoints", "error handling", "database queries", "authentication logic")'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      }
    },
    required: ['searchPattern']
  }
};

/**
 * MCP Tool: Get Codebase Structure
 * Retrieves overall codebase architecture and organization
 */
export const getCodebaseStructureTool: Tool = {
  name: 'get_codebase_structure',
  description: 'Get an overview of the codebase structure, architecture, organization, and main components.',
  inputSchema: {
    type: 'object',
    properties: {
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      }
    }
  }
};

/**
 * MCP Tool: Find Usages
 * Finds where a function, class, or variable is used throughout the codebase
 */
export const findUsagesTool: Tool = {
  name: 'find_usages',
  description: 'Find where a specific function, class, variable, or identifier is used throughout the codebase.',
  inputSchema: {
    type: 'object',
    properties: {
      identifier: {
        type: 'string',
        description: 'The function, class, variable, or identifier name to find usages for'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      }
    },
    required: ['identifier']
  }
};

/**
 * All available MCP tools
 */
export const allTools: Tool[] = [
  queryCodebaseTool,
  analyzeCodeTool,
  searchCodebaseTool,
  getCodebaseStructureTool,
  findUsagesTool
];

/**
 * Handle tool execution
 */
export async function handleToolCall(
  toolName: string,
  args: Record<string, unknown>
): Promise<{ content: Array<{ type: string; text: string }> }> {
  try {
    let result;

    switch (toolName) {
      case 'query_codebase':
        result = await queryCodebase(
          args.query as string,
          args.workingDirectory as string | undefined
        );
        break;

      case 'analyze_code':
        result = await analyzeCode(
          args.filePath as string,
          args.analysisQuery as string,
          args.workingDirectory as string | undefined
        );
        break;

      case 'search_codebase':
        result = await searchCodebase(
          args.searchPattern as string,
          args.workingDirectory as string | undefined
        );
        break;

      case 'get_codebase_structure':
        result = await getCodebaseStructure(
          args.workingDirectory as string | undefined
        );
        break;

      case 'find_usages':
        result = await findUsages(
          args.identifier as string,
          args.workingDirectory as string | undefined
        );
        break;

      default:
        throw new Error(`Unknown tool: ${toolName}`);
    }

    if (!result.success) {
      return {
        content: [
          {
            type: 'text',
            text: `Error: ${result.error}\n\nPartial output: ${result.output}`
          }
        ]
      };
    }

    return {
      content: [
        {
          type: 'text',
          text: result.output
        }
      ]
    };
  } catch (error: any) {
    return {
      content: [
        {
          type: 'text',
          text: `Error executing tool ${toolName}: ${error.message}`
        }
      ]
    };
  }
}
