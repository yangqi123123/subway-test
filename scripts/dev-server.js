/**
 * 本地静态服务 — 代理项目内 HTML / 资源，供浏览器 http:// 访问
 * 用法: node scripts/dev-server.js [port]
 */
const http = require("http");
const fs = require("fs");
const path = require("path");
const { URL } = require("url");

const ROOT = path.resolve(__dirname, "..");
const PORT = Number(process.argv[2]) || 8080;
const HOST = "127.0.0.1";

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".txt": "text/plain; charset=utf-8",
  ".md": "text/markdown; charset=utf-8",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0].split("#")[0]);
  const normalized = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  const filePath = path.join(ROOT, normalized);
  if (!filePath.startsWith(ROOT)) return null;
  return filePath;
}

function send(res, status, body, headers) {
  res.writeHead(status, headers);
  res.end(body);
}

function serveFile(res, filePath) {
  fs.stat(filePath, (err, stat) => {
    if (err || !stat.isFile()) {
      send(res, 404, "404 Not Found\n", { "Content-Type": "text/plain; charset=utf-8" });
      return;
    }
    const ext = path.extname(filePath).toLowerCase();
    const type = MIME[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": type, "Cache-Control": "no-cache" });
    fs.createReadStream(filePath).pipe(res);
  });
}

function resolveRequestPath(urlPath) {
  let filePath = safePath(urlPath);
  if (!filePath) return null;

  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    const indexPath = path.join(filePath, "index.html");
    if (fs.existsSync(indexPath)) return indexPath;
  }

  if (!path.extname(filePath) && fs.existsSync(filePath + ".html")) {
    return filePath + ".html";
  }

  return filePath;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, "http://" + HOST);
  let pathname = url.pathname;
  if (pathname === "/") pathname = "/index.html";

  const filePath = resolveRequestPath(pathname);
  if (!filePath || !fs.existsSync(filePath)) {
    send(res, 404, "404 Not Found: " + pathname + "\n", { "Content-Type": "text/plain; charset=utf-8" });
    return;
  }

  serveFile(res, filePath);
});

server.listen(PORT, HOST, () => {
  const base = "http://" + HOST + ":" + PORT;
  console.log("");
  console.log("  武汉地铁保护区原型 — 本地服务已启动");
  console.log("  ─────────────────────────────────────");
  console.log("  根目录: " + ROOT);
  console.log("");
  console.log("  入口页:");
  console.log("    " + base + "/");
  console.log("    " + base + "/app/index.html");
  console.log("    " + base + "/web/map/map-alerts.html");
  console.log("");
  console.log("  按 Ctrl+C 停止");
  console.log("");
});
