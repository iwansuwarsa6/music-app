import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}']
      },
      manifest: {
        name: 'RnCmusic Premium',
        short_name: 'RnCmusic',
        description: 'Aplikasi streaming musik premium dari RNC Tech',
        theme_color: '#0f0f0f',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/rnctech.jpg', // 👉 Udah diganti ke logo RNC Tech
            sizes: '192x192',
            type: 'image/jpeg'     
          },
          {
            src: '/rnctech.jpg', // 👉 Udah diganti ke logo RNC Tech
            sizes: '512x512',
            type: 'image/jpeg',    
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})