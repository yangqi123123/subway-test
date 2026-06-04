/**
 * 人工巡检记录 — 独立搜索页
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
    var input = document.getElementById("manual-search-input");
    var hintEl = document.getElementById("manual-search-hint");
    var clearBtn = document.getElementById("manual-search-clear");
    var submitBtn = document.getElementById("manual-search-submit");
    var backBtn = document.getElementById("manual-search-back");
    if (!input) return;

    var listPage = "manual.html";
    var defaultHint = "输入巡查编号后点击搜索，将返回人工巡检记录列表展示筛选结果";

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
        if (hintEl) hintEl.textContent = "请先输入编号";
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
