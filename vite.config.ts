
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    port: 3000, // TEST WITH DIFFERENT PORT
    open: false,
  },
  plugins: [
    react(),
    // TEMPORARILY DISABLED FOR DEBUGGING
    // mode === 'development' &&
    // componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
    dedupe: ['react', 'react-dom'],
  },
  optimizeDeps: {
    include: ['react', 'react-dom', '@mantine/core'],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: undefined,
      },
    },
  },
  preview: {
    port: 8080,
    host: "0.0.0.0",
    strictPort: false, // Allow fallback ports
    open: true, // Auto-open browser
    cors: true, // Enable CORS
  },
}));
