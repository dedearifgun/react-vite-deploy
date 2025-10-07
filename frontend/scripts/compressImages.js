/*
  Lossless image compression for public assets.
  - JPEG: jpegtran (lossless, can do progressive)
  - PNG: optipng (lossless)
  - SVG: svgo (safe defaults)
*/

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const targets = [
  path.join(ROOT, 'public', 'images'),
  path.join(ROOT, 'public'),
  path.join(ROOT, 'src', 'assets'),
];

const allowedExt = new Set(['.png', '.jpg', '.jpeg', '.svg']);

async function walk(dir) {
  const entries = await fs.promises.readdir(dir, { withFileTypes: true });
  const files = [];
  for (const e of entries) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) {
      files.push(...await walk(full));
    } else {
      const ext = path.extname(e.name).toLowerCase();
      if (!allowedExt.has(ext)) continue;
      // skip favicons and already optimized files if needed
      if (e.name.toLowerCase().includes('favicon')) continue;
      files.push(full);
    }
  }
  return files;
}

async function compressFile(filePath, libs) {
  const before = (await fs.promises.stat(filePath)).size;
  const ext = path.extname(filePath).toLowerCase();
  const plugins = [];
  if (ext === '.jpg' || ext === '.jpeg') {
    plugins.push(libs.imageminJpegtran({ progressive: true }));
  } else if (ext === '.png') {
    plugins.push(libs.imageminOptipng({ optimizationLevel: 3 }));
  } else if (ext === '.svg') {
    plugins.push(libs.imageminSvgo({
      multipass: true,
      plugins: [
        { name: 'preset-default' },
        { name: 'removeViewBox', active: false },
      ],
    }));
  }

  // Optimize to temp dir, only replace if smaller
  const tmpDir = path.join(path.dirname(filePath), '.optimized_tmp');
  await fs.promises.mkdir(tmpDir, { recursive: true });
  await libs.imagemin([filePath], { destination: tmpDir, plugins });
  const outPath = path.join(tmpDir, path.basename(filePath));
  const exists = fs.existsSync(outPath);
  const after = exists ? (await fs.promises.stat(outPath)).size : before;
  if (exists && after < before) {
    await fs.promises.copyFile(outPath, filePath);
  }
  // cleanup temp file
  try { if (exists) await fs.promises.unlink(outPath); } catch(_) {}
  try { await fs.promises.rmdir(tmpDir); } catch(_) {}
  return { before, after };
}

async function main() {
  const allFiles = [];
  for (const t of targets) {
    try {
      if (fs.existsSync(t)) {
        allFiles.push(...await walk(t));
      }
    } catch (_) {}
  }
  if (allFiles.length === 0) {
    console.log('No image assets found to compress.');
    return;
  }
  let totalBefore = 0, totalAfter = 0;
  // Dynamically import ESM modules
  const { default: imagemin } = await import('imagemin');
  const { default: imageminJpegtran } = await import('imagemin-jpegtran');
  const { default: imageminOptipng } = await import('imagemin-optipng');
  const { default: imageminSvgo } = await import('imagemin-svgo');

  const libs = { imagemin, imageminJpegtran, imageminOptipng, imageminSvgo };

  for (const f of allFiles) {
    try {
      const { before, after } = await compressFile(f, libs);
      totalBefore += before; totalAfter += after;
      const delta = before - after;
      console.log(`Optimized: ${path.relative(ROOT, f)} -> saved ${delta} bytes (${before} -> ${after})`);
    } catch (err) {
      console.warn('Failed to optimize', f, err?.message || err);
    }
  }
  const saved = totalBefore - totalAfter;
  console.log(`\nTotal saved: ${saved} bytes (from ${totalBefore} to ${totalAfter}).`);
}

main().catch(err => { console.error(err); process.exit(1); });