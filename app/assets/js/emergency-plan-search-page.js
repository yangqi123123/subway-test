/**
 * 应急预案 — 独立搜索页
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
    var input = document.getElementById("plan-search-input");
    var hintEl = document.getElementById("plan-search-hint");
    var clearBtn = document.getElementById("plan-search-clear");
    var submitBtn = document.getElementById("plan-search-submit");
    var backBtn = document.getElementById("plan-search-back");
    if (!input) return;

    var listPage = "emergency-plan.html";
    var defaultHint = "输入预案名称或备注后点击搜索，将返回应急预案列表展示筛选结果";

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
        if (hintEl) hintEl.textContent = "请先输入预案名称或备注";
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
})();
