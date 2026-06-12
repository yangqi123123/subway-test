/**
 * 全时全域数据统计 — Web / 移动端共用逻辑（对齐 stats/dc-system-stats.html）
 */
(function (global) {
  "use strict";

  var TABS = [
    { key: "projectAlert", label: "项目告警统计" },
    { key: "workflowStatus", label: "处理状态" },
  ];

  var MOBILE_CHARTS = [
    {
      key: "projectAlert",
      titleId: "chart-title-project",
      subId: "chart-sub-project",
      legendId: "alert-chart-legend-project",
      toolsId: "alert-chart-tools-project",
      canvasId: "alert-chart-project",
      tableId: "alert-chart-table-project",
      fileName: "全时全域-项目告警统计",
    },
    {
      key: "workflowStatus",
      titleId: "chart-title-workflow",
      subId: "chart-sub-workflow",
      legendId: "alert-chart-legend-workflow",
      toolsId: "alert-chart-tools-workflow",
      canvasId: "alert-chart-workflow",
      tableId: "alert-chart-table-workflow",
      fileName: "全时全域-处理状态统计",
    },
  ];

  function bootSystemStatsPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    if (!global.DCAlertStats) return;

    var activeTab = "projectAlert";
    var chartConfigs = {};
    var chartToolbar = null;
    var mobileToolbars = {};
    var isDualMobileCharts = isMobile && !!document.getElementById("alert-chart-workflow");
    var chartFullscreen = {
      active: false,
      key: null,
      placeholder: null,
      chartCard: null,
    };

    function $(id) {
      return document.getElementById(id);
    }

    function showToast(msg) {
      var toastEl = $("system-stats-toast");
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

    function fieldVal(id) {
      var el = $(id);
      return el ? String(el.value || "").trim() : "";
    }

    function readFilters() {
      return {
        line: fieldVal("filter-line"),
        area: fieldVal("filter-area"),
        station: fieldVal("filter-station"),
        start: fieldVal("filter-date-start"),
        end: fieldVal("filter-date-end"),
      };
    }

    function fillSelectOptions(selectId, values) {
      var el = $(selectId);
      if (!el) return;
      var current = el.value;
      while (el.options.length > 1) el.remove(1);
      values.forEach(function (val) {
        var o = document.createElement("option");
        o.value = val;
        o.textContent = val;
        el.appendChild(o);
      });
      if (current) el.value = current;
    }

    function enhanceMobileFilterPickers() {
      if (!isMobile || !global.WHFilterPicker) return;
      global.WHFilterPicker.enhanceFilterSheet("system-stats-filter-sheet");
    }

    function populateFilterSelects() {
      var opts = global.DCAlertStats.getFilterOptions();
      fillSelectOptions("filter-line", opts.lines);
      fillSelectOptions("filter-area", opts.areas);
      fillSelectOptions("filter-station", opts.stations);
    }

    function applyDefaultFilters() {
      var defaults = global.DCAlertStats.getDefaultFilters();
      var lineEl = $("filter-line");
      var areaEl = $("filter-area");
      var stationEl = $("filter-station");
      var startEl = $("filter-date-start");
      var endEl = $("filter-date-end");
      if (lineEl) lineEl.value = defaults.line || "";
      if (areaEl) areaEl.value = defaults.area || "";
      if (stationEl) stationEl.value = defaults.station || "";
      if (startEl) startEl.value = defaults.start || "";
      if (endEl) endEl.value = defaults.end || "";
    }

    function refreshData() {
      var alerts = global.DCAlertStats.filterFulltimeAlerts(global.DCAlertStats.filterAlerts(readFilters()));
      chartConfigs = global.DCAlertStats.buildChartConfigs(alerts);
      updateSummary(alerts);
      syncFilterHint();
    }

    function updateSummary(alerts) {
      if (!$("stat-total")) return;
      alerts = alerts || global.DCAlertStats.filterFulltimeAlerts(global.DCAlertStats.filterAlerts(readFilters()));
      var summary = global.DCAlertStats.computeSummary(alerts);
      var projects = {};
      alerts.forEach(function (row) {
        if (row.projectName) projects[row.projectName] = true;
      });
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-total", summary.total);
      set("stat-pending", summary.pending);
      set("stat-reviewed", Math.max(0, summary.total - summary.pending));
      set("stat-project", Object.keys(projects).length);
    }

    function syncFilterHint() {
      var hintEl = $("system-stats-filter-hint");
      if (!hintEl) return;
      var parts = [];
      if (fieldVal("filter-line")) parts.push(fieldVal("filter-line"));
      if (fieldVal("filter-date-start") || fieldVal("filter-date-end")) {
        parts.push((fieldVal("filter-date-start") || "…") + " ~ " + (fieldVal("filter-date-end") || "…"));
      }
      hintEl.textContent = parts.length ? parts.join(" · ") : "";
      hintEl.hidden = !parts.length;
    }

    function renderLegend(config, legendId) {
      var legendEl = $(legendId || "alert-chart-legend");
      if (!legendEl) return;
      if (!config || !config.legend || !config.legend.length) {
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

    function tabKeyFromBtn(btn) {
      return btn.getAttribute("data-tab") || "";
    }

    function updateChartPanel(config, meta) {
      if (!config || !meta) return;
      var titleEl = $(meta.titleId);
      var subEl = $(meta.subId);
      if (titleEl) titleEl.textContent = config.title;
      if (subEl) {
        subEl.textContent = config.sub || "";
        subEl.style.display = config.sub ? "" : "none";
      }
      renderLegend(config, meta.legendId);
      var toolbar = mobileToolbars[meta.key] || chartToolbar;
      if (toolbar) {
        toolbar.state.viewMode = "chart";
        toolbar.state.chartType = "bar";
        toolbar.state.barLayout = config.defaultBarLayout || "stacked";
        toolbar.render();
      }
    }

    function renderMobileCharts() {
      MOBILE_CHARTS.forEach(function (meta) {
        updateChartPanel(chartConfigs[meta.key], meta);
      });
    }

    function activateTab(key) {
      if (!key) return;
      activeTab = key;
      refreshData();
      var config = chartConfigs[key];
      if (!config) return;
      var titleEl = $("chart-title");
      var subEl = $("chart-sub");
      if (titleEl) titleEl.textContent = config.title;
      if (subEl) {
        subEl.textContent = config.sub || "";
        subEl.style.display = config.sub ? "" : "none";
      }
      document.querySelectorAll(".stats-tab").forEach(function (btn) {
        var active = tabKeyFromBtn(btn) === key;
        btn.classList.toggle("active", active);
        if (active && isMobile && btn.scrollIntoView) {
          btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      });
      if (chartToolbar) {
        chartToolbar.state.viewMode = "chart";
        chartToolbar.state.chartType = "bar";
        chartToolbar.state.barLayout = config.defaultBarLayout || "stacked";
        renderLegend(config);
        chartToolbar.render();
      }
    }

    function applyFilter() {
      if (isDualMobileCharts) {
        refreshData();
        renderMobileCharts();
      } else {
        activateTab(activeTab);
      }
      if (isMobile) showToast("已按当前条件筛选");
    }

    function resetFilter() {
      applyDefaultFilters();
      enhanceMobileFilterPickers();
      applyFilter();
      if (isMobile) showToast("筛选条件已重置");
    }

    function getChartMeta(key) {
      for (var i = 0; i < MOBILE_CHARTS.length; i++) {
        if (MOBILE_CHARTS[i].key === key) return MOBILE_CHARTS[i];
      }
      return null;
    }

    function getActiveChartTitle() {
      var meta = chartFullscreen.key ? getChartMeta(chartFullscreen.key) : null;
      if (meta) {
        var titleEl = $(meta.titleId);
        return titleEl ? titleEl.textContent : "统计图表";
      }
      return "统计图表";
    }

    function syncFullscreenRotator() {
      var rotator = $("system-stats-fullscreen-rotator");
      if (!rotator) return;
      var portrait = window.innerWidth < window.innerHeight;
      rotator.classList.toggle("mp-system-stats-fullscreen__rotator--landscape", portrait);
    }

    function ensureToolbarChartView(toolbar) {
      if (!toolbar) return;
      toolbar.state.viewMode = "chart";
      toolbar.render();
    }

    function prepareToolbarForChartDisplay(key) {
      ensureToolbarChartView(mobileToolbars[key]);
    }

    function resizeChartForFullscreen(key, isFullscreen) {
      var meta = getChartMeta(key);
      if (!meta) return;
      var longSide = Math.max(window.innerWidth, window.innerHeight);
      var shortSide = Math.min(window.innerWidth, window.innerHeight);
      var chartW = isFullscreen ? Math.max(640, longSide - 72) : 720;
      var chartH = isFullscreen ? Math.max(260, shortSide - 148) : 320;
      var canvas = $(meta.canvasId);
      if (canvas) {
        canvas.width = chartW;
        canvas.height = chartH;
      }
      if (mobileToolbars[key]) mobileToolbars[key].render();
    }

    function enterChartFullscreen(key) {
      if (!isMobile || !isDualMobileCharts || chartFullscreen.active) return;
      var meta = getChartMeta(key);
      if (!meta) return;
      var fsEl = $("system-stats-fullscreen");
      var fsBody = $("system-stats-fullscreen-body");
      var chartCard = document.querySelector('.mp-system-stats-chart-card[data-chart-key="' + key + '"]');
      if (!fsEl || !fsBody || !chartCard) return;

      prepareToolbarForChartDisplay(key);
      chartFullscreen.placeholder = document.createElement("div");
      chartFullscreen.placeholder.className = "mp-system-stats-chart-placeholder";
      chartCard.parentNode.insertBefore(chartFullscreen.placeholder, chartCard);
      fsBody.appendChild(chartCard);
      chartFullscreen.chartCard = chartCard;
      chartFullscreen.key = key;
      chartFullscreen.active = true;

      var titleEl = $("system-stats-fullscreen-title");
      if (titleEl) titleEl.textContent = getActiveChartTitle();

      fsEl.hidden = false;
      fsEl.setAttribute("aria-hidden", "false");
      document.body.classList.add("mp-system-stats-chart-fullscreen");
      syncFullscreenRotator();
      setTimeout(function () {
        resizeChartForFullscreen(key, true);
      }, 60);
    }

    function exitChartFullscreen() {
      if (!chartFullscreen.active || !chartFullscreen.chartCard) return;
      var key = chartFullscreen.key;
      var fsEl = $("system-stats-fullscreen");
      var placeholder = chartFullscreen.placeholder;
      if (placeholder && placeholder.parentNode) {
        placeholder.parentNode.insertBefore(chartFullscreen.chartCard, placeholder);
        placeholder.remove();
      }
      chartFullscreen.placeholder = null;
      chartFullscreen.chartCard = null;
      chartFullscreen.key = null;
      chartFullscreen.active = false;
      if (key) prepareToolbarForChartDisplay(key);
      if (fsEl) {
        fsEl.hidden = true;
        fsEl.setAttribute("aria-hidden", "true");
      }
      document.body.classList.remove("mp-system-stats-chart-fullscreen");
      if (key) {
        resizeChartForFullscreen(key, false);
        setTimeout(function () {
          resizeChartForFullscreen(key, false);
        }, 80);
      }
    }

    function toggleChartFullscreen(key) {
      if (chartFullscreen.active && chartFullscreen.key === key) exitChartFullscreen();
      else if (chartFullscreen.active) {
        exitChartFullscreen();
        enterChartFullscreen(key);
      } else enterChartFullscreen(key);
    }

    function mountTabs() {
      if (isDualMobileCharts) return;
      var nav = $("system-stats-tabs");
      if (!nav || nav.dataset.mounted === "1") return;
      nav.innerHTML = TABS.map(function (tab) {
        return (
          '<button type="button" class="stats-tab' +
          (tab.key === "projectAlert" ? " active" : "") +
          '" data-tab="' +
          tab.key +
          '">' +
          tab.label +
          "</button>"
        );
      }).join("");
      nav.dataset.mounted = "1";
    }

    function initToolbar() {
      if (!global.DCChartToolbar) return false;

      if (isDualMobileCharts) {
        var ready = true;
        var toolsOptions = { fullscreen: true };
        MOBILE_CHARTS.forEach(function (meta) {
          var toolsEl = $(meta.toolsId);
          if (toolsEl && !toolsEl.innerHTML) {
            toolsEl.innerHTML = global.DCChartToolbar.createToolsHtml(toolsOptions);
          }
          if (!mobileToolbars[meta.key] && $(meta.canvasId)) {
            mobileToolbars[meta.key] = new global.DCChartToolbar({
              canvas: $(meta.canvasId),
              toolsEl: $(meta.toolsId),
              tableWrap: $(meta.tableId),
              fileName: meta.fileName,
              compact: true,
              onFullscreenClick: (function (chartKey) {
                return function () {
                  toggleChartFullscreen(chartKey);
                };
              })(meta.key),
              getConfig: (function (chartKey) {
                return function () {
                  return chartConfigs[chartKey] || chartConfigs.projectAlert;
                };
              })(meta.key),
            });
          }
          if (!mobileToolbars[meta.key]) ready = false;
        });
        return ready;
      }

      var toolsEl = $("alert-chart-tools");
      if (toolsEl && !toolsEl.innerHTML) {
        toolsEl.innerHTML = global.DCChartToolbar.createToolsHtml();
      }
      if (!chartToolbar && $("alert-chart")) {
        chartToolbar = new global.DCChartToolbar({
          canvas: $("alert-chart"),
          toolsEl: $("alert-chart-tools"),
          tableWrap: $("alert-chart-table"),
          fileName: "全时全域告警统计",
          compact: isMobile,
          getConfig: function () {
            return chartConfigs[activeTab] || chartConfigs.projectAlert;
          },
        });
      }
      return !!chartToolbar;
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (trigger) {
          var action = trigger.getAttribute("data-action");
          if (action === "open-system-stats-filter") {
            var sheet = $("system-stats-filter-sheet");
            if (sheet) {
              sheet.classList.add("is-open");
              sheet.setAttribute("aria-hidden", "false");
            }
            return;
          }
          if (action === "close-system-stats-filter") {
            var closeSheet = $("system-stats-filter-sheet");
            if (closeSheet) {
              closeSheet.classList.remove("is-open");
              closeSheet.setAttribute("aria-hidden", "true");
            }
            return;
          }
          if (action === "search-system-stats-filter") {
            var filterSheet = $("system-stats-filter-sheet");
            if (filterSheet) {
              filterSheet.classList.remove("is-open");
              filterSheet.setAttribute("aria-hidden", "true");
            }
            applyFilter();
            return;
          }
          if (action === "reset-system-stats-filter") {
            resetFilter();
            return;
          }
          if (action === "system-stats-exit-fullscreen") {
            exitChartFullscreen();
            return;
          }
        }

        if (!isDualMobileCharts) {
          var tabBtn = event.target.closest(".stats-tab");
          if (tabBtn) activateTab(tabKeyFromBtn(tabBtn));
        }
      });

      var searchBtn = $("filter-search-btn");
      var resetBtn = $("filter-reset-btn");
      if (searchBtn) searchBtn.addEventListener("click", applyFilter);
      if (resetBtn) resetBtn.addEventListener("click", resetFilter);

      if (isMobile && isDualMobileCharts) {
        global.addEventListener("resize", function () {
          if (!chartFullscreen.active || !chartFullscreen.key) return;
          syncFullscreenRotator();
          resizeChartForFullscreen(chartFullscreen.key, true);
        });
        document.addEventListener("keydown", function (event) {
          if (event.key === "Escape" && chartFullscreen.active) exitChartFullscreen();
        });
      }
    }

    function initQuickLinks() {
      document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
        var target = anchor.getAttribute("data-quick-href");
        if (target && typeof global.whPageHref === "function") anchor.setAttribute("href", global.whPageHref(target));
      });
    }

    if (isMobile) mountTabs();
    populateFilterSelects();
    applyDefaultFilters();
    enhanceMobileFilterPickers();
    refreshData();
    bindEvents();
    if (!isMobile) initQuickLinks();

    function bootCharts() {
      if (!initToolbar()) {
        setTimeout(bootCharts, 40);
        return;
      }
      if (isDualMobileCharts) renderMobileCharts();
      else activateTab("projectAlert");
    }

    bootCharts();
  }

  global.WH_SYSTEM_STATS_TABS = TABS;
  global.WHSystemStatsPage = { boot: bootSystemStatsPage };
})(typeof window !== "undefined" ? window : global);
