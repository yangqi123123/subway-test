/**
 * 线路项目统计 — Web / 移动端共用逻辑
 */
(function (global) {
  "use strict";

  function bootLineStatsPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var lineChartBase = global.WH_LINE_CHART_BASE;
    var chartConfigs = global.WH_LINE_CHART_CONFIGS || {};
    var activeSystemTab = "projectType";
    var lineToolbar = null;
    var systemToolbar = null;

    function $(id) {
      return document.getElementById(id);
    }

    function showToast(msg) {
      var toastEl = $("line-stats-toast");
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
      var box = document.getElementById("toast-box");
      if (box) box.remove();
      box = document.createElement("div");
      box.id = "toast-box";
      box.className =
        "fixed right-5 bottom-5 z-[100] rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg";
      box.textContent = msg;
      document.body.appendChild(box);
      setTimeout(function () {
        box.remove();
      }, 1800);
    }

    function updateSummary() {
      var summary = global.WH_LINE_STATS_SUMMARY || {};
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-line", summary.line || 0);
      set("stat-station", summary.station || 0);
      set("stat-section", summary.section || 0);
      set("stat-project", summary.project || 0);
    }

    function cloneLineChartConfig(cfg) {
      return {
        title: cfg.title,
        sub: cfg.sub,
        axisLabel: cfg.axisLabel,
        yLabel: cfg.yLabel,
        max: cfg.max,
        labels: cfg.labels.slice(),
        series: cfg.series.map(function (s) {
          var copy = Object.assign({}, s);
          copy.values = s.values.slice();
          return copy;
        }),
      };
    }

    function getFilteredLineChartConfig() {
      var cfg = cloneLineChartConfig(lineChartBase);
      var line = fieldVal("filter-line");
      var section = fieldVal("filter-section");
      var station = fieldVal("filter-station");
      var start = fieldVal("filter-date-start");
      var end = fieldVal("filter-date-end");
      var hints = [];
      if (section) hints.push("区间：" + section);
      if (station) hints.push("站点：" + station);
      if (start || end) hints.push((start || "…") + " ~ " + (end || "…"));
      if (hints.length) cfg.sub = hints.join(" · ") + " · " + lineChartBase.sub;

      if (line) {
        var idx = cfg.labels.indexOf(line);
        if (idx >= 0) {
          cfg.labels = [line];
          cfg.series = cfg.series.map(function (s) {
            var copy = Object.assign({}, s);
            copy.values = [s.values[idx]];
            return copy;
          });
          var peak = 0;
          cfg.series.forEach(function (s) {
            s.values.forEach(function (v) {
              if (v > peak) peak = v;
            });
          });
          cfg.max = Math.max(40, Math.ceil(peak / 10) * 10 + 20);
        }
      }
      return cfg;
    }

    function formatDateInput(d) {
      var pad = function (n) {
        return n < 10 ? "0" + n : String(n);
      };
      return d.getFullYear() + "-" + pad(d.getMonth() + 1) + "-" + pad(d.getDate());
    }

    function getDefaultDateRange() {
      var end = new Date();
      var start = new Date();
      start.setDate(end.getDate() - 6);
      return { start: formatDateInput(start), end: formatDateInput(end) };
    }

    function applyDefaultDateFilters() {
      var defaults = getDefaultDateRange();
      var startEl = $("filter-date-start");
      var endEl = $("filter-date-end");
      if (startEl) startEl.value = defaults.start;
      if (endEl) endEl.value = defaults.end;
    }

    function applyDefaultLineFilters() {
      applyDefaultDateFilters();
      if (isMobile) {
        var lineEl = $("filter-line");
        if (lineEl) lineEl.value = "8号线";
      }
    }

    function enhanceMobileFilterPickers() {
      if (!isMobile || !global.WHFilterPicker) return;
      global.WHFilterPicker.enhanceFilterSheet("line-stats-filter-sheet");
    }

    function fieldVal(id) {
      var el = $(id);
      return el ? String(el.value || "").trim() : "";
    }

    function updateLineChartTitles(cfg) {
      var titleEl = document.querySelector("#tab-panel-line .line-chart-title");
      var subEl = document.querySelector("#tab-panel-line .line-chart-sub");
      if (titleEl) titleEl.textContent = cfg.title;
      if (subEl) subEl.textContent = cfg.sub;
    }

    function applyGeoFilter(silent) {
      var cfg = getFilteredLineChartConfig();
      updateLineChartTitles(cfg);
      if ($("tab-panel-line") && !$("tab-panel-line").classList.contains("hidden") && lineToolbar) {
        lineToolbar.render();
      }
      syncFilterHint();
      if (!silent && isMobile) showToast("已按当前条件筛选");
    }

    function resetGeoFilter() {
      if (isMobile) {
        ["filter-section", "filter-station"].forEach(function (id) {
          var el = $(id);
          if (el) el.value = "";
        });
        applyDefaultLineFilters();
        enhanceMobileFilterPickers();
      } else {
        ["filter-line", "filter-section", "filter-station"].forEach(function (id) {
          var el = $(id);
          if (el) el.value = "";
        });
        applyDefaultDateFilters();
      }
      updateLineChartTitles(lineChartBase);
      if ($("tab-panel-line") && !$("tab-panel-line").classList.contains("hidden") && lineToolbar) {
        lineToolbar.render();
      }
      syncFilterHint();
    }

    function syncFilterHint() {
      var hintEl = $("line-stats-filter-hint");
      if (!hintEl) return;
      var parts = [];
      if (fieldVal("filter-line")) parts.push(fieldVal("filter-line"));
      if (fieldVal("filter-date-start") || fieldVal("filter-date-end")) {
        parts.push((fieldVal("filter-date-start") || "…") + " ~ " + (fieldVal("filter-date-end") || "…"));
      }
      hintEl.textContent = parts.length ? parts.join(" · ") : "";
      hintEl.hidden = !parts.length;
    }

    function renderLegend(config) {
      var legendEl = $("system-chart-legend");
      if (!legendEl) return;
      if (!config.legend || !config.legend.length) {
        legendEl.innerHTML = "";
        return;
      }
      legendEl.innerHTML = config.legend
        .map(function (item) {
          return (
            '<span class="dc-chart-legend-item">' +
            '<span class="dc-chart-legend-dot" style="background:' +
            item.color +
            '"></span>' +
            item.name +
            "</span>"
          );
        })
        .join("");
    }

    function activateSystemTab(key) {
      activeSystemTab = key;
      var config = chartConfigs[key];
      if (!config) return;
      var titleEl = $("chart-title");
      var subEl = $("chart-sub");
      if (titleEl) titleEl.textContent = config.title;
      if (subEl) subEl.textContent = config.sub;
      if (config.defaultBarLayout && systemToolbar) {
        systemToolbar.state.barLayout = config.defaultBarLayout;
        systemToolbar.state.chartType = "bar";
      }
      renderLegend(config);
      if (systemToolbar) systemToolbar.render();
    }

    function activateTab(key) {
      var isLine = key === "lineProject";
      document.querySelectorAll(".stats-tab").forEach(function (btn) {
        var active = btn.dataset.tab === key;
        btn.classList.toggle("active", active);
        if (active && isMobile && btn.scrollIntoView) {
          btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      });
      if ($("tab-panel-line")) $("tab-panel-line").classList.toggle("hidden", !isLine);
      if ($("tab-panel-system")) $("tab-panel-system").classList.toggle("hidden", isLine);
      if (isLine) applyGeoFilter(true);
      else activateSystemTab(key);
    }

    function mountTabs() {
      var nav = $("line-stats-tabs");
      if (!nav || nav.dataset.mounted === "1") return;
      var tabs = global.WH_LINE_STATS_TABS || [];
      nav.innerHTML = tabs
        .map(function (tab) {
          return (
            '<button type="button" class="stats-tab' +
            (tab.key === "lineProject" ? " active" : "") +
            '" data-tab="' +
            tab.key +
            '">' +
            tab.label +
            "</button>"
          );
        })
        .join("");
      nav.dataset.mounted = "1";
    }

    function initToolbars() {
      if (!global.DCChartToolbar) return false;
      var lineTools = $("line-chart-tools");
      var systemTools = $("system-chart-tools");
      if (lineTools && !lineTools.innerHTML) {
        lineTools.innerHTML = DCChartToolbar.createToolsHtml();
      }
      if (systemTools && !systemTools.innerHTML) {
        systemTools.innerHTML = DCChartToolbar.createToolsHtml();
      }
      if (!lineToolbar && $("line-project-chart")) {
        lineToolbar = new DCChartToolbar({
          canvas: $("line-project-chart"),
          toolsEl: $("line-chart-tools"),
          tableWrap: $("line-chart-table"),
          fileName: "线路项目统计",
          compact: isMobile,
          getConfig: function () {
            return getFilteredLineChartConfig();
          },
        });
      }
      if (!systemToolbar && $("system-chart")) {
        systemToolbar = new DCChartToolbar({
          canvas: $("system-chart"),
          toolsEl: $("system-chart-tools"),
          tableWrap: $("system-chart-table"),
          fileName: "线路项目统计-全时全域",
          compact: isMobile,
          getConfig: function () {
            return chartConfigs[activeSystemTab];
          },
        });
      }
      return !!(lineToolbar && systemToolbar);
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");

        if (action === "open-line-stats-filter") {
          var sheet = $("line-stats-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            sheet.setAttribute("aria-hidden", "false");
          }
          return;
        }
        if (action === "close-line-stats-filter") {
          var closeSheet = $("line-stats-filter-sheet");
          if (closeSheet) {
            closeSheet.classList.remove("is-open");
            closeSheet.setAttribute("aria-hidden", "true");
          }
          return;
        }
        if (action === "search-line-stats-filter") {
          var filterSheet = $("line-stats-filter-sheet");
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          applyGeoFilter();
          return;
        }
        if (action === "reset-line-stats-filter") {
          resetGeoFilter();
          if (isMobile) showToast("筛选条件已重置");
        }
      });

      document.addEventListener("click", function (event) {
        var tabBtn = event.target.closest(".stats-tab");
        if (!tabBtn) return;
        activateTab(tabBtn.dataset.tab);
      });

      var searchBtn = $("filter-search-btn");
      var resetBtn = $("filter-reset-btn");
      if (searchBtn) searchBtn.addEventListener("click", function () { applyGeoFilter(); });
      if (resetBtn) resetBtn.addEventListener("click", resetGeoFilter);
    }

    function initQuickLinks() {
      document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
        var target = anchor.getAttribute("data-quick-href");
        if (target && typeof global.whPageHref === "function") anchor.setAttribute("href", global.whPageHref(target));
      });
    }

    mountTabs();
    updateSummary();
    bindEvents();
    initQuickLinks();
    if (isMobile) applyDefaultLineFilters();
    else applyDefaultDateFilters();
    syncFilterHint();
    enhanceMobileFilterPickers();

    function bootCharts() {
      if (!initToolbars()) {
        setTimeout(bootCharts, 40);
        return;
      }
      lineToolbar.render();
      activateTab("lineProject");
    }

    bootCharts();
  }

  global.WHLineStatsPage = { boot: bootLineStatsPage };
})(window);
