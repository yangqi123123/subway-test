/**
 * 页面嵌入模式：?embed=1 时去掉顶栏/侧栏，仅渲染业务区（供项目管理巡查 Tab 复用）
 */
(function () {
  if (!/[?&]embed=1(?:&|$)/.test(location.search)) return;
  document.documentElement.classList.add("wh-embed-mode");
  var body = document.body;
  if (body) body.setAttribute("data-shell", "embed");
  var style = document.createElement("style");
  style.id = "wh-embed-mode-style";
  style.textContent =
    "html.wh-embed-mode,body.wh-layout-embed{margin:0;min-height:100%;background:#020617}" +
    "body.wh-layout-embed #page-root{max-width:100%!important;margin:0!important;padding:12px 16px 20px;min-height:100vh;box-sizing:border-box}" +
    "body.wh-layout-embed [data-embed-hide]{display:none!important}";
  document.head.appendChild(style);
})();
