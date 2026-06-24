import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react";

// Firebase sets "sideEffects: false" in its package.json which causes
// Vite/Rollup to tree-shake away the Firestore component registration.
// This plugin overrides that for the specific modules we need.
function firebaseSideEffects(): Plugin {
  return {
    name: "firebase-side-effects",
    enforce: "pre",
    transform(code, id) {
      if (
        id.includes("@firebase/firestore") ||
        id.includes("@firebase/auth") ||
        id.includes("@firebase/app")
      ) {
        // Remove any /*#__PURE__*/ annotations that enable tree-shaking
        return code.replace(/\/\*#__PURE__\*\//g, "");
      }
    }
  };
}

export default defineConfig({
  base: "/admin/",
  plugins: [firebaseSideEffects(), react()],
  server: { port: 5173 },
  build: {
    outDir: "dist",
    sourcemap: false
  }
});
