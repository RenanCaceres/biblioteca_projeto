// vite.config.js
// Configuração do Vite (bundler do React moderno)
// Baseado na apostila cap27: npx create-vite para criar o projeto frontend

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173, // porta padrão do Vite
  },
});
