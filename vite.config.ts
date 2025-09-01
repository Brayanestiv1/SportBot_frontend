import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
  ],
  server: {
    host: '0.0.0.0', // Esto permite que el servidor sea accesible desde fuera del contenedor
    port: 5174, // Configura el puerto para que sea siempre 5174
  }
})
