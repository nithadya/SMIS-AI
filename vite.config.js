import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: "/SMISFrontend",
  server: {
    port: 5173,
    host: true,
    open: true,
    hmr: {
      overlay: false, // Disable the error overlay for better performance
    },
  },
  optimizeDeps: {
    include: [
      "react",
      "react-dom",
      "react-router-dom",
      "@emotion/react",
      "@emotion/styled",
      "antd",
      "d3-geo",
      "d3-scale",
      "react-simple-maps",
    ],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          "react-vendor": ["react", "react-dom", "react-router-dom"],
          "ui-vendor": ["@emotion/react", "@emotion/styled", "antd"],
          "map-vendor": ["d3-geo", "d3-scale", "react-simple-maps"],
        },
      },
    },
  },
});
