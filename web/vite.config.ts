import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Dev only: forwards /api to the Spring Boot server so the browser sees one origin.
  server: { proxy: { '/api': 'http://localhost:8080' } },
})
