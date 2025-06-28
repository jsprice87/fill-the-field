# Deployment Readiness Check

Verify the project is ready for deployment with comprehensive checks.

```bash
echo "🚀 Deployment Readiness Check for Fill The Field"
echo "================================================"

# Check git status
echo "📋 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "❌ Uncommitted changes detected. Please commit or stash changes."
    git status --short
    exit 1
else
    echo "✅ Git working directory clean"
fi

# Check branch
CURRENT_BRANCH=$(git branch --show-current)
echo "📍 Current branch: $CURRENT_BRANCH"

# Run comprehensive checks
echo "🔍 Running pre-deployment checks..."

# TypeScript check
echo "  🔤 TypeScript validation..."
npm run typecheck > /dev/null 2>&1 && echo "  ✅ TypeScript check passed" || { echo "  ❌ TypeScript errors found"; exit 1; }

# Linting
echo "  🧹 Code quality check..."
npm run lint > /dev/null 2>&1 && echo "  ✅ Linting passed" || { echo "  ❌ Linting issues found"; exit 1; }

# Build test
echo "  🔨 Production build test..."
npm run build > /dev/null 2>&1 && echo "  ✅ Build successful" || { echo "  ❌ Build failed"; exit 1; }

# Environment check
echo "📋 Environment Configuration:"
echo "  • NODE_ENV: ${NODE_ENV:-not set}"
echo "  • Package.json version: $(node -p "require('./package.json').version")"

echo ""
echo "🎉 Deployment readiness check completed successfully!"
echo "🚀 Project is ready for deployment to production."
```

This command performs a comprehensive pre-deployment check including:
- Git status verification
- TypeScript compilation
- Code quality validation
- Production build test
- Environment configuration review