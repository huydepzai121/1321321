# Ví dụ sử dụng MCP Augment Server

## 📚 Use Cases

### 1. Query về Authentication Flow

```json
{
  "tool": "query_codebase",
  "arguments": {
    "query": "Làm thế nào để user authentication hoạt động trong project này? Mô tả flow từ login đến session management.",
    "workingDirectory": "/path/to/project"
  }
}
```

**Response sẽ trả về:**
- Chi tiết về authentication flow
- Các files liên quan
- Dependencies và libraries được sử dụng
- Security best practices được áp dụng

### 2. Phân tích File cụ thể

```json
{
  "tool": "analyze_code",
  "arguments": {
    "filePath": "src/api/controllers/userController.ts",
    "analysisQuery": "Phân tích function này: dependencies, side effects, error handling, và performance considerations",
    "workingDirectory": "/path/to/project"
  }
}
```

### 3. Tìm kiếm Database Queries

```json
{
  "tool": "search_codebase",
  "arguments": {
    "searchPattern": "Tất cả các database queries liên quan đến user data, bao gồm raw SQL và ORM queries",
    "workingDirectory": "/path/to/project"
  }
}
```

### 4. Hiểu Project Structure

```json
{
  "tool": "get_codebase_structure",
  "arguments": {
    "workingDirectory": "/path/to/project"
  }
}
```

**Response sẽ bao gồm:**
- Tổng quan về architecture (MVC, microservices, etc.)
- Main directories và purposes
- Tech stack
- Entry points
- Configuration files

### 5. Tìm Function Usages

```json
{
  "tool": "find_usages",
  "arguments": {
    "identifier": "generateAuthToken",
    "workingDirectory": "/path/to/project"
  }
}
```

## 🔧 Integration Examples

### Claude Desktop Configuration

File: `~/Library/Application Support/Claude/claude_desktop_config.json`

```json
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": [
        "/Users/username/projects/mcp-augment-server/dist/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

### Programmatic Usage (Node.js)

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

async function queryAugment() {
  const transport = new StdioClientTransport({
    command: 'node',
    args: ['./dist/index.js'],
  });

  const client = new Client(
    { name: 'my-client', version: '1.0.0' },
    { capabilities: {} }
  );

  await client.connect(transport);

  // List available tools
  const tools = await client.listTools();
  console.log('Available tools:', tools);

  // Call a tool
  const result = await client.callTool({
    name: 'query_codebase',
    arguments: {
      query: 'How does the payment system work?',
      workingDirectory: '/path/to/project'
    }
  });

  console.log('Result:', result);
}

queryAugment();
```

## 🎯 Advanced Use Cases

### 1. Code Review Assistant

Sử dụng multiple tools để review PR:

```typescript
// Step 1: Lấy structure
const structure = await callTool('get_codebase_structure', {
  workingDirectory: '/project'
});

// Step 2: Analyze changed files
const analysis = await callTool('analyze_code', {
  filePath: 'src/newFeature.ts',
  analysisQuery: 'Review code quality, potential bugs, và security issues'
});

// Step 3: Check usages
const usages = await callTool('find_usages', {
  identifier: 'newApiEndpoint'
});
```

### 2. Documentation Generator

```typescript
// Query để generate docs
const docs = await callTool('query_codebase', {
  query: 'Tạo documentation cho tất cả public APIs trong project, bao gồm endpoints, parameters, responses, và examples'
});
```

### 3. Dependency Analysis

```typescript
const deps = await callTool('search_codebase', {
  searchPattern: 'Tìm tất cả dependencies và third-party libraries, analyze security vulnerabilities và outdated packages'
});
```

### 4. Migration Planning

```typescript
const migration = await callTool('query_codebase', {
  query: 'Analyze codebase để migrate từ Express sang Fastify. List tất cả files cần update và potential breaking changes'
});
```

## 🔄 Workflow Examples

### Debug Workflow

```typescript
// 1. Tìm lỗi
const errorSearch = await callTool('search_codebase', {
  searchPattern: 'error handling for database connections'
});

// 2. Analyze error handling code
const analysis = await callTool('analyze_code', {
  filePath: 'src/db/connection.ts',
  analysisQuery: 'Phân tích error handling strategy và suggest improvements'
});

// 3. Tìm related code
const related = await callTool('find_usages', {
  identifier: 'handleDatabaseError'
});
```

### Refactoring Workflow

```typescript
// 1. Understand current implementation
const current = await callTool('analyze_code', {
  filePath: 'src/legacy/userService.ts',
  analysisQuery: 'Document current implementation và dependencies'
});

// 2. Find all usages
const usages = await callTool('find_usages', {
  identifier: 'UserService'
});

// 3. Plan refactoring
const plan = await callTool('query_codebase', {
  query: 'Suggest refactoring strategy để modernize UserService, keeping backward compatibility'
});
```

## 💡 Tips & Best Practices

### 1. Specific Queries

❌ **Không tốt:**
```json
{"query": "Tell me about the code"}
```

✅ **Tốt:**
```json
{"query": "Explain the authentication flow in src/auth/, including JWT token generation and validation"}
```

### 2. Context-Rich Analysis

❌ **Không tốt:**
```json
{"analysisQuery": "What does this do?"}
```

✅ **Tốt:**
```json
{"analysisQuery": "Analyze this API endpoint: input validation, error handling, database queries, response format, and potential security issues"}
```

### 3. Working Directory

Luôn specify `workingDirectory` nếu không chạy từ project root:

```json
{
  "workingDirectory": "/full/path/to/project"
}
```

### 4. Batch Queries

Nếu cần multiple insights, gọi tools tuần tự:

```typescript
const results = await Promise.all([
  callTool('get_codebase_structure', {}),
  callTool('search_codebase', { searchPattern: 'test files' }),
  callTool('query_codebase', { query: 'How is testing organized?' })
]);
```

## 🎓 Learning Resources

- **MCP Protocol**: https://modelcontextprotocol.io
- **Auggie CLI**: https://docs.augmentcode.com/cli/overview
- **TypeScript SDK**: https://github.com/modelcontextprotocol/typescript-sdk

---

Có thêm use cases? Tạo issue hoặc PR để share!
