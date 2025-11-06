# 🚀 Quick Start - Cách Chạy MCP Augment Server

## Bước 1: Cài đặt Prerequisites

### 1.1. Node.js (>= 18.0.0)

```bash
# Check version
node --version

# Nếu chưa có, cài đặt:
# macOS
brew install node

# Ubuntu/Debian
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 1.2. Auggie CLI

```bash
# Install globally
npm install -g @augmentcode/auggie

# Verify installation
auggie --version

# Login (bắt buộc!)
auggie login
# → Follow prompts để đăng nhập Augment account
```

---

## Bước 2: Build MCP Server

```bash
# Vào thư mục project
cd mcp-augment-server

# Install dependencies
npm install

# Build TypeScript
npm run build

# Verify build thành công
ls dist/
# Should see: index.js, tools.js, auggie.js, etc.
```

---

## Bước 3: Test Server (Standalone)

### Option A: Test Read-Only Features (100% Safe)

```bash
# Start server
npm start

# Server sẽ output:
# MCP Augment Server started successfully
# Server: mcp-augment-server v1.0.0
# Tools available: 12
# Waiting for MCP client connections...
```

Server chạy qua **stdio** nên không có port/URL. Cần MCP client để connect.

### Option B: Quick Test với Echo

```bash
# Test list tools
echo '{"jsonrpc":"2.0","id":1,"method":"tools/list"}' | npm start

# Expected output:
# → List of 12 tools
```

---

## Bước 4: Connect MCP Client

### Option 1: Claude Desktop (Recommended)

#### 4.1. Tìm config file:

**macOS:**
```bash
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
```

**Windows:**
```bash
notepad %APPDATA%\Claude\claude_desktop_config.json
```

**Linux:**
```bash
nano ~/.config/Claude/claude_desktop_config.json
```

#### 4.2. Thêm server config:

```json
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": [
        "/ABSOLUTE/PATH/TO/mcp-augment-server/dist/index.js"
      ],
      "env": {
        "NODE_ENV": "production"
      }
    }
  }
}
```

⚠️ **QUAN TRỌNG:**
- Phải dùng **absolute path** (full path)
- Không dùng `~` hoặc relative paths
- Ví dụ: `/Users/username/projects/1321321/mcp-augment-server/dist/index.js`

#### 4.3. Restart Claude Desktop

```bash
# Close và mở lại Claude Desktop
```

#### 4.4. Verify trong Claude:

Trong Claude Desktop, bạn sẽ thấy:
- 🔧 Tool icon (hammer)
- Click → See list of 12 MCP tools
- Try: "Use autonomous_agent to analyze this codebase"

### Option 2: Coder

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

### Option 3: Custom MCP Client

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'node',
  args: ['/path/to/mcp-augment-server/dist/index.js']
});

const client = new Client(
  { name: 'my-client', version: '1.0.0' },
  { capabilities: {} }
);

await client.connect(transport);

// List tools
const tools = await client.listTools();
console.log('Available tools:', tools);

// Call autonomous_agent
const result = await client.callTool({
  name: 'autonomous_agent',
  arguments: {
    initialQuery: 'How does authentication work in this project?'
  }
});

console.log(result);
```

---

## Bước 5: Sử dụng Tools

### 5.1. Read-Only Query (100% Safe)

**Trong Claude Desktop:**

```
You: "Use the autonomous_agent tool to explain how authentication works in this codebase"

Claude: [Calls autonomous_agent tool]
→ MCP server tự động:
  1. Gets codebase structure
  2. Queries auth details
  3. Searches auth code
  4. Synthesizes comprehensive answer

Claude: [Presents results to you]
```

**Example với query_codebase:**

```
You: "Use query_codebase to find all API endpoints"

Claude: [Calls query_codebase]
→ auggie --print "find all API endpoints"
→ Returns list of endpoints

Claude: Here are all the API endpoints...
```

### 5.2. Editing Mode (⚠️ Test First!)

**Preview với Dry Run:**

```
You: "Use autonomous_editor with dryRun=true to preview fixing the login bug"

Claude: [Calls autonomous_editor with dryRun: true]
→ Shows what WILL be changed
→ NO actual modifications

Claude: Here's what would be changed...
```

**Actual Editing:**

```
You: "Use autonomous_editor to fix the login bug (no dry run)"

Claude: [Calls autonomous_editor with dryRun: false]
→ AI analyzes bug
→ Generates fix
→ MODIFIES FILES
→ Returns summary of changes

Claude: I've fixed the bug. Files modified:
- src/auth/login.ts
```

### 5.3. Custom Commands

**Create Command:**

```
You: "Create a custom command called 'security-audit'"

Claude: [Calls create_custom_command]
→ Creates .augment/commands/security-audit.md

Claude: Custom command created!
```

**Use Command:**

```
You: "Run the security-audit command"

Claude: [Calls execute_slash_command]
→ auggie command security-audit
→ Runs security audit

Claude: Here's the security audit report...
```

---

## 🔧 Troubleshooting

### Problem 1: "auggie: command not found"

```bash
# Solution: Install auggie
npm install -g @augmentcode/auggie

# Verify
which auggie
auggie --version
```

### Problem 2: "Auggie not logged in"

```bash
# Solution: Login
auggie login

# Follow prompts to authenticate
```

### Problem 3: Server not showing in Claude Desktop

**Check:**
1. ✅ Path trong config là absolute?
2. ✅ File `dist/index.js` tồn tại?
3. ✅ Đã restart Claude Desktop?
4. ✅ Check Claude Desktop logs

**macOS logs:**
```bash
tail -f ~/Library/Logs/Claude/mcp*.log
```

### Problem 4: "Cannot find module @modelcontextprotocol/sdk"

```bash
# Solution: Reinstall dependencies
cd mcp-augment-server
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Problem 5: Editing không work

```bash
# Check auggie CLI version
auggie --version

# Test manually
cd /path/to/test-project
auggie --print "Create a test file called hello.txt"

# If file NOT created:
# → Editing via --print may not be supported
# → Update implementation to use pipe or stdin method
```

---

## 🎯 Recommended Workflow

### Day 1: Test Read-Only

```bash
1. Build server: npm run build
2. Add to Claude Desktop config
3. Restart Claude
4. Test query tools:
   - query_codebase
   - autonomous_agent
   - search_codebase
```

### Day 2: Test Custom Commands

```bash
1. Create custom command
2. List commands
3. Execute command
4. Verify works
```

### Day 3: Test Editing (Carefully!)

```bash
1. Use dryRun=true first!
2. Review preview
3. If looks good, try actual edit
4. Verify files changed
5. Review with git diff
```

---

## 📊 Feature Availability

| Feature | Status | Command |
|---------|--------|---------|
| Query codebase | ✅ Ready | `npm start` |
| Autonomous agents | ✅ Ready | `npm start` |
| Custom commands | ✅ Ready | `npm start` |
| **Editing mode** | ⚠️ Test First | `npm start` + verify |

---

## 🚀 Full Example Session

```bash
# Terminal 1: Build and verify
cd mcp-augment-server
npm install
npm run build
ls dist/  # Verify files

# Terminal 2: Test auggie CLI
auggie --version
auggie login
cd /path/to/test-project
auggie --print "What files are here?"

# Terminal 3: Configure Claude Desktop
nano ~/Library/Application\ Support/Claude/claude_desktop_config.json
# Add config (see above)
# Save and quit

# Restart Claude Desktop

# In Claude Desktop:
# "Use autonomous_agent to analyze this codebase structure"
# → Should work!

# Try editing (carefully):
# "Use autonomous_editor with dryRun true to preview fixing bug"
# → Review output
# "Now run without dry run"
# → Check if files actually changed with git diff
```

---

## 📖 Next Steps

After getting it running:

1. **Read Documentation:**
   - `AUTONOMOUS_MODE.md` - How autonomous agents work
   - `EDITING_MODE.md` - How editing features work
   - `IMPLEMENTATION_STATUS.md` - What's tested vs untested

2. **Try Examples:**
   - See `EXAMPLES.md` for usage patterns
   - See `examples/autonomous-usage.md` for workflows

3. **Verify Editing:**
   - Follow testing checklist in `IMPLEMENTATION_STATUS.md`
   - Update code if needed based on findings

4. **Customize:**
   - Create custom commands for your workflow
   - Add team-specific commands in `.augment/commands/`

---

## 💡 Pro Tips

### Tip 1: Start Safe

```bash
# Only enable read-only tools first
# Add to config:
{
  "env": {
    "ENABLE_EDITING": "false"
  }
}
```

### Tip 2: Watch Server Logs

```bash
# Server logs go to stderr
npm start 2> server.log

# In another terminal:
tail -f server.log
```

### Tip 3: Test in Isolated Directory

```bash
# Don't test in production code!
mkdir /tmp/test-project
cd /tmp/test-project
git init
echo "test" > test.txt

# Now safe to test editing
```

### Tip 4: Use Git

```bash
# Always commit before testing edits
git add .
git commit -m "Before testing MCP edits"

# Test editing

# Review changes
git diff

# Rollback if needed
git reset --hard HEAD
```

---

## 🎊 Summary

**Minimal Start (Read-Only):**
```bash
cd mcp-augment-server
npm install
npm run build
# Add to Claude Desktop config
# Restart Claude
# Done! 8 tools ready to use
```

**Full Start (With Editing):**
```bash
# Same as above, plus:
npm install -g @augmentcode/auggie
auggie login
# Test editing carefully
# Verify files actually change
# Update code if needed
```

**Current Status:**
- ✅ Read-only: **Production ready**
- ⚠️ Editing: **Test first, then deploy**

Bắt đầu với read-only là safest! 🚀
