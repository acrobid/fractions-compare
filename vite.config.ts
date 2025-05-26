import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { VitePWA } from "vite-plugin-pwa";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    VitePWA({
      registerType: "autoUpdate",
      // includeAssets: [
      //   "favicon.ico",
      //   "favicon.svg",
      //   "apple-touch-icon-180x180.png",
      // ],
      // workbox: {
      //   globPatterns: ["**/*.{js,css,html,ico,png,svg}"],
      //   runtimeCaching: [
      //     {
      //       urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
      //       handler: "CacheFirst",
      //       options: {
      //         cacheName: "google-fonts-cache",
      //         expiration: {
      //           maxEntries: 10,
      //           maxAgeSeconds: 60 * 60 * 24 * 365, // <== 365 days
      //         },
      //       },
      //     },
      //   ],
      // },
      manifest: {
        name: "Fraction Visualizer - Compare & Learn",
        short_name: "Fraction Visualizer",
        description:
          "Interactive tool to visualize and compare fractions. Perfect for learning how fractions work!",
        theme_color: "#42b883",
        background_color: "#ffffff",
        display: "standalone",
        scope: "/",
        start_url: "/",
        categories: ["education", "utilities"],
        lang: "en",
        icons: [
          {
            src: "pwa-64x64.png",
            sizes: "64x64",
            type: "image/png",
          },
          {
            src: "pwa-192x192.png",
            sizes: "192x192",
            type: "image/png",
          },
          {
            src: "pwa-512x512.png",
            sizes: "512x512",
            type: "image/png",
          },
          {
            src: "maskable-icon-512x512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
});
