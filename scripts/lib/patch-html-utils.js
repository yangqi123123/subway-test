/**
 * Node 补丁脚本工具：避免把补丁变量泄漏进浏览器内联脚本
 */
const TAG = "d" + "iv";

/** 将模板中的 ${TAG} 替换为 div，用于 HTML 与内联 JS 字符串 */
function joinTag(template) {
  return String(template).split("${TAG}").join(TAG);
}

/**
 * 校验即将写入 .html 的 <script> 内容（不含外层 script 标签亦可）
 * @returns {string} 传入的 js 原文（通过校验后原样返回）
 */
function assertBrowserScriptSafe(js) {
  var code = String(js);
  if (/<\/?motion\b/i.test(code)) {
    throw new Error("browser script contains invalid <motion> tag");
  }
  if (/\$\{TAG\}/.test(code)) {
    throw new Error("browser script still contains unreplaced ${TAG}");
  }
  if (/\+\s*d\s*\+/.test(code)) {
    throw new Error("browser script contains undefined patch variable `d` (+ d +)");
  }
  if (/\+\s*TAG\s*\+/.test(code)) {
    throw new Error("browser script contains undefined patch variable `TAG`");
  }
  return code;
}

/** 从完整 HTML 提取第一个内联 IIFE 并校验语法 */
function assertInlinePageScript(html) {
  var s = String(html);
  var start = s.indexOf("(function () {");
  if (start < 0) throw new Error("no inline IIFE found");
  var end = s.indexOf("})();", start);
  if (end < 0) throw new Error("IIFE not closed");
  var body = s.slice(start, end + 5);
  assertBrowserScriptSafe(body);
  new Function(body);
  return true;
}

module.exports = {
  TAG: TAG,
  joinTag: joinTag,
  assertBrowserScriptSafe: assertBrowserScriptSafe,
  assertInlinePageScript: assertInlinePageScript,
};
