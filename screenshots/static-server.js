const http = require('http');
const fs = require('fs');
const path = require('path');
const port = 8090;
const root = path.resolve(__dirname, '..');

const mime = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon'
};

const server = http.createServer((req, res) => {
  const decoded = decodeURIComponent(req.url.split('?')[0]);
  const safePath = path.normalize(decoded).replace(/^(\.\.\/|\\)+/, '');
  let filePath = path.join(root, safePath === '/' ? 'index.html' : safePath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, 'index.html');
  }
  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404); res.end('Not found');
    } else {
      const ext = path.extname(filePath).toLowerCase();
      res.writeHead(200, { 'Content-Type': mime[ext] || 'application/octet-stream' });
      res.end(data);
    }
  });
});

server.listen(port, () => console.log('static server on http://127.0.0.1:' + port));
