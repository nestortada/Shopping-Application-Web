import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  return {
    base: env.VITE_BASE_PATH || '/Shopping-Application-Web',
    plugins: [react(), tailwindcss()],
    server: {
      proxy: {
        '/api': {
          target: env.VITE_BACKEND_URL || 'http://localhost:5000',
          changeOrigin: true,
        },
        '/v0': {
          target: 'https://firebasestorage.googleapis.com',
          changeOrigin: true,
          secure: false,
          headers: {
            'Access-Control-Allow-Origin': '*'
          }
        }
      },
      cors: true
    },
  };
});
