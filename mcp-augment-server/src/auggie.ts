/**
 * Auggie CLI wrapper for programmatic access to Augment's context engine
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import type { AuggieQueryOptions, AuggieResult } from './types.js';

const execAsync = promisify(exec);

/**
 * Default timeout for Auggie CLI commands (60 seconds)
 */
const DEFAULT_TIMEOUT = 60000;

/**
 * Execute an Auggie CLI command with the given query
 * Uses --print flag for non-interactive, programmatic output
 */
export async function executeAuggieQuery(
  options: AuggieQueryOptions
): Promise<AuggieResult> {
  const { query, workingDirectory, timeout = DEFAULT_TIMEOUT } = options;

  try {
    // Check if auggie is installed
    try {
      await execAsync('which auggie', { timeout: 5000 });
    } catch (error) {
      return {
        success: false,
        output: '',
        error: 'Auggie CLI is not installed. Please install it with: npm install -g @augmentcode/auggie',
        exitCode: 127
      };
    }

    // Execute auggie command with --print flag for programmatic output
    const command = `auggie --print "${query.replace(/"/g, '\\"')}"`;

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
