/**
 * Auggie CLI wrapper for programmatic access to Augment's context engine
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { AuggieQueryOptions, AuggieResult } from './types.js';

const execAsync = promisify(exec);

/**
 * Default timeout for Auggie CLI commands
 * Increased to 120 seconds to handle complex queries
 */
const DEFAULT_TIMEOUT = 120000; // 2 minutes

/**
 * Quick timeout for simple operations
 */
const QUICK_TIMEOUT = 30000; // 30 seconds

/**
 * Get auggie command path
 * Tries multiple locations to find auggie
 */
async function getAuggieCommand(): Promise<string> {
  // Check environment variable first
  if (process.env.AUGGIE_PATH) {
    try {
      await execAsync(`${process.env.AUGGIE_PATH} --version`, { timeout: 5000 });
      return process.env.AUGGIE_PATH;
    } catch {
      console.error(`[Warning] AUGGIE_PATH set to ${process.env.AUGGIE_PATH} but not found`);
    }
  }

  // Try direct command
  try {
    await execAsync('auggie --version', { timeout: 5000 });
    return 'auggie';
  } catch {
    // Not in PATH, try common npm global locations
    const possiblePaths = [
      // Unix/Linux/macOS
      '/usr/local/bin/auggie',
      '/opt/homebrew/bin/auggie',
      `${process.env.HOME}/.npm-global/bin/auggie`,
      `${process.env.HOME}/.nvm/versions/node/*/bin/auggie`,
      '/usr/bin/auggie',

      // Windows
      `${process.env.APPDATA}\\npm\\auggie.cmd`,
      `${process.env.APPDATA}\\npm\\auggie`,
      `C:\\Users\\${process.env.USERNAME}\\AppData\\Roaming\\npm\\auggie.cmd`,
      `C:\\Program Files\\nodejs\\auggie.cmd`,
    ];

    for (const path of possiblePaths) {
      try {
        await execAsync(`${path} --version`, { timeout: 5000 });
        return path;
      } catch {
        continue;
      }
    }

    // Check npm global bin
    try {
      const { stdout } = await execAsync('npm config get prefix', { timeout: 5000 });
      const npmPrefix = stdout.trim();

      // Try both Unix and Windows paths
      const npmPaths = [
        `${npmPrefix}/bin/auggie`,
        `${npmPrefix}\\auggie.cmd`,
        `${npmPrefix}\\auggie`,
      ];

      for (const path of npmPaths) {
        try {
          await execAsync(`"${path}" --version`, { timeout: 5000 });
          return path;
        } catch {
          continue;
        }
      }
    } catch {
      // Still not found
    }

    throw new Error('Auggie CLI not found in PATH or common locations');
  }
}

/**
 * Execute an Auggie CLI command with the given query
 * Uses --print flag for non-interactive, programmatic output
 */
export async function executeAuggieQuery(
  options: AuggieQueryOptions
): Promise<AuggieResult> {
  const { query, workingDirectory, timeout = DEFAULT_TIMEOUT } = options;

  try {
    // Get auggie command path
    const auggieCmd = await getAuggieCommand().catch((err) => {
      return null;
    });

    if (!auggieCmd) {
      return {
        success: false,
        output: '',
        error: `Auggie CLI not found. Please ensure:
1. Auggie is installed: npm install -g @augmentcode/auggie
2. You're logged in: auggie login
3. Auggie is in PATH or installed in standard location

Checked locations:
- AUGGIE_PATH environment variable: ${process.env.AUGGIE_PATH || 'not set'}
- System PATH
- /usr/local/bin/auggie (Unix/macOS)
- /opt/homebrew/bin/auggie (macOS Homebrew)
- ~/.npm-global/bin/auggie (Unix/macOS)
- %APPDATA%\\npm\\auggie.cmd (Windows)
- C:\\Users\\[USER]\\AppData\\Roaming\\npm\\auggie.cmd (Windows)
- npm global bin directory

Solutions:
1. Add auggie to PATH
2. Set AUGGIE_PATH in Claude Desktop config:
   Windows: "AUGGIE_PATH": "C:\\Users\\HUYDZ\\AppData\\Roaming\\npm\\auggie.cmd"
   Unix/macOS: "AUGGIE_PATH": "/usr/local/bin/auggie"
3. Reinstall auggie: npm install -g @augmentcode/auggie

For help, see PATH_FIX.md`,
        exitCode: 127
      };
    }

    // Execute auggie command with --print flag for programmatic output
    const command = `${auggieCmd} --print "${query.replace(/"/g, '\\"')}"`;

    const { stdout, stderr } = await execAsync(command, {
      cwd: workingDirectory || process.cwd(),
      timeout,
      maxBuffer: 10 * 1024 * 1024, // 10MB buffer for large outputs
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
      error: error.message || 'Unknown error executing auggie command',
      exitCode: error.code || 1
    };
  }
}

/**
 * Query the codebase using Auggie's context engine
 */
export async function queryCodebase(
  query: string,
  workingDirectory?: string
): Promise<AuggieResult> {
  return executeAuggieQuery({ query, workingDirectory });
}

/**
 * Analyze a specific file or code pattern
 */
export async function analyzeCode(
  filePath: string,
  analysisQuery: string,
  workingDirectory?: string
): Promise<AuggieResult> {
  const query = `Analyze the file ${filePath}: ${analysisQuery}`;
  return executeAuggieQuery({ query, workingDirectory });
}

/**
 * Search the codebase for specific patterns or functionality
 */
export async function searchCodebase(
  searchPattern: string,
  workingDirectory?: string
): Promise<AuggieResult> {
  const query = `Search the codebase for: ${searchPattern}`;
  return executeAuggieQuery({ query, workingDirectory });
}

/**
 * Get codebase structure and architecture information
 */
export async function getCodebaseStructure(
  workingDirectory?: string
): Promise<AuggieResult> {
  const query = 'Describe the overall structure and architecture of this codebase';
  return executeAuggieQuery({ query, workingDirectory });
}

/**
 * Find where a function or class is used in the codebase
 */
export async function findUsages(
  identifier: string,
  workingDirectory?: string
): Promise<AuggieResult> {
  const query = `Where is ${identifier} used in this codebase?`;
  return executeAuggieQuery({ query, workingDirectory });
}
