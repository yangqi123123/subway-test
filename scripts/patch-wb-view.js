const fs = require("fs");
const path = require("path");
const root = path.join(__dirname, "..");

for (const f of fs.readdirSync(root)) {
  if (!f.endsWith(".html")) continue;
  if (f === "wb-hub.html") continue;
  const p = path.join(root, f);
  let c = fs.readFileSync(p, "utf8");
  if (!c.includes('data-top="wb"')) continue;
  if (c.includes("data-wb-view=")) continue;
  c = c.replace(/<body([^>]*)>/, '<body$1 data-wb-view="page">');
  fs.writeFileSync(p, c, "utf8");
  console.log("patched", f);
}
