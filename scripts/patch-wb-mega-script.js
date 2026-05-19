const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");
const tag =
  '<script src="assets/js/workbench-mega.js"></script>\n  <script src="assets/js/shell.js"></script>';

for (const f of fs.readdirSync(root)) {
  if (!f.endsWith(".html")) continue;
  const p = path.join(root, f);
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes('data-top="wb"')) continue;
  if (c.includes("workbench-mega.js")) continue;
  if (!c.includes('src="assets/js/shell.js"')) continue;
  c = c.replace(
    '<script src="assets/js/shell.js"></script>',
    tag
  );
  fs.writeFileSync(p, c, "utf8");
  console.log("patched", f);
}
