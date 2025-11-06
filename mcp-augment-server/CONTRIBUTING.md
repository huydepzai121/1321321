# Contributing Guide

Cảm ơn bạn đã quan tâm đến việc contribute cho MCP Augment Server! 🎉

## 📋 Development Setup

### Prerequisites

- Node.js >= 18.0.0
- TypeScript >= 5.6.0
- Auggie CLI installed and configured
- Git

### Setup Steps

```bash
# 1. Fork và clone repository
git clone <your-fork-url>
cd mcp-augment-server

# 2. Install dependencies
npm install

# 3. Build project
npm run build

# 4. Run in dev mode
npm run dev
```

## 🔧 Development Workflow

### Making Changes

1. **Create a feature branch:**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make your changes:**
   - Edit files trong `src/`
   - Follow existing code style
   - Add comments cho complex logic

3. **Build và test:**
   ```bash
   npm run build
   npm start
   ```

4. **Commit changes:**
   ```bash
   git add .
   git commit -m "feat: your feature description"
   ```

### Commit Message Convention

Follow [Conventional Commits](https://www.conventionalcommits.org/):

- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `refactor:` - Code refactoring
- `test:` - Adding tests
- `chore:` - Maintenance tasks

**Examples:**
```
feat: add support for custom auggie commands
fix: handle timeout errors gracefully
docs: update README with new examples
refactor: improve error handling in tools.ts
```

## 🎯 Areas for Contribution

### High Priority

- [ ] Add unit tests
- [ ] Add integration tests
- [ ] Improve error messages
- [ ] Add more MCP tools
- [ ] Performance optimizations

### Documentation

- [ ] More usage examples
- [ ] Video tutorials
- [ ] API documentation
- [ ] Troubleshooting guides

### Features

- [ ] Support for auggie custom commands
- [ ] Caching layer for repeated queries
- [ ] Rate limiting
- [ ] Logging improvements
- [ ] Configuration file support
- [ ] Multi-project support

## 🏗️ Project Structure

```
mcp-augment-server/
├── src/
│   ├── index.ts          # Main MCP server
│   ├── tools.ts          # MCP tools definitions
│   ├── auggie.ts         # Auggie CLI wrapper
│   └── types.ts          # TypeScript types
├── dist/                 # Compiled output
├── docs/                 # Documentation
└── tests/                # Tests (to be added)
```

## 📝 Code Style Guidelines

### TypeScript

- Sử dụng `interface` cho type definitions
- Enable `strict` mode
- Add JSDoc comments cho public APIs
- Use `async/await` thay vì Promises

**Good:**
```typescript
/**
 * Execute an Auggie query with options
 */
async function executeQuery(options: QueryOptions): Promise<Result> {
  // implementation
}
```

### Error Handling

- Luôn catch và handle errors
- Provide meaningful error messages
- Include context trong errors

**Good:**
```typescript
try {
  const result = await auggie.query(input);
  return result;
} catch (error) {
  throw new Error(`Failed to query codebase: ${error.message}`);
}
```

### Naming Conventions

- Functions: `camelCase`
- Classes: `PascalCase`
- Constants: `UPPER_SNAKE_CASE`
- Interfaces: `PascalCase`

## 🧪 Testing

### Running Tests

```bash
# Run all tests (when implemented)
npm test

# Run specific test
npm test -- tools.test.ts

# Watch mode
npm test -- --watch
```

### Writing Tests

```typescript
import { describe, it, expect } from 'vitest';
import { queryCodebase } from '../src/auggie';

describe('queryCodebase', () => {
  it('should return result for valid query', async () => {
    const result = await queryCodebase('test query');
    expect(result.success).toBe(true);
  });

  it('should handle errors gracefully', async () => {
    const result = await queryCodebase('');
    expect(result.success).toBe(false);
    expect(result.error).toBeDefined();
  });
});
```

## 🐛 Bug Reports

Khi report bug, bao gồm:

1. **Description:** Mô tả rõ ràng vấn đề
2. **Steps to reproduce:**
   - Step 1
   - Step 2
   - etc.
3. **Expected behavior:** Điều bạn mong đợi
4. **Actual behavior:** Điều thực tế xảy ra
5. **Environment:**
   - OS: macOS/Windows/Linux
   - Node.js version: `node --version`
   - Auggie version: `auggie --version`
   - MCP server version

## 🚀 Pull Request Process

1. **Fork repository**
2. **Create feature branch**
3. **Make changes**
4. **Test thoroughly**
5. **Update documentation** nếu cần
6. **Create Pull Request** with:
   - Clear title
   - Description of changes
   - Reference to issues (if any)
   - Screenshots (if UI changes)

### PR Checklist

- [ ] Code builds without errors
- [ ] Tests pass (if applicable)
- [ ] Documentation updated
- [ ] Commit messages follow convention
- [ ] No merge conflicts
- [ ] Changes are focused and atomic

## 🔍 Code Review

Maintainers sẽ review PR của bạn:

- ✅ Approve: Ready to merge
- 💬 Comment: Suggestions for improvement
- ❌ Request changes: Required changes before merge

Be patient và responsive to feedback!

## 📚 Resources

### Learning MCP

- [MCP Specification](https://modelcontextprotocol.io/specification)
- [MCP TypeScript SDK](https://github.com/modelcontextprotocol/typescript-sdk)
- [MCP Examples](https://github.com/modelcontextprotocol/servers)

### Learning Auggie

- [Auggie Documentation](https://docs.augmentcode.com/cli/overview)
- [Auggie GitHub](https://github.com/augmentcode/auggie)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [TypeScript Deep Dive](https://basarat.gitbook.io/typescript/)

## 💡 Questions?

- Open a discussion on GitHub
- Join our community (if available)
- Check existing issues

## 🙏 Thank You!

Every contribution matters:
- Code contributions
- Documentation improvements
- Bug reports
- Feature suggestions
- Spreading the word

Thank you for making this project better! ❤️

---

Happy coding! 🚀
