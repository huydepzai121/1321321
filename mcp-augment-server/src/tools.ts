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
import {
  executeSlashCommand,
  executeGithubWorkflow,
  executeCodeReview
} from './commands.js';
import {
  executeAutonomousAgent,
  executeAdaptiveAgent
} from './agent.js';
import {
  executeAuggieTask,
  executeCustomSlashCommand,
  createCustomCommand,
  listCustomCommands
} from './editor.js';
import {
  executeAutonomousEditor
} from './autonomous-editor.js';

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
 * MCP Tool: Execute Slash Command
 * Execute Auggie slash commands (custom or built-in)
 */
export const executeSlashCommandTool: Tool = {
  name: 'execute_slash_command',
  description: 'Execute an Auggie slash command. Auggie supports custom commands in .augment/commands/ and built-in commands like /github-workflow, /code-review, etc.',
  inputSchema: {
    type: 'object',
    properties: {
      commandName: {
        type: 'string',
        description: 'Name of the slash command (without the / prefix, e.g., "github-workflow", "code-review")'
      },
      args: {
        type: 'string',
        description: 'Optional: Arguments to pass to the command'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      }
    },
    required: ['commandName']
  }
};

/**
 * MCP Tool: Autonomous Agent (THIS IS THE KEY TOOL!)
 * AI agent chỉ cần "mồi" - MCP server sẽ tự động break down và execute
 */
export const autonomousAgentTool: Tool = {
  name: 'autonomous_agent',
  description: '🤖 AUTONOMOUS MODE: AI agent chỉ cần cung cấp câu hỏi ban đầu. MCP server sẽ TỰ ĐỘNG: (1) Phân tích query, (2) Tạo execution plan với multiple sub-tasks, (3) Execute từng task với auggie, (4) Tổng hợp kết quả. Perfect for complex questions that need multiple queries!',
  inputSchema: {
    type: 'object',
    properties: {
      initialQuery: {
        type: 'string',
        description: 'Câu hỏi hoặc yêu cầu ban đầu. MCP server sẽ tự động break down thành các sub-tasks và execute (e.g., "How does authentication work in this project?", "Analyze the payment system")'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      }
    },
    required: ['initialQuery']
  }
};

/**
 * MCP Tool: Adaptive Autonomous Agent
 * Advanced version with adaptive planning based on intermediate results
 */
export const adaptiveAgentTool: Tool = {
  name: 'adaptive_agent',
  description: '🧠 ADAPTIVE AUTONOMOUS MODE: Advanced autonomous agent that adapts its execution plan based on intermediate results. Can add follow-up tasks dynamically. Best for exploratory analysis and deep dives.',
  inputSchema: {
    type: 'object',
    properties: {
      initialQuery: {
        type: 'string',
        description: 'Initial query or request. Agent will adapt its plan based on findings.'
      },
      maxIterations: {
        type: 'number',
        description: 'Optional: Maximum number of iterations (default: 5). Prevents infinite loops.'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      }
    },
    required: ['initialQuery']
  }
};

/**
 * MCP Tool: Autonomous Editor ⚡ FULL POWER!
 * AI tự động generate prompts và execute editing tasks
 */
export const autonomousEditorTool: Tool = {
  name: 'autonomous_editor',
  description: '⚡ AUTONOMOUS EDITING MODE: AI tự động phân tích task, generate optimal prompts, execute với auggie (BAO GỒM EDITING FILES), và verify changes. Thay vì user prompt, AI sẽ tự làm TẤT CẢ! Support: create files, fix bugs, refactor, add features, add tests, optimize code.',
  inputSchema: {
    type: 'object',
    properties: {
      request: {
        type: 'string',
        description: 'Editing request (e.g., "Fix the authentication bug", "Add tests for payment module", "Refactor UserService", "Create new API endpoint for orders")'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      },
      dryRun: {
        type: 'boolean',
        description: 'Optional: Preview changes without applying (default: false)'
      }
    },
    required: ['request']
  }
};

/**
 * MCP Tool: Execute Editing Task
 * Direct auggie editing execution
 */
export const executeEditingTaskTool: Tool = {
  name: 'execute_editing_task',
  description: 'Execute a specific editing task with auggie CLI. Can create, modify, or delete files. Use for direct editing when you know exactly what to do.',
  inputSchema: {
    type: 'object',
    properties: {
      task: {
        type: 'string',
        description: 'Editing task to execute (e.g., "Add error handling to src/api/users.ts", "Create tests for PaymentService")'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      },
      dryRun: {
        type: 'boolean',
        description: 'Optional: Preview changes without applying (default: false)'
      }
    },
    required: ['task']
  }
};

/**
 * MCP Tool: Create Custom Slash Command
 */
export const createCustomCommandTool: Tool = {
  name: 'create_custom_command',
  description: 'Create a custom slash command in .augment/commands/ that can be reused. Perfect for common workflows.',
  inputSchema: {
    type: 'object',
    properties: {
      commandName: {
        type: 'string',
        description: 'Name of the command (e.g., "security-audit", "add-api-endpoint")'
      },
      description: {
        type: 'string',
        description: 'Description of what the command does'
      },
      prompt: {
        type: 'string',
        description: 'The prompt that will be executed when command is called'
      },
      workingDirectory: {
        type: 'string',
        description: 'Optional: Path to the codebase directory'
      }
    },
    required: ['commandName', 'description', 'prompt']
  }
};

/**
 * MCP Tool: List Custom Commands
 */
export const listCustomCommandsTool: Tool = {
  name: 'list_custom_commands',
  description: 'List all available custom slash commands in .augment/commands/',
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
 * All available MCP tools
 */
export const allTools: Tool[] = [
  // 🔥 AUTONOMOUS EDITING (FULL POWER!)
  autonomousEditorTool,

  // Autonomous query agents (READ-ONLY)
  autonomousAgentTool,
  adaptiveAgentTool,

  // Direct editing tools
  executeEditingTaskTool,

  // Custom commands
  createCustomCommandTool,
  listCustomCommandsTool,
  executeSlashCommandTool,

  // Basic query tools (manual control)
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
    // Handle autonomous editing tools
    if (toolName === 'autonomous_editor') {
      const editorResult = await executeAutonomousEditor(
        args.request as string,
        args.workingDirectory as string | undefined,
        {
          dryRun: (args.dryRun as boolean) || false
        }
      );

      if (!editorResult.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Autonomous editor error: ${editorResult.error}`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: editorResult.summary
          }
        ]
      };
    }

    if (toolName === 'execute_editing_task') {
      const taskResult = await executeAuggieTask(
        args.task as string,
        args.workingDirectory as string | undefined,
        {
          dryRun: (args.dryRun as boolean) || false
        }
      );

      if (!taskResult.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Editing task error: ${taskResult.error}\n\nPartial output: ${taskResult.output}`
            }
          ]
        };
      }

      let response = taskResult.output;
      if (taskResult.filesChanged && taskResult.filesChanged.length > 0) {
        response += `\n\n**Files Changed:**\n${taskResult.filesChanged.map(f => `- ${f}`).join('\n')}`;
      }

      return {
        content: [
          {
            type: 'text',
            text: response
          }
        ]
      };
    }

    if (toolName === 'create_custom_command') {
      const cmdResult = await createCustomCommand(
        args.commandName as string,
        args.description as string,
        args.prompt as string,
        args.workingDirectory as string | undefined
      );

      return {
        content: [
          {
            type: 'text',
            text: cmdResult.success ? cmdResult.output : `Error: ${cmdResult.error}`
          }
        ]
      };
    }

    if (toolName === 'list_custom_commands') {
      const listResult = await listCustomCommands(
        args.workingDirectory as string | undefined
      );

      return {
        content: [
          {
            type: 'text',
            text: listResult.output
          }
        ]
      };
    }

    // Handle autonomous agent tools
    if (toolName === 'autonomous_agent') {
      const agentResult = await executeAutonomousAgent(
        args.initialQuery as string,
        args.workingDirectory as string | undefined,
        {
          maxTotalTime: (args.maxTotalTime as number) || 240000, // 4 minutes default
          taskTimeout: (args.taskTimeout as number) || 90000 // 90 seconds per task
        }
      );

      if (!agentResult.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Autonomous agent error: ${agentResult.error}`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: agentResult.synthesis
          }
        ]
      };
    }

    if (toolName === 'adaptive_agent') {
      const agentResult = await executeAdaptiveAgent(
        args.initialQuery as string,
        {
          maxIterations: (args.maxIterations as number) || 3, // Reduced from 5
          maxTotalTime: (args.maxTotalTime as number) || 240000, // 4 minutes
          taskTimeout: (args.taskTimeout as number) || 90000 // 90 seconds per task
        },
        args.workingDirectory as string | undefined
      );

      if (!agentResult.success) {
        return {
          content: [
            {
              type: 'text',
              text: `Adaptive agent error: ${agentResult.error}`
            }
          ]
        };
      }

      return {
        content: [
          {
            type: 'text',
            text: agentResult.synthesis
          }
        ]
      };
    }

    // Handle slash command tool
    if (toolName === 'execute_slash_command') {
      const result = await executeSlashCommand(
        args.commandName as string,
        args.args as string | undefined,
        args.workingDirectory as string | undefined
      );

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
    }

    // Handle basic query tools
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
