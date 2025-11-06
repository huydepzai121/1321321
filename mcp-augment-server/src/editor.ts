/**
 * Auggie Editing Mode - Full auggie CLI capabilities including file editing
 *
 * This module provides FULL auggie functionality:
 * - Interactive mode execution
 * - File editing operations
 * - Custom slash commands
 * - Task execution with edits
 */

import { exec, spawn } from 'child_process';
import { promisify } from 'util';
import type { AuggieResult } from './types.js';

const execAsync = promisify(exec);

/**
 * Timeout configurations for different operation types
 */
const DEFAULT_TIMEOUT = 180000; // 3 minutes for editing tasks
const QUICK_EDIT_TIMEOUT = 90000; // 1.5 minutes for simple edits
const LONG_TIMEOUT = 300000; // 5 minutes for complex refactoring

/**
 * Get auggie command path - shared utility
 */
async function getAuggieCommand(): Promise<string | null> {
  // Try direct command first
  try {
    await execAsync('auggie --version', { timeout: 5000 });
    return 'auggie';
  } catch {
    // Try common locations
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

    // Try npm global bin
    try {
      const { stdout } = await execAsync('npm config get prefix', { timeout: 5000 });
      const npmPrefix = stdout.trim();
      const auggiePath = `${npmPrefix}/bin/auggie`;
      await execAsync(`${auggiePath} --version`, { timeout: 5000 });
      return auggiePath;
    } catch {
      return null;
    }
  }
}

/**
 * Execute auggie in interactive mode with prompt
 * This allows full auggie capabilities including editing
 */
export async function executeAuggieInteractive(
  prompt: string,
  workingDirectory?: string,
  options?: {
    timeout?: number;
    allowEditing?: boolean;
    dryRun?: boolean;
  }
): Promise<AuggieResult> {
  const {
    timeout = DEFAULT_TIMEOUT,
    allowEditing = true,
    dryRun = false
  } = options || {};

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

    // Prepare command based on mode
    let command: string;

    if (dryRun) {
      // Dry run mode - preview changes without applying
      command = `${auggieCmd} --print "${prompt.replace(/"/g, '\\"')}"`;
    } else if (allowEditing) {
      // Full interactive mode with editing
      // Use expect-like approach or direct stdin
      command = `echo "${prompt.replace(/"/g, '\\"')}" | ${auggieCmd}`;
    } else {
      // Read-only mode
      command = `${auggieCmd} --print "${prompt.replace(/"/g, '\\"')}"`;
    }

    const { stdout, stderr } = await execAsync(command, {
      cwd: workingDirectory || process.cwd(),
      timeout,
      maxBuffer: 20 * 1024 * 1024, // 20MB for large edits
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
      error: error.message || 'Unknown error executing auggie',
      exitCode: error.code || 1
    };
  }
}

/**
 * Execute auggie with task that may include edits
 * Returns both the response and any file changes made
 */
export async function executeAuggieTask(
  task: string,
  workingDirectory?: string,
  options?: {
    autoApprove?: boolean;
    dryRun?: boolean;
  }
): Promise<AuggieResult & { filesChanged?: string[] }> {
  const { autoApprove = false, dryRun = false } = options || {};

  try {
    const result = await executeAuggieInteractive(task, workingDirectory, {
      allowEditing: !dryRun,
      dryRun
    });

    // Parse output to extract file changes
    const filesChanged = parseFileChanges(result.output);

    return {
      ...result,
      filesChanged
    };
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message,
      exitCode: 1
    };
  }
}

/**
 * Parse auggie output to extract changed files
 */
function parseFileChanges(output: string): string[] {
  const files: string[] = [];

  // Look for common patterns in auggie output
  const patterns = [
    /Modified:\s+(.+)/g,
    /Created:\s+(.+)/g,
    /Updated:\s+(.+)/g,
    /Edited:\s+(.+)/g,
    /Writing to:\s+(.+)/g
  ];

  for (const pattern of patterns) {
    let match;
    while ((match = pattern.exec(output)) !== null) {
      files.push(match[1].trim());
    }
  }

  return [...new Set(files)]; // Remove duplicates
}

/**
 * Execute custom slash command (from .augment/commands/)
 */
export async function executeCustomSlashCommand(
  commandName: string,
  args?: string,
  workingDirectory?: string,
  options?: {
    allowEditing?: boolean;
    dryRun?: boolean;
  }
): Promise<AuggieResult> {
  try {
    // Custom commands are executed via auggie command <name>
    const command = args
      ? `auggie command ${commandName} "${args.replace(/"/g, '\\"')}"`
      : `auggie command ${commandName}`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: workingDirectory || process.cwd(),
      timeout: DEFAULT_TIMEOUT,
      maxBuffer: 20 * 1024 * 1024,
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
      error: error.message,
      exitCode: error.code || 1
    };
  }
}

/**
 * Create a custom slash command file
 */
export async function createCustomCommand(
  commandName: string,
  description: string,
  prompt: string,
  workingDirectory?: string
): Promise<AuggieResult> {
  try {
    const commandsDir = `${workingDirectory || process.cwd()}/.augment/commands`;
    const commandFile = `${commandsDir}/${commandName}.md`;

    // Create markdown file with frontmatter
    const content = `---
name: ${commandName}
description: ${description}
---

${prompt}
`;

    // Use node fs to create file
    const fs = await import('fs/promises');
    await fs.mkdir(commandsDir, { recursive: true });
    await fs.writeFile(commandFile, content, 'utf-8');

    return {
      success: true,
      output: `Created custom command: ${commandName}\nFile: ${commandFile}`,
      exitCode: 0
    };
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: `Failed to create custom command: ${error.message}`,
      exitCode: 1
    };
  }
}

/**
 * List available custom commands
 */
export async function listCustomCommands(
  workingDirectory?: string
): Promise<AuggieResult> {
  try {
    const commandsDir = `${workingDirectory || process.cwd()}/.augment/commands`;
    const fs = await import('fs/promises');

    try {
      const files = await fs.readdir(commandsDir);
      const mdFiles = files.filter(f => f.endsWith('.md'));

      if (mdFiles.length === 0) {
        return {
          success: true,
          output: 'No custom commands found',
          exitCode: 0
        };
      }

      const commands = await Promise.all(
        mdFiles.map(async (file) => {
          const content = await fs.readFile(`${commandsDir}/${file}`, 'utf-8');
          const nameMatch = content.match(/name:\s*(.+)/);
          const descMatch = content.match(/description:\s*(.+)/);

          return {
            file: file.replace('.md', ''),
            name: nameMatch ? nameMatch[1].trim() : file.replace('.md', ''),
            description: descMatch ? descMatch[1].trim() : 'No description'
          };
        })
      );

      const output = commands
        .map(cmd => `/${cmd.file}: ${cmd.description}`)
        .join('\n');

      return {
        success: true,
        output,
        exitCode: 0
      };
    } catch (error) {
      return {
        success: true,
        output: 'No custom commands directory found',
        exitCode: 0
      };
    }
  } catch (error: any) {
    return {
      success: false,
      output: '',
      error: error.message,
      exitCode: 1
    };
  }
}

/**
 * Advanced: Execute auggie with streaming output
 * Useful for long-running tasks
 */
export function executeAuggieStreaming(
  prompt: string,
  workingDirectory?: string,
  onOutput?: (data: string) => void,
  onError?: (data: string) => void
): Promise<AuggieResult> {
  return new Promise((resolve, reject) => {
    const child = spawn('auggie', [], {
      cwd: workingDirectory || process.cwd(),
      stdio: ['pipe', 'pipe', 'pipe']
    });

    let stdout = '';
    let stderr = '';

    // Send prompt to stdin
    child.stdin.write(prompt + '\n');
    child.stdin.end();

    child.stdout.on('data', (data) => {
      const str = data.toString();
      stdout += str;
      if (onOutput) onOutput(str);
    });

    child.stderr.on('data', (data) => {
      const str = data.toString();
      stderr += str;
      if (onError) onError(str);
    });

    child.on('close', (code) => {
      resolve({
        success: code === 0,
        output: stdout.trim(),
        error: stderr ? stderr.trim() : undefined,
        exitCode: code || 0
      });
    });

    child.on('error', (error) => {
      reject({
        success: false,
        output: stdout,
        error: error.message,
        exitCode: 1
      });
    });
  });
}
