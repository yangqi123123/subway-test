/**
 * 巡查模块 — 通用独立搜索页
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

  window.initPatrolSearchPage = function (config) {
    config = config || {};
    var inputId = config.inputId || "patrol-search-input";
    var hintId = config.hintId || "patrol-search-hint";
    var clearId = config.clearId || "patrol-search-clear";
    var submitId = config.submitId || "patrol-search-submit";
    var backId = config.backId || "patrol-search-back";
    var listPage = config.listPage || "index.html";
    var emptyHint = config.emptyHint || "请先输入搜索关键词";
    var defaultHint = config.defaultHint || "输入编号后点击搜索，将返回列表展示筛选结果";
    var placeholder = config.placeholder || "输入编号";

    ready(function () {
      var input = document.getElementById(inputId);
      var hintEl = document.getElementById(hintId);
      var clearBtn = document.getElementById(clearId);
      var submitBtn = document.getElementById(submitId);
      var backBtn = document.getElementById(backId);
      if (!input) return;
      input.placeholder = placeholder;

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
          if (hintEl) hintEl.textContent = emptyHint;
          input.focus();
          return;
        }
        window.location.replace(listPage + "?q=" + encodeURIComponent(q));
      }

      input.addEventListener("input", function () {
        syncClear();
        if (hintEl) hintEl.textContent = defaultHint;
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
          if (hintEl) hintEl.textContent = defaultHint;
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
  };
})();
