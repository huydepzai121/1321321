/**
 * Type definitions for Auggie CLI wrapper and MCP server
 */

export interface AuggieQueryOptions {
  query: string;
  workingDirectory?: string;
  timeout?: number;
}

export interface AuggieResult {
  success: boolean;
  output: string;
  error?: string;
  exitCode?: number;
}

export interface CodebaseContext {
  query: string;
  response: string;
  timestamp: string;
}

export interface AnalysisResult {
  filePath?: string;
  analysis: string;
  suggestions?: string[];
}

export interface SearchResult {
  pattern: string;
  matches: string;
  fileCount?: number;
}
