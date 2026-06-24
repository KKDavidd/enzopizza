// ============================================================
// ENZOPIZZA HAJMÁSKÉR — root build script
// Vercel build command: `npm run build` (this file).
// Produces dist/ with public site + dist/admin/index.html
// The admin is a self-contained HTML file using CDN imports —
// no bundler, no tree-shaking, no Firebase SDK issues.
// ============================================================

const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const distDir = path.join(root, "dist");
const publicSiteDir = path.join(root, "public-site");
const adminStaticDir = path.join(root, "admin-static");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) copyDir(srcPath, destPath);
    else fs.copyFileSync(srcPath, destPath);
  }
}

console.log("→ Assembling dist/...");
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

// Copy public site
copyDir(publicSiteDir, distDir);
for (const skip of ["README.md", "vercel.json"]) {
  const p = path.join(distDir, skip);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

// Copy admin static (single index.html with CDN imports)
const adminDest = path.join(distDir, "admin");
fs.mkdirSync(adminDest, { recursive: true });
copyDir(adminStaticDir, adminDest);

console.log("✓ Build complete: dist/ (public) + dist/admin/ (admin CMS)");
