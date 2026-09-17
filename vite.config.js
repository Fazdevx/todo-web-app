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
    hmr: {
      // Mismo host/puerto que el servidor: evita que el cliente de HMR intente
      // un hostname distinto (IPv6 o un dominio de red) y falle el WebSocket.
      protocol: 'ws',
      host: '127.0.0.1',
      port: 5173,
    },
  },
  optimizeDeps: {
    // Pre-optimizar React y las librerías grandes desde el arranque. Cuando Vite
    // descubre una dependencia nueva a mitad de sesión, re-optimiza y recarga la
    // página: si el navegador tenia modulos del bundle anterior, puede quedar con
    // DOS copias de React y aparecer errores como
    // "useTasks must be used within a TaskProvider" aunque el Provider exista.
    include: [
      'react',
      'react-dom',
      'react-dom/client',
      'react/jsx-runtime',
      'react/jsx-dev-runtime',
      'lucide-react',
    ],
  },
});
