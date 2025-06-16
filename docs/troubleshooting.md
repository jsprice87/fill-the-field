
# Troubleshooting Guide

## Duplicate React with Mantine

### Problem
Error: `Cannot read properties of null (reading 'useRef')` when using Mantine components.

### Root Cause
Two different copies of React ended up in the bundle - one pre-bundled by Vite and another resolved by Mantine via node_modules.

### Solution
1. **Add React deduplication to vite.config.ts:**
```typescript
export default defineConfig({
  resolve: {
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom'],
  },
});
```

2. **Ensure correct provider hierarchy in main.tsx:**
```typescript
<QueryClientProvider>
  <MantineProvider>
    <ThemeProvider>
      <App />
    </ThemeProvider>
  </MantineProvider>
</QueryClientProvider>
```

3. **Clean install dependencies:**
```bash
rm -rf node_modules pnpm-lock.yaml
pnpm install
```

4. **Restart dev server completely**

### Verification
Run `npm ls react react-dom` to confirm only one copy of React exists in the dependency tree.
