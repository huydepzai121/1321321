# Auggie CLI - Actual Capabilities

## 📋 Verified Features (Từ Official Docs)

### ✅ Confirmed Capabilities

Based on official documentation và research, đây là những gì Auggie CLI **THỰC SỰ CÓ**:

### 1. **Interactive Mode** ✅

```bash
auggie
```

- Full-screen terminal UI
- Rich interactive features
- Can analyze code
- **CAN MAKE CHANGES TO CODE** ✅
- Execute tools
- Agentic capabilities

### 2. **Print Mode (Non-Interactive)** ✅

```bash
auggie --print "your instruction"
```

- Executes instruction once
- Prints response to stdout
- Exits immediately
- **Perfect for programmatic use** ✅

### 3. **Quiet Mode** ✅

```bash
auggie --quiet --print "your instruction"
```

- Only returns final output
- No intermediate messages
- Ideal for structured data
- **Perfect for automation** ✅

### 4. **Custom Slash Commands** ✅

**Locations:**
```
~/.augment/commands/<name>.md        # User-wide
./.augment/commands/<name>.md        # Workspace
./.claude/commands/<name>.md         # Claude Code
```

**Execute:**
```bash
# From CLI
auggie command <name>

# List all
auggie command list

# In interactive mode
/command-name
```

**Format:** Markdown files với frontmatter

### 5. **Built-in Slash Commands** ✅

```bash
auggie /help
# Others mentioned: /github-workflow, /feedback
```

### 6. **Command-Line Flags** ✅

| Flag | Purpose | Example |
|------|---------|---------|
| `--print` | Non-interactive output | `auggie --print "explain"` |
| `--quiet` | Structured output only | `auggie --quiet --print` |
| `--workspace-root` | Specify root directory | `auggie --workspace-root /path` |
| `--rules` | Custom rules file | `auggie --rules rules.md` |
| `--model` | Specify model | `auggie --model <name>` |
| `--compact` | Compact output | `auggie --compact` |

### 7. **Pipe Support** ✅

```bash
# Pipe input to auggie
git diff | auggie "Explain the impact of these changes"

# Can be used in pipelines
cat file.js | auggie "Review this code"
```

### 8. **Editing Capabilities** ✅ CONFIRMED

From docs: "**make changes to code**" - auggie CAN edit files!

**What it can do:**
- Analyze code ✅
- **Make changes** ✅
- Execute tools ✅
- Debug issues ✅
- Build features ✅

---

## 🎯 How MCP Server Uses These

### Current Implementation:

1. **Read-Only Queries:**
   ```typescript
   // Uses: auggie --print "query"
   executeAuggieQuery({ query, workingDirectory });
   ```

2. **Editing Tasks:**
   ```typescript
   // Uses: echo "prompt" | auggie (or similar)
   executeAuggieInteractive(prompt, workingDirectory, {
     allowEditing: true
   });
   ```

3. **Custom Commands:**
   ```typescript
   // Uses: auggie command <name>
   executeSlashCommand(commandName, args);
   ```

---

## ⚠️ Assumptions vs Reality

### ✅ CORRECT Assumptions:

1. **`--print` flag exists** ✅
   - Confirmed in docs
   - Returns output to stdout

2. **Interactive mode can edit** ✅
   - Docs confirm "make changes"
   - Full agentic capabilities

3. **Custom commands in `.augment/commands/`** ✅
   - Confirmed location
   - Markdown format
   - `auggie command <name>` syntax

4. **Can use programmatically** ✅
   - `--print` for non-interactive
   - `--quiet` for structured output
   - Pipe support

### ❓ UNCLEAR/Need Testing:

1. **Exact editing invocation:**
   ```bash
   # Method 1: Pipe (might work)
   echo "Fix bug in file.ts" | auggie

   # Method 2: Print mode with editing instruction
   auggie --print "Fix bug in file.ts"

   # Method 3: Interactive stdin
   auggie < instruction.txt
   ```
   **→ Need to test which method actually edits files**

2. **Output format when editing:**
   - Does it output "Modified: file.ts"?
   - How to parse which files changed?
   - **→ Need to test actual output**

3. **Built-in slash commands:**
   - `/help` confirmed
   - `/github-workflow` mentioned
   - `/feedback` mentioned
   - **→ Full list not documented**

4. **Auto-approval of edits:**
   - Does interactive mode require user approval?
   - Can we auto-approve in programmatic mode?
   - **→ Need to test**

---

## 🔧 Recommended Implementation Updates

### 1. For Read-Only Queries (CURRENT IS CORRECT):

```typescript
// ✅ This is correct
async function queryCodebase(query: string) {
  const command = `auggie --print "${query}"`;
  const { stdout } = await execAsync(command);
  return stdout;
}
```

### 2. For Editing Tasks (NEED TO VERIFY):

**Option A: Using --print (if it supports editing)**
```typescript
async function executeEditingTask(task: string) {
  const command = `auggie --print "${task}"`;
  const { stdout } = await execAsync(command);
  // Parse output to find changed files
  return parseChanges(stdout);
}
```

**Option B: Using stdin pipe**
```typescript
async function executeEditingTask(task: string) {
  const command = `echo "${task}" | auggie`;
  const { stdout } = await execAsync(command);
  return parseChanges(stdout);
}
```

**Option C: Using spawn with stdin** (Most reliable for editing)
```typescript
async function executeEditingTask(task: string) {
  const child = spawn('auggie', [], {
    stdio: ['pipe', 'pipe', 'pipe']
  });

  child.stdin.write(task + '\n');
  child.stdin.end();

  // Collect output
  // Wait for completion
  return result;
}
```

### 3. For Custom Commands (CURRENT IS CORRECT):

```typescript
// ✅ This is correct
async function executeCustomCommand(name: string, args?: string) {
  const command = args
    ? `auggie command ${name} "${args}"`
    : `auggie command ${name}`;
  const { stdout } = await execAsync(command);
  return stdout;
}
```

---

## 🧪 Testing Checklist

Before production use, test:

- [ ] `auggie --print "query"` returns expected output
- [ ] `auggie --print "edit task"` actually modifies files
- [ ] Output format when files are modified
- [ ] How to parse changed files from output
- [ ] `auggie command <name>` executes custom commands
- [ ] Pipe input works: `echo "task" | auggie`
- [ ] Stdin approach for editing tasks
- [ ] Whether interactive mode requires approval
- [ ] Error handling for failed edits

---

## 📚 Official Documentation Links

- **CLI Overview:** https://docs.augmentcode.com/cli/overview
- **CLI Flags:** https://docs.augmentcode.com/cli/reference
- **Custom Commands:** https://docs.augmentcode.com/cli/custom-commands

---

## 💡 Key Takeaways

### What We Know FOR SURE:

1. ✅ Auggie CLI EXISTS and is available
2. ✅ Can be installed via npm: `npm install -g @augmentcode/auggie`
3. ✅ Has `--print` flag for non-interactive use
4. ✅ Supports custom commands in `.augment/commands/`
5. ✅ **CAN make changes to code** (confirmed in docs)
6. ✅ Supports pipe input
7. ✅ Has multiple modes: interactive, print, quiet

### What Needs TESTING:

1. ❓ Exact invocation for editing (print vs pipe vs stdin)
2. ❓ Output format when files are modified
3. ❓ How to detect which files changed
4. ❓ Whether it requires user approval in programmatic mode
5. ❓ Complete list of built-in slash commands

### Implementation Status:

- ✅ **Read-only queries:** CORRECT implementation
- ⚠️ **Editing tasks:** MAY WORK but needs testing
- ✅ **Custom commands:** CORRECT implementation
- ⚠️ **File change detection:** ASSUMED format, needs verification

---

## 🚀 Next Steps

### For Production Use:

1. **Install auggie:** `npm install -g @augmentcode/auggie`
2. **Login:** `auggie login`
3. **Test queries:** Verify `auggie --print "query"` works
4. **Test editing:** Try `auggie --print "fix bug in file.ts"`
5. **Verify output:** Check if files actually changed
6. **Parse format:** Understand output format
7. **Update parser:** Update `parseFileChanges()` based on actual output

### If Editing Doesn't Work with --print:

Need to switch to **interactive stdin approach:**

```typescript
function executeAuggieInteractive(prompt: string): Promise<Result> {
  return new Promise((resolve) => {
    const child = spawn('auggie', []);

    let output = '';
    child.stdout.on('data', (data) => output += data);

    child.stdin.write(prompt + '\n');
    // May need to send 'y' for approval
    // child.stdin.write('y\n');
    child.stdin.end();

    child.on('close', () => {
      resolve(parseOutput(output));
    });
  });
}
```

---

**Summary:** MCP server implementation is MOSTLY correct based on documented features, but editing capabilities need real-world testing to verify exact invocation method and output format.
