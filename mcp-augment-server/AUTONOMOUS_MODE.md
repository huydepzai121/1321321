# 🤖 Autonomous Agent Mode

## Tổng quan

**Autonomous Mode** là tính năng mạnh mẽ nhất của MCP Augment Server - cho phép AI agents chỉ cần **"mồi"** một câu hỏi ban đầu, sau đó MCP server sẽ **TỰ ĐỘNG**:

1. ✅ Phân tích query và hiểu intent
2. ✅ Tạo execution plan với multiple sub-tasks
3. ✅ Execute từng task với auggie CLI
4. ✅ Sử dụng slash commands khi cần
5. ✅ Tổng hợp kết quả comprehensive

## 🎯 Tại sao cần Autonomous Mode?

### ❌ Trước (Manual Mode):

```typescript
// AI agent phải call multiple tools manually
const result1 = await callTool('get_codebase_structure');
const result2 = await callTool('query_codebase', { query: 'How does auth work?' });
const result3 = await callTool('search_codebase', { pattern: 'auth code' });
const result4 = await callTool('find_usages', { identifier: 'AuthService' });

// AI agent phải tự tổng hợp kết quả
const synthesis = combineResults(result1, result2, result3, result4);
```

**Problems:**
- AI agent phải biết call tools nào
- Phải orchestrate multiple calls
- Phải tự tổng hợp kết quả
- Mất nhiều round-trips

### ✅ Sau (Autonomous Mode):

```typescript
// AI agent CHỈ CẦN "MỒI" một câu hỏi
const result = await callTool('autonomous_agent', {
  initialQuery: 'How does authentication work in this project?'
});

// MCP server tự động làm TẤT CẢ!
// - Phân tích query
// - Tạo plan: structure → query → search → usages
// - Execute tất cả
// - Tổng hợp kết quả
```

**Benefits:**
- ✅ AI agent chỉ cần 1 call duy nhất
- ✅ MCP server tự động orchestrate
- ✅ Intelligent planning
- ✅ Comprehensive results
- ✅ Giảm latency

## 🛠️ Autonomous Tools

### 1. `autonomous_agent` (Standard)

**Recommended cho:** Most use cases, complex questions

```json
{
  "tool": "autonomous_agent",
  "arguments": {
    "initialQuery": "How does user authentication work?",
    "workingDirectory": "/path/to/project"
  }
}
```

**Hoạt động như thế nào:**

1. **Query Analysis**: Phân tích query để hiểu intent
2. **Plan Generation**: Tạo execution plan với 2-5 tasks
3. **Sequential Execution**: Execute tasks theo thứ tự
4. **Result Synthesis**: Tổng hợp kết quả comprehensive

**Example Plans:**

| Query Type | Generated Tasks |
|------------|----------------|
| "How does X work?" | 1. Get structure<br>2. Query details<br>3. Search related code |
| "Find X" | 1. Search for X<br>2. Explain findings |
| "Analyze X" | 1. Analyze X<br>2. Get suggestions |
| "Where is X used?" | 1. Find usages<br>2. Explain usage patterns |

### 2. `adaptive_agent` (Advanced)

**Recommended cho:** Exploratory analysis, deep dives, research

```json
{
  "tool": "adaptive_agent",
  "arguments": {
    "initialQuery": "Analyze the payment system comprehensively",
    "maxIterations": 7,
    "workingDirectory": "/path/to/project"
  }
}
```

**Khác biệt với `autonomous_agent`:**

- **Adaptive Planning**: Có thể thêm tasks mới dựa trên intermediate results
- **Dynamic Exploration**: Tự động follow interesting findings
- **Iteration Limit**: Có max iterations để tránh infinite loops
- **Deeper Analysis**: Phù hợp cho complex investigations

**Example Adaptive Flow:**

```
Initial Query: "Analyze payment system"

Task 1: Get structure
  → Result: Found PaymentService, StripeIntegration
  → Adaptive: Add task to analyze PaymentService

Task 2: Query payment system
  → Result: Mentions webhook handling
  → Adaptive: Add task to find webhook code

Task 3: Analyze PaymentService
  → Result: Uses Redis for caching
  → Adaptive: Add task to analyze caching strategy

... continues until max iterations or completion
```

## 📚 Use Cases

### Use Case 1: Understanding New Codebase

**Scenario:** Developer join team mới, cần hiểu codebase

```json
{
  "tool": "autonomous_agent",
  "arguments": {
    "initialQuery": "Give me a comprehensive overview of this codebase - architecture, main components, tech stack, and entry points"
  }
}
```

**Agent sẽ tự động:**
1. Get codebase structure
2. Query về architecture patterns
3. Query về tech stack và dependencies
4. Tổng hợp comprehensive overview

### Use Case 2: Debugging

**Scenario:** Bug trong authentication flow

```json
{
  "tool": "adaptive_agent",
  "arguments": {
    "initialQuery": "Analyze the authentication flow and find potential issues with token expiration",
    "maxIterations": 10
  }
}
```

**Agent sẽ tự động:**
1. Get codebase structure
2. Search authentication code
3. Find token-related code
4. Analyze token expiration logic
5. [Adaptive] Find related error handling
6. [Adaptive] Check token refresh logic
7. Tổng hợp findings và potential issues

### Use Case 3: Code Review

**Scenario:** Review PR về payment feature

```json
{
  "tool": "autonomous_agent",
  "arguments": {
    "initialQuery": "Review the payment integration code - check for security issues, error handling, and best practices"
  }
}
```

**Agent sẽ tự động:**
1. Search payment code
2. Analyze security aspects
3. Check error handling
4. Find usage patterns
5. Tổng hợp review comments

### Use Case 4: Migration Planning

**Scenario:** Plan migration from REST to GraphQL

```json
{
  "tool": "adaptive_agent",
  "arguments": {
    "initialQuery": "Analyze all REST API endpoints and provide migration plan to GraphQL",
    "maxIterations": 15
  }
}
```

**Agent sẽ tự động:**
1. Search REST endpoints
2. Analyze endpoint patterns
3. Find related models/types
4. Check authentication/authorization
5. [Adaptive] Analyze data fetching patterns
6. [Adaptive] Find N+1 query issues
7. Create comprehensive migration plan

## 🎨 Response Format

Autonomous agents trả về results theo format:

```markdown
# Autonomous Agent Analysis Results

**Initial Query:** [Your query]

**Reasoning:** [Why these tasks were chosen]

**Tasks Executed:** [Number]

---

## Task 1: [Description]

✅ **Success**

[Detailed results from auggie]

---

## Task 2: [Description]

✅ **Success**

[Detailed results from auggie]

---

## Summary

- Total tasks: X
- Successful: Y
- Failed: Z

### Key Findings

[Synthesis of all findings]
```

## 🔧 Slash Commands Integration

Autonomous agents có thể sử dụng slash commands:

### Built-in Slash Commands

```typescript
// Agent có thể tự động execute
/github-workflow
/code-review
/feedback
```

### Custom Slash Commands

Tạo trong `.augment/commands/`:

```markdown
---
name: security-check
description: Security audit
---

Perform comprehensive security audit:
- Check authentication
- Review authorization
- Find SQL injection risks
- Check XSS vulnerabilities
```

Agent có thể call:

```json
{
  "tool": "execute_slash_command",
  "arguments": {
    "commandName": "security-check"
  }
}
```

## 🎯 Best Practices

### 1. Write Clear Queries

❌ **Vague:**
```json
{"initialQuery": "Tell me about code"}
```

✅ **Specific:**
```json
{"initialQuery": "Explain the authentication flow from login to session management, including JWT handling"}
```

### 2. Use Appropriate Mode

| Scenario | Use |
|----------|-----|
| Single clear question | `autonomous_agent` |
| Exploratory research | `adaptive_agent` |
| Need specific info | Basic tools (`query_codebase`) |

### 3. Set Iteration Limits

```json
{
  "tool": "adaptive_agent",
  "arguments": {
    "initialQuery": "...",
    "maxIterations": 5  // Prevent excessive queries
  }
}
```

### 4. Specify Working Directory

```json
{
  "workingDirectory": "/absolute/path/to/project"
}
```

## 🔍 How It Works Internally

### Query Analysis Engine

```typescript
function generatePlan(query: string): AgentPlan {
  // Analyze query intent
  if (query.includes('how') || query.includes('work')) {
    // → Explanation pattern
    return [getStructure, queryDetails, searchRelated];
  }

  if (query.includes('find') || query.includes('where')) {
    // → Search pattern
    return [search, explainFindings];
  }

  // ... more patterns
}
```

### Execution Flow

```typescript
async function executeAutonomousAgent(query: string) {
  // 1. Generate plan
  const plan = generatePlan(query);

  // 2. Execute tasks
  const results = [];
  for (const task of plan.tasks) {
    const result = await executeTask(task);
    results.push(result);

    // Stop if critical failure
    if (!result.success && task.critical) break;
  }

  // 3. Synthesize
  return synthesizeResults(plan, results);
}
```

### Adaptive Planning

```typescript
async function executeAdaptiveAgent(query: string) {
  const plan = generatePlan(query);

  for (let i = 0; i < plan.tasks.length; i++) {
    const result = await executeTask(plan.tasks[i]);

    // Adaptive: Add follow-up tasks
    if (shouldAddFollowUp(result)) {
      plan.tasks.push(generateFollowUpTask(result));
    }
  }
}
```

## 📊 Performance

### Benchmark Results

| Mode | Queries | Latency | Completeness |
|------|---------|---------|--------------|
| Manual | 4-6 individual calls | High (multiple round-trips) | Depends on AI |
| Autonomous | 1 call | Medium (sequential execution) | High (planned) |
| Adaptive | 1 call | Higher (more tasks) | Very High |

### Optimization Tips

1. **Use Standard for Simple Queries**: Faster than adaptive
2. **Set Reasonable Iteration Limits**: Prevent excessive calls
3. **Specify Working Directory**: Avoid auggie searching wrong path
4. **Monitor Execution Logs**: Check stderr for progress

## 🚀 Integration Examples

### Claude Desktop

```json
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": ["/path/to/mcp-augment-server/dist/index.js"]
    }
  }
}
```

**Usage in Claude:**
```
User: How does authentication work in my project?

Claude: I'll use the autonomous_agent tool from Augment MCP server.

[Calls autonomous_agent with the query]

[Receives comprehensive analysis with multiple sub-queries executed]

Claude: Based on the autonomous analysis, here's how authentication works...
```

### Programmatic Usage

```typescript
import { Client } from '@modelcontextprotocol/sdk/client/index.js';

const client = new Client(...);
await client.connect(...);

// AI agent chỉ cần "mồi"
const result = await client.callTool({
  name: 'autonomous_agent',
  arguments: {
    initialQuery: 'Analyze payment system security'
  }
});

console.log(result.content[0].text);
// → Comprehensive analysis with multiple aspects covered
```

## 💡 Tips & Tricks

### Combine with Other Tools

```typescript
// Use autonomous for exploration
const overview = await callTool('autonomous_agent', {
  initialQuery: 'Overview of API endpoints'
});

// Then use specific tools for details
const specific = await callTool('analyze_code', {
  filePath: 'src/api/users.ts',
  analysisQuery: 'Security review'
});
```

### Debug Agent Planning

Check stderr logs để xem agent planning:

```
[Agent] Executing task: Get codebase structure
[Agent] Executing task: Query authentication details
[Agent] Executing task: Search auth-related code
[Adaptive Agent] Iteration 4: Analyze token handling
```

### Customize Plans

Future version sẽ support custom planning strategies:

```typescript
// Coming soon
const result = await callTool('autonomous_agent', {
  initialQuery: '...',
  planningStrategy: 'breadth-first' | 'depth-first' | 'custom'
});
```

## 🎓 Learning Resources

- **Query Analysis**: Xem `src/agent.ts` function `generatePlan()`
- **Task Execution**: Xem `src/agent.ts` function `executeTask()`
- **Adaptive Logic**: Xem `src/agent.ts` function `executeAdaptiveAgent()`

## ⚙️ Configuration

### Environment Variables (Future)

```bash
# Max tasks per autonomous execution
MAX_AUTONOMOUS_TASKS=10

# Timeout per task
TASK_TIMEOUT=60000

# Enable adaptive planning
ENABLE_ADAPTIVE=true
```

---

**Autonomous Mode = AI Agent chỉ cần "mồi", MCP server làm tất cả!** 🚀
