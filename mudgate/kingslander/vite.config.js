import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// No build section ⇒ Vite uses its default 'dist/' folder.
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api': 'https://cloaking.bernard-labs.com'
    }
  }
});