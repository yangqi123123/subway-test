/**
 * 人员轨迹 — Web / 移动端共用逻辑（对齐 wb/in-track-person.html）
 */
(function (global) {
  "use strict";

  function bootInTrackPersonPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var trackRows = (global.WH_TRACK_PERSON_ROWS || []).map(function (row) {
      return Object.assign({}, row, { points: (row.points || []).slice() });
    });

    var filteredRows = null;
    var currentRow = null;
    var currentPointIndex = 0;
    var playbackApi = null;

    var listView = document.getElementById("track-list-view");
    var detailView = document.getElementById("track-detail-view");
    var tableBody = document.getElementById("track-table-body");
    var mobileList = document.getElementById("track-mobile-list");
    var recordList = document.getElementById("track-record-list");
    var detailBaseGrid = document.getElementById("detail-base-grid");
    var detailStatusBadge = document.getElementById("detail-status-badge");
    var mapStatusText = document.getElementById("map-status-text");
    var mapCurrentName = document.getElementById("map-current-name");
    var mapCurrentTime = document.getElementById("map-current-time");
    var toastEl = document.getElementById("track-toast");

    function esc(s) {
      return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
        return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
      });
    }

    function showToast(msg) {
      if (!toastEl) return;
      toastEl.textContent = msg;
      toastEl.classList.add("show");
      clearTimeout(showToast._t);
      showToast._t = setTimeout(function () {
        toastEl.classList.remove("show");
      }, 1800);
    }

    function getListSource() {
      return filteredRows !== null ? filteredRows : trackRows;
    }

    function setStatText(id, val) {
      var el = document.getElementById(id);
      if (el) el.textContent = String(val);
    }

    function updateTrackStats(rows) {
      var list = rows || getListSource();
      var online = 0;
      var offline = 0;
      var points = 0;
      list.forEach(function (r) {
        if (r.status === "在线") online += 1;
        if (r.status === "离线") offline += 1;
        points += r.points ? r.points.length : 0;
      });
      setStatText("stat-total", list.length);
      setStatText("stat-online", online);
      setStatText("stat-offline", offline);
      setStatText("stat-points", points);
      setStatText("table-total", list.length);
    }

    function statusClass(status) {
      return status === "在线" ? "mp-track-status mp-track-status--online" : "mp-track-status mp-track-status--offline";
    }

    function fieldVal(id) {
      var el = document.getElementById(id);
      return el ? String(el.value || "").trim() : "";
    }

    function trackDatePart(value) {
      return String(value || "").slice(0, 10);
    }

    function readFiltersFromForm() {
      return {
        line: fieldVal("filter-line"),
        dept: fieldVal("filter-dept"),
        dateStart: fieldVal("filter-date-start"),
        dateEnd: fieldVal("filter-date-end"),
      };
    }

    function rowMatchesSearch(row, query) {
      var q = (query || "").trim().toLowerCase();
      if (!q) return true;
      return (
        String(row.personName || "").toLowerCase().indexOf(q) >= 0 ||
        String(row.deviceCode || "").toLowerCase().indexOf(q) >= 0
      );
    }

    function syncTrackSearchClear() {
      var input = document.getElementById("track-search-trigger");
      var clearBtn = document.getElementById("track-search-clear");
      if (!input || !clearBtn) return;
      clearBtn.hidden = !(input.value || "").trim();
    }

    function clearTrackSearch() {
      var searchInput = document.getElementById("track-search-trigger");
      if (searchInput) searchInput.value = "";
      applyFilter(undefined, true);
    }

    function refreshTrackFilterPickers() {
      if (global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
        var sheet = document.getElementById("track-filter-sheet");
        if (sheet) global.WHProjectMobile.enhanceSelectFields(sheet);
      }
    }

    function applyFilter(qOverride, silent) {
      var searchInput = document.getElementById("track-search-trigger");
      var q =
        typeof qOverride === "string"
          ? qOverride
          : searchInput && searchInput.value
            ? searchInput.value.trim()
            : "";
      if (searchInput && typeof qOverride === "string") searchInput.value = qOverride;
      var f = readFiltersFromForm();
      var hasFilter = !!(q || f.line || f.dept || f.dateStart || f.dateEnd);
      filteredRows = hasFilter
        ? trackRows.filter(function (row) {
            if (q && !rowMatchesSearch(row, q)) return false;
            if (f.line && row.line !== f.line) return false;
            if (f.dept && row.dept !== f.dept) return false;
            var rowDate = trackDatePart(row.latestTime);
            if (f.dateStart && rowDate && rowDate < f.dateStart) return false;
            if (f.dateEnd && rowDate && rowDate > f.dateEnd) return false;
            return true;
          })
        : null;
      renderList();
      syncTrackSearchClear();
      if (!silent) showToast("已按当前条件筛选");
    }

    function resetFilters() {
      ["filter-date-start", "filter-date-end"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.value = "";
      });
      ["filter-line", "filter-dept"].forEach(function (id) {
        var el = document.getElementById(id);
        if (el) el.selectedIndex = 0;
      });
      var filterSheet = document.getElementById("track-filter-sheet");
      if (filterSheet && global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
        global.WHProjectMobile.syncPickersFromForm(filterSheet);
      }
      applyFilter(undefined, true);
      showToast("筛选条件已重置");
    }

    function renderMobileCard(row) {
      return (
        '<article class="mp-project-card" data-row-id="' +
        row.id +
        '">' +
        '<div class="mp-project-card__head"><span class="mp-project-card__id">' +
        esc(row.deviceCode) +
        "</span>" +
        '<span class="' +
        statusClass(row.status) +
        '">' +
        esc(row.status) +
        "</span></div>" +
        '<h3 class="mp-project-card__title">' +
        esc(row.personName) +
        "</h3>" +
        '<dl class="mp-project-card__meta">' +
        "<div><dt>所属部门</dt><dd>" +
        esc(row.dept) +
        "</dd></div>" +
        "<div><dt>所属线路</dt><dd>" +
        esc(row.line) +
        "</dd></div>" +
        "<div><dt>最新定位时间</dt><dd>" +
        esc(row.latestTime) +
        "</dd></div>" +
        "</dl>" +
        '<div class="mp-project-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="track-detail" data-id="' +
        row.id +
        '"><i class="fa-regular fa-eye"></i>详情</button>' +
        "</div></article>"
      );
    }

    function renderMobileList(rows) {
      if (!mobileList) return;
      if (!rows.length) {
        mobileList.innerHTML =
          '<div class="mp-project-empty"><i class="fa-solid fa-person-walking"></i><p>暂无人员轨迹数据</p></div>';
        updateTrackStats(rows);
        return;
      }
      mobileList.innerHTML = rows.map(renderMobileCard).join("");
      updateTrackStats(rows);
    }

    function renderTable(rows) {
      if (!tableBody) return;
      tableBody.innerHTML = rows
        .map(function (row, index) {
          return (
            "<tr data-row-index=\"" +
            index +
            "\"><td>" +
            (index + 1) +
            "</td><td>" +
            esc(row.personName) +
            "</td><td>" +
            esc(row.deviceCode) +
            "</td><td>" +
            esc(row.dept) +
            "</td><td>" +
            esc(row.line) +
            "</td><td>" +
            esc(row.latestTime) +
            '</td><td><span class="wh-status ' +
            (row.status === "在线" ? "wh-status--done" : "wh-status--pending") +
            '">' +
            esc(row.status) +
            '</span></td><td><button type="button" class="wh-link" data-action="track-detail" data-id="' +
            row.id +
            "\">详情</button></td></tr>"
          );
        })
        .join("");
      updateTrackStats(rows);
    }

    function renderList() {
      var rows = getListSource();
      if (mobileList) renderMobileList(rows);
      if (tableBody) renderTable(rows);
    }

    function buildBaseInfo(row) {
      if (!detailBaseGrid) return;
      var fields = [
        { label: "人员姓名", value: row.personName },
        { label: "设备编号", value: row.deviceCode },
        { label: "所属部门", value: row.dept },
        { label: "所属线路", value: row.line },
        { label: "最新定位时间", value: row.latestTime },
        { label: "当前状态", value: row.status },
      ];
      if (isMobile) {
        detailBaseGrid.innerHTML = fields
          .map(function (field) {
            return (
              '<div class="mp-track-info-item"><dt>' +
              esc(field.label) +
              "</dt><dd>" +
              esc(field.value) +
              "</dd></div>"
            );
          })
          .join("");
      } else {
        detailBaseGrid.innerHTML = fields
          .map(function (field) {
            return (
              '<div class="track-info-card"><div class="track-info-label">' +
              esc(field.label) +
              '</div><div class="track-info-value">' +
              esc(field.value) +
              "</div></div>"
            );
          })
          .join("");
      }
      if (detailStatusBadge) {
        detailStatusBadge.className =
          "mp-track-status " + (row.status === "在线" ? "mp-track-status--online" : "mp-track-status--offline");
        detailStatusBadge.textContent = row.status;
      }
    }

    function renderRecords() {
      if (!recordList || !currentRow) return;
      recordList.innerHTML = currentRow.points
        .map(function (point, index) {
          return (
            '<button type="button" class="mp-track-record-item' +
            (index === currentPointIndex ? " is-active" : "") +
            '" data-point-index="' +
            index +
            '">' +
            '<span class="mp-track-record-item__code">' +
            esc(point.id) +
            "</span>" +
            '<span class="mp-track-record-item__time">' +
            esc(point.time) +
            "</span>" +
            '<span class="mp-track-record-item__name">' +
            esc(point.name) +
            "</span></button>"
          );
        })
        .join("");
    }

    function destroyPlayback() {
      if (playbackApi) {
        playbackApi.destroy();
        playbackApi = null;
      }
    }

    function initPlayback(row) {
      destroyPlayback();
      if (!global.WHTrackPlayback) return;
      playbackApi = global.WHTrackPlayback.create({
        preset: "person",
        mapContainerId: "person-track-map",
        statusEl: mapStatusText,
        nameEl: mapCurrentName,
        timeEl: mapCurrentTime,
        fitPadding: isMobile ? [24, 24] : [40, 40],
        onStep: function (index) {
          currentPointIndex = index;
          renderRecords();
        },
      });
      playbackApi.draw(row.points);
      currentPointIndex = 0;
      renderRecords();
    }

    function focusPoint(index, panMap) {
      if (!currentRow || !currentRow.points[index] || !playbackApi) return;
      currentPointIndex = index;
      playbackApi.focusPoint(index, panMap);
      renderRecords();
    }

    function openDetail(id) {
      var row = trackRows.filter(function (item) {
        return item.id === id;
      })[0];
      if (!row) return;
      currentRow = row;
      currentPointIndex = 0;
      if (listView) listView.classList.add("hidden");
      if (detailView) detailView.classList.remove("hidden");
      buildBaseInfo(row);
      var navName = document.getElementById("detail-person-name");
      if (navName) navName.textContent = row.personName || "";
      initPlayback(row);
      setTimeout(function () {
        if (playbackApi && playbackApi.getMap()) playbackApi.getMap().invalidateSize();
      }, 120);
      global.dispatchEvent(new Event("wh-track-view-change"));
    }

    function showList() {
      destroyPlayback();
      currentRow = null;
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-track-view-change"));
    }

    function playTrack() {
      if (!playbackApi) return;
      playbackApi._playing = true;
      playbackApi.play();
    }

    function bindEvents() {
      var searchPage = "track-person-search.html";

      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        if (action === "open-track-search") {
          event.preventDefault();
          global.location.href = searchPage;
          return;
        }
        if (action === "track-detail") {
          openDetail(Number(trigger.getAttribute("data-id")));
          return;
        }
        if (action === "back-track-list") {
          showList();
          return;
        }
        if (action === "open-track-filter") {
          var sheet = document.getElementById("track-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            refreshTrackFilterPickers();
          }
          return;
        }
        if (action === "close-track-filter") {
          var closeSheet = document.getElementById("track-filter-sheet");
          if (closeSheet) closeSheet.classList.remove("is-open");
          return;
        }
        if (action === "search-track") {
          var searchSheet = document.getElementById("track-filter-sheet");
          if (searchSheet) searchSheet.classList.remove("is-open");
          applyFilter();
          return;
        }
        if (action === "reset-track-filter") {
          var resetSheet = document.getElementById("track-filter-sheet");
          if (resetSheet) resetSheet.classList.remove("is-open");
          resetFilters();
          return;
        }
        if (action === "play-track") {
          playTrack();
          return;
        }
        if (action === "reset-track-map") {
          if (playbackApi) playbackApi.fitBounds();
        }
      });

      if (mobileList) {
        mobileList.addEventListener("click", function (event) {
          if (event.target.closest("[data-action]")) return;
          var card = event.target.closest(".mp-project-card[data-row-id]");
          if (!card) return;
          openDetail(Number(card.getAttribute("data-row-id")));
        });
      }

      if (recordList) {
        recordList.addEventListener("click", function (event) {
          var item = event.target.closest("[data-point-index]");
          if (!item || !playbackApi) return;
          playbackApi.stop(false);
          playbackApi._playing = false;
          if (mapStatusText) mapStatusText.textContent = "已定位";
          focusPoint(Number(item.getAttribute("data-point-index")), true);
        });
      }
      var trackSearchClear = document.getElementById("track-search-clear");
      if (trackSearchClear) {
        trackSearchClear.addEventListener("click", function (e) {
          e.preventDefault();
          e.stopPropagation();
          clearTrackSearch();
        });
      }

      var trackSearchWrap = document.querySelector(".mp-search-input-wrap[data-action='open-track-search']");
      if (trackSearchWrap) {
        trackSearchWrap.addEventListener("click", function (e) {
          if (e.target.closest("#track-search-clear")) return;
        });
      }
    }

    if (isMobile && global.WHProjectMobile && global.WHProjectMobile.init) {
      try {
        global.WHProjectMobile.init({
          clearListSearch: clearTrackSearch,
          showToast: showToast
        });
      } catch (initErr) {
        console.warn("[WHInTrackPersonPage] mobile init", initErr);
      }
      refreshTrackFilterPickers();
      syncTrackSearchClear();
    }

    renderList();
    bindEvents();

    (function handleQueryOpen() {
      try {
        var params = new URLSearchParams(global.location.search);
        var id = params.get("id");
        if (id) {
          setTimeout(function () {
            openDetail(Number(id));
          }, 120);
          return;
        }
        var q = params.get("q");
        if (q) {
          applyFilter(q);
          try {
            global.history.replaceState({ fromTrackSearch: true }, "", "track-person.html");
          } catch (e) {
            /* ignore */
          }
        }
      } catch (e) {
        /* ignore */
      }
    })();

    global.WHInTrackPersonPage.showList = showList;
    global.WHInTrackPersonPage.openDetail = openDetail;
    global.WHInTrackPersonPage.renderList = renderList;
    return { showList: showList, openDetail: openDetail, renderList: renderList };
  }

  global.WHInTrackPersonPage = {
    boot: bootInTrackPersonPage,
    showList: null,
    openDetail: null,
    renderList: null,
  };
})(typeof window !== "undefined" ? window : global);
