/**
 * 无人机数据统计 — Web / 移动端共用逻辑（对齐 stats/dc-drone-stats.html）
 */
(function (global) {
  "use strict";

  var MAIN_TABS = [
    { key: "overview", label: "资源调度与使用记录" },
    { key: "records", label: "使用记录明细" },
  ];

  function bootDroneStatsPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var initialTab = options.initialTab || "overview";
    if (!global.DCDroneStats) return;

    var records = global.DCDroneStats.USAGE_RECORDS.slice();
    var activeMainTab = "overview";
    var searchKeyword = "";

    function $(id) {
      return document.getElementById(id);
    }

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function showToast(msg) {
      var toastEl = $("drone-stats-toast");
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
        airport: fieldVal("filter-airport"),
        device: fieldVal("filter-device"),
        start: fieldVal("filter-time-start"),
        end: fieldVal("filter-time-end"),
        keyword: searchKeyword,
      };
    }

    function getSelectedLineKey() {
      var value = fieldVal("filter-line");
      return value || "all";
    }

    function applyDefaultFilters() {
      var defaults = global.DCDroneStats.getDefaultDateRange({ months: 6 });
      var lineEl = $("filter-line");
      var startEl = $("filter-time-start");
      var endEl = $("filter-time-end");
      if (lineEl && !lineEl.value) lineEl.value = "8";
      if (startEl) startEl.value = defaults.start;
      if (endEl) endEl.value = defaults.end;
    }

    function syncFilterHint() {
      var hintEl = $("drone-stats-filter-hint");
      if (!hintEl) return;
      var parts = [];
      if (fieldVal("filter-line")) {
        var lineEl = $("filter-line");
        var lineText = lineEl && lineEl.selectedIndex >= 0 ? lineEl.options[lineEl.selectedIndex].text : fieldVal("filter-line");
        parts.push(lineText || fieldVal("filter-line") + "号线");
      }
      if (fieldVal("filter-airport")) parts.push(fieldVal("filter-airport"));
      if (fieldVal("filter-device")) parts.push(fieldVal("filter-device"));
      if (fieldVal("filter-time-start") || fieldVal("filter-time-end")) {
        parts.push((fieldVal("filter-time-start") || "…") + " ~ " + (fieldVal("filter-time-end") || "…"));
      }
      hintEl.textContent = parts.length ? parts.join(" · ") : "";
      hintEl.hidden = !parts.length;
    }

    function updateSummary() {
      var summary = global.DCDroneStats.computeSummary(records, getSelectedLineKey());
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-records", summary.violations);
      set("stat-airports", summary.avgDiscovered);
      set("stat-devices", summary.flightCount);
      set("stat-operators", summary.flightHours);
    }

    function getFilteredList() {
      return global.DCDroneStats.filterUsageRecords(records, readFilters());
    }

    function flightLogDetailUrl(logId) {
      if (isMobile) {
        return "../../asset/pages/flight-log.html?from=drone-stats&detail=" + encodeURIComponent(logId);
      }
      return "../wb/am-flight-log.html?from=drone-stats&detail=" + encodeURIComponent(logId);
    }

    function renderUsageRecordsWeb(list) {
      var body = $("usage-record-body");
      var totalEl = $("usage-record-total");
      if (!body) return;
      if (totalEl) totalEl.textContent = String(list.length);
      if (!list.length) {
        body.innerHTML = '<tr><td colspan="11" class="px-3 py-8 text-center text-slate-400">暂无使用记录</td></tr>';
        return;
      }
      body.innerHTML = list
        .map(function (row, index) {
          return (
            '<tr style="background:' +
            (index % 2 === 0 ? "rgba(12,24,48,0.45)" : "rgba(15,32,58,0.55)") +
            '">' +
            '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
            esc(row.id) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(row.device) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(row.airport) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(row.taskType) +
            "</td>" +
            '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
            esc(row.takeoff) +
            "</td>" +
            '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
            esc(row.landing) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(row.duration) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(row.maxHeight) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(row.battery) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(row.operator) +
            "</td>" +
            '<td class="px-3 whitespace-nowrap">' +
            '<button type="button" class="dc-table-op" data-action="drone-usage-detail" data-log-id="' +
            esc(row.id) +
            '">查看详情</button>' +
            "</td></tr>"
          );
        })
        .join("");
    }

    function renderUsageCard(row, index) {
      return (
        '<article class="mp-project-card mp-flight-log-card mp-drone-usage-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
        esc(row.id) +
        "</span>" +
        '<span class="mp-flight-status-tag mp-flight-status-tag--ok">' +
        esc(row.taskType) +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.device) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-flight-log-card__meta">' +
        '<div class="mp-project-card__meta-full"><dt>所属机场</dt><dd>' +
        esc(row.airport) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full"><dt>操作员</dt><dd>' +
        esc(row.operator) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full mp-project-card__meta-nowrap"><dt>起飞时间</dt><dd>' +
        esc(row.takeoff) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full mp-project-card__meta-nowrap"><dt>降落时间</dt><dd>' +
        esc(row.landing) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full"><dt>使用时长</dt><dd>' +
        esc(row.duration) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full"><dt>电池消耗</dt><dd>' +
        esc(row.battery) +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions mp-flight-log-card__actions">' +
        '<a class="mp-project-action" href="' +
        esc(flightLogDetailUrl(row.id)) +
        '"><i class="fa-regular fa-eye"></i>查看详情</a>' +
        "</div></article>"
      );
    }

    function renderUsageRecordsMobile(list) {
      var listEl = $("drone-usage-mobile-list");
      var totalEl = $("usage-record-total");
      if (!listEl) return;
      if (totalEl) totalEl.textContent = String(list.length);
      if (!list.length) {
        listEl.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-helicopter"></i><p>暂无使用记录</p></div>';
        return;
      }
      listEl.innerHTML = list.map(renderUsageCard).join("");
    }

    function syncSearchClear() {
      var input = $("drone-usage-search-input");
      var clearBtn = $("drone-usage-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function syncSearchInput() {
      var input = $("drone-usage-search-input");
      if (input) input.value = searchKeyword;
      syncSearchClear();
    }

    function drawTrendChart() {
      var canvas = $("trend-chart");
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      var left = isMobile ? 36 : 42;
      var right = isMobile ? 12 : 18;
      var top = isMobile ? 14 : 18;
      var bottom = isMobile ? 28 : 34;
      var months = ["一月", "二月", "三月", "四月", "五月", "六月"];
      var drone = [10, 20, 10, 15, 30, 20];
      var airport = [20, 25, 50, 45, 30, 30];
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = isMobile ? "rgba(148,163,184,.25)" : "rgba(148,163,184,.18)";
      ctx.fillStyle = isMobile ? "#64748b" : "#94a3b8";
      ctx.font = (isMobile ? 10 : 12) + "px sans-serif";
      for (var i = 0; i <= 5; i++) {
        var y = top + ((h - top - bottom) / 5) * i;
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(w - right, y);
        ctx.stroke();
        ctx.fillText(String(50 - i * 10), isMobile ? 6 : 12, y + 4);
      }
      months.forEach(function (m, idx) {
        var x = left + ((w - left - right) / (months.length - 1)) * idx;
        ctx.fillText(m, x - (isMobile ? 10 : 12), h - 8);
      });
      function drawSeries(list, color) {
        ctx.strokeStyle = color;
        ctx.lineWidth = 2;
        ctx.beginPath();
        list.forEach(function (v, idx) {
          var x = left + ((w - left - right) / (months.length - 1)) * idx;
          var y = top + ((50 - v) / 50) * (h - top - bottom);
          if (idx === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        });
        ctx.stroke();
        list.forEach(function (v, idx) {
          var x = left + ((w - left - right) / (months.length - 1)) * idx;
          var y = top + ((50 - v) / 50) * (h - top - bottom);
          ctx.fillStyle = isMobile ? "#fff" : "#071426";
          ctx.beginPath();
          ctx.arc(x, y, 3.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = color;
          ctx.lineWidth = 2;
          ctx.stroke();
        });
      }
      drawSeries(drone, "#1e90ff");
      drawSeries(airport, "#22d3ee");
    }

    function drawDurationChart() {
      var canvas = $("duration-chart");
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      var left = isMobile ? 42 : 54;
      var right = isMobile ? 16 : 24;
      var top = isMobile ? 12 : 16;
      var bottom = isMobile ? 20 : 24;
      var labels = ["一月", "二月", "三月", "四月", "五月", "六月"];
      var drone = [10, 20, 30, 40, 50, 60];
      var airport = [20, 25, 50, 45, 30, 100];
      ctx.clearRect(0, 0, w, h);
      ctx.strokeStyle = isMobile ? "rgba(148,163,184,.25)" : "rgba(148,163,184,.18)";
      ctx.fillStyle = isMobile ? "#64748b" : "#94a3b8";
      ctx.font = (isMobile ? 10 : 12) + "px sans-serif";
      [0, 20, 40, 60, 80, 100].forEach(function (v, i) {
        var x = left + ((w - left - right) / 5) * i;
        ctx.beginPath();
        ctx.moveTo(x, top);
        ctx.lineTo(x, h - bottom);
        ctx.stroke();
        ctx.fillText(String(v), x - 8, h - 4);
      });
      labels.forEach(function (m, i) {
        var y = top + ((h - top - bottom) / labels.length) * i + 16;
        ctx.fillText(m, isMobile ? 4 : 8, y + 4);
        var y1 = y - 8;
        var barH = isMobile ? 8 : 10;
        var scale = isMobile ? 2.2 : 2.9;
        ctx.fillStyle = "#1e90ff";
        ctx.fillRect(left, y1, drone[i] * scale, barH);
        ctx.fillStyle = "#31c5e4";
        ctx.fillRect(left, y1 + (isMobile ? 11 : 14), airport[i] * scale, barH);
      });
    }

    function drawViolationMonthChart(values) {
      var canvas = $("violation-month-chart");
      if (!canvas) return;
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      var left = isMobile ? 40 : 48;
      var right = isMobile ? 14 : 20;
      var top = isMobile ? 18 : 22;
      var bottom = isMobile ? 30 : 36;
      var months = ["一月", "二月", "三月", "四月", "五月", "六月"];
      var max = 100;
      ctx.clearRect(0, 0, w, h);
      ctx.font = (isMobile ? 10 : 12) + "px sans-serif";
      ctx.fillStyle = isMobile ? "#64748b" : "#94a3b8";
      ctx.strokeStyle = isMobile ? "rgba(148,163,184,.25)" : "rgba(148,163,184,.2)";
      for (var i = 0; i <= 5; i++) {
        var tick = i * 20;
        var y = h - bottom - ((h - top - bottom) / 5) * i;
        ctx.setLineDash([4, 4]);
        ctx.beginPath();
        ctx.moveTo(left, y);
        ctx.lineTo(w - right, y);
        ctx.stroke();
        ctx.setLineDash([]);
        ctx.fillText(String(tick), isMobile ? 10 : 14, y + 4);
      }
      var slot = (w - left - right) / months.length;
      var barW = Math.min(isMobile ? 28 : 42, slot * 0.5);
      months.forEach(function (month, idx) {
        var value = values[idx] || 0;
        var x = left + slot * idx + (slot - barW) / 2;
        var barH = (value / max) * (h - top - bottom);
        var y = h - bottom - barH;
        ctx.fillStyle = isMobile ? "rgba(34, 211, 238, 0.2)" : "rgba(34, 211, 238, 0.35)";
        ctx.fillRect(x - 2, y - 2, barW + 4, barH + 4);
        var grad = ctx.createLinearGradient(0, y, 0, h - bottom);
        grad.addColorStop(0, "#67e8f9");
        grad.addColorStop(1, "#0891b2");
        ctx.fillStyle = grad;
        ctx.fillRect(x, y, barW, barH);
        if (barH > 16) {
          ctx.fillStyle = isMobile ? "#0f172a" : "#f0fdfa";
          ctx.font = "bold " + (isMobile ? 10 : 11) + "px sans-serif";
          ctx.textAlign = "center";
          ctx.fillText(String(value), x + barW / 2, y + 14);
        }
        ctx.fillStyle = isMobile ? "#64748b" : "#94a3b8";
        ctx.font = (isMobile ? 10 : 12) + "px sans-serif";
        ctx.textAlign = "center";
        ctx.fillText(month, x + barW / 2, h - 10);
      });
      ctx.textAlign = "left";
    }

    function drawViolationPieChart(segments) {
      var canvas = $("violation-pie-chart");
      var legendEl = $("violation-pie-legend");
      if (!canvas || !segments.length) return;
      var ctx = canvas.getContext("2d");
      var w = canvas.width;
      var h = canvas.height;
      var cx = w / 2;
      var cy = h / 2;
      var radius = isMobile ? 58 : 68;
      var inner = isMobile ? 30 : 36;
      var total = segments.reduce(function (sum, s) {
        return sum + s.value;
      }, 0);
      var start = -Math.PI / 2;
      ctx.clearRect(0, 0, w, h);
      ctx.beginPath();
      ctx.arc(cx, cy, radius + 8, 0, Math.PI * 2);
      ctx.fillStyle = isMobile ? "rgba(37, 99, 235, 0.06)" : "rgba(34, 211, 238, 0.08)";
      ctx.fill();
      segments.forEach(function (seg) {
        var slice = (seg.value / total) * Math.PI * 2;
        ctx.beginPath();
        ctx.moveTo(cx, cy);
        ctx.arc(cx, cy, radius, start, start + slice);
        ctx.closePath();
        ctx.fillStyle = seg.color;
        ctx.fill();
        ctx.strokeStyle = isMobile ? "#fff" : "rgba(7, 20, 38, 0.88)";
        ctx.lineWidth = 2;
        ctx.stroke();
        start += slice;
      });
      ctx.beginPath();
      ctx.arc(cx, cy, inner, 0, Math.PI * 2);
      ctx.fillStyle = isMobile ? "#fff" : "#071426";
      ctx.fill();
      ctx.strokeStyle = isMobile ? "rgba(37, 99, 235, 0.2)" : "rgba(34, 211, 238, 0.28)";
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.fillStyle = isMobile ? "#0f172a" : "#e0f2fe";
      ctx.font = "bold " + (isMobile ? 14 : 15) + "px sans-serif";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(String(total), cx, cy - 7);
      ctx.fillStyle = isMobile ? "#64748b" : "#94a3b8";
      ctx.font = (isMobile ? 9 : 10) + "px sans-serif";
      ctx.fillText("违规项", cx, cy + 11);
      ctx.textAlign = "left";
      ctx.textBaseline = "alphabetic";
      if (legendEl) {
        legendEl.innerHTML = segments
          .map(function (seg) {
            return (
              '<span class="dc-legend-item" title="' +
              esc(seg.name) +
              "（" +
              seg.value +
              '个）"><span class="dc-dot" style="background:' +
              seg.color +
              '"></span><span class="dc-legend-label">' +
              esc(seg.name) +
              "</span> " +
              seg.value +
              "个</span>"
            );
          })
          .join("");
      }
    }

    function refreshOverviewByLine() {
      var lineKey = getSelectedLineKey();
      var data = global.DCDroneStats.getLineData(lineKey);
      drawViolationMonthChart(data.monthly);
      drawViolationPieChart(data.pie);
      updateSummary();
    }

    function refreshAllCharts() {
      drawTrendChart();
      drawDurationChart();
      refreshOverviewByLine();
    }

    function applyUsageFilter(silent) {
      var list = getFilteredList();
      if (isMobile) renderUsageRecordsMobile(list);
      else renderUsageRecordsWeb(list);
      refreshOverviewByLine();
      syncFilterHint();
      if (!silent && isMobile) showToast("已按当前条件筛选");
    }

    function resetUsageFilter() {
      var airportSel = $("filter-airport");
      var deviceSel = $("filter-device");
      var lineSel = $("filter-line");
      var timeStart = $("filter-time-start");
      var timeEnd = $("filter-time-end");
      var defaults = global.DCDroneStats.getDefaultDateRange({ months: 6 });
      if (airportSel) airportSel.value = "";
      if (deviceSel) deviceSel.value = "";
      if (lineSel) lineSel.value = "8";
      if (timeStart) timeStart.value = defaults.start;
      if (timeEnd) timeEnd.value = defaults.end;
      if (isMobile && global.WHFilterPicker) {
        global.WHFilterPicker.enhanceFilterSheet("drone-stats-filter-sheet");
      }
      applyUsageFilter(true);
      if (isMobile) showToast("筛选条件已重置");
    }

    function enhanceMobileFilterPickers() {
      if (!isMobile || !global.WHFilterPicker) return;
      global.WHFilterPicker.enhanceFilterSheet("drone-stats-filter-sheet");
    }

    function mountMainTabs() {
      var nav = $("drone-stats-main-tabs");
      if (!nav || nav.dataset.mounted === "1") return;
      nav.innerHTML = MAIN_TABS.map(function (tab) {
        return (
          '<button type="button" class="stats-tab' +
          (tab.key === "overview" ? " active" : "") +
          '" data-main-tab="' +
          tab.key +
          '">' +
          tab.label +
          "</button>"
        );
      }).join("");
      nav.dataset.mounted = "1";
    }

    function activateMainTab(key) {
      activeMainTab = key;
      var overview = $("drone-stats-overview-view");
      var records = $("drone-stats-records-view");
      if (overview) overview.classList.toggle("hidden", key !== "overview");
      if (records) records.classList.toggle("hidden", key !== "records");
      document.querySelectorAll("[data-main-tab]").forEach(function (btn) {
        var active = btn.getAttribute("data-main-tab") === key;
        btn.classList.toggle("active", active);
        if (active && isMobile && btn.scrollIntoView) {
          btn.scrollIntoView({ behavior: "smooth", inline: "center", block: "nearest" });
        }
      });
      if (key === "overview") refreshAllCharts();
      if (key === "records") applyUsageFilter(true);
    }

    function initQuickLinks() {
      document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
        var target = anchor.getAttribute("data-quick-href");
        if (target && typeof global.whPageHref === "function") anchor.setAttribute("href", global.whPageHref(target));
      });
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (trigger) {
          var action = trigger.getAttribute("data-action");
          if (action === "open-drone-stats-filter") {
            var sheet = $("drone-stats-filter-sheet");
            if (sheet) {
              sheet.classList.add("is-open");
              sheet.setAttribute("aria-hidden", "false");
            }
            return;
          }
          if (action === "close-drone-stats-filter") {
            var closeSheet = $("drone-stats-filter-sheet");
            if (closeSheet) {
              closeSheet.classList.remove("is-open");
              closeSheet.setAttribute("aria-hidden", "true");
            }
            return;
          }
          if (action === "search-drone-stats-filter") {
            var filterSheet = $("drone-stats-filter-sheet");
            if (filterSheet) {
              filterSheet.classList.remove("is-open");
              filterSheet.setAttribute("aria-hidden", "true");
            }
            applyUsageFilter();
            return;
          }
          if (action === "reset-drone-stats-filter") {
            resetUsageFilter();
            return;
          }
          if (action === "drone-usage-search-clear") {
            searchKeyword = "";
            syncSearchInput();
            applyUsageFilter(true);
            return;
          }
          if (action === "drone-usage-detail") {
            var logId = trigger.getAttribute("data-log-id");
            if (logId && global.WHFlightLogPage && typeof global.WHFlightLogPage.openWebDetail === "function") {
              global.WHFlightLogPage.openWebDetail(logId);
            }
            return;
          }
        }

        var mainTabBtn = event.target.closest("[data-main-tab]");
        if (mainTabBtn) activateMainTab(mainTabBtn.getAttribute("data-main-tab") || "overview");
      });

      var searchWrap = $("drone-usage-search-wrap");
      if (searchWrap) {
        searchWrap.addEventListener("click", function (event) {
          if (event.target.closest("[data-action='drone-usage-search-clear']")) return;
          var input = $("drone-usage-search-input");
          if (input) input.focus();
        });
      }

      var searchInput = $("drone-usage-search-input");
      if (searchInput) {
        searchInput.addEventListener("input", function () {
          searchKeyword = searchInput.value.trim();
          syncSearchClear();
        });
        searchInput.addEventListener("keydown", function (event) {
          if (event.key === "Enter") {
            event.preventDefault();
            searchKeyword = searchInput.value.trim();
            applyUsageFilter();
          }
        });
      }

      var searchSubmit = $("drone-usage-search-submit");
      if (searchSubmit) {
        searchSubmit.addEventListener("click", function () {
          searchKeyword = searchInput ? searchInput.value.trim() : "";
          applyUsageFilter();
        });
      }

      var searchBtn = $("usage-filter-search");
      var resetBtn = $("usage-filter-reset");
      if (searchBtn) searchBtn.addEventListener("click", applyUsageFilter);
      if (resetBtn) resetBtn.addEventListener("click", resetUsageFilter);

      var lineEl = $("filter-line");
      if (lineEl) lineEl.addEventListener("change", function () {
        applyUsageFilter(true);
      });
    }

    if (isMobile) mountMainTabs();
    applyDefaultFilters();
    enhanceMobileFilterPickers();
    bindEvents();
    if (!isMobile) initQuickLinks();
    refreshAllCharts();
    applyUsageFilter(true);
    syncSearchInput();
    if (isMobile) activateMainTab(initialTab === "records" ? "records" : "overview");
  }

  global.WH_DRONE_STATS_MAIN_TABS = MAIN_TABS;
  global.WHDroneStatsPage = { boot: bootDroneStatsPage };
})(typeof window !== "undefined" ? window : global);
