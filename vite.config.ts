import tailwindcss from "@tailwindcss/vite";
import basicSsl from "@vitejs/plugin-basic-ssl";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
    // The Web Share API only exists in a secure context. Testing on a phone
    // over a plain-HTTP LAN address (http://192.168.x.x:5173) therefore has no
    // navigator.share at all, and the share button falls back to downloading.
    // Serving dev over HTTPS — even with a self-signed cert — makes the origin
    // secure so the native share sheet works on the device.
    basicSsl(),
  ],
  server: {
    // Expose on the LAN so a phone on the same Wi-Fi can reach it.
    host: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "./src"),
    },
  },
});
