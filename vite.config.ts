import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { viteStaticCopy } from 'vite-plugin-static-copy'

// https://vitejs.dev/config/

export default defineConfig({
  plugins: [
    react(),
    viteStaticCopy({
      targets: [
        {
          src: 'src/data/provinces.geojson',
          dest: 'data',
        },
      ],
    }),
  ],
  assetsInclude: ['**/*.geojson'],
  optimizeDeps: {
    include: ['@mui/material'],
  },
  server: {
    proxy: {
      '/api': 'http://localhost:3333',
    },
  },
})
