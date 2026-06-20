// ============================================================
// ENZOPIZZA HAJMÁSKÉR — root build script
//
// Vercel build command: `npm run build` (this file).
// Produces a single output directory `dist/` containing:
//   dist/                  <- the static public site (public-site/*)
//   dist/admin/             <- the built FireCMS admin SPA
//
// This lets one Vercel project serve both the public site at
// the domain root and the CMS at {domain}/admin, with a single
// deploy and no cross-project rewrites.
// ============================================================

const { execSync } = require("node:child_process");
const fs = require("node:fs");
const path = require("node:path");

const root = __dirname;
const distDir = path.join(root, "dist");
const publicSiteDir = path.join(root, "public-site");
const adminDir = path.join(root, "admin-cms");
const adminBuildDir = path.join(adminDir, "dist");

function copyDir(src, dest) {
  fs.mkdirSync(dest, { recursive: true });
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(srcPath, destPath);
    } else {
      fs.copyFileSync(srcPath, destPath);
    }
  }
}

console.log("→ Installing & building admin-cms (FireCMS)...");
execSync("npm install", { cwd: adminDir, stdio: "inherit" });
execSync("npm run build", { cwd: adminDir, stdio: "inherit" });

console.log("→ Assembling combined dist/ output...");
fs.rmSync(distDir, { recursive: true, force: true });
fs.mkdirSync(distDir, { recursive: true });

copyDir(publicSiteDir, distDir);
// public-site/README.md and vercel.json (if any) intentionally
// excluded from the deployed output below.
for (const skip of ["README.md", "vercel.json"]) {
  const p = path.join(distDir, skip);
  if (fs.existsSync(p)) fs.rmSync(p, { recursive: true, force: true });
}

copyDir(adminBuildDir, path.join(distDir, "admin"));

console.log("✓ Build complete: dist/ (public site) + dist/admin (CMS)");
