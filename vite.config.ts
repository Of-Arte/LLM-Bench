import path from 'path';
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No API keys are injected into the bundle via envPrefix or define.
// Users supply their own keys through the in-app Settings → API Keys UI.
// Those keys are stored in localStorage and never bundled into the JS output.

export default defineConfig({
  server: {
    port: 3000,
    host: '0.0.0.0',
  },
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    }
  }
});
