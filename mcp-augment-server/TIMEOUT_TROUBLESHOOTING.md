# Timeout Troubleshooting Guide

## 🚨 Vấn đề: "Context server request timeout"

Lỗi này xảy ra khi auggie CLI hoặc autonomous agent chạy quá lâu, vượt quá timeout của MCP client (Claude Desktop).

### Nguyên nhân chính:

1. **Autonomous Agent chạy nhiều tasks tuần tự** (3-5 tasks × 1-2 phút/task = quá lâu!)
2. **Query phức tạp** cần phân tích nhiều files
3. **Editing tasks lớn** (refactoring, multiple files)
4. **Codebase lớn** (>10K files) → auggie mất thời gian index
5. **MCP client timeout** (Claude Desktop thường timeout sau 60-120s)

---

## ✅ Solutions Đã Implement

### 1. **Increased Timeouts**

| Component | Old Timeout | New Timeout | Lý do |
|-----------|-------------|-------------|-------|
| Query (auggie.ts) | 60s | 120s | Complex queries cần nhiều thời gian |
| Editing (editor.ts) | 180s | 180s (+ 90s quick, 300s long) | Flexible timeouts |
| Autonomous Agent | 60s/task | 90s/task | Reduced but realistic |
| Total Agent Time | Unlimited | 240s (4 min) | Hard limit to prevent indefinite runs |

### 2. **Optimized Autonomous Agent**

**Trước đây:**
```
Query: "How does auth work?"
→ Task 1: Get structure (60s)
→ Task 2: Answer query (60s)
→ Task 3: Search auth code (60s)
Total: 180s+ → TIMEOUT!
```

**Bây giờ:**
```
Query: "How does auth work?"
→ Task 1: Answer with full context (90s)
Total: 90s → SUCCESS!
```

**Changes:**
- ✅ Reduced task count (3-5 tasks → 1-2 tasks)
- ✅ Smarter task generation (only necessary tasks)
- ✅ Early termination if approaching timeout
- ✅ Progress logging to track execution time

### 3. **Timeout Tracking**

Agent giờ track thời gian thực tế:

```typescript
[Agent] Executing task 1/2: Answer the main question
[Agent] Time remaining: 230s
[Agent] Task completed in 45s
[Agent] Total execution time: 45ms
```

Nếu sắp timeout → dừng sớm:
```typescript
[Agent] Approaching timeout limit (180000ms elapsed), stopping early
[Agent] Completed 2/3 tasks
```

---

## 🛠️ How to Fix Timeout Issues

### Option 1: Use Basic Tools Instead of Autonomous

Nếu autonomous_agent timeout, dùng basic tools:

```typescript
// Thay vì:
autonomous_agent({
  initialQuery: "Explain authentication system"
})

// Dùng:
query_codebase({
  query: "Explain authentication system in detail"
})
```

**Pros:**
- Chạy 1 query thay vì nhiều tasks
- Timeout thấp hơn (120s vs 240s)
- Kết quả nhanh hơn

**Cons:**
- Ít context hơn (không có structure overview)
- Cần manual follow-up queries

### Option 2: Break Down Large Queries

**❌ Bad (timeout risk):**
```
"Analyze entire authentication system including login, signup, password reset, session management, and OAuth integration"
```

**✅ Good:**
```
1. "How does login work?"
2. "How does password reset work?"
3. "How is OAuth integrated?"
```

### Option 3: Use Specific Tools for Specific Tasks

| Task Type | Best Tool | Why |
|-----------|-----------|-----|
| Single question | `query_codebase` | Fast, direct |
| Find code | `search_codebase` | Optimized for search |
| Analyze file | `analyze_code` | Focused analysis |
| Complex exploration | `autonomous_agent` | Multi-step but may timeout |
| Very complex | Break into multiple `query_codebase` | Manual but reliable |

### Option 4: Increase Client-Side Timeout

**File:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": ["path/to/mcp-augment-server/dist/index.js"],
      "env": {
        "AUGGIE_PATH": "C:\\Users\\HUYDZ\\AppData\\Roaming\\npm\\auggie.cmd"
      },
      "timeout": 300000
    }
  }
}
```

⚠️ **Note:** Not all MCP clients support custom timeout config. Check client docs.

### Option 5: Configure Custom Timeouts per Tool Call

Some tools support custom timeout parameters:

```typescript
// Autonomous agent with custom timeouts
autonomous_agent({
  initialQuery: "Complex query",
  maxTotalTime: 180000,  // 3 minutes total
  taskTimeout: 60000      // 1 minute per task
})

// Adaptive agent
adaptive_agent({
  initialQuery: "Exploratory query",
  maxIterations: 2,       // Limit iterations
  maxTotalTime: 120000,   // 2 minutes total
  taskTimeout: 60000      // 1 minute per task
})
```

---

## 📊 Timeout Configuration Summary

### Current Default Timeouts:

```typescript
// auggie.ts (basic queries)
DEFAULT_TIMEOUT = 120000  // 2 minutes
QUICK_TIMEOUT = 30000     // 30 seconds

// editor.ts (editing tasks)
DEFAULT_TIMEOUT = 180000       // 3 minutes
QUICK_EDIT_TIMEOUT = 90000     // 1.5 minutes
LONG_TIMEOUT = 300000          // 5 minutes

// agent.ts (autonomous mode)
TASK_TIMEOUT = 90000      // 90 seconds per task
MAX_TOTAL_TIME = 240000   // 4 minutes total
```

### Tool-Specific Timeouts:

| Tool | Timeout | Configurable? |
|------|---------|---------------|
| `query_codebase` | 120s | ❌ No |
| `search_codebase` | 120s | ❌ No |
| `analyze_code` | 120s | ❌ No |
| `autonomous_agent` | 240s total, 90s/task | ✅ Yes (`maxTotalTime`, `taskTimeout`) |
| `adaptive_agent` | 240s total, 90s/task | ✅ Yes (`maxTotalTime`, `taskTimeout`, `maxIterations`) |
| `autonomous_editor` | 180s+ | ❌ No (uses editor timeout) |
| `execute_editing_task` | 180s | ❌ No |

---

## 🔍 Debugging Timeout Issues

### 1. Check Logs

MCP server logs to stderr. Trong Claude Desktop, check:
- **Windows:** `%APPDATA%\Claude\logs\mcp.log`
- **macOS:** `~/Library/Logs/Claude/mcp.log`

Look for:
```
[Agent] Executing task 1/3: ...
[Agent] Time remaining: 150s
[Agent] Task completed in 65s
[Agent] Approaching timeout limit, stopping early
```

### 2. Test Locally

```bash
cd mcp-augment-server
npm run build

# Test basic query (should complete in <30s)
echo '{"query": "What is the main entry point?"}' | node dist/index.js

# Test with time tracking
time node dist/index.js
```

### 3. Identify Slow Queries

Auggie có thể chậm khi:
- First query sau khi restart (indexing codebase)
- Codebase lớn (>10K files)
- Complex architecture (monorepo, microservices)
- Heavy Git history

**Solution:** Run một simple query trước để warm up:
```typescript
// Warm-up query
query_codebase({ query: "List main directories" })

// Then run actual query
query_codebase({ query: "Complex question..." })
```

---

## 📋 Checklist When Getting Timeout

- [ ] Đang dùng `autonomous_agent`? → Thử `query_codebase` thay thế
- [ ] Query quá phức tạp? → Chia nhỏ thành multiple queries
- [ ] Codebase lớn? → Run warm-up query trước
- [ ] Lần đầu chạy? → Chờ auggie index xong
- [ ] Check logs → Xem task nào timeout
- [ ] Rebuild server → `npm run build` (đảm bảo timeout mới được apply)

---

## 🎯 Best Practices

### ✅ DO:

1. **Use basic tools for simple queries** (`query_codebase` cho single questions)
2. **Break down complex questions** into multiple small queries
3. **Rebuild after updating timeouts** (`npm run build`)
4. **Monitor execution time** via logs
5. **Test locally first** trước khi dùng trong Claude Desktop

### ❌ DON'T:

1. **Don't ask overly broad questions** ("Explain the entire system")
2. **Don't stack multiple questions** ("How does A work and B work and C work...")
3. **Don't ignore timeout warnings** in logs
4. **Don't use autonomous mode for simple queries** (overkill)
5. **Don't expect instant results** for large codebases

---

## 🚀 Performance Tips

### 1. Codebase Optimization

Thêm `.augmentignore` để auggie skip unnecessary files:

```
# .augmentignore
node_modules/
dist/
build/
.git/
*.log
*.lock
coverage/
.next/
```

### 2. Query Optimization

**❌ Vague:**
```
"Tell me about the code"
```

**✅ Specific:**
```
"Explain how user authentication is implemented in src/auth/"
```

### 3. Progressive Queries

Start broad → refine:

```
1. "What are the main modules?" (30s)
2. "Explain the auth module" (60s)
3. "How does login validation work?" (45s)
```

Total: 135s vs asking "Explain everything about authentication" → 180s+ timeout

---

## 📚 Related Docs

- [QUICKSTART.md](./QUICKSTART.md) - Setup and configuration
- [AUTONOMOUS_MODE.md](./AUTONOMOUS_MODE.md) - How autonomous agent works
- [PATH_FIX.md](./PATH_FIX.md) - Auggie CLI detection issues
- [WINDOWS_PATH_FIX.md](./WINDOWS_PATH_FIX.md) - Windows-specific fixes

---

## ❓ FAQ

**Q: Tại sao lúc được lúc không?**
A: Phụ thuộc vào:
- Độ phức tạp của query
- Auggie cache (query đầu tiên chậm hơn)
- System load
- Network (nếu auggie fetch remote resources)

**Q: Có thể tắt timeout không?**
A: Không khuyến khích. Set quá cao (>5 phút) có thể làm client hang.

**Q: Tool nào nhanh nhất?**
A: `query_codebase` (1 task, 120s max). `autonomous_agent` chậm nhất (multi-task).

**Q: Rebuild có giúp không?**
A: Có! Phải rebuild để apply timeout changes: `npm run build`

**Q: Timeout errors có crash server không?**
A: Không. Server handle gracefully và return partial results.

---

**Updated:** 2025-11-06
**Version:** 1.1.0 (với timeout optimizations)
