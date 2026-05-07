import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: { proxy: { '/api': { target: 'http://localhost:3000', rewrite: path => path.replace(/^\/api/, '') } } },
  preview: { allowedHosts: ['erp.eternityjoias.com.br'] },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test/setup.ts'],
    coverage: { provider: 'v8', include: ['src/**/*.{ts,tsx}'], exclude: ['src/test/**', 'src/main.tsx'] },
  },
});
