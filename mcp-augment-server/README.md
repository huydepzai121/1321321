# MCP Augment Server

🚀 MCP (Model Context Protocol) server implementation trong TypeScript để expose Augment's context engine cho các AI agents khác.

## 📋 Tổng quan

Server này wrap Auggie CLI của Augment Code và expose nó qua Model Context Protocol, cho phép các AI agents khác query và phân tích codebase một cách thông minh.

### Tính năng chính

- ✅ **Query Codebase**: Hỏi về codebase bằng natural language
- ✅ **Analyze Code**: Phân tích files và patterns cụ thể
- ✅ **Search Codebase**: Tìm kiếm functions, classes, patterns
- ✅ **Codebase Structure**: Lấy overview về architecture
- ✅ **Find Usages**: Tìm nơi sử dụng functions/classes

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

Server expose 5 MCP tools:

### 1. `query_codebase`

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

### 2. `analyze_code`

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

### 3. `search_codebase`

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

### 4. `get_codebase_structure`

Lấy overview về codebase structure và architecture.

**Parameters:**
- `workingDirectory` (optional): Đường dẫn đến codebase

**Example:**
```json
{
  "workingDirectory": "/path/to/project"
}
```

### 5. `find_usages`

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
