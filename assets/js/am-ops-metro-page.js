/**
 * 资源监控 — Web / 移动端共用逻辑
 */
(function (global) {
  "use strict";

  function bootOpsMetroPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var serverId = options.serverId || "metro";

    function $(sel) {
      return document.querySelector(sel);
    }

    function showToast(msg) {
      var toastEl = document.getElementById("ops-toast");
      if (toastEl) {
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () {
          toastEl.classList.remove("show");
        }, 1800);
        return;
      }
      if (isMobile) return;
      var box = document.getElementById("ops-toast-box");
      if (box) box.remove();
      box = document.createElement("div");
      box.id = "ops-toast-box";
      box.className =
        "fixed bottom-5 right-5 z-[1300] rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg";
      box.textContent = msg;
      document.body.appendChild(box);
      setTimeout(function () {
        box.remove();
      }, 1600);
    }

    function metricHtml(val, isRate) {
      if (!isRate) return val;
      return '<i class="fa-solid fa-arrow-down text-[11px]"></i> ' + val;
    }

    function setNodeStatus(key, level, text) {
      var el = document.querySelector('[data-node="' + key + '"]');
      if (!el) return;
      var dot = el.querySelector(".topo-dot");
      if (!dot) return;
      dot.className = "topo-dot topo-dot--" + level;
      var label = el.querySelector("span:last-child");
      if (label) label.textContent = text;
    }

    function applyServer(id) {
      var dataMap = global.WH_OPS_METRO_SERVER_DATA || {};
      var data = dataMap[id] || dataMap.metro;
      if (!data) return;

      ["cpu", "mem", "disk"].forEach(function (k) {
        var el = document.querySelector('[data-metric="' + k + '"]');
        if (el) el.innerHTML = metricHtml(data.metrics[k], true);
      });
      ["cores", "memFree", "diskFree"].forEach(function (k) {
        var el = document.querySelector('[data-metric="' + k + '"]');
        if (el) el.textContent = data.metrics[k];
      });
      Object.keys(data.store).forEach(function (k) {
        var el = document.querySelector('[data-store="' + k + '"]');
        if (el) el.textContent = data.store[k];
      });
      var chart = data.chart;
      var totalEl = document.querySelector('[data-chart="total"]');
      if (totalEl) totalEl.textContent = chart.total;
      var usedEl = document.querySelector('[data-chart="used"]');
      if (usedEl) usedEl.textContent = chart.used;
      var freeEl = document.querySelector('[data-chart="free"]');
      if (freeEl) freeEl.textContent = chart.free;
      var pctBar = document.querySelector('[data-chart="pctBar"]');
      if (pctBar) pctBar.style.width = chart.pct + "%";
      var pctText = document.querySelector('[data-chart="pctText"]');
      if (pctText) pctText.textContent = "已用 " + chart.pct + "%";
      var pctDetail = document.querySelector('[data-chart="pctDetail"]');
      if (pctDetail) pctDetail.textContent = chart.pctDetail;
      ["photo", "project", "lib"].forEach(function (k) {
        var bar = document.querySelector('[data-bar="' + k + '"]');
        if (bar) bar.style.width = chart.bars[k];
        var labelEl = document.querySelector('[data-bar-label="' + k + '"]');
        if (labelEl && chart.labels) labelEl.textContent = chart.labels[k];
      });
      Object.keys(data.nodes).forEach(function (k) {
        setNodeStatus(k, data.nodes[k][0], data.nodes[k][1]);
      });
    }

    function fieldVal(id) {
      var el = document.getElementById(id);
      return el ? String(el.value || "").trim() : "";
    }

    function syncFilterHint() {
      var hintEl = document.getElementById("ops-filter-hint");
      if (!hintEl) return;
      var start = fieldVal("ops-filter-start");
      var end = fieldVal("ops-filter-end");
      if (start && end) {
        hintEl.textContent = start.replace("T", " ") + " ~ " + end.replace("T", " ");
        hintEl.hidden = false;
      } else {
        hintEl.hidden = true;
        hintEl.textContent = "";
      }
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");

        if (action === "open-ops-filter") {
          var sheet = document.getElementById("ops-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            sheet.setAttribute("aria-hidden", "false");
          }
          return;
        }
        if (action === "close-ops-filter") {
          var closeSheet = document.getElementById("ops-filter-sheet");
          if (closeSheet) {
            closeSheet.classList.remove("is-open");
            closeSheet.setAttribute("aria-hidden", "true");
          }
          return;
        }
        if (action === "search-ops-filter") {
          var filterSheet = document.getElementById("ops-filter-sheet");
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          applyServer(serverId);
          syncFilterHint();
          showToast("已按时间范围刷新监控数据");
          return;
        }
        if (action === "reset-ops-filter") {
          var defaults = global.WH_OPS_METRO_DEFAULT_FILTER || {};
          var startEl = document.getElementById("ops-filter-start");
          var endEl = document.getElementById("ops-filter-end");
          if (startEl) startEl.value = defaults.start || "";
          if (endEl) endEl.value = defaults.end || "";
          applyServer(serverId);
          syncFilterHint();
          showToast("筛选条件已重置");
        }
      });

      var searchBtn = document.getElementById("ops-filter-search");
      var resetBtn = document.getElementById("ops-filter-reset");
      if (searchBtn) {
        searchBtn.addEventListener("click", function () {
          applyServer(serverId);
          showToast("已按时间范围刷新监控数据");
        });
      }
      if (resetBtn) {
        resetBtn.addEventListener("click", function () {
          var defaults = global.WH_OPS_METRO_DEFAULT_FILTER || {};
          var startEl = document.getElementById("ops-filter-start");
          var endEl = document.getElementById("ops-filter-end");
          if (startEl) startEl.value = defaults.start || "";
          if (endEl) endEl.value = defaults.end || "";
          applyServer(serverId);
          showToast("筛选条件已重置");
        });
      }
    }

    function initQuickLinks() {
      var mountEl = document.getElementById("ops-quick-links");
      if (mountEl && global.SystemMgmtQuickLinks) {
        SystemMgmtQuickLinks.mount(mountEl, "wb/am-ops-metro.html");
      }
    }

    bindEvents();
    initQuickLinks();
    syncFilterHint();
    applyServer(serverId);
  }

  global.WHOpsMetroPage = { boot: bootOpsMetroPage };
})(window);
