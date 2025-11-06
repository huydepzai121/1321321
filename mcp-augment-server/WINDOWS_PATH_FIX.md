# Windows PATH Fix

## Vấn đề trên Windows

Auggie installed tại: `C:\Users\HUYDZ\AppData\Roaming\npm\node_modules\@augmentcode\auggie`

Nhưng MCP server không tìm thấy vì Windows paths khác Unix/macOS.

## Giải pháp

### Option 1: Set AUGGIE_PATH (RECOMMENDED)

**File:** `%APPDATA%\Claude\claude_desktop_config.json`

```json
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": [
        "C:\\path\\to\\mcp-augment-server\\dist\\index.js"
      ],
      "env": {
        "AUGGIE_PATH": "C:\\Users\\HUYDZ\\AppData\\Roaming\\npm\\auggie.cmd"
      }
    }
  }
}
```

⚠️ **Lưu ý:**
- Dùng `\\` (double backslash) trong JSON
- Dùng `.cmd` extension trên Windows
- Replace `HUYDZ` bằng username của bạn

### Option 2: Find Exact Path

```cmd
REM 1. Find where auggie is
where auggie

REM Output might be:
REM C:\Users\HUYDZ\AppData\Roaming\npm\auggie.cmd

REM 2. Use that path in config
```

### Option 3: Check npm global bin

```cmd
REM Find npm prefix
npm config get prefix

REM Output: C:\Users\HUYDZ\AppData\Roaming\npm

REM Auggie is at:
REM C:\Users\HUYDZ\AppData\Roaming\npm\auggie.cmd
```

### Option 4: Add to PATH

```cmd
REM 1. Open System Properties > Environment Variables
REM 2. Add to User PATH:
C:\Users\HUYDZ\AppData\Roaming\npm

REM 3. Restart Claude Desktop
```

## Updated Code

Code giờ detect Windows paths:

```typescript
const possiblePaths = [
  // Windows paths (NEW!)
  `${process.env.APPDATA}\\npm\\auggie.cmd`,
  `${process.env.APPDATA}\\npm\\auggie`,
  `C:\\Users\\${process.env.USERNAME}\\AppData\\Roaming\\npm\\auggie.cmd`,

  // Unix/macOS paths
  '/usr/local/bin/auggie',
  '/opt/homebrew/bin/auggie',
  // ...
];
```

## Full Windows Example

```json
{
  "mcpServers": {
    "augment": {
      "command": "node",
      "args": [
        "C:\\Users\\HUYDZ\\projects\\1321321\\mcp-augment-server\\dist\\index.js"
      ],
      "env": {
        "AUGGIE_PATH": "C:\\Users\\HUYDZ\\AppData\\Roaming\\npm\\auggie.cmd",
        "NODE_ENV": "production"
      }
    }
  }
}
```

## Verification

```cmd
REM After rebuild
cd mcp-augment-server
npm run build

REM Test
node dist\index.js

REM Should not see "auggie not found" error anymore
```

## Common Windows Paths

| Location | Path |
|----------|------|
| npm global | `%APPDATA%\npm\auggie.cmd` |
| Full path | `C:\Users\[USER]\AppData\Roaming\npm\auggie.cmd` |
| Node.js global | `C:\Program Files\nodejs\auggie.cmd` |
| User local | `%USERPROFILE%\AppData\Local\npm\auggie.cmd` |

## Debug on Windows

```cmd
REM Check auggie
where auggie

REM Check version
auggie --version

REM Test with full path
"C:\Users\HUYDZ\AppData\Roaming\npm\auggie.cmd" --version

REM Check environment
echo %APPDATA%
echo %USERNAME%

REM Test MCP server
set AUGGIE_PATH=C:\Users\HUYDZ\AppData\Roaming\npm\auggie.cmd
node dist\index.js
```

## Expected Output After Fix

```
✅ Auggie CLI: v0.x.x
✅ Build successful!
✅ Server is working!
```

**Key point:** Trên Windows phải dùng `.cmd` extension và `\\` trong JSON!
