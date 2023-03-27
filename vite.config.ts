import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:1111",
        changeOrigin: true,
        secure: false,
      },
      "/auth": {
        target: "http://localhost:1111",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
