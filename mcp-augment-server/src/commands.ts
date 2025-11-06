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
 * Get auggie command path - shared utility
 */
async function getAuggieCommand(): Promise<string | null> {
  try {
    await execAsync('auggie --version', { timeout: 5000 });
    return 'auggie';
  } catch {
    const possiblePaths = [
      '/usr/local/bin/auggie',
      '/opt/homebrew/bin/auggie',
      `${process.env.HOME}/.npm-global/bin/auggie`,
      '/usr/bin/auggie',
    ];

    for (const path of possiblePaths) {
      try {
        await execAsync(`${path} --version`, { timeout: 5000 });
        return path;
      } catch {
        continue;
      }
    }

    try {
      const { stdout } = await execAsync('npm config get prefix', { timeout: 5000 });
      const auggiePath = `${stdout.trim()}/bin/auggie`;
      await execAsync(`${auggiePath} --version`, { timeout: 5000 });
      return auggiePath;
    } catch {
      return null;
    }
  }
}

/**
 * Execute an Auggie slash command
 */
export async function executeSlashCommand(
  commandName: string,
  args: string = '',
  workingDirectory?: string
): Promise<AuggieResult> {
  try {
    // Get auggie command
    const auggieCmd = await getAuggieCommand();
    if (!auggieCmd) {
      return {
        success: false,
        output: '',
        error: 'Auggie CLI not found. Please install: npm install -g @augmentcode/auggie',
        exitCode: 127
      };
    }

    // Execute command using auggie command <name>
    const command = args
      ? `${auggieCmd} command ${commandName} "${args.replace(/"/g, '\\"')}"`
      : `${auggieCmd} command ${commandName}`;

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
    const auggieCmd = await getAuggieCommand();
    if (!auggieCmd) {
      return {
        success: false,
        output: '',
        error: 'Auggie CLI not found',
        exitCode: 127
      };
    }

    const command = `${auggieCmd} --help`;
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
