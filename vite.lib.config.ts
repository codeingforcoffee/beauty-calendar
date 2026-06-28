import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

// Library build config — externalizes peer deps so consumers bring their own.
export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  build: {
    lib: {
      entry: fileURLToPath(new URL("./src/index.ts", import.meta.url)),
      name: "BeautyCalendar",
      fileName: "beauty-calendar",
    },
    rollupOptions: {
      external: ["vue", "dayjs", "@vueuse/core"],
      output: {
        exports: "named",
        globals: {
          vue: "Vue",
          dayjs: "dayjs",
          "@vueuse/core": "VueUse",
        },
        assetFileNames: "beauty-calendar.[ext]",
      },
    },
    cssCodeSplit: false,
    sourcemap: true,
  },
});
