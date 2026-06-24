// ============================================================
// ENZOPIZZA HAJMÁSKÉR — root build script
// Vercel build command: `npm run build` (this file).
// Produces dist/ with public site + dist/admin/ with CMS.
// Uses esbuild directly for the admin to avoid Vite/Rollup
// tree-shaking Firebase's side-effect component registrations.
// ============================================================

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const distDir = path.join(root, "dist");
const publicSiteDir = path.join(root, "public-site");
const adminDir = path.join(root, "admin-cms");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

// ── 1. Install admin deps ────────────────────────────────────
console.log("→ Installing admin-cms dependencies...");
execSync("npm install", { cwd: adminDir, stdio: "inherit" });

// ── 2. Build admin with esbuild (no tree-shaking) ───────────
console.log("→ Building admin-cms with esbuild...");

const adminDist = path.join(adminDir, "dist");
const adminAssets = path.join(adminDist, "assets");
fs.rmSync(adminDist, { recursive: true, force: true });
fs.mkdirSync(adminAssets, { recursive: true });

// Transpile TSX→JS with esbuild (tsc for type-check only)
execSync(
  [
    "npx esbuild src/main.tsx",
    "--bundle",
    "--format=esm",
    "--target=es2020",
    "--jsx=automatic",
    "--loader:.tsx=tsx",
    "--loader:.ts=ts",
    // esbuild ignores sideEffects:false in node_modules by default
    "--tree-shaking=false",
    "--minify",
    `--outfile=${path.join(adminAssets, "index.js")}`,
    "--public-path=/admin/assets/",
  ].join(" "),
  { cwd: adminDir, stdio: "inherit" }
);

// Copy CSS
const cssFiles = ["index.css"];
for (const f of cssFiles) {
  const src = path.join(adminDir, "src", f);
  if (fs.existsSync(src)) {
    fs.copyFileSync(src, path.join(adminAssets, f));
  }
}

// Write index.html
fs.writeFileSync(
  path.join(adminDist, "index.html"),
  `<!DOCTYPE html>
<html lang="hu">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="robots" content="noindex, nofollow" />
    <title>Enzopizza — Admin</title>
    <link rel="stylesheet" href="/admin/assets/index.css" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/admin/assets/index.js"></script>
  </body>
</html>
`
);

console.log("✓ Admin built with esbuild");

// ── 3. Assemble dist/ ────────────────────────────────────────
console.log("→ Assembling dist/ output...");
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

copyDir(publicSiteDir, distDir);
for (const skip of ["README.md", "vercel.json"]) {
  const p = path.join(distDir, skip);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

copyDir(adminDist, path.join(distDir, "admin"));

console.log("✓ Build complete: dist/ (public site) + dist/admin/ (CMS)");
