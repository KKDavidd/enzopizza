import fireCMSConfig from "@firecms/ui/tailwind.config.js";

/** @type {import('tailwindcss').Config} */
export default {
  presets: [fireCMSConfig],
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@firecms/**/src/**/*.{js,ts,jsx,tsx}",
    "./node_modules/@firecms/**/dist/**/*.{js,mjs}"
  ]
};
