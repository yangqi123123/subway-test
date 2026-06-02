/**
 * 卡片网格分页（资料库、巡检成果等）
 */
(function (global) {
  "use strict";

  function paginate(list, state) {
    var pageSize = state.pageSize || 12;
    var page = state.page || 1;
    var total = list.length;
    var pages = Math.max(1, Math.ceil(total / pageSize) || 1);
    if (page > pages) page = pages;
    if (page < 1) page = 1;
    state.page = page;
    var start = (page - 1) * pageSize;
    return {
      total: total,
      page: page,
      pageSize: pageSize,
      pages: pages,
      rows: list.slice(start, start + pageSize),
    };
  }

  function renderPagerHtml(meta, state, options) {
    options = options || {};
    var sizes = options.pageSizes || [12, 20, 40];
    var sizeOpts = sizes
      .map(function (n) {
        return (
          '<option value="' +
          n +
          '"' +
          (meta.pageSize === n ? " selected" : "") +
          ">" +
          n +
          " 条/页</option>"
        );
      })
      .join("");

    var prevDisabled = meta.page <= 1 ? " disabled" : "";
    var nextDisabled = meta.page >= meta.pages ? " disabled" : "";

    var pageBtns = "";
    var maxBtns = 5;
    var startPage = Math.max(1, meta.page - 2);
    var endPage = Math.min(meta.pages, startPage + maxBtns - 1);
    startPage = Math.max(1, endPage - maxBtns + 1);
    for (var p = startPage; p <= endPage; p++) {
      pageBtns +=
        '<button type="button" class="card-grid-pager__btn ' +
        (p === meta.page ? "wh-btn-primary is-active" : "wh-btn-ghost") +
        '" data-pager-action="page" data-page="' +
        p +
        '">' +
        p +
        "</button>";
    }

    return (
      '<div class="card-grid-pager" data-card-pager>' +
      "<span>共 <b class=\"text-cyan-200\">" +
      meta.total +
      '</b> 条，第 <b class="text-cyan-200">' +
      meta.page +
      "</b> / " +
      meta.pages +
      " 页</span>" +
      '<div class="card-grid-pager__right">' +
      '<button type="button" class="card-grid-pager__btn wh-btn-ghost"' +
      prevDisabled +
      ' data-pager-action="prev" aria-label="上一页">&lt;</button>' +
      pageBtns +
      '<button type="button" class="card-grid-pager__btn wh-btn-ghost"' +
      nextDisabled +
      ' data-pager-action="next" aria-label="下一页">&gt;</button>' +
      '<select class="wh-input px-2 text-[11px]" data-pager-action="size">' +
      sizeOpts +
      "</select>" +
      "<span>跳至</span>" +
      '<input type="number" class="wh-input w-12 px-2 text-center" min="1" max="' +
      meta.pages +
      '" value="' +
      meta.page +
      '" data-pager-jump />' +
      "<span>页</span>" +
      '<button type="button" class="card-grid-pager__btn wh-btn-ghost" data-pager-action="goto">确定</button>' +
      "</div></div>"
    );
  }

  function bindPager(container, state, onChange) {
    if (!container || container._pagerBound) return;
    container._pagerBound = true;

    container.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-pager-action]");
      if (!btn || !container.contains(btn)) return;
      var action = btn.getAttribute("data-pager-action");
      if (action === "prev") {
        state.page = Math.max(1, (state.page || 1) - 1);
        onChange();
      }
      if (action === "next") {
        state.page = (state.page || 1) + 1;
        onChange();
      }
      if (action === "page") {
        state.page = parseInt(btn.getAttribute("data-page"), 10) || 1;
        onChange();
      }
      if (action === "goto") {
        var input = container.querySelector("[data-pager-jump]");
        var n = input ? parseInt(input.value, 10) : state.page;
        if (!isNaN(n) && n >= 1) state.page = n;
        onChange();
      }
    });

    container.addEventListener("change", function (e) {
      var t = e.target;
      if (!(t instanceof HTMLSelectElement)) return;
      if (t.getAttribute("data-pager-action") !== "size") return;
      state.pageSize = parseInt(t.value, 10) || 12;
      state.page = 1;
      onChange();
    });

    container.addEventListener("keydown", function (e) {
      if (e.key !== "Enter") return;
      var input = e.target;
      if (!(input instanceof HTMLInputElement) || !input.hasAttribute("data-pager-jump")) return;
      var n = parseInt(input.value, 10);
      if (!isNaN(n) && n >= 1) {
        state.page = n;
        onChange();
      }
    });
  }

  function mountPager(container, meta, state, onChange, options) {
    if (!container) return;
    container.innerHTML = renderPagerHtml(meta, state, options);
    bindPager(container, state, onChange);
  }

  global.WHCardGridPager = {
    paginate: paginate,
    mountPager: mountPager,
    renderPagerHtml: renderPagerHtml,
    bindPager: bindPager,
  };
})(window);
