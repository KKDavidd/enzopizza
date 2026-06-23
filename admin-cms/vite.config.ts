import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// The admin CMS is deployed at {domain}/admin, so the Vite base
// path must match — this makes all built asset URLs resolve
// correctly when served from that subpath.
export default defineConfig({
  base: "/admin/",
  plugins: [react()],
  server: {
    port: 5173
  },
  build: {
    outDir: "dist",
    sourcemap: true
  }
});
