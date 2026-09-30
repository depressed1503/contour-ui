import { resolve } from "node:path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [react()],

  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      formats: ["es"],
      fileName: "index",
      cssFileName: "styles",
    },

    rollupOptions: {
      external: [
        /^react(?:\/.*)?$/,
        /^react-dom(?:\/.*)?$/,
        /^@base-ui\/react(?:\/.*)?$/,
        /^@tanstack\/react-form(?:\/.*)?$/,
        /^@tanstack\/react-table(?:\/.*)?$/,
        /^lucide-react(?:\/.*)?$/,
      ],
    },
  },
});
