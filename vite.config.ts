import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  server: { host: true, port: 5175 },
  // three.js lives in its own lazily-loaded chunk
  build: { chunkSizeWarningLimit: 600 },
});
