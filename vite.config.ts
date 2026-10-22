import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

const GOOGLE_SCRIPT_TARGET = 'https://script.google.com/macros/s/AKfycbwTEELh5cZjPW2Eqe6CIFoLOweNKwvI0d0Oma_2BtffswrLzbgHCfR6Fzm776nuhF5n/exec';

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/cms': {
        target: GOOGLE_SCRIPT_TARGET,
        changeOrigin: true,
        rewrite: () => ''
      },
      '/api/apply': {
        target: GOOGLE_SCRIPT_TARGET,
        changeOrigin: true,
        rewrite: () => ''
      }
    }
  }
});
