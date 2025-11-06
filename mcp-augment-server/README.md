# MCP Augment Server

🚀 **FULL-FEATURED** MCP (Model Context Protocol) server với **AUTONOMOUS EDITING** - AI agent chỉ cần "mồi", server tự động phân tích, execute, và **SỬA CODE**!

## 📋 Tổng quan

Server này wrap **toàn bộ Auggie CLI capabilities** và expose qua Model Context Protocol, cho phép AI agents:
- ✅ Query và analyze codebase
- ✅ **TỰ ĐỘNG SỬA FILES** (create, modify, delete)
- ✅ Fix bugs, add features, refactor code
- ✅ Generate tests và documentation
- ✅ Custom slash commands

**Khác biệt chính:** Thay vì user phải prompt auggie, **AI sẽ tự generate optimal prompts và execute!**

### Tính năng chính

#### ⚡ AUTONOMOUS EDITING MODE (FULL POWER!)
- 🔥 **Autonomous Editor**: AI tự phân tích task, generate prompts, **TỰ SỬA CODE**, verify changes!
  - Fix bugs automatically
  - Add features với planning
  - Refactor code safely
  - Generate tests
  - Add documentation
  - Optimize performance
- 🔥 **Direct Editing**: Execute specific editing tasks
- 🔥 **Custom Slash Commands**: Tạo và sử dụng reusable commands
- 🔥 **Dry Run Mode**: Preview changes trước khi apply

#### 🤖 Autonomous Query Mode (Read-Only)
- ✅ **Autonomous Agent**: AI tự phân tích query, tạo plan, execute multiple queries, tổng hợp kết quả
- ✅ **Adaptive Agent**: Advanced với adaptive planning - tự thêm follow-up tasks

#### 📊 Basic Tools (Manual Control)
- ✅ **Query Codebase**: Hỏi về codebase bằng natural language
- ✅ **Analyze Code**: Phân tích files và patterns cụ thể
- ✅ **Search Codebase**: Tìm kiếm functions, classes, patterns
- ✅ **Codebase Structure**: Lấy overview về architecture
- ✅ **Find Usages**: Tìm nơi sử dụng functions/classes

**Total:** 12 MCP tools (4 editing + 3 autonomous + 5 basic)

## 🛠️ Yêu cầu

### Prerequisites

1. **Node.js** >= 18.0.0
2. **Auggie CLI** phải được cài đặt:
   ```bash
   npm install -g @augmentcode/auggie
   ```
3. Đăng nhập vào Augment account:
   ```bash
   auggie login
   ```

## 📦 Cài đặt

### Cài đặt từ source

```bash
# Clone repository
cd mcp-augment-server

# Cài đặt dependencies
npm install

# Build TypeScript
npm run build

# Chạy server
npm start
```

### Build Commands

```bash
# Build một lần
npm run build

# Build và watch for changes
npm run watch

# Build và run
npm run dev
```

## 🚀 Cách sử dụng

### 1. Standalone Mode

Chạy server trực tiếp:

```bash
node dist/index.js
```

### 2. MCP Client Integration

Thêm vào MCP client configuration (ví dụ: Claude Desktop):

```json
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": ["/path/to/mcp-augment-server/dist/index.js"],
      "env": {}
    }
  }
}
```

### 3. Coder Integration

Với [Coder](https://github.com/Codify-Labs/coder):

```json
{
  "mcp": {
    "servers": {
      "augment": {
        "command": "node /path/to/mcp-augment-server/dist/index.js"
      }
    }
  }
}
```

## 🔧 MCP Tools

Server expose **12 MCP tools**:

### ⚡ AUTONOMOUS EDITING TOOLS (FULL POWER!)

### 1. `autonomous_editor` 🔥 MOST POWERFUL

**AI tự động SỬA CODE - không cần user prompt auggie!**

**Parameters:**
- `request` (required): Editing request
- `workingDirectory` (optional): Path to codebase
- `dryRun` (optional): Preview mode (default: false)

**Example:**
```json
{
  "request": "Fix the bug where users can't login with email addresses containing special characters",
  "dryRun": false
}
```

**What happens:**
1. AI phân tích task → Identifies as BUG_FIX
2. Generate plan:
   - Locate and understand bug
   - Generate fix
   - Verify fix
3. Execute each step với auggie
4. **FILES ĐƯỢC SỬA TỰ ĐỘNG!**
5. Return comprehensive summary

**Supports:**
- ✅ Create files
- ✅ Fix bugs
- ✅ Refactor code
- ✅ Add features
- ✅ Add tests
- ✅ Add docs
- ✅ Optimize code

[📖 Full docs trong EDITING_MODE.md](EDITING_MODE.md)

### 2. `execute_editing_task`

**Direct editing cho specific tasks.**

```json
{
  "task": "Add comprehensive error handling to src/api/users.ts",
  "dryRun": false
}
```

### 3. `create_custom_command`

**Tạo reusable slash commands.**

```json
{
  "commandName": "security-audit",
  "description": "Comprehensive security audit",
  "prompt": "Analyze for SQL injection, XSS, auth issues..."
}
```

### 4. `list_custom_commands`

List all custom commands trong `.augment/commands/`

---

### 🤖 Autonomous Query Tools (READ-ONLY - Chỉ cần "mồi"!)

### 5. `autonomous_agent`

**AI agent chỉ cần "mồi" - MCP server tự query (READ-ONLY).**

**Parameters:**
- `initialQuery` (required): Câu hỏi ban đầu
- `workingDirectory` (optional): Đường dẫn đến codebase

**Example:**
```json
{
  "initialQuery": "How does authentication work in this project? Include flow, tokens, and session management.",
  "workingDirectory": "/path/to/project"
}
```

**What happens:**
1. MCP server phân tích query
2. Tạo execution plan (e.g., get structure → query details → search code → find usages)
3. Execute tất cả tasks tự động
4. Tổng hợp kết quả comprehensive

[📖 Chi tiết trong AUTONOMOUS_MODE.md](AUTONOMOUS_MODE.md)

### 6. `adaptive_agent`

**Advanced autonomous query với adaptive planning.**

**Parameters:**
- `initialQuery` (required): Câu hỏi ban đầu
- `maxIterations` (optional): Max iterations (default: 5)
- `workingDirectory` (optional): Đường dẫn đến codebase

**Example:**
```json
{
  "initialQuery": "Comprehensively analyze the payment system - architecture, security, error handling, and integration points",
  "maxIterations": 10,
  "workingDirectory": "/path/to/project"
}
```

**Adaptive features:**
- Tự động thêm follow-up tasks dựa trên findings
- Deep exploration mode
- Best for complex investigations

### 7. `execute_slash_command`

**Execute auggie slash commands.**

**Parameters:**
- `commandName` (required): Command name (without /)
- `args` (optional): Arguments
- `workingDirectory` (optional): Đường dẫn đến codebase

**Example:**
```json
{
  "commandName": "github-workflow",
  "args": "Generate PR workflow",
  "workingDirectory": "/path/to/project"
}
```

---

### 📊 Basic Query Tools (Manual Control)

### 8. `query_codebase`

Query codebase bằng natural language.

**Parameters:**
- `query` (required): Câu hỏi về codebase
- `workingDirectory` (optional): Đường dẫn đến codebase

**Example:**
```json
{
  "query": "How does user authentication work in this project?",
  "workingDirectory": "/path/to/project"
}
```

### 9. `analyze_code`

Phân tích file hoặc code pattern cụ thể.

**Parameters:**
- `filePath` (required): Đường dẫn file cần phân tích
- `analysisQuery` (required): Câu hỏi phân tích
- `workingDirectory` (optional): Đường dẫn đến codebase

**Example:**
```json
{
  "filePath": "src/auth/login.ts",
  "analysisQuery": "What does this function do and what are its dependencies?",
  "workingDirectory": "/path/to/project"
}
```

### 10. `search_codebase`

Tìm kiếm patterns, functions, classes trong codebase.

**Parameters:**
- `searchPattern` (required): Pattern cần tìm
- `workingDirectory` (optional): Đường dẫn đến codebase

**Example:**
```json
{
  "searchPattern": "API endpoints handling user data",
  "workingDirectory": "/path/to/project"
}
```

### 11. `get_codebase_structure`

Lấy overview về codebase structure và architecture.

**Parameters:**
- `workingDirectory` (optional): Đường dẫn đến codebase

**Example:**
```json
{
  "workingDirectory": "/path/to/project"
}
```

### 12. `find_usages`

Tìm nơi sử dụng function, class, hoặc variable.

**Parameters:**
- `identifier` (required): Tên function/class/variable
- `workingDirectory` (optional): Đường dẫn đến codebase

**Example:**
```json
{
  "identifier": "getUserById",
  "workingDirectory": "/path/to/project"
}
```

## 📁 Cấu trúc Project

```
mcp-augment-server/
├── src/
│   ├── index.ts          # Main MCP server
│   ├── tools.ts          # MCP tools implementation
│   ├── auggie.ts         # Auggie CLI wrapper
│   └── types.ts          # TypeScript type definitions
├── dist/                 # Compiled JavaScript (generated)
├── package.json
├── tsconfig.json
└── README.md
```

## 🔍 Technical Details

### Architecture

```
AI Agent (MCP Client)
    ↓ MCP Protocol (stdio)
MCP Augment Server
    ↓ CLI invocation
Auggie CLI
    ↓ Context Engine API
Augment Code Backend
```

### Auggie CLI Integration

Server sử dụng `auggie --print` flag để run non-interactive mode, phù hợp cho programmatic access:

```typescript
// Example: Chạy query
auggie --print "How does authentication work?"
```

### Error Handling

- ✅ Kiểm tra Auggie CLI có được cài đặt
- ✅ Timeout handling (default: 60s)
- ✅ Large output buffering (10MB)
- ✅ Graceful error messages
- ✅ Partial output trong error cases

## 🐛 Troubleshooting

### Auggie CLI không tìm thấy

```
Error: Auggie CLI is not installed
```

**Solution:**
```bash
npm install -g @augmentcode/auggie
auggie login
```

### Timeout errors

Nếu queries chạy quá lâu, tăng timeout trong `src/auggie.ts`:

```typescript
const DEFAULT_TIMEOUT = 120000; // 120 seconds
```

### Output buffer exceeded

Nếu gặp lỗi buffer quá lớn, tăng `maxBuffer`:

```typescript
maxBuffer: 20 * 1024 * 1024, // 20MB
```

## 🔒 Security

- ⚠️ Server chỉ expose **read-only** operations
- ⚠️ Không có editing tools để đảm bảo an toàn
- ⚠️ Chạy với permissions của user hiện tại
- ⚠️ Working directory có thể được giới hạn via configuration

## 📝 Development

### Running in Development

```bash
# Watch mode
npm run watch

# In another terminal
npm start
```

### Testing

```bash
# Chạy server và test với MCP client
npm run dev

# Hoặc test trực tiếp với CLI
echo '{"query": "test"}' | node dist/index.js
```

## 🤝 Contributing

Contributions are welcome! Vui lòng:

1. Fork repository
2. Tạo feature branch
3. Commit changes
4. Push và tạo Pull Request

## 📄 License

MIT License - xem file LICENSE để biết thêm chi tiết.

## 🔗 Links

- [Model Context Protocol](https://modelcontextprotocol.io)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [Augment Code](https://www.augmentcode.com)
- [Auggie CLI](https://docs.augmentcode.com/cli/overview)

## 📮 Support

Nếu gặp vấn đề hoặc có câu hỏi:
- Tạo issue trên GitHub
- Xem Auggie CLI docs: https://docs.augmentcode.com/cli/overview
- Xem MCP docs: https://modelcontextprotocol.io

---

**Made with ❤️ for the AI Agent ecosystem**
