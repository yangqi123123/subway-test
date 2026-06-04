/**
 * 飞行日志 — Web / 移动端共用逻辑（只读）
 */
(function (global) {
  "use strict";

  function flightStatusMeta(status) {
    var label = String(status || "成功").trim();
    if (label === "异常中止" || label === "手动取消") {
      return { label: label, textClass: "mp-flight-status--warn", tagClass: "mp-flight-status-tag--warn" };
    }
    if (label === "失败") {
      return { label: "失败", textClass: "mp-flight-status--fail", tagClass: "mp-flight-status-tag--fail" };
    }
    return { label: "成功", textClass: "mp-flight-status--ok", tagClass: "mp-flight-status-tag--ok" };
  }

  function bootFlightLogPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;

    var rows = (global.WH_FLIGHT_LOG_ROWS || []).map(function (row) {
      return Object.assign({}, row, {
        track: (row.track || []).slice(),
        events: (row.events || []).slice(),
      });
    });
    var filteredRows = null;
    var lastRenderedList = [];
    var trackPlayback = null;
    var currentDetailRow = null;

    var listView = document.getElementById("flight-log-list-view");
    var detailView = document.getElementById("flight-log-detail-view");
    var mobileList = document.getElementById("flight-log-mobile-list");
    var detailBody = document.getElementById("flight-log-detail-body");
    var toastEl = document.getElementById("flight-log-toast");
    var tableBody = document.getElementById("table-body");

    function $(id) {
      return document.getElementById(id);
    }

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function showToast(msg) {
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
      var existing = document.getElementById("toast-box");
      if (existing) existing.remove();
      var box = document.createElement("div");
      box.id = "toast-box";
      box.className =
        "fixed right-5 bottom-5 z-[100] rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg";
      box.textContent = msg;
      document.body.appendChild(box);
      setTimeout(function () {
        box.remove();
      }, 1800);
    }

    function dispatchViewChange() {
      global.dispatchEvent(new Event("wh-flight-log-view-change"));
    }

    function fieldVal(id) {
      var el = $(id);
      return el ? String(el.value || "").trim() : "";
    }

    function getListSource() {
      return filteredRows !== null ? filteredRows : rows;
    }

    function findRow(id) {
      return rows.find(function (row) {
        return row.id === id;
      });
    }

    function updateStats(list) {
      var data = list || getListSource();
      var success = 0;
      var abnormal = 0;
      var fail = 0;
      data.forEach(function (item) {
        var meta = flightStatusMeta(item.status);
        if (meta.label === "成功") success += 1;
        else if (meta.label === "失败") fail += 1;
        else abnormal += 1;
      });
      var set = function (id, val) {
        var el = $(id);
        if (el) el.textContent = String(val);
      };
      set("stat-total", data.length);
      set("stat-success", success);
      set("stat-abnormal", abnormal);
      set("stat-fail", fail);
      var totalEl = $("table-total");
      if (totalEl) totalEl.textContent = String(data.length);
    }

    function getSearchQuery(qOverride) {
      if (typeof qOverride === "string") return qOverride;
      if (isMobile) {
        var input = $("flight-log-search-trigger");
        return input && input.value ? input.value.trim() : "";
      }
      return fieldVal("search-keyword");
    }

    function rowMatchesSearch(row, q) {
      if (!q) return true;
      return [row.id, row.droneNo, row.operator].some(function (text) {
        return String(text || "").indexOf(q) >= 0;
      });
    }

    function syncSearchClear() {
      var input = $("flight-log-search-trigger");
      var clearBtn = $("flight-log-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function applyFilter(qOverride, silent) {
      var q = getSearchQuery(qOverride);
      if (isMobile) {
        var input = $("flight-log-search-trigger");
        if (input && typeof qOverride === "string") input.value = qOverride;
      }
      filteredRows = q
        ? rows.filter(function (row) {
            return rowMatchesSearch(row, q);
          })
        : null;
      renderList();
      syncSearchClear();
      if (!silent && isMobile) showToast("已按当前条件筛选");
    }

    function clearSearch() {
      var input = $("flight-log-search-trigger");
      if (input) input.value = "";
      applyFilter("", true);
    }

    function displayVal(value) {
      return esc(value === undefined || value === null || value === "" ? "—" : value);
    }

    function landingDisplay(row) {
      var text = String(row.landingPos || "—");
      var parts = text.split("/");
      if (parts.length < 2) return displayVal(text);
      return esc(parts[0]) + (parts[1] ? ' <span class="fl-landing-warn mp-flight-landing-warn">' + esc(parts[1]) + "</span>" : "");
    }

    function detailRow(label, valueHtml) {
      return (
        '<div class="fl-detail-row"><span class="fl-detail-row__label">' +
        esc(label) +
        '</span><span class="fl-detail-row__value">' +
        valueHtml +
        "</span></div>"
      );
    }

    function statusDetailHtml(status) {
      var meta = flightStatusMeta(status);
      var dot =
        meta.label === "成功"
          ? "bg-emerald-400"
          : meta.label === "失败"
            ? "bg-rose-500"
            : "bg-amber-400";
      return (
        '<span class="fl-detail-status ' +
        (meta.label === "成功" ? "text-emerald-200" : meta.label === "失败" ? "text-rose-200" : "text-amber-200") +
        '"><span class="fl-dot ' +
        dot +
        '"></span>' +
        displayVal(meta.label) +
        "</span>"
      );
    }

    function buildWebDetailHtml(row) {
      var droneLabel = row.deviceCode || row.deviceName || "—";
      return (
        '<div class="fl-detail-list">' +
        detailRow("任务ID", displayVal(row.id)) +
        detailRow("无人机编号", displayVal(row.droneNo)) +
        detailRow("无人机名称", '<span class="fl-detail-link">' + displayVal(droneLabel) + "</span>") +
        detailRow("所属机场", '<span class="fl-detail-link">' + displayVal(row.airport) + "</span>") +
        detailRow("操作员", displayVal(row.operator)) +
        detailRow("任务类型", displayVal(row.taskType)) +
        detailRow("关联计划", '<span class="fl-detail-link">' + displayVal(row.planName) + "</span>") +
        detailRow("起飞时间", displayVal(row.takeoff)) +
        detailRow("降落时间", displayVal(row.landing)) +
        detailRow("飞行时长", displayVal(row.duration)) +
        detailRow("起飞位置", displayVal(row.takeoffPos)) +
        detailRow("降落位置", landingDisplay(row)) +
        detailRow("最大飞行高度", displayVal(row.maxHeight)) +
        detailRow("总飞行距离", displayVal(row.totalDistance)) +
        detailRow("起飞电量", displayVal(row.takeoffPower)) +
        detailRow("降落电量", displayVal(row.landingPower)) +
        detailRow("飞行状态", statusDetailHtml(row.status)) +
        detailRow("天气情况", displayVal(row.weather)) +
        "</div>"
      );
    }

    function buildDetailHtml(row) {
      var meta = flightStatusMeta(row.status);
      return (
        '<dl class="mp-disease-detail-grid">' +
        "<div><dt>任务ID</dt><dd>" +
        displayVal(row.id) +
        "</dd></div>" +
        "<div><dt>无人机编号</dt><dd>" +
        displayVal(row.droneNo) +
        "</dd></div>" +
        "<div><dt>设备名称</dt><dd>" +
        displayVal(row.deviceName) +
        "</dd></div>" +
        "<div><dt>所属机场</dt><dd>" +
        displayVal(row.airport) +
        "</dd></div>" +
        "<div><dt>操作员</dt><dd>" +
        displayVal(row.operator) +
        "</dd></div>" +
        "<div><dt>任务类型</dt><dd>" +
        displayVal(row.taskType) +
        "</dd></div>" +
        "<div><dt>关联计划</dt><dd>" +
        displayVal(row.planName) +
        "</dd></div>" +
        "<div><dt>起飞时间</dt><dd>" +
        displayVal(row.takeoff) +
        "</dd></div>" +
        "<div><dt>降落时间</dt><dd>" +
        displayVal(row.landing) +
        "</dd></div>" +
        "<div><dt>飞行时长</dt><dd>" +
        displayVal(row.duration) +
        "</dd></div>" +
        "<div><dt>最大飞行高度</dt><dd>" +
        displayVal(row.maxHeight) +
        "</dd></div>" +
        "<div><dt>电池消耗</dt><dd>" +
        displayVal(row.battery) +
        "</dd></div>" +
        "<div><dt>总飞行距离</dt><dd>" +
        displayVal(row.totalDistance) +
        "</dd></div>" +
        "<div><dt>起飞电量</dt><dd>" +
        displayVal(row.takeoffPower) +
        "</dd></div>" +
        "<div><dt>降落电量</dt><dd>" +
        displayVal(row.landingPower) +
        "</dd></div>" +
        '<div><dt>飞行状态</dt><dd><span class="' +
        esc(meta.textClass) +
        '">' +
        displayVal(meta.label) +
        "</span></dd></div>" +
        "<div><dt>起飞位置</dt><dd>" +
        displayVal(row.takeoffPos) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>降落位置</dt><dd>' +
        landingDisplay(row) +
        "</dd></div>" +
        '<div class="mp-disease-detail-grid__full"><dt>天气情况</dt><dd>' +
        displayVal(row.weather) +
        "</dd></div></dl>" +
        (isMobile
          ? '<div class="mp-flight-log-map-block"><div class="mp-flight-log-map-head"><h4>飞行轨迹</h4><div class="mp-flight-log-map-actions">' +
            '<button type="button" class="mp-btn mp-btn--ghost mp-btn--sm" data-action="flight-play-track"><i class="fa-solid fa-play"></i>播放</button>' +
            '<button type="button" class="mp-btn mp-btn--ghost mp-btn--sm" data-action="flight-reset-track"><i class="fa-solid fa-location-crosshairs"></i>重置</button>' +
            "</div></div>" +
            '<div id="fl-detail-map" class="mp-flight-log-map"></div>' +
            '<div class="mp-flight-log-map-meta"><span>轨迹状态：<b id="fl-map-status-text">待播放</b></span><span>当前位置：<b id="fl-map-current-name">--</b></span></div></div>'
          : "")
      );
    }

    function renderCard(row, index) {
      var meta = flightStatusMeta(row.status);
      return (
        '<article class="mp-project-card mp-flight-log-card" data-row-index="' +
        index +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
        esc(row.id) +
        "</span>" +
        '<span class="mp-flight-status-tag ' +
        esc(meta.tagClass) +
        '">' +
        esc(meta.label) +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.deviceName) +
        "</h3>" +
        '<dl class="mp-project-card__meta mp-flight-log-card__meta">' +
        '<div class="mp-project-card__meta-full"><dt>任务类型</dt><dd>' +
        esc(row.taskType) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full"><dt>操作员</dt><dd>' +
        esc(row.operator) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full mp-project-card__meta-nowrap"><dt>关联计划</dt><dd>' +
        esc(row.planName) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full mp-project-card__meta-nowrap"><dt>起飞时间</dt><dd>' +
        esc(row.takeoff) +
        "</dd></div>" +
        '<div class="mp-project-card__meta-full mp-project-card__meta-nowrap"><dt>降落时间</dt><dd>' +
        esc(row.landing) +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions mp-flight-log-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="flight-log-detail" data-index="' +
        index +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        '<button type="button" class="mp-project-action" data-action="flight-export-report" data-log-id="' +
        esc(row.id) +
        '"><i class="fa-regular fa-file-lines"></i>导出报告</button>' +
        "</div></article>"
      );
    }

    function renderMobileList(list) {
      if (!mobileList) return;
      if (!list.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-plane"></i><p>暂无飞行日志</p></div>';
        return;
      }
      mobileList.innerHTML = list.map(renderCard).join("");
    }

    function statusHtmlWeb(status) {
      var meta = flightStatusMeta(status);
      var dot =
        meta.label === "成功"
          ? "bg-emerald-400"
          : meta.label === "失败"
            ? "bg-rose-500"
            : "bg-amber-400";
      return (
        '<span class="inline-flex items-center gap-2 ' +
        (meta.label === "成功" ? "text-emerald-200" : meta.label === "失败" ? "text-rose-200" : "text-amber-200") +
        '"><span class="fl-dot ' +
        dot +
        '"></span>' +
        esc(meta.label) +
        "</span>"
      );
    }

    function renderWebTable(list) {
      if (!tableBody) return;
      if (!list.length) {
        tableBody.innerHTML =
          '<tr><td colspan="11" class="px-3 py-8 text-center text-slate-400">暂无飞行日志</td></tr>';
        return;
      }
      tableBody.innerHTML = list
        .map(function (item, index) {
          return (
            '<tr data-id="' +
            esc(item.id) +
            '" style="background:' +
            (index % 2 === 0 ? "rgba(12,24,48,0.45)" : "rgba(15,32,58,0.55)") +
            '">' +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.id) +
            "</td>" +
            '<td class="px-3 text-cyan-300">' +
            esc(item.deviceName) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.taskType) +
            "</td>" +
            '<td class="px-3 text-cyan-300">' +
            esc(item.planName) +
            "</td>" +
            '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
            esc(item.takeoff) +
            "</td>" +
            '<td class="px-3 text-slate-100/95 whitespace-nowrap">' +
            esc(item.landing) +
            "</td>" +
            '<td class="px-3">' +
            statusHtmlWeb(item.status) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.maxHeight) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.battery) +
            "</td>" +
            '<td class="px-3 text-slate-100/95">' +
            esc(item.operator) +
            "</td>" +
            '<td class="px-3 disease-col-actions"><div class="disease-op-actions">' +
            '<span class="fl-op-btn text-cyan-300" data-action="flight-log-web-detail" data-log-id="' +
            esc(item.id) +
            '"><i class="fa-regular fa-eye"></i>查看详情</span>' +
            '<span class="fl-op-btn text-sky-300" data-action="flight-export-report" data-log-id="' +
            esc(item.id) +
            '"><i class="fa-regular fa-file-lines"></i>导出报告</span>' +
            "</div></td></tr>"
          );
        })
        .join("");
    }

    function renderList() {
      var list = getListSource();
      lastRenderedList = list.slice();
      updateStats(list);
      if (isMobile) renderMobileList(list);
      else renderWebTable(list);
    }

    function destroyTrackPlayback() {
      if (trackPlayback) {
        trackPlayback.destroy();
        trackPlayback = null;
      }
    }

    function renderTrackMap(row) {
      if (!row || !global.WHTrackPlayback) return;
      destroyTrackPlayback();
      trackPlayback = global.WHTrackPlayback.create({
        preset: "drone",
        mapContainerId: isMobile ? "fl-detail-map" : "detail-map",
        center: global.WH_FLIGHT_LOG_WUHAN || [30.5928, 114.3055],
        zoom: 12,
        statusEl: $("fl-map-status-text"),
        nameEl: $("fl-map-current-name"),
        timeEl: $("fl-map-current-time"),
        fitPadding: [24, 24],
      });
      trackPlayback.draw(row.track || []);
      setTimeout(function () {
        var map = trackPlayback.getMap();
        if (map && map.invalidateSize) map.invalidateSize();
      }, 120);
    }

    function exportFlightReport(id) {
      var row = findRow(id);
      if (!row || !global.WHFlightReportModal) {
        showToast("暂无飞行报告数据");
        return;
      }
      global.WHFlightReportModal.exportReport(global.WHFlightReportModal.planFromFlightLog(row));
    }

    function showList() {
      destroyTrackPlayback();
      currentDetailRow = null;
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      dispatchViewChange();
    }

    function showDetail(index) {
      var row = lastRenderedList[index];
      if (!row) return;
      currentDetailRow = row;
      var titleEl = $("detail-flight-log-title");
      if (titleEl) titleEl.textContent = row.id + " · 飞行日志详情";
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.remove("hidden");
      if (detailBody) detailBody.innerHTML = buildDetailHtml(row);
      dispatchViewChange();
      if (isMobile) setTimeout(function () { renderTrackMap(row); }, 80);
    }

    function openWebDetail(id) {
      var row = findRow(id);
      if (!row) return;
      currentDetailRow = row;
      var info = $("detail-info");
      if (info) info.innerHTML = buildWebDetailHtml(row);
      var titleEl = document.querySelector("#detail-modal h3");
      if (titleEl) titleEl.textContent = row.id + " · 飞行日志详情";
      var mask = $("detail-modal");
      if (mask) mask.classList.add("show");
      setTimeout(function () { renderTrackMap(row); }, 80);
    }

    function closeWebDetail() {
      destroyTrackPlayback();
      var mask = $("detail-modal");
      if (mask) mask.classList.remove("show");
    }

    function bindEvents() {
      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        var index = trigger.hasAttribute("data-index") ? Number(trigger.getAttribute("data-index")) : -1;
        var logId = trigger.getAttribute("data-log-id");

        if (action === "open-flight-log-search") {
          event.preventDefault();
          global.location.href = "flight-log-search.html";
          return;
        }
        if (action === "flight-log-search-clear") {
          clearSearch();
          return;
        }
        if (action === "flight-log-detail") {
          showDetail(index);
          return;
        }
        if (action === "flight-log-web-detail") {
          if (logId) openWebDetail(logId);
          return;
        }
        if (action === "flight-export-report") {
          exportFlightReport(logId);
          return;
        }
        if (action === "flight-play-track" && trackPlayback) {
          trackPlayback.play();
          return;
        }
        if (action === "flight-reset-track" && trackPlayback) {
          trackPlayback.fitBounds();
          return;
        }
        if (action === "close-flight-log-detail") {
          showList();
          return;
        }
        if (action === "close-detail-modal") {
          closeWebDetail();
        }
      });

      var searchBtn = $("search-btn");
      var resetBtn = $("reset-btn");
      if (searchBtn) searchBtn.addEventListener("click", function () { applyFilter(); });
      if (resetBtn) resetBtn.addEventListener("click", function () {
        $("search-keyword").value = "";
        applyFilter("", true);
      });

      var exportBtn = $("export-btn");
      if (exportBtn) exportBtn.addEventListener("click", function () { showToast("已按当前日志列表导出"); });

      document.querySelectorAll("[data-close]").forEach(function (btn) {
        btn.addEventListener("click", function () {
          if (btn.getAttribute("data-close") === "detail-modal") closeWebDetail();
        });
      });

      var playBtn = $("detail-play-track-btn");
      var resetBtnMap = $("detail-map-reset-btn");
      var exportBtn = $("detail-export-btn");
      if (playBtn) playBtn.addEventListener("click", function () { if (trackPlayback) trackPlayback.play(); });
      if (resetBtnMap) resetBtnMap.addEventListener("click", function () { if (trackPlayback) trackPlayback.fitBounds(); });
      if (exportBtn) {
        exportBtn.addEventListener("click", function () {
          if (currentDetailRow) exportFlightReport(currentDetailRow.id);
        });
      }
    }

    function initFromQuery() {
      try {
        var params = new URLSearchParams(global.location.search);
        var q = params.get("q") || "";
        var detailId = params.get("detail") || params.get("id") || "";
        if (q) applyFilter(q, true);
        if (detailId) {
          setTimeout(function () {
            var idx = getListSource().findIndex(function (row) { return row.id === detailId; });
            if (idx >= 0) {
              if (isMobile) showDetail(idx);
              else openWebDetail(detailId);
            }
          }, 120);
        }
      } catch (e) {
        /* ignore */
      }
    }

    function setupWebRowClick() {
      if (isMobile || !tableBody) return;
      if (!global.WHTableRowClick) {
        setTimeout(setupWebRowClick, 40);
        return;
      }
      WHTableRowClick.bindById("table-body", {
        onOpenByTr: function (tr) {
          var id = tr.getAttribute("data-id");
          if (id) openWebDetail(id);
        },
      });
    }

    bindEvents();
    renderList();
    initFromQuery();
    syncSearchClear();
    setupWebRowClick();

    global.WHFlightLogPage.showList = showList;
  }

  global.WHFlightLogPage = {
    boot: bootFlightLogPage,
    flightStatusMeta: flightStatusMeta,
  };
})(window);
