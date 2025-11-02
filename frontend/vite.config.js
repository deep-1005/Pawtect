import { defineConfig } from 'vite';

export default defineConfig({
  server: {
    host: '0.0.0.0', // Allow access from network
    port: 5173,
    strictPort: true
  }
});
