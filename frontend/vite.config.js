import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-192x192.png', 'pwa-512x512.png', 'favicon.svg'],
      manifest: {
        name: 'ប្រព័ន្ធគ្រប់គ្រងស្ថានីយ៍ | Station Ops',
        short_name: 'Station Ops',
        description: 'ប្រព័ន្ធគ្រប់គ្រងប្រតិបត្តិការប្រេងឥន្ធនៈ និងអាចម៍ដី - Fuel & Soil Management Mini App',
        theme_color: '#0f172a',
        background_color: '#0a0f1d',
        display: 'standalone',
        orientation: 'portrait-primary',
        start_url: '/',
        icons: [
          {
            src: 'pwa-192x192.png',
            sizes: '192x192',
            type: 'image/png'
          },
          {
            src: 'pwa-512x512.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'maskable-icon-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
      }
    })
  ],
})
