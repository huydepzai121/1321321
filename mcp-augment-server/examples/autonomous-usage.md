# Autonomous Mode Usage Examples

## Quick Start

### Example 1: Simple Query

**AI Agent gửi:**
```json
{
  "tool": "autonomous_agent",
  "arguments": {
    "initialQuery": "How does authentication work?"
  }
}
```

**MCP Server tự động:**
1. Get codebase structure
2. Query authentication details
3. Search auth-related code
4. Tổng hợp kết quả

**AI Agent nhận:**
```markdown
# Autonomous Agent Analysis Results

**Initial Query:** How does authentication work?

**Reasoning:** Query asks for explanation - will get structure first, then query specifics, then find related code

**Tasks Executed:** 3

---

## Task 1: Get overall codebase structure for context

✅ Success

[Codebase structure details...]

---

## Task 2: Answer the main question

✅ Success

Authentication in this project uses JWT tokens with the following flow:
1. User submits credentials to /api/login
2. Server validates against database
3. JWT token generated with user claims
4. Token stored in httpOnly cookie
...

---

## Task 3: Find authentication-related code

✅ Success

Found authentication code in:
- src/auth/login.ts - Login handler
- src/auth/middleware.ts - Auth middleware
- src/auth/jwt.ts - Token generation
...

---

## Summary

- Total tasks: 3
- Successful: 3
- Failed: 0

### Key Findings

The autonomous agent successfully analyzed your query...
```

## Example 2: Complex Analysis

**AI Agent:**
```json
{
  "tool": "adaptive_agent",
  "arguments": {
    "initialQuery": "Comprehensively analyze the payment system - architecture, security, error handling",
    "maxIterations": 10
  }
}
```

**Adaptive agent tự động:**
1. Get structure → Finds PaymentService
2. Query payment system → Mentions Stripe integration
3. Search Stripe code → Finds webhook handlers
4. [Adaptive] Analyze webhook security
5. [Adaptive] Check error handling in payments
6. [Adaptive] Review transaction logging
7. Tổng hợp comprehensive analysis

## Example 3: Using with Claude Desktop

**User:** "I want to understand how the API endpoints are structured"

**Claude:** "Let me use the Augment MCP autonomous agent to analyze this."

```typescript
// Claude calls:
{
  tool: "autonomous_agent",
  arguments: {
    initialQuery: "Analyze API endpoint structure, routing, middleware, and patterns"
  }
}

// Receives comprehensive analysis
// Presents to user in friendly format
```

## Example 4: Slash Command Integration

**AI Agent:**
```json
{
  "tool": "execute_slash_command",
  "arguments": {
    "commandName": "code-review",
    "args": "src/payment/checkout.ts"
  }
}
```

**Result:**
```markdown
# Code Review: src/payment/checkout.ts

## Security Issues
- [ ] API key exposed in code
- [ ] Missing input validation

## Best Practices
- [x] Error handling implemented
- [ ] Missing unit tests

...
```

## Integration Patterns

### Pattern 1: Two-Phase Analysis

```typescript
// Phase 1: Quick overview with autonomous agent
const overview = await callTool('autonomous_agent', {
  initialQuery: 'Give me an overview of the authentication system'
});

// Phase 2: Deep dive on specific findings
const detail = await callTool('analyze_code', {
  filePath: 'src/auth/jwt.ts',
  analysisQuery: 'Security review of JWT implementation'
});
```

### Pattern 2: Progressive Exploration

```typescript
// Start broad
const broad = await callTool('autonomous_agent', {
  initialQuery: 'What are the main components?'
});

// Get more specific based on results
const specific = await callTool('adaptive_agent', {
  initialQuery: 'Deep dive into the UserService component',
  maxIterations: 10
});
```

## Comparison: Manual vs Autonomous

### Manual Mode (Old Way)

```typescript
// AI agent has to orchestrate everything
const step1 = await callTool('get_codebase_structure');
// Analyze result...

const step2 = await callTool('query_codebase', {
  query: 'How does X work?'
});
// Analyze result...

const step3 = await callTool('search_codebase', {
  pattern: 'X related code'
});
// Analyze result...

const step4 = await callTool('find_usages', {
  identifier: 'XService'
});

// AI agent combines all results
const final = combineResults(step1, step2, step3, step4);
```

**Problems:**
- 4+ round trips
- AI agent must plan
- Complex orchestration
- Higher latency

### Autonomous Mode (New Way)

```typescript
// AI agent just "kicks off"
const result = await callTool('autonomous_agent', {
  initialQuery: 'How does X work?'
});

// Done! MCP server did everything
```

**Benefits:**
- 1 round trip
- MCP server plans
- Simple call
- Lower latency
- Better results

## Best Practices

### 1. Be Specific in Queries

❌ Bad:
```json
{"initialQuery": "Tell me about code"}
```

✅ Good:
```json
{"initialQuery": "Explain the authentication flow from login through session management, including JWT token handling and refresh logic"}
```

### 2. Choose Right Mode

| Query Type | Use |
|------------|-----|
| "How does X work?" | `autonomous_agent` |
| "Find all uses of X" | `autonomous_agent` |
| "Deep analysis of X" | `adaptive_agent` with high iterations |
| "What is X exactly?" | `query_codebase` (simple) |

### 3. Set Appropriate Limits

```json
{
  "tool": "adaptive_agent",
  "arguments": {
    "initialQuery": "...",
    "maxIterations": 5  // Start conservative
  }
}
```

### 4. Monitor Logs

```bash
# Server logs show agent planning
npm start 2> agent.log

# Check progress
tail -f agent.log
```

## Real-World Examples

### Onboarding New Developer

```json
{
  "tool": "autonomous_agent",
  "arguments": {
    "initialQuery": "I'm new to this codebase. Give me a comprehensive overview: architecture, main components, tech stack, development workflow, and where to start contributing."
  }
}
```

### Bug Investigation

```json
{
  "tool": "adaptive_agent",
  "arguments": {
    "initialQuery": "Investigate the reported bug with user sessions expiring unexpectedly. Analyze session management, token handling, and timeout logic.",
    "maxIterations": 8
  }
}
```

### Security Audit

```json
{
  "tool": "adaptive_agent",
  "arguments": {
    "initialQuery": "Perform security audit: authentication, authorization, input validation, SQL injection risks, XSS vulnerabilities, and secrets management.",
    "maxIterations": 12
  }
}
```

### Performance Analysis

```json
{
  "tool": "autonomous_agent",
  "arguments": {
    "initialQuery": "Analyze API performance: database queries, N+1 problems, caching strategy, and optimization opportunities."
  }
}
```

## Tips & Tricks

### Tip 1: Use for Documentation

```typescript
// Auto-generate architecture docs
const docs = await callTool('autonomous_agent', {
  initialQuery: 'Create comprehensive architecture documentation covering system design, components, data flow, and deployment'
});

// Save to file
fs.writeFileSync('ARCHITECTURE.md', docs.content[0].text);
```

### Tip 2: Combine with Other Tools

```typescript
// Autonomous for overview
const overview = await callTool('autonomous_agent', {
  initialQuery: 'Overview of payment system'
});

// Manual for specific deep dive
const specific = await callTool('analyze_code', {
  filePath: 'src/payment/stripe.ts',
  analysisQuery: 'Line-by-line security review'
});
```

### Tip 3: Iterative Refinement

```typescript
// First pass: broad
const v1 = await callTool('autonomous_agent', {
  initialQuery: 'Authentication system overview'
});

// Second pass: specific based on v1 findings
const v2 = await callTool('autonomous_agent', {
  initialQuery: 'Deep dive into the JWT refresh token mechanism mentioned in the overview'
});
```

---

**Remember: AI agent chỉ cần "mồi" - MCP server tự động làm tất cả!** 🚀
