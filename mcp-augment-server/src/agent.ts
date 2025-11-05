/**
 * Autonomous Agent Orchestrator
 *
 * This module implements an autonomous agent that can:
 * 1. Receive an initial query from an AI agent
 * 2. Automatically break down the query into sub-tasks
 * 3. Execute multiple auggie queries with follow-ups
 * 4. Use slash commands when appropriate
 * 5. Synthesize and return comprehensive results
 */

import { queryCodebase, analyzeCode, searchCodebase, getCodebaseStructure, findUsages } from './auggie.js';
import { executeSlashCommand } from './commands.js';
import type { AuggieResult } from './types.js';

/**
 * Agent task types
 */
export enum AgentTaskType {
  QUERY = 'query',
  ANALYZE = 'analyze',
  SEARCH = 'search',
  STRUCTURE = 'structure',
  USAGES = 'usages',
  COMMAND = 'command'
}

export interface AgentTask {
  type: AgentTaskType;
  description: string;
  params: Record<string, any>;
}

export interface AgentPlan {
  initialQuery: string;
  tasks: AgentTask[];
  reasoning: string;
}

export interface AgentResult {
  success: boolean;
  plan: AgentPlan;
  results: Array<{
    task: AgentTask;
    result: AuggieResult;
  }>;
  synthesis: string;
  error?: string;
}

/**
 * Generate an execution plan from initial query
 */
export function generatePlan(initialQuery: string): AgentPlan {
  const tasks: AgentTask[] = [];
  let reasoning = '';

  const lowerQuery = initialQuery.toLowerCase();

  // Analyze query intent and generate tasks
  if (lowerQuery.includes('how') || lowerQuery.includes('explain') || lowerQuery.includes('work')) {
    reasoning = 'Query asks for explanation - will get structure first, then query specifics, then find related code';

    tasks.push({
      type: AgentTaskType.STRUCTURE,
      description: 'Get overall codebase structure for context',
      params: {}
    });

    tasks.push({
      type: AgentTaskType.QUERY,
      description: 'Answer the main question',
      params: { query: initialQuery }
    });

    if (lowerQuery.includes('authentication') || lowerQuery.includes('auth')) {
      tasks.push({
        type: AgentTaskType.SEARCH,
        description: 'Find authentication-related code',
        params: { searchPattern: 'authentication and authorization code' }
      });
    }
  }
  else if (lowerQuery.includes('find') || lowerQuery.includes('where') || lowerQuery.includes('search')) {
    reasoning = 'Query is about finding code - will search and then analyze findings';

    tasks.push({
      type: AgentTaskType.SEARCH,
      description: 'Search for requested code',
      params: { searchPattern: initialQuery }
    });

    tasks.push({
      type: AgentTaskType.QUERY,
      description: 'Get detailed explanation of findings',
      params: { query: `Explain in detail: ${initialQuery}` }
    });
  }
  else if (lowerQuery.includes('analyze') || lowerQuery.includes('review')) {
    reasoning = 'Query asks for analysis - will analyze and provide suggestions';

    tasks.push({
      type: AgentTaskType.QUERY,
      description: 'Perform detailed analysis',
      params: { query: initialQuery }
    });

    if (lowerQuery.includes('file') || lowerQuery.includes('.')) {
      // Extract potential file path
      const words = initialQuery.split(' ');
      const potentialPath = words.find(w => w.includes('/') || w.includes('.'));
      if (potentialPath) {
        tasks.push({
          type: AgentTaskType.ANALYZE,
          description: `Analyze file: ${potentialPath}`,
          params: {
            filePath: potentialPath,
            analysisQuery: 'Provide detailed analysis of this file'
          }
        });
      }
    }
  }
  else if (lowerQuery.includes('structure') || lowerQuery.includes('architecture') || lowerQuery.includes('overview')) {
    reasoning = 'Query asks for structural overview';

    tasks.push({
      type: AgentTaskType.STRUCTURE,
      description: 'Get codebase structure',
      params: {}
    });

    tasks.push({
      type: AgentTaskType.QUERY,
      description: 'Get detailed architectural insights',
      params: { query: 'Explain the architecture, design patterns, and key components in detail' }
    });
  }
  else if (lowerQuery.includes('used') || lowerQuery.includes('usage') || lowerQuery.includes('reference')) {
    reasoning = 'Query asks about code usage - will find usages and analyze';

    // Try to extract identifier
    const words = initialQuery.split(' ');
    const identifier = words.find(w => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(w)) || 'component';

    tasks.push({
      type: AgentTaskType.USAGES,
      description: `Find usages of: ${identifier}`,
      params: { identifier }
    });

    tasks.push({
      type: AgentTaskType.QUERY,
      description: 'Explain usage patterns',
      params: { query: `Explain how ${identifier} is used throughout the codebase` }
    });
  }
  else {
    // Default: comprehensive analysis
    reasoning = 'General query - will perform comprehensive analysis';

    tasks.push({
      type: AgentTaskType.STRUCTURE,
      description: 'Get codebase overview',
      params: {}
    });

    tasks.push({
      type: AgentTaskType.QUERY,
      description: 'Answer the query',
      params: { query: initialQuery }
    });

    tasks.push({
      type: AgentTaskType.QUERY,
      description: 'Get additional context',
      params: { query: `Provide any additional relevant context for: ${initialQuery}` }
    });
  }

  return {
    initialQuery,
    tasks,
    reasoning
  };
}

/**
 * Execute a single task
 */
async function executeTask(
  task: AgentTask,
  workingDirectory?: string
): Promise<AuggieResult> {
  switch (task.type) {
    case AgentTaskType.QUERY:
      return queryCodebase(task.params.query, workingDirectory);

    case AgentTaskType.ANALYZE:
      return analyzeCode(
        task.params.filePath,
        task.params.analysisQuery,
        workingDirectory
      );

    case AgentTaskType.SEARCH:
      return searchCodebase(task.params.searchPattern, workingDirectory);

    case AgentTaskType.STRUCTURE:
      return getCodebaseStructure(workingDirectory);

    case AgentTaskType.USAGES:
      return findUsages(task.params.identifier, workingDirectory);

    case AgentTaskType.COMMAND:
      return executeSlashCommand(
        task.params.commandName,
        task.params.args,
        workingDirectory
      );

    default:
      return {
        success: false,
        output: '',
        error: `Unknown task type: ${task.type}`,
        exitCode: 1
      };
  }
}

/**
 * Synthesize results from multiple tasks
 */
function synthesizeResults(
  plan: AgentPlan,
  results: Array<{ task: AgentTask; result: AuggieResult }>
): string {
  let synthesis = `# Autonomous Agent Analysis Results\n\n`;
  synthesis += `**Initial Query:** ${plan.initialQuery}\n\n`;
  synthesis += `**Reasoning:** ${plan.reasoning}\n\n`;
  synthesis += `**Tasks Executed:** ${results.length}\n\n`;
  synthesis += `---\n\n`;

  results.forEach((item, index) => {
    synthesis += `## Task ${index + 1}: ${item.task.description}\n\n`;

    if (item.result.success) {
      synthesis += `✅ **Success**\n\n`;
      synthesis += `${item.result.output}\n\n`;
    } else {
      synthesis += `❌ **Failed**\n\n`;
      synthesis += `Error: ${item.result.error}\n\n`;
      if (item.result.output) {
        synthesis += `Partial output: ${item.result.output}\n\n`;
      }
    }

    synthesis += `---\n\n`;
  });

  // Add summary
  const successCount = results.filter(r => r.result.success).length;
  const failCount = results.length - successCount;

  synthesis += `## Summary\n\n`;
  synthesis += `- Total tasks: ${results.length}\n`;
  synthesis += `- Successful: ${successCount}\n`;
  synthesis += `- Failed: ${failCount}\n\n`;

  if (successCount > 0) {
    synthesis += `### Key Findings\n\n`;
    synthesis += `The autonomous agent successfully analyzed your query by breaking it down into ${results.length} sub-tasks. `;
    synthesis += `Each task gathered specific information about your codebase. `;
    synthesis += `Review the detailed results above for comprehensive insights.\n`;
  }

  return synthesis;
}

/**
 * Execute autonomous agent workflow
 */
export async function executeAutonomousAgent(
  initialQuery: string,
  workingDirectory?: string
): Promise<AgentResult> {
  try {
    // Generate execution plan
    const plan = generatePlan(initialQuery);

    // Execute tasks sequentially
    const results: Array<{ task: AgentTask; result: AuggieResult }> = [];

    for (const task of plan.tasks) {
      console.error(`[Agent] Executing task: ${task.description}`);
      const result = await executeTask(task, workingDirectory);
      results.push({ task, result });

      // Stop if critical task fails
      if (!result.success && task.type === AgentTaskType.QUERY) {
        console.error(`[Agent] Critical task failed, stopping execution`);
        break;
      }
    }

    // Synthesize results
    const synthesis = synthesizeResults(plan, results);

    return {
      success: true,
      plan,
      results,
      synthesis
    };
  } catch (error: any) {
    return {
      success: false,
      plan: {
        initialQuery,
        tasks: [],
        reasoning: ''
      },
      results: [],
      synthesis: '',
      error: error.message
    };
  }
}

/**
 * Advanced autonomous agent with adaptive planning
 * This version can adjust its plan based on intermediate results
 */
export async function executeAdaptiveAgent(
  initialQuery: string,
  maxIterations: number = 5,
  workingDirectory?: string
): Promise<AgentResult> {
  try {
    const plan = generatePlan(initialQuery);
    const results: Array<{ task: AgentTask; result: AuggieResult }> = [];
    let iterations = 0;

    for (let i = 0; i < plan.tasks.length && iterations < maxIterations; i++) {
      const task = plan.tasks[i];
      console.error(`[Adaptive Agent] Iteration ${iterations + 1}: ${task.description}`);

      const result = await executeTask(task, workingDirectory);
      results.push({ task, result });
      iterations++;

      // Adaptive: If we found something interesting, add follow-up tasks
      if (result.success && result.output.length > 0) {
        // Check if we should add follow-up tasks
        if (task.type === AgentTaskType.SEARCH && i === plan.tasks.length - 1) {
          // Found search results, add analysis task
          plan.tasks.push({
            type: AgentTaskType.QUERY,
            description: 'Analyze search findings in depth',
            params: {
              query: `Based on the search results, provide a detailed analysis and explanation`
            }
          });
        }
      }
    }

    const synthesis = synthesizeResults(plan, results);

    return {
      success: true,
      plan,
      results,
      synthesis
    };
  } catch (error: any) {
    return {
      success: false,
      plan: {
        initialQuery,
        tasks: [],
        reasoning: ''
      },
      results: [],
      synthesis: '',
      error: error.message
    };
  }
}
