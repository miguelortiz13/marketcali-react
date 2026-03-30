import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8088",
      },
      "/auth": {
        target: "http://localhost:8088",
      },
    },
  },
  optimizeDeps: {
    include: ['quagga'],
    exclude: ['@ericblade/quagga2'],
  },
  resolve: {
    alias: {
      'quagga': '@ericblade/quagga2',
    },
  },

});
