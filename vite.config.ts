
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "0.0.0.0", // Allow external access for VS Code port forwarding
    port: 8080,
    strictPort: false, // Allow fallback to other ports
    open: true, // Auto-open browser for easier testing
    cors: true, // Enable CORS for API calls
    fs: {
      strict: false, // Allow serving files from outside root
    },
  },
  plugins: [
    react(),
    mode === 'development' &&
    componentTagger(),
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
