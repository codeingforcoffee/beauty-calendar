import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Playground dev / build config.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "beauty-calendar": fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 5180,
    open: true,
  },
  build: {
    outDir: "dist-play",
  },
});
