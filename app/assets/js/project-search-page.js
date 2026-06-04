/**
 * 项目管理 — 独立搜索页：输入关键词后跳转主列表展示筛选结果
 */
(function () {
  "use strict";

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var input = document.getElementById("project-search-input");
    var hintEl = document.getElementById("project-search-hint");
    var clearBtn = document.getElementById("project-search-clear");
    var submitBtn = document.getElementById("project-search-submit");
    var backBtn = document.getElementById("project-search-back");
    if (!input) return;

    var listPage = "project.html";
    try {
      if (new URLSearchParams(window.location.search).get("module") === "done") {
        listPage = "project-done.html";
        var titleEl = document.querySelector(".miniapp-navbar__title");
        if (titleEl) titleEl.textContent = "搜索完工项目";
        document.title = "搜索完工项目";
      }
    } catch (e) {
      /* ignore */
    }

    function goBack() {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = listPage;
    }

    if (backBtn) backBtn.addEventListener("click", goBack);

    function syncClear() {
      if (!clearBtn) return;
      clearBtn.hidden = !(input.value || "").length;
    }

    function submitSearch() {
      var q = (input.value || "").trim();
      if (!q) {
        if (hintEl) hintEl.textContent = "请先输入搜索关键词";
        input.focus();
        return;
      }
      window.location.replace(listPage + "?q=" + encodeURIComponent(q));
    }

    input.addEventListener("input", function () {
      syncClear();
      if (hintEl) hintEl.textContent = "输入关键词后点击搜索，将返回项目列表展示筛选结果";
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        submitSearch();
      }
    });

    if (submitBtn) submitBtn.addEventListener("click", submitSearch);

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        syncClear();
        input.focus();
        if (hintEl) hintEl.textContent = "输入关键词后点击搜索，将返回项目列表展示筛选结果";
      });
    }

    try {
      var params = new URLSearchParams(window.location.search);
      var initialQ = params.get("q") || "";
      if (initialQ) input.value = initialQ;
    } catch (e) {
      /* ignore */
    }

    syncClear();
    input.focus();
  });
})();
