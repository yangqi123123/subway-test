/**
 * 应急物资 — 独立搜索页
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
    var input = document.getElementById("material-search-input");
    var hintEl = document.getElementById("material-search-hint");
    var clearBtn = document.getElementById("material-search-clear");
    var submitBtn = document.getElementById("material-search-submit");
    var backBtn = document.getElementById("material-search-back");
    if (!input) return;

    var warehouse = "";
    try {
      var params = new URLSearchParams(window.location.search);
      warehouse = params.get("warehouse") || "";
    } catch (e) {
      /* ignore */
    }

    var listPage =
      "emergency-material.html" +
      (warehouse ? "?warehouse=" + encodeURIComponent(warehouse) : "");
    var defaultHint = "输入物资名称后点击搜索，将返回物资列表展示筛选结果";

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
        if (hintEl) hintEl.textContent = "请先输入物资名称";
        input.focus();
        return;
      }
      var sep = listPage.indexOf("?") >= 0 ? "&" : "?";
      window.location.replace(listPage + sep + "q=" + encodeURIComponent(q));
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
      var initialParams = new URLSearchParams(window.location.search);
      var initialQ = initialParams.get("q") || "";
      if (initialQ) input.value = initialQ;
    } catch (e) {
      /* ignore */
    }

    syncClear();
    input.focus();
  });
})();
