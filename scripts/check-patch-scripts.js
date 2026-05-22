/**
 * 校验 scripts/patch-*.js 模板中是否含会泄漏到浏览器的 + d + / + TAG +
 */
const fs = require("fs");
const path = require("path");
const root = path.join(__dirname);

var failed = false;
fs.readdirSync(root)
  .filter(function (n) {
    return /^patch-.*\.js$/.test(n);
  })
  .forEach(function (name) {
    var s = fs.readFileSync(path.join(root, name), "utf8");
    var errs = [];
    if (/newJs[\s\S]*?'\s*\+\s*d\s*\+/.test(s) || /newJs[\s\S]*?'\s*\+\s*TAG\s*\+/.test(s)) {
      errs.push("newJs template contains + d + or + TAG + (use ${TAG} + joinTag instead)");
    }
    if (errs.length) {
      failed = true;
      console.error("[FAIL]", name);
      errs.forEach(function (e) {
        console.error("  -", e);
      });
    } else {
      console.log("[OK]", name);
    }
  });

process.exit(failed ? 1 : 0);
