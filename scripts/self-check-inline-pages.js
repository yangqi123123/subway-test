/**
 * 自检：带内联脚本的列表+表单页（语法、常见补丁错误、关键 DOM）
 * 用法: node scripts/self-check-inline-pages.js [file.html ...]
 */
const fs = require("fs");
const path = require("path");
const { assertInlinePageScript } = require("./lib/patch-html-utils");

const defaultFiles = ["in-night.html", "in-disease.html"];
const root = path.join(__dirname, "..");
const files = process.argv.slice(2).length ? process.argv.slice(2) : defaultFiles;

var failed = false;

files.forEach(function (name) {
  var file = path.isAbsolute(name) ? name : path.join(root, name);
  if (!fs.existsSync(file)) {
    console.error("[FAIL]", name, "file not found");
    failed = true;
    return;
  }
  var s = fs.readFileSync(file, "utf8");
  var label = path.basename(file);
  var errs = [];

  try {
    assertInlinePageScript(s);
    if (s.includes("bindUploader") && s.includes("bindFileInput(")) {
      errs.push("calls removed bindFileInput alongside bindUploader");
    }
    if (s.includes("f-photo-list") && s.includes("f-photo-names")) {
      errs.push("stale f-photo-names reference with f-photo-list upload UI");
    }
  } catch (e) {
    errs.push(e.message);
  }

  ["table-body", "list-view", "form-view"].forEach(function (id) {
    if (!s.includes('id="' + id + '"')) errs.push("missing #" + id);
  });

  if (errs.length) {
    failed = true;
    console.error("[FAIL]", label);
    errs.forEach(function (e) {
      console.error("  -", e);
    });
  } else {
    console.log("[OK]", label);
  }
});

process.exit(failed ? 1 : 0);
