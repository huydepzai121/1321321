# Hướng dẫn Cài đặt Chi tiết

## 📋 Prerequisites

### 1. Cài đặt Node.js

Yêu cầu Node.js >= 18.0.0

**macOS:**
```bash
# Sử dụng Homebrew
brew install node

# Hoặc sử dụng nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
nvm use 18
```

**Linux (Ubuntu/Debian):**
```bash
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

**Windows:**
- Download từ: https://nodejs.org/
- Hoặc sử dụng `nvm-windows`

### 2. Cài đặt Auggie CLI

```bash
# Cài đặt global
npm install -g @augmentcode/auggie

# Verify installation
auggie --version

# Login vào Augment account
auggie login
```

Nếu chưa có account:
- Đăng ký tại: https://www.augmentcode.com/
- Follow setup instructions

## 🚀 Cài đặt MCP Augment Server

### Option 1: Từ Source (Recommended)

```bash
# 1. Clone repository
git clone <repository-url>
cd mcp-augment-server

# 2. Cài đặt dependencies
npm install

# 3. Build TypeScript code
npm run build

# 4. Test server
npm start

# 5. (Optional) Install globally
npm link
```

### Option 2: Từ NPM (Nếu published)

```bash
npm install -g mcp-augment-server
```

## 🔧 Configuration

### Claude Desktop

**macOS:**
```bash
# Edit config file
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
# Edit config file
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
# Edit config file
nano ~/.config/Claude/claude_desktop_config.json
```

Thêm configuration:

```json
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": [
        "/absolute/path/to/mcp-augment-server/dist/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

⚠️ **Lưu ý:** Phải sử dụng **absolute path**, không dùng relative path hoặc `~`

### Coder Integration

Edit `.coder/mcp.json`:

```json
{
  "mcp": {
    "servers": {
      "augment": {
        "command": "node",
        "args": ["/absolute/path/to/mcp-augment-server/dist/index.js"]
      }
    }
  }
}
```

### Continue.dev Integration

Edit `~/.continue/config.json`:

```json
{
  "experimental": {
    "modelContextProtocol": {
      "servers": [
        {
          "name": "augment",
          "command": "node",
          "args": ["/absolute/path/to/mcp-augment-server/dist/index.js"]
        }
      ]
    }
  }
}
```

## ✅ Verify Installation

### 1. Test Auggie CLI

```bash
# Test trong interactive mode
auggie

# Test với query
auggie "What is the structure of this codebase?"

# Test non-interactive mode (quan trọng cho MCP)
auggie --print "Test query"
```

### 2. Test MCP Server

```bash
# Build project
cd mcp-augment-server
npm run build

# Chạy server
npm start

# Server sẽ output:
# MCP Augment Server started successfully
# Server: mcp-augment-server v1.0.0
# Tools available: 5
# Waiting for MCP client connections...
```

### 3. Test với MCP Client

```bash
# Test basic communication
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm start
```

## 🐛 Troubleshooting

### Issue: "auggie: command not found"

**Solution:**
```bash
# Reinstall auggie
npm install -g @augmentcode/auggie

# Verify npm global bin path
npm config get prefix

# Add to PATH if needed (macOS/Linux)
export PATH="$PATH:$(npm config get prefix)/bin"
```

### Issue: "Cannot find module '@modelcontextprotocol/sdk'"

**Solution:**
```bash
cd mcp-augment-server
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Issue: TypeScript compilation errors

**Solution:**
```bash
# Verify TypeScript version
npm list typescript

# Reinstall if needed
npm install typescript@latest --save-dev
npm run build
```

### Issue: "EACCES: permission denied"

**Solution (macOS/Linux):**
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
sudo chown -R $(whoami) /usr/local/lib/node_modules

# Hoặc sử dụng nvm
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
nvm install 18
```

### Issue: Server starts but tools don't work

**Checklist:**
1. ✅ Auggie CLI installed? `auggie --version`
2. ✅ Logged in? `auggie login`
3. ✅ Correct working directory?
4. ✅ Check server logs (stderr)

## 🔍 Debugging

### Enable Debug Logging

```bash
# Set environment variable
NODE_DEBUG=* npm start

# Hoặc trong config
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": ["./dist/index.js"],
      "env": {
        "NODE_DEBUG": "*"
      }
    }
  }
}
```

### Check Server Logs

Server logs đi vào stderr (không ảnh hưởng stdio communication):

```bash
npm start 2> server.log
```

### Test Individual Components

```typescript
// test-auggie.ts
import { queryCodebase } from './src/auggie.js';

async function test() {
  const result = await queryCodebase('test query');
  console.log(result);
}

test();
```

```bash
npx tsx test-auggie.ts
```

## 📦 Build từ Source

### Development Build

```bash
# Install dependencies
npm install

# Build once
npm run build

# Build và watch
npm run watch

# Run in dev mode (build + run)
npm run dev
```

### Production Build

```bash
# Clean build
rm -rf dist/
npm run build

# Verify output
ls -la dist/

# Test
npm start
```

### Package for Distribution

```bash
# Create tarball
npm pack

# Hoặc publish to npm
npm publish
```

## 🌐 Network Issues

Nếu corporate network block npm registry:

### Option 1: Sử dụng npm mirror

```bash
npm config set registry https://registry.npmmirror.com
npm install
```

### Option 2: Offline installation

```bash
# Trên máy có internet, tạo tarball
npm pack

# Copy tarball sang máy offline
scp mcp-augment-server-1.0.0.tgz target-machine:~/

# Install offline
npm install ~/mcp-augment-server-1.0.0.tgz
```

## 🎯 Next Steps

Sau khi cài đặt thành công:

1. ✅ Đọc [README.md](README.md) để hiểu features
2. ✅ Xem [EXAMPLES.md](EXAMPLES.md) để học cách sử dụng
3. ✅ Test với MCP client (Claude Desktop, Coder, etc.)
4. ✅ Integrate vào workflow của bạn

## 🔗 Resources

- [MCP Documentation](https://modelcontextprotocol.io)
- [Auggie CLI Docs](https://docs.augmentcode.com/cli/overview)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Node.js Documentation](https://nodejs.org/docs/)

---

Need help? Tạo issue trên GitHub!
