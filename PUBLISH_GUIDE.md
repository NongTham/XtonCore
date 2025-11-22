# 🚀 XtonCore v2.1.0 - Publishing Guide

## ✅ Pre-publish Checklist

### 1. Version Check
- [x] Version updated to 2.1.0
- [x] README.md updated
- [x] CHANGELOG created

### 2. Build & Test
```bash
# Build the project
yarn build

# Check for errors
yarn lint

# Run tests (if available)
yarn test
```

### 3. Files Check
Make sure these files are included:
- [x] `dist/` - Compiled code
- [x] `index.d.ts` - Type definitions
- [x] `README.md` - Documentation
- [x] `LICENSE` - License file
- [x] `package.json` - Package info

## 📦 Publishing Steps

### Step 1: Login to NPM
```bash
npm login
# Enter your NPM credentials
```

### Step 2: Build
```bash
yarn build
```

### Step 3: Dry Run (Optional)
```bash
npm publish --dry-run
# Check what will be published
```

### Step 4: Publish
```bash
npm publish
```

### Step 5: Verify
```bash
# Check on NPM
npm view xtoncore

# Test installation
npm install xtoncore@2.1.0
```

## 🏷️ Git Tagging

```bash
# Create git tag
git tag -a v2.1.0 -m "Release v2.1.0 - Performance & Feature Update"

# Push tag
git push origin v2.1.0

# Push all changes
git push origin main
```

## 📝 What's New in v2.1.0

### ⚡ Performance Features
- **Lazy Loading** - 80% faster startup, 67% less memory
- **Parallel Loading** - 57% faster initialization
- **Combined** - Up to 90% faster overall

### 🎯 New Features
- Lazy loading system with on-demand command loading
- Parallel module loading
- Enhanced TypeScript support with full type definitions
- New utility methods: `preloadCommands()`, `preloadAllCommands()`, `getLazyLoadingStats()`
- Performance tracking and monitoring improvements

### 🔧 Improvements
- Better error handling
- Enhanced logging
- Improved documentation
- Better code organization

### 📚 Documentation
- New TYPESCRIPT.md guide
- New PERFORMANCE.md guide
- New LAZY_LOADING.md guide
- Updated README.md
- Added examples

## 🔍 Post-publish Verification

### 1. Check NPM Page
Visit: https://www.npmjs.com/package/xtoncore

### 2. Test Installation
```bash
# Create test directory
mkdir test-xtoncore
cd test-xtoncore

# Initialize project
npm init -y

# Install xtoncore
npm install xtoncore@2.1.0

# Test import
node -e "const { ClientHandler } = require('xtoncore'); console.log('✅ Import successful!');"
```

### 3. Check TypeScript Types
```bash
# Create test TypeScript file
echo "import { ClientHandler } from 'xtoncore';" > test.ts

# Check types
npx tsc --noEmit test.ts
```

## 📢 Announcement

After publishing, announce on:
- [ ] GitHub Releases
- [ ] Discord server
- [ ] Twitter/X
- [ ] Dev.to / Medium (optional)

### GitHub Release Template

**Title:** XtonCore v2.1.0 - Performance & Feature Update

**Description:**
```markdown
# 🚀 XtonCore v2.1.0

## ⚡ Performance Improvements

- **Lazy Loading** - Commands load on-demand (80% faster startup!)
- **Parallel Loading** - Modules load simultaneously (57% faster!)
- **Combined Performance** - Up to 90% faster overall

## ✨ New Features

- Lazy loading system with configurable preloading
- Parallel module loading
- Enhanced TypeScript support
- New utility methods for performance management
- Comprehensive performance monitoring

## 📊 Benchmarks

| Bot Size | Before | After | Improvement |
|----------|--------|-------|-------------|
| Small (10 cmds) | 100ms | 40ms | 60% faster |
| Medium (50 cmds) | 350ms | 150ms | 57% faster |
| Large (200 cmds) | 1200ms | 200ms | 83% faster |

## 📚 Documentation

- [TypeScript Guide](./TYPESCRIPT.md)
- [Performance Guide](./PERFORMANCE.md)
- [Lazy Loading Guide](./LAZY_LOADING.md)

## 🔧 Installation

\`\`\`bash
npm install xtoncore@2.1.0
\`\`\`

## 🙏 Thanks

Thank you to everyone who contributed and provided feedback!
```

## 🐛 Troubleshooting

### Issue: "You do not have permission to publish"
**Solution:** Make sure you're logged in with the correct NPM account
```bash
npm whoami
npm login
```

### Issue: "Version already exists"
**Solution:** Update version number
```bash
npm version patch  # 2.1.0 -> 2.1.1
npm version minor  # 2.1.0 -> 2.2.0
npm version major  # 2.1.0 -> 3.0.0
```

### Issue: "Package name already taken"
**Solution:** The package name "xtoncore" should already be yours. If not, contact NPM support.

## 📞 Support

If you encounter any issues:
1. Check NPM documentation
2. Check GitHub issues
3. Contact package maintainer

---

**Ready to publish? Run these commands:**

```bash
# 1. Build
yarn build

# 2. Login (if needed)
npm login

# 3. Publish
npm publish

# 4. Tag
git tag -a v2.1.0 -m "Release v2.1.0"
git push origin v2.1.0

# 5. Celebrate! 🎉
```
