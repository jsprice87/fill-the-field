# Build and Test Workflow

Run the complete build and test pipeline for the Fill The Field project.

```bash
echo "🔨 Running build and test workflow..."
npm run typecheck && echo "✅ TypeScript check passed" || { echo "❌ TypeScript check failed"; exit 1; }
npm run lint && echo "✅ Linting passed" || { echo "❌ Linting failed"; exit 1; }
npm run build && echo "✅ Build completed" || { echo "❌ Build failed"; exit 1; }
echo "🎉 All checks passed! Ready for deployment."
```

This command ensures your code is ready for production by running:
1. TypeScript type checking
2. ESLint code quality checks  
3. Production build process