/**
 * Auggie Slash Commands wrapper
 *
 * Auggie supports custom slash commands stored in .augment/commands/
 * and built-in commands like /github-workflow, /feedback, etc.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { AuggieResult } from './types.js';

const execAsync = promisify(exec);
const DEFAULT_TIMEOUT = 120000; // 2 minutes for commands

/**
 * Execute an Auggie slash command
 */
export async function executeSlashCommand(
  commandName: string,
  args: string = '',
  workingDirectory?: string
): Promise<AuggieResult> {
  try {
    // Check if auggie is installed
    try {
      await execAsync('which auggie', { timeout: 5000 });
    } catch (error) {
      return {
        success: false,
        output: '',
        error: 'Auggie CLI is not installed',
        exitCode: 127
      };
    }

    // Execute command using auggie command <name>
    const command = args
      ? `auggie command ${commandName} "${args.replace(/"/g, '\\"')}"`
      : `auggie command ${commandName}`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: workingDirectory || process.cwd(),
      timeout: DEFAULT_TIMEOUT,
      maxBuffer: 10 * 1024 * 1024,
    });

    return {
      success: true,
      output: stdout.trim(),
      error: stderr ? stderr.trim() : undefined,
      exitCode: 0
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.message || 'Unknown error executing slash command',
      exitCode: error.code || 1
    };
  }
}

/**
 * List available Auggie commands
 */
export async function listAuggieCommands(
  workingDirectory?: string
): Promise<AuggieResult> {
  try {
    const command = 'auggie --help';
    const { stdout, stderr } = await execAsync(command, {
      cwd: workingDirectory || process.cwd(),
      timeout: 10000,
    });

    return {
      success: true,
      output: stdout.trim(),
      exitCode: 0
    };
  } catch (error: any) {
    return {
      success: false,
      output: error.stdout || '',
      error: error.message,
      exitCode: error.code || 1
    };
  }
}

/**
 * Built-in Auggie slash commands
 */
export const BUILTIN_COMMANDS = {
  GITHUB_WORKFLOW: 'github-workflow',
  FEEDBACK: 'feedback',
  CODE_REVIEW: 'code-review',
} as const;

/**
 * Execute GitHub workflow command
 */
export async function executeGithubWorkflow(
  args: string,
  workingDirectory?: string
): Promise<AuggieResult> {
  return executeSlashCommand(BUILTIN_COMMANDS.GITHUB_WORKFLOW, args, workingDirectory);
}

/**
 * Execute code review command
 */
export async function executeCodeReview(
  filePath: string,
  workingDirectory?: string
): Promise<AuggieResult> {
  return executeSlashCommand(BUILTIN_COMMANDS.CODE_REVIEW, filePath, workingDirectory);
}
