import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// During local development, `npm run dev:mock` starts a small mock API on
// port 8787 (see dev-server/mock-api.js) so the site is fully clickable
// without a real Telegram bot yet. In production (Vercel) this proxy is
// irrelevant — the platform routes /api/* to the serverless functions
// directly.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8787',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
