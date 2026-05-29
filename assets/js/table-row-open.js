/**
 * 列表行点击：优先打开「查看/详情」，否则打开「编辑」
 */
(function (global) {
  var IGNORE =
    "input,button,a,label,select,textarea,.disease-col-actions,.flight-plan-col-actions,.wb-action,.project-action,.line-action,.row-action,.score-action-link,.dr-action,.uav-link,.material-action,.op-btn,.alert-op-btn,.am-tree-cell,[data-action]";

  function shouldIgnore(e) {
    return !!(e && e.target && e.target.closest(IGNORE));
  }

  function pickOpenAction(actions) {
    if (!actions || !actions.length) return null;
    var view = null;
    var edit = null;
    for (var i = 0; i < actions.length; i++) {
      var a = actions[i];
      var label = a.label || "";
      if (
        !view &&
        (label === "查看" ||
          label === "查看详情" ||
          label === "查阅计划" ||
          label === "详情" ||
          a.type === "view" ||
          a.detail)
      ) {
        view = a;
      }
      if (!edit && (label === "编辑" || a.type === "edit")) edit = a;
    }
    return view || edit || null;
  }

  function injectStyles() {
    if (document.getElementById("wh-row-open-style")) return;
    var style = document.createElement("style");
    style.id = "wh-row-open-style";
    style.textContent =
      ".wh-row-open-tbody tr:not(.alert-tree-row--parent){cursor:pointer}" +
      ".wh-row-open-tbody tr:not(.alert-tree-row--parent):hover>td:not(.disease-col-actions):not(.flight-plan-col-actions){background:rgba(14,48,78,.38)!important}";
    document.head.appendChild(style);
  }

  function bind(tbody, options) {
    if (!tbody || tbody.dataset.whRowOpenBound) return;
    options = options || {};
    tbody.dataset.whRowOpenBound = "1";
    tbody.classList.add("wh-row-open-tbody");
    injectStyles();
    tbody.addEventListener("click", function (e) {
      if (shouldIgnore(e)) return;
      var tr = e.target.closest("tr");
      if (!tr || tr.classList.contains("alert-tree-row--parent") || tr.querySelector(".wb-empty, .alert-tree-empty")) return;
      var rows = typeof options.getRows === "function" ? options.getRows() : options.rows;
      var index =
        typeof options.getIndex === "function"
          ? options.getIndex(tr, rows)
          : Number(tr.getAttribute("data-row-index"));
      if (Number.isNaN(index) || index < 0 || !rows || rows[index] === undefined) {
        if (typeof options.onOpenByTr === "function") {
          options.onOpenByTr(tr, rows);
        }
        return;
      }
      if (typeof options.onOpen === "function") options.onOpen(rows[index], index, tr);
    });
  }

  function bindById(tbodyId, options) {
    bind(typeof tbodyId === "string" ? document.getElementById(tbodyId) : tbodyId, options);
  }

  global.WHTableRowClick = {
    IGNORE: IGNORE,
    shouldIgnore: shouldIgnore,
    pickOpenAction: pickOpenAction,
    injectStyles: injectStyles,
    bind: bind,
    bindById: bindById,
  };
})(typeof window !== "undefined" ? window : global);
