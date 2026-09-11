import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import path from 'path';

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  server: {
    // Bind to IPv4 loopback explicitly. The default ('localhost') can resolve
    // to IPv6 (::1) only, while browsers often dial the HMR WebSocket over IPv4
    // (127.0.0.1) -> "WebSocket connection failed" / "failed to connect to websocket".
    host: '127.0.0.1',
    port: 5173,
    strictPort: true,
  },
});
