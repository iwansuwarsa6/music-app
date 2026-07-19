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
        name: 'rndmusic Premium',
        short_name: 'rndmusic',
        description: 'Aplikasi streaming musik premium',
        theme_color: '#0f0f0f',
        background_color: '#000000',
        display: 'standalone',
        icons: [
          {
            src: '/rndigital.jpg', // 👉 Ngambil dari folder public
            sizes: '192x192',
            type: 'image/jpeg'     // 👉 Diubah jadi jpeg
          },
          {
            src: '/rndigital.jpg', // 👉 Pake gambar yang sama aja gapapa
            sizes: '512x512',
            type: 'image/jpeg',    // 👉 Diubah jadi jpeg
            purpose: 'any maskable'
          }
        ]
      }
    })
  ],
})