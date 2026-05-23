/**
 * 目录重组：根目录仅保留 index.html（双端入口），其余 HTML → web/，登录页 → web/web-login.html
 * 运行: node scripts/reorganize-web-structure.js
 */
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const webDir = path.join(projectRoot, "web");
const appDir = path.join(projectRoot, "app");

function fixWebHtmlAssetRefs(text) {
  return text
    .replace(/href="\.\.\/\.\.\/assets\//g, 'href="../assets/')
    .replace(/src="\.\.\/\.\.\/assets\//g, 'src="../assets/')
    .replace(/href="assets\//g, 'href="../assets/')
    .replace(/src="assets\//g, 'src="../assets/')
    .replace(/href='assets\//g, "href='../assets/")
    .replace(/src='assets\//g, "src='../assets/");
}

function fixWebLoginRedirect(text) {
  return text.replace(/window\.location\.href\s*=\s*["']map-gis\.html["']/g, 'window.location.href = "map-gis.html"');
}

const entryIndex = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>武汉地铁保护区管理平台</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" />
    <link rel="stylesheet" href="assets/css/theme.css" />
    <style>
      .entry-shell {
        min-height: 100vh;
        min-height: 100dvh;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1.5rem;
      }
      .entry-grid {
        width: 100%;
        max-width: 520px;
        display: grid;
        gap: 1rem;
      }
      @media (min-width: 480px) {
        .entry-grid { grid-template-columns: 1fr 1fr; max-width: 640px; }
      }
      .entry-card {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
        padding: 2rem 1.5rem;
        border-radius: 12px;
        border: 1px solid rgba(34, 211, 238, 0.25);
        background: rgba(7, 27, 51, 0.85);
        color: #e2f5ff;
        text-decoration: none;
        transition: border-color 0.15s, background 0.15s, transform 0.15s;
      }
      .entry-card:hover {
        border-color: rgba(34, 211, 238, 0.55);
        background: rgba(12, 40, 72, 0.95);
        transform: translateY(-2px);
      }
      .entry-card__icon {
        width: 3.5rem;
        height: 3.5rem;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 12px;
        font-size: 1.5rem;
        margin-bottom: 1rem;
      }
      .entry-card--mobile .entry-card__icon {
        color: #a5f3fc;
        background: rgba(34, 211, 238, 0.12);
        border: 1px solid rgba(34, 211, 238, 0.3);
      }
      .entry-card--desktop .entry-card__icon {
        color: #a5f3fc;
        background: rgba(34, 211, 238, 0.12);
        border: 1px solid rgba(34, 211, 238, 0.35);
      }
    </style>
  </head>
  <body class="wh-main-canvas text-slate-100">
    <div class="entry-shell">
      <div class="w-full flex flex-col items-center">
        <div class="text-center mb-10">
          <div class="inline-flex items-center justify-center w-14 h-14 rounded-xl border border-cyan-400/35 bg-black/25 text-2xl text-cyan-300 shadow-[0_0_20px_rgba(34,211,238,0.25)] mb-4">
            <i class="fa-solid fa-train-subway" aria-hidden="true"></i>
          </div>
          <h1 class="text-xl font-semibold text-white tracking-tight" style="text-shadow: 0 0 24px rgba(34, 211, 238, 0.25)">武汉地铁保护区管理平台</h1>
          <p class="text-xs text-slate-500 mt-2">请选择访问端</p>
        </div>
        <div class="entry-grid">
          <a href="app/index.html" class="entry-card entry-card--mobile">
            <span class="entry-card__icon"><i class="fa-solid fa-mobile-screen-button" aria-hidden="true"></i></span>
            <span class="text-base font-semibold text-white">移动端</span>
            <span class="text-[11px] text-slate-500 mt-2">手机 / 平板原型</span>
          </a>
          <a href="web/web-login.html" class="entry-card entry-card--desktop">
            <span class="entry-card__icon"><i class="fa-solid fa-desktop" aria-hidden="true"></i></span>
            <span class="text-base font-semibold text-white">电脑端</span>
            <span class="text-[11px] text-slate-500 mt-2">运维后台 · Web</span>
          </a>
        </div>
      </div>
    </div>
  </body>
</html>
`;

const appIndex = `<!DOCTYPE html>
<html lang="zh-CN">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
    <title>移动端 — 武汉地铁保护区</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css" crossorigin="anonymous" />
    <link rel="stylesheet" href="../assets/css/theme.css" />
    <style>
      .m-login { min-height: 100dvh; display: flex; align-items: center; justify-content: center; padding: 1rem; }
      .m-card { width: 100%; max-width: 360px; }
    </style>
  </head>
  <body class="wh-main-canvas text-slate-100">
    <div class="m-login">
      <div class="m-card neon-panel neon-panel--tight p-6">
        <div class="text-center mb-6">
          <div class="inline-flex items-center justify-center w-12 h-12 rounded-xl border border-cyan-400/35 bg-black/25 text-xl text-cyan-300 mb-3">
            <i class="fa-solid fa-train-subway" aria-hidden="true"></i>
          </div>
          <h1 class="text-lg font-semibold text-white">移动端原型</h1>
          <p class="text-[11px] text-slate-500 mt-1">武汉地铁保护区管理平台</p>
        </div>
        <p class="text-center text-sm text-slate-400 mb-4">移动端页面将在此目录（app/）中扩展。</p>
        <a href="../index.html" class="block w-full py-2.5 text-center text-sm font-semibold wh-btn-primary rounded">返回入口</a>
      </div>
    </div>
  </body>
</html>
`;

function main() {
  fs.mkdirSync(webDir, { recursive: true });
  fs.mkdirSync(appDir, { recursive: true });

  const indexPath = path.join(projectRoot, "index.html");
  if (!fs.existsSync(indexPath)) {
    console.error("缺少 index.html");
    process.exit(1);
  }
  const originalLogin = fs.readFileSync(indexPath, "utf8");

  const htmlAtRoot = fs
    .readdirSync(projectRoot)
    .filter((f) => f.endsWith(".html") && f !== "index.html" && f !== "web-login.html");

  for (const f of htmlAtRoot) {
    const from = path.join(projectRoot, f);
    const to = path.join(webDir, f);
    if (fs.existsSync(to)) fs.unlinkSync(to);
    fs.renameSync(from, to);
    console.log("  moved", f, "→ web/");
  }

  let loginHtml = fixWebHtmlAssetRefs(originalLogin);
  loginHtml = fixWebLoginRedirect(loginHtml);
  fs.writeFileSync(path.join(webDir, "web-login.html"), loginHtml, "utf8");
  console.log("  created web/web-login.html");

  for (const f of fs.readdirSync(webDir)) {
    if (!f.endsWith(".html")) continue;
    const p = path.join(webDir, f);
    fs.writeFileSync(p, fixWebHtmlAssetRefs(fs.readFileSync(p, "utf8")), "utf8");
  }

  fs.writeFileSync(indexPath, entryIndex, "utf8");
  console.log("  wrote root index.html (portal)");

  fs.writeFileSync(path.join(appDir, "index.html"), appIndex, "utf8");
  console.log("  wrote app/index.html");

  console.log("\n[OK] Done. Root HTML count:", fs.readdirSync(projectRoot).filter((f) => f.endsWith(".html")).length);
  console.log("[OK] web HTML count:", fs.readdirSync(webDir).filter((f) => f.endsWith(".html")).length);
}

main();
