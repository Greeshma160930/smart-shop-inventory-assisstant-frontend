import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
        secure: false,
        configure: (proxy) => {
          proxy.on('error', (err, req, res) => {
            console.error('[Vite Proxy] Error connecting to backend (http://localhost:8080):', err.message);
            if (!res.headersSent) {
              res.writeHead(502, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({
                status: 502,
                error: 'Bad Gateway',
                message: 'Backend server at http://localhost:8080 is not running or unreachable. Please start Spring Boot in Spring Tools 4 (STS) or via terminal.',
              }));
            }
          });
        },
      },
    },
  },
});
