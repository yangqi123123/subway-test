/**
 * 本地静态服务 — 代理项目根目录 HTML/资源
 * 用法: node scripts/dev-server.js [端口]
 */
const http = require("http");
const fs = require("fs");
const path = require("path");

const root = path.resolve(__dirname, "..");
const port = Number(process.argv[2]) || 5173;

const MIME = {
  ".html": "text/html; charset=utf-8",
  ".htm": "text/html; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ico": "image/x-icon",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".map": "application/json",
  ".mp4": "video/mp4",
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const rel = decoded.replace(/^\/+/, "") || "index.html";
  const file = path.normalize(path.join(root, rel));
  if (!file.startsWith(root)) return null;
  return file;
}

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type || "text/plain; charset=utf-8" });
  res.end(body);
}

const server = http.createServer(function (req, res) {
  const file = safePath(req.url || "/");
  if (!file) {
    send(res, 403, "Forbidden");
    return;
  }

  fs.stat(file, function (err, stat) {
    if (err) {
      send(res, 404, "Not Found: " + path.basename(file));
      return;
    }
    const target = stat.isDirectory() ? path.join(file, "index.html") : file;
    fs.readFile(target, function (readErr, data) {
      if (readErr) {
        send(res, 404, "Not Found");
        return;
      }
      const ext = path.extname(target).toLowerCase();
      res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
      res.end(data);
    });
  });
});

server.listen(port, "127.0.0.1", function () {
  console.log("Prototype server running at http://127.0.0.1:" + port + "/");
  console.log("Root: " + root);
  console.log("Examples:");
  console.log("  http://127.0.0.1:" + port + "/index.html");
  console.log("  http://127.0.0.1:" + port + "/map-gis.html");
  console.log("  http://127.0.0.1:" + port + "/am-flight-log.html");
});
