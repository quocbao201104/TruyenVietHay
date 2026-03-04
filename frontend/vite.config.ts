// frontend/vite.config.ts
import { defineConfig, loadEnv } from "vite";
import vue from "@vitejs/plugin-vue";
import tailwindcss from "@tailwindcss/vite";
import path from "path";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');

  const target = env.VITE_API_URL || "http://localhost:3000";

  return {
    plugins: [
      vue(),
      tailwindcss(),
      VitePWA({
        registerType: "autoUpdate",
        manifest: {
          name: "TruyenVietHay",
          short_name: "TVH",
          start_url: "/",
          display: "standalone",
          background_color: "#ffffff",
          theme_color: "#42b983",
          icons: [
            {
              src: '/pwa-192x192.png',
              sizes: '192x192',
              type: 'image/png'
            }
          ]
        }
      })
    ],
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
    server: {
      host: true,
      port: 5173,
      headers: {
        "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
      },
      proxy: {
        "/api": {
          target: target,
          changeOrigin: true,
          secure: false,
        },
        "/uploads_img": {
          target: target,
          changeOrigin: true,
          secure: false,
        }
      },
    },
    build: {
      minify: "terser",
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
        },
      },
    },
  };
});