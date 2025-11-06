# PATH Issues Fix

## Problem

Auggie CLI installed nhưng MCP server báo "not found" vì:
- MCP server chạy trong environment khác
- PATH của Node.js process có thể khác shell PATH
- npm global bin không trong PATH

## Solution

### Option 1: Automatic Detection (RECOMMENDED)

Code giờ tự động tìm auggie ở nhiều locations:
```typescript
// Tries in order:
1. AUGGIE_PATH environment variable
2. Direct 'auggie' command in PATH
3. /usr/local/bin/auggie
4. /opt/homebrew/bin/auggie (macOS Homebrew)
5. ~/.npm-global/bin/auggie
6. /usr/bin/auggie
7. npm global bin directory
```

**Không cần làm gì thêm!** Rebuild và chạy:
```bash
npm run build
```

### Option 2: Set AUGGIE_PATH (if auto-detect fails)

```bash
# Find where auggie is installed
which auggie
# Output: /path/to/auggie

# Set in Claude Desktop config
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": ["/path/to/mcp-augment-server/dist/index.js"],
      "env": {
        "AUGGIE_PATH": "/path/to/auggie"
      }
    }
  }
}
```

**Example:**
```json
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": ["/Users/huy/projects/mcp-augment-server/dist/index.js"],
      "env": {
        "AUGGIE_PATH": "/usr/local/bin/auggie"
      }
    }
  }
}
```

### Option 3: Add auggie to PATH

```bash
# Find npm global bin
npm config get prefix

# If output is /usr/local
# Add to PATH in Claude Desktop config:
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": ["/path/to/dist/index.js"],
      "env": {
        "PATH": "/usr/local/bin:${PATH}"
      }
    }
  }
}
```

### Option 4: Symlink auggie

```bash
# Find auggie
which auggie
# e.g., /Users/huy/.nvm/versions/node/v18.0.0/bin/auggie

# Create symlink to standard location
sudo ln -s /Users/huy/.nvm/versions/node/v18.0.0/bin/auggie /usr/local/bin/auggie

# Verify
/usr/local/bin/auggie --version
```

## Verification

After fix, test:

```bash
# Rebuild
cd mcp-augment-server
npm run build

# Test
./test-local.sh

# Should see:
# ✅ Auggie CLI: [version or installed]
# ✅ Server is working!
```

## Improved Error Message

Giờ error message sẽ show:

```
Auggie CLI not found. Please ensure:
1. Auggie is installed: npm install -g @augmentcode/auggie
2. You're logged in: auggie login
3. Auggie is in PATH or installed in standard location

Checked locations:
- AUGGIE_PATH environment variable
- System PATH
- /usr/local/bin/auggie
- /opt/homebrew/bin/auggie (macOS)
- ~/.npm-global/bin/auggie
- npm global bin directory

If auggie is installed elsewhere, please add it to PATH or set AUGGIE_PATH.
```

## Debug

```bash
# Check where auggie is
which auggie

# Check npm global bin
npm config get prefix

# Check if auggie works
auggie --version

# Test with explicit path
/full/path/to/auggie --version

# Set AUGGIE_PATH and test
AUGGIE_PATH=/full/path/to/auggie node dist/index.js
```

## Summary

✅ **Fixed:** Code giờ tự động tìm auggie ở nhiều locations
✅ **Fallback:** Support AUGGIE_PATH env variable
✅ **Better error:** Helpful message with all checked locations

**Most users:** Chỉ cần rebuild, không cần config thêm!
