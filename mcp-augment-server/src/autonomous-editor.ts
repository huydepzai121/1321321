/**
 * Autonomous Editing Agent
 *
 * AI tự động generate prompts và execute editing tasks với auggie CLI.
 * Thay vì user phải prompt, AI sẽ:
 * 1. Phân tích task
 * 2. Generate optimal prompts
 * 3. Execute với auggie (bao gồm editing)
 * 4. Verify changes
 * 5. Return comprehensive results
 */

import {
  executeAuggieInteractive,
  executeAuggieTask,
  executeCustomSlashCommand
} from './editor.js';
import { queryCodebase, searchCodebase } from './auggie.js';
import type { AuggieResult } from './types.js';

export enum EditingTaskType {
  // Code generation
  CREATE_FILE = 'create_file',
  GENERATE_CODE = 'generate_code',

  // Code modification
  FIX_BUG = 'fix_bug',
  REFACTOR = 'refactor',
  ADD_FEATURE = 'add_feature',
  OPTIMIZE = 'optimize',

  // Code improvement
  ADD_TESTS = 'add_tests',
  ADD_DOCS = 'add_docs',
  FIX_TYPES = 'fix_types',
  FIX_LINT = 'fix_lint',

  // Custom
  CUSTOM_EDIT = 'custom_edit'
}

export interface EditingTask {
  type: EditingTaskType;
  description: string;
  target?: string; // File or pattern
  context?: string;
}

export interface EditingPlan {
  originalRequest: string;
  taskType: EditingTaskType;
  steps: Array<{
    action: string;
    prompt: string;
    requiresEditing: boolean;
  }>;
  reasoning: string;
  safetyChecks: string[];
}

export interface EditingResult {
  success: boolean;
  plan: EditingPlan;
  results: Array<{
    step: string;
    result: AuggieResult;
    filesChanged?: string[];
  }>;
  summary: string;
  error?: string;
}

/**
 * Analyze user request and determine editing task type
 */
export function analyzeEditingTask(request: string): EditingTaskType {
  const lower = request.toLowerCase();

  // Code generation
  if (lower.includes('create') || lower.includes('generate') || lower.includes('new file')) {
    return EditingTaskType.CREATE_FILE;
  }

  // Bug fixes
  if (lower.includes('fix') && (lower.includes('bug') || lower.includes('error') || lower.includes('issue'))) {
    return EditingTaskType.FIX_BUG;
  }

  // Refactoring
  if (lower.includes('refactor') || lower.includes('restructure') || lower.includes('reorganize')) {
    return EditingTaskType.REFACTOR;
  }

  // Feature addition
  if (lower.includes('add') && (lower.includes('feature') || lower.includes('functionality'))) {
    return EditingTaskType.ADD_FEATURE;
  }

  // Optimization
  if (lower.includes('optimize') || lower.includes('performance') || lower.includes('speed up')) {
    return EditingTaskType.OPTIMIZE;
  }

  // Tests
  if (lower.includes('test') && (lower.includes('add') || lower.includes('write') || lower.includes('create'))) {
    return EditingTaskType.ADD_TESTS;
  }

  // Documentation
  if (lower.includes('doc') || lower.includes('comment') || lower.includes('jsdoc')) {
    return EditingTaskType.ADD_DOCS;
  }

  // Type fixes
  if (lower.includes('type') && (lower.includes('fix') || lower.includes('error'))) {
    return EditingTaskType.FIX_TYPES;
  }

  // Lint fixes
  if (lower.includes('lint') || lower.includes('eslint') || lower.includes('prettier')) {
    return EditingTaskType.FIX_LINT;
  }

  return EditingTaskType.CUSTOM_EDIT;
}

/**
 * Generate editing plan with AI-optimized prompts
 */
export function generateEditingPlan(request: string): EditingPlan {
  const taskType = analyzeEditingTask(request);
  const steps: EditingPlan['steps'] = [];
  let reasoning = '';
  const safetyChecks: string[] = [];

  switch (taskType) {
    case EditingTaskType.CREATE_FILE:
      reasoning = 'Creating new file - will analyze codebase patterns, generate code following conventions';
      steps.push(
        {
          action: 'Analyze codebase patterns',
          prompt: 'Analyze the codebase structure, coding patterns, and conventions to understand how new files should be created',
          requiresEditing: false
        },
        {
          action: 'Generate file content',
          prompt: `${request}. Follow the codebase conventions and patterns. Include proper imports, types, and documentation.`,
          requiresEditing: true
        }
      );
      safetyChecks.push('Verify file doesn\'t already exist', 'Check imports are valid', 'Ensure proper structure');
      break;

    case EditingTaskType.FIX_BUG:
      reasoning = 'Bug fix - will locate bug, understand context, generate fix, verify';
      steps.push(
        {
          action: 'Locate and understand bug',
          prompt: `Find and analyze the bug: ${request}. Explain what's causing it and where it's located.`,
          requiresEditing: false
        },
        {
          action: 'Generate fix',
          prompt: `Fix the bug: ${request}. Ensure the fix is minimal, doesn't break existing functionality, and includes error handling.`,
          requiresEditing: true
        },
        {
          action: 'Verify fix',
          prompt: 'Verify the bug fix is correct and doesn\'t introduce new issues. Check related code paths.',
          requiresEditing: false
        }
      );
      safetyChecks.push('Check for breaking changes', 'Verify error handling', 'Ensure tests still pass');
      break;

    case EditingTaskType.REFACTOR:
      reasoning = 'Refactoring - will analyze current code, plan refactoring, execute, verify';
      steps.push(
        {
          action: 'Analyze current implementation',
          prompt: `Analyze the code to be refactored: ${request}. Understand its current structure, dependencies, and usage.`,
          requiresEditing: false
        },
        {
          action: 'Plan refactoring',
          prompt: `Plan the refactoring for: ${request}. Consider impact on other code, maintain backward compatibility where needed.`,
          requiresEditing: false
        },
        {
          action: 'Execute refactoring',
          prompt: `Refactor the code: ${request}. Follow the plan, maintain functionality, improve code quality.`,
          requiresEditing: true
        },
        {
          action: 'Verify refactoring',
          prompt: 'Verify the refactoring maintains all functionality and doesn\'t break dependencies.',
          requiresEditing: false
        }
      );
      safetyChecks.push('Maintain API compatibility', 'Check all usages updated', 'Verify tests pass');
      break;

    case EditingTaskType.ADD_FEATURE:
      reasoning = 'Feature addition - will understand requirements, plan implementation, generate code';
      steps.push(
        {
          action: 'Understand requirements',
          prompt: `Analyze the feature request: ${request}. Understand what needs to be built and how it fits into the codebase.`,
          requiresEditing: false
        },
        {
          action: 'Plan implementation',
          prompt: `Plan how to implement: ${request}. Consider architecture, files to create/modify, integration points.`,
          requiresEditing: false
        },
        {
          action: 'Implement feature',
          prompt: `Implement the feature: ${request}. Follow codebase patterns, add proper error handling, include documentation.`,
          requiresEditing: true
        },
        {
          action: 'Add tests',
          prompt: 'Generate tests for the new feature to ensure it works correctly.',
          requiresEditing: true
        }
      );
      safetyChecks.push('Follow existing patterns', 'Include error handling', 'Add tests', 'Update docs');
      break;

    case EditingTaskType.ADD_TESTS:
      reasoning = 'Adding tests - will analyze code, generate comprehensive test cases';
      steps.push(
        {
          action: 'Analyze code to test',
          prompt: `Analyze the code for testing: ${request}. Understand its behavior, edge cases, and dependencies.`,
          requiresEditing: false
        },
        {
          action: 'Generate tests',
          prompt: `Generate comprehensive tests: ${request}. Cover happy paths, edge cases, error cases. Use existing test patterns.`,
          requiresEditing: true
        }
      );
      safetyChecks.push('Cover edge cases', 'Test error handling', 'Follow test conventions');
      break;

    case EditingTaskType.ADD_DOCS:
      reasoning = 'Adding documentation - will analyze code and generate comprehensive docs';
      steps.push(
        {
          action: 'Analyze code',
          prompt: `Analyze the code: ${request}. Understand its purpose, parameters, return values, and usage.`,
          requiresEditing: false
        },
        {
          action: 'Generate documentation',
          prompt: `Add documentation: ${request}. Include JSDoc comments, parameter descriptions, examples, and usage notes.`,
          requiresEditing: true
        }
      );
      safetyChecks.push('Document all parameters', 'Include examples', 'Explain edge cases');
      break;

    case EditingTaskType.OPTIMIZE:
      reasoning = 'Optimization - will analyze performance, identify bottlenecks, optimize';
      steps.push(
        {
          action: 'Analyze performance',
          prompt: `Analyze performance of: ${request}. Identify bottlenecks, inefficiencies, and optimization opportunities.`,
          requiresEditing: false
        },
        {
          action: 'Optimize code',
          prompt: `Optimize: ${request}. Improve performance while maintaining correctness and readability.`,
          requiresEditing: true
        },
        {
          action: 'Verify optimization',
          prompt: 'Verify the optimization improves performance without breaking functionality.',
          requiresEditing: false
        }
      );
      safetyChecks.push('Maintain correctness', 'Verify performance gain', 'Check memory usage');
      break;

    default:
      reasoning = 'Custom editing task - will analyze request and execute appropriately';
      steps.push(
        {
          action: 'Understand request',
          prompt: `Analyze the request: ${request}. Understand what needs to be done.`,
          requiresEditing: false
        },
        {
          action: 'Execute task',
          prompt: request,
          requiresEditing: true
        }
      );
      safetyChecks.push('Verify changes are safe', 'Check for unintended side effects');
  }

  return {
    originalRequest: request,
    taskType,
    steps,
    reasoning,
    safetyChecks
  };
}

/**
 * Execute autonomous editing agent
 */
export async function executeAutonomousEditor(
  request: string,
  workingDirectory?: string,
  options?: {
    dryRun?: boolean;
    autoApprove?: boolean;
  }
): Promise<EditingResult> {
  const { dryRun = false, autoApprove = false } = options || {};

  try {
    // Generate plan
    const plan = generateEditingPlan(request);
    console.error(`[Autonomous Editor] Generated plan with ${plan.steps.length} steps`);
    console.error(`[Autonomous Editor] Task type: ${plan.taskType}`);
    console.error(`[Autonomous Editor] Reasoning: ${plan.reasoning}`);

    // Execute steps
    const results: EditingResult['results'] = [];

    for (let i = 0; i < plan.steps.length; i++) {
      const step = plan.steps[i];
      console.error(`[Autonomous Editor] Step ${i + 1}/${plan.steps.length}: ${step.action}`);

      let result: AuggieResult & { filesChanged?: string[] };

      if (step.requiresEditing) {
        // Editing step
        result = await executeAuggieTask(step.prompt, workingDirectory, {
          dryRun,
          autoApprove
        });
      } else {
        // Read-only analysis step
        result = await executeAuggieInteractive(step.prompt, workingDirectory, {
          allowEditing: false
        });
      }

      results.push({
        step: step.action,
        result,
        filesChanged: result.filesChanged
      });

      // Stop on error for critical steps
      if (!result.success && step.requiresEditing) {
        console.error(`[Autonomous Editor] Critical step failed, stopping`);
        break;
      }
    }

    // Generate summary
    const summary = generateEditingSummary(plan, results, dryRun);

    return {
      success: true,
      plan,
      results,
      summary
    };
  } catch (error: any) {
    return {
      success: false,
      plan: {
        originalRequest: request,
        taskType: EditingTaskType.CUSTOM_EDIT,
        steps: [],
        reasoning: '',
        safetyChecks: []
      },
      results: [],
      summary: '',
      error: error.message
    };
  }
}

/**
 * Generate comprehensive summary
 */
function generateEditingSummary(
  plan: EditingPlan,
  results: EditingResult['results'],
  dryRun: boolean
): string {
  let summary = `# Autonomous Editing Agent Results\n\n`;
  summary += `**Original Request:** ${plan.originalRequest}\n\n`;
  summary += `**Task Type:** ${plan.taskType}\n\n`;
  summary += `**Reasoning:** ${plan.reasoning}\n\n`;
  summary += `**Mode:** ${dryRun ? '🔍 DRY RUN (Preview Only)' : '✏️  EDITING MODE'}\n\n`;
  summary += `---\n\n`;

  // Results for each step
  results.forEach((item, index) => {
    summary += `## Step ${index + 1}: ${item.step}\n\n`;

    if (item.result.success) {
      summary += `✅ **Success**\n\n`;

      if (item.filesChanged && item.filesChanged.length > 0) {
        summary += `**Files Changed:**\n`;
        item.filesChanged.forEach(file => {
          summary += `- ${file}\n`;
        });
        summary += `\n`;
      }

      summary += `${item.result.output}\n\n`;
    } else {
      summary += `❌ **Failed**\n\n`;
      summary += `Error: ${item.result.error}\n\n`;
    }

    summary += `---\n\n`;
  });

  // Summary stats
  const successCount = results.filter(r => r.result.success).length;
  const failCount = results.length - successCount;
  const allFilesChanged = results
    .flatMap(r => r.filesChanged || [])
    .filter((v, i, a) => a.indexOf(v) === i); // unique

  summary += `## Summary\n\n`;
  summary += `- Total steps: ${results.length}\n`;
  summary += `- Successful: ${successCount}\n`;
  summary += `- Failed: ${failCount}\n`;

  if (allFilesChanged.length > 0) {
    summary += `- Files modified: ${allFilesChanged.length}\n\n`;
    summary += `### All Changed Files:\n`;
    allFilesChanged.forEach(file => {
      summary += `- ${file}\n`;
    });
    summary += `\n`;
  }

  // Safety checks
  if (plan.safetyChecks.length > 0) {
    summary += `### Safety Checks to Perform:\n`;
    plan.safetyChecks.forEach(check => {
      summary += `- [ ] ${check}\n`;
    });
    summary += `\n`;
  }

  if (dryRun) {
    summary += `\n**Note:** This was a dry run. No actual changes were made. Run in editing mode to apply changes.\n`;
  }

  return summary;
}
