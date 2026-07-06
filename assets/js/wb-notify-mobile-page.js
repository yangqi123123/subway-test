/**
 * 移动端系统通知页面
 */
(function (global) {
  "use strict";

  var STORAGE_NOTIFY_EXTRA = "whmetro-notify-extra";
  var STORAGE_NOTIFY_MANUAL_DETAIL = "whmetro-notify-manual-detail";
  var MANUAL_NOTIFY_PROJECT_TYPES = {
    "新建商业文化设施项目": "一般项目",
    "洪山路至小洪山商业公寓项目": "重点项目",
    "三金潭车辆段上盖物业综合开发项目": "一般项目"
  };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function $(id) {
    return document.getElementById(id);
  }

  function toast(msg) {
    var el = $("wb-mobile-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function readClass(read) {
    if (read === "未读") return "mp-wb-tag--warn";
    if (read === "已读") return "mp-wb-tag--ok";
    return "";
  }

  function normalizeNotifyRow(row) {
    if (!row) return row;
    var next = Object.assign({}, row);
    if (next.type === "项目巡线") next.type = "项目巡查";
    if (!next.projectType && next.projectName) {
      next.projectType = MANUAL_NOTIFY_PROJECT_TYPES[next.projectName] || "一般项目";
    }
    return next;
  }

  function readExtraNotifyRows() {
    try {
      var raw = global.localStorage.getItem(STORAGE_NOTIFY_EXTRA);
      return raw ? JSON.parse(raw).map(normalizeNotifyRow) : [];
    } catch (e) {
      return [];
    }
  }

  function isLegacyProjectNotify(row) {
    return row && row.type === "项目巡查" && row.source === "今日巡线" && !Array.isArray(row.projects);
  }
  function cleanupLegacyProjectNotifies() {
    try {
      var rows = readExtraNotifyRows();
      var cleaned = rows.filter(function (row) { return !isLegacyProjectNotify(row); });
      if (cleaned.length !== rows.length) {
        global.localStorage.setItem(STORAGE_NOTIFY_EXTRA, JSON.stringify(cleaned));
      }
    } catch (e) {}
  }
  function cloneNotifyConfig() {
    cleanupLegacyProjectNotifies();
    var src = (global.WH_WORKBENCH_CONFIGS || {})["wb-sys-notify"];
    if (!src) return null;
    var cloned = JSON.parse(JSON.stringify(src));
    cloned.rows = readExtraNotifyRows().concat((cloned.rows || []).map(normalizeNotifyRow));
    return cloned;
  }

  function isAirspaceNotify(row) {
    if (global.WHWorkbenchNotify && global.WHWorkbenchNotify.isAirspaceNotify) {
      return global.WHWorkbenchNotify.isAirspaceNotify(row);
    }
    return row && (row.type === "空域许可提醒" || row.type === "提醒");
  }

  function isManualNotify(row) {
    return row && (row.type === "项目巡查" || row.type === "项目巡线");
  }

  function manualNotifyProjectType(row) {
    if (row.projectType) return row.projectType;
    return MANUAL_NOTIFY_PROJECT_TYPES[row.projectName] || "一般项目";
  }

  function manualNotifyCardRows(row) {
    return [
      ["通知类型", row.type || "项目巡查"],
      ["发布时间", row.time || row.patrolDate || "-"]
    ];
  }

  function manualNotifyDetailPairs(row) {
    return [
      ["编号", row.id || "-"],
      ["所属线路", row.line || "-"],
      ["上下行", row.direction || "-"],
      ["所在区间", row.section || "-"],
      ["站点", row.station || "-"],
      ["所在项目", (row.projectName || "-") + (manualNotifyProjectType(row) ? " / " + manualNotifyProjectType(row) : "")],
      ["巡查日期", row.patrolDate || row.time || "-"],
      ["项目进展", row.progress || row.result || "-"],
      ["协调情况及备注", row.remark || "-"],
      ["巡查人", row.user || "-"],
      ["更新时间", row.updatedAt || row.time || "-"]
    ];
  }

  function ensureNotifyDetailMediaStyles() {
    if (document.getElementById("wb-notify-detail-media-style")) return;
    var style = document.createElement("style");
    style.id = "wb-notify-detail-media-style";
    style.textContent = "" +
      ".mp-notify-page .patrol-media-cell.patrol-media-cell--detail-grid{width:100%;max-width:none;}" +
      ".mp-notify-page .patrol-media-cell--detail-grid .patrol-media-strip{display:grid;grid-template-columns:repeat(4,34px);gap:6px;max-width:154px;overflow:hidden;}" +
      ".mp-notify-page .patrol-media-cell--detail-grid .patrol-media-popover__grid{grid-template-columns:repeat(4,minmax(0,1fr));gap:8px;}" +
      ".mp-notify-page .patrol-media-cell--detail-grid .patrol-media-popover__card{min-width:0;}";
    document.head.appendChild(style);
  }

  function buildManualNotifyDetailHtml(row) {
    ensureNotifyDetailMediaStyles();
    var pairs = manualNotifyDetailPairs(row);
    var detailHtml = '<dl class="mp-disease-detail-grid">' + pairs.map(function (pair) {
      var full = pair[0] === "项目进展" || pair[0] === "协调情况及备注";
      return (full ? '<div class="mp-disease-detail-grid__full">' : '<div>') +
        '<dt>' + esc(pair[0]) + '</dt><dd>' + esc(pair[1]) + '</dd></div>';
    }).join("");

    if (global.WHPatrolMediaGallery && global.WHPatrolMediaGallery.renderDetailGrid) {
      detailHtml += '<div class="mp-disease-detail-grid__full"><dt>巡查照片</dt><dd>' +
        global.WHPatrolMediaGallery.renderDetailGrid({ kind: "photo", projectName: row.projectName }) +
        '</dd></div>';
      detailHtml += '<div class="mp-disease-detail-grid__full"><dt>巡查视频</dt><dd>' +
        global.WHPatrolMediaGallery.renderDetailGrid({ kind: "video", projectName: row.projectName }) +
        '</dd></div>';
    }

    return detailHtml + '</dl>';
  }

  function bootNotifyMobilePage() {
    if (global.WHHeaderBadges && global.WHHeaderBadges.refresh) {
      global.WHHeaderBadges.refresh();
    }

    var config = cloneNotifyConfig();
    if (!config) return;

    if (global.WHHeaderBadges && global.WHHeaderBadges.applyNotifyReadToRows) {
      global.WHHeaderBadges.applyNotifyReadToRows(config.rows);
    }

    var state = { filtered: [], lastViewedRow: null };
    var listEl = $("wb-mobile-list");
    var listView = $("wb-list-view");
    var detailView = $("wb-detail-view");
    var detailBody = $("wb-detail-body");
    var filterSheet = $("wb-filter-sheet");
    var searchInput = $("wb-search-trigger");
    var searchClearBtn = $("wb-search-clear");

    function syncSearchClear() {
      if (!searchInput || !searchClearBtn) return;
      searchClearBtn.hidden = !(searchInput.value || "").trim();
    }

    function getSearchQuery(qOverride) {
      if (typeof qOverride === "string") return qOverride;
      return searchInput && searchInput.value ? searchInput.value.trim() : "";
    }

    function readFilters() {
      return {
        type: ($("wb-filter-type") && $("wb-filter-type").value) || "全部",
        start: ($("wb-filter-start") && $("wb-filter-start").value) || "",
        end: ($("wb-filter-end") && $("wb-filter-end").value) || "",
        keyword: getSearchQuery()
      };
    }

    function rowMatches(row, f) {
      if (f.type && f.type !== "全部") {
        var typeLabel = row.type === "提醒" ? "空域许可提醒" : row.type;
        if (typeLabel !== f.type) return false;
      }
      var searchable = [row.title, row.projectName, row.progress].join(" ");
      if (Array.isArray(row.projects) && row.projects.length) {
        searchable += " " + row.projects.map(function (proj) {
          return proj.projectName || proj.title || "";
        }).join(" ");
      }
      if (f.keyword && searchable.indexOf(f.keyword) < 0) return false;
      if (f.start && row.time && row.time.slice(0, 10) < f.start) return false;
      if (f.end && row.time && row.time.slice(0, 10) > f.end) return false;
      return true;
    }

    function allRows() {
      return config.rows || [];
    }

    function updateStats() {
      var rows = allRows();
      var set = function (id, val) {
        var el = $(id);
        if (!el) return;
        var numEl = el.querySelector(".mp-stat-card__num");
        if (numEl) numEl.textContent = String(val);
        else el.textContent = String(val);
      };
      set("stat-total", rows.length);
      set("stat-unread", rows.filter(function (r) { return r.read === "未读"; }).length);
      set("stat-approval-msg", rows.filter(function (r) { return r.type === "审批消息"; }).length);
      set("stat-airspace", rows.filter(function (r) { return isAirspaceNotify(r); }).length);
      if (global.WHHeaderBadges && global.WHHeaderBadges.refresh) {
        global.WHHeaderBadges.refresh();
      }
    }

    function renderManualNotifyCard(row, index) {
      var read = row.read || "未读";
      var isAggregated = Array.isArray(row.projects) && row.projects.length > 0;
      var rowsHtml = "";
      if (isAggregated) {
        rowsHtml =
          '<div class="mp-wb-card__row"><span class="mp-wb-card__label">通知类型</span><span class="mp-wb-card__value">' + esc(row.type || "项目巡查") + '</span></div>' +
          '<div class="mp-wb-card__row"><span class="mp-wb-card__label">发布时间</span><span class="mp-wb-card__value">' + esc(row.time || "-") + '</span></div>' +
          '<div class="mp-wb-card__row"><span class="mp-wb-card__label">已完成项目</span></div>' +
          '<div class="mp-wb-card__projects">' + row.projects.map(function (proj, pidx) {
            return '<button type="button" class="mp-wb-card__project" data-action="wb-view-project" data-project-index="' + pidx + '">' + esc(proj.projectName || proj.title || "项目") + '</button>';
          }).join("") + '</div>';
      } else {
        rowsHtml = manualNotifyCardRows(row).map(function (pair) {
          return '<div class="mp-wb-card__row"><span class="mp-wb-card__label">' + esc(pair[0]) + '</span><span class="mp-wb-card__value">' + esc(pair[1]) + '</span></div>';
        }).join("");
      }
      return (
        '<article class="mp-project-card mp-wb-card mp-wb-card--todo" data-index="' + index + '" role="listitem">' +
        '<div class="mp-wb-card__head" data-action="wb-view">' +
        '<h3 class="mp-project-card__title mp-wb-card__title">' + esc(isAggregated ? row.title : ((row.projectName || row.title || "项目") + " + 已完成")) + '</h3>' +
        '<span class="mp-wb-tag ' + readClass(read) + '">' + esc(read) + '</span></div>' +
        '<div class="mp-wb-card__rows">' + rowsHtml + '</div>' +
        '</article>'
      );
    }

    function renderDefaultNotifyCard(row, index) {
      var read = row.read || "-";
      var typeLabel = row.type === "提醒" ? "空域许可提醒" : row.type || "-";
      return (
        '<article class="mp-project-card mp-wb-card mp-wb-card--todo" data-index="' + index + '" role="listitem">' +
        '<div class="mp-wb-card__head">' +
        '<h3 class="mp-project-card__title mp-wb-card__title">' + esc(row.title) + '</h3>' +
        '<span class="mp-wb-tag ' + readClass(read) + '">' + esc(read) + '</span></div>' +
        '<div class="mp-wb-card__rows">' +
        '<div class="mp-wb-card__row"><span class="mp-wb-card__label">通知类型</span><span class="mp-wb-card__value">' + esc(typeLabel) + '</span></div>' +
        '<div class="mp-wb-card__row"><span class="mp-wb-card__label">发布时间</span><span class="mp-wb-card__value">' + esc(row.time || "-") + '</span></div></div>' +
        '<div class="mp-project-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="wb-view">查看</button>' +
        '</div></article>'
      );
    }

    function renderList() {
      if (!listEl) return;
      if (!state.filtered.length) {
        listEl.innerHTML = '<div class="mp-project-empty">暂无数据</div>';
        return;
      }
      listEl.innerHTML = state.filtered.map(function (row, index) {
        return isManualNotify(row) ? renderManualNotifyCard(row, index) : renderDefaultNotifyCard(row, index);
      }).join("");
    }

    function applyFilter(qOverride, silent) {
      var q = getSearchQuery(qOverride);
      if (searchInput && typeof qOverride === "string") searchInput.value = qOverride;
      var filters = readFilters();
      if (typeof qOverride === "string") filters.keyword = q;
      state.filtered = allRows().filter(function (row) {
        return rowMatches(row, filters);
      }).sort(function (a, b) {
        return (a.read === "未读" ? 0 : 1) - (b.read === "未读" ? 0 : 1);
      });
      renderList();
      updateStats();
      syncSearchClear();
      if (!silent && q) toast("已按当前条件筛选");
    }

    function clearSearch() {
      if (searchInput) searchInput.value = "";
      applyFilter("", true);
    }

    function initFromQuery() {
      try {
        var params = new URLSearchParams(global.location.search);
        var q = params.get("q") || "";
        if (q) applyFilter(q, true);
      } catch (e) {}
    }

    function buildDetailGrid(pairs) {
      return '<dl class="mp-disease-detail-grid">' + pairs.filter(function (p) {
        return p[1] != null && p[1] !== "";
      }).map(function (p) {
        return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>";
      }).join("") + '</dl>';
    }

    function buildAggregatedNotifyDetailHtml(row) {
      var projects = row.projects || [];
      var listHtml = projects.map(function (proj, pidx) {
        return '<button type="button" class="mp-wb-detail-project" data-action="wb-view-project" data-project-index="' + pidx + '">' + esc(proj.projectName || proj.title || "项目") + '</button>';
      }).join("");
      return '<section class="mp-patrol-alert-section mp-todo-detail-section">' +
        '<h4 class="mp-patrol-alert-section__title">项目巡查汇总</h4>' +
        '<div class="mp-patrol-alert-section__body">' +
        '<p class="mp-wb-detail-lead">' + esc(row.title) + '</p>' +
        '<div class="mp-wb-detail-projects">' + listHtml + '</div>' +
        '<p class="mp-wb-detail-hint">（点击项目名称可查看详情）</p>' +
        '</div></section>';
    }

    function buildNotifyDetailHtml(row) {
      if (isManualNotify(row) && Array.isArray(row.projects) && row.projects.length > 0) {
        return buildAggregatedNotifyDetailHtml(row);
      }
      if (isManualNotify(row)) {
        return '<section class="mp-patrol-alert-section mp-todo-detail-section"><h4 class="mp-patrol-alert-section__title">人工巡检详情</h4><div class="mp-patrol-alert-section__body">' + buildManualNotifyDetailHtml(row) + '</div></section>';
      }
      var pairs = global.WHWorkbenchNotify && global.WHWorkbenchNotify.notifyDetailPairs
        ? global.WHWorkbenchNotify.notifyDetailPairs(row)
        : [["标题", row.title], ["发布时间", row.time]];
      return '<section class="mp-patrol-alert-section mp-todo-detail-section"><h4 class="mp-patrol-alert-section__title">通知详情</h4><div class="mp-patrol-alert-section__body">' + buildDetailGrid(pairs) + '</div></section>';
    }

    function openDetail(row) {
      if (!detailView || !detailBody) return;
      state.lastViewedRow = row;
      detailBody.innerHTML = buildNotifyDetailHtml(row);
      var titleEl = $("detail-wb-title");
      if (titleEl) titleEl.textContent = "详情";
      if (listView) listView.classList.add("hidden");
      detailView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-wb-view-change"));
    }

    function showList() {
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-wb-view-change"));
    }

    function persistNotifyRead(row) {
      if (!row || !row.id) return;
      try {
        var extras = readExtraNotifyRows();
        var changed = false;
        extras = extras.map(function (r) {
          if (r.id === row.id && r.read !== "已读") {
            changed = true;
            return Object.assign({}, r, { read: "已读" });
          }
          return r;
        });
        if (changed) {
          global.localStorage.setItem(STORAGE_NOTIFY_EXTRA, JSON.stringify(extras));
        }
      } catch (e) {}
    }

    function markRowRead(row) {
      if (!row) return;
      if (row.read !== "已读") {
        row.read = "已读";
        persistNotifyRead(row);
        if (global.WHHeaderBadges && global.WHHeaderBadges.markNotifyRead) {
          global.WHHeaderBadges.markNotifyRead(row);
        }
      }
    }

    function handleView(row) {
      markRowRead(row);
      openDetail(row);
      applyFilter(undefined, true);
    }

    function cacheNotifyManualProject(project) {
      if (!project) return;
      try {
        global.sessionStorage.setItem(STORAGE_NOTIFY_MANUAL_DETAIL, JSON.stringify(project));
      } catch (e) {}
    }

    function buildManualDetailHref(project) {
      if (!project) return "../../patrol/pages/manual.html";
      var name = project.projectName || project.title || "";
      var href = "../../patrol/pages/manual.html?source=notify&notifyType=manual&project=" + encodeURIComponent(name);
      if (project.taskId) href += "&taskId=" + encodeURIComponent(project.taskId);
      if (project.id) href += "&manualId=" + encodeURIComponent(project.id);
      if (project.line) href += "&line=" + encodeURIComponent(project.line);
      if (project.direction) href += "&direction=" + encodeURIComponent(project.direction);
      if (project.section) href += "&section=" + encodeURIComponent(project.section);
      if (project.station) href += "&station=" + encodeURIComponent(project.station);
      if (project.patrolDate) href += "&patrolDate=" + encodeURIComponent(project.patrolDate);
      return href;
    }

    function openProjectDetail(row, projectIndex) {
      var projects = row && row.projects ? row.projects : [];
      var project = projects[projectIndex];
      if (!project) return;
      markRowRead(row);
      cacheNotifyManualProject(project);
      global.location.href = buildManualDetailHref(project);
    }

    function bindEvents() {
      document.addEventListener("click", function (e) {
        var trigger = e.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");

        if (action === "wb-view-project") {
          var card = trigger.closest(".mp-wb-card");
          var detail = trigger.closest(".mp-detail-view");
          var row = null;
          if (card) {
            var index = Number(card.getAttribute("data-index"));
            row = state.filtered[index];
          } else if (detail && state.lastViewedRow) {
            row = state.lastViewedRow;
          }
          if (!row) return;
          var pidx = Number(trigger.getAttribute("data-project-index"));
          openProjectDetail(row, pidx);
          return;
        }

        if (action === "open-wb-filter") {
          if (filterSheet) {
            filterSheet.classList.add("is-open");
            filterSheet.setAttribute("aria-hidden", "false");
          }
          return;
        }
        if (action === "open-wb-search") {
          e.preventDefault();
          global.location.href = "notify-search.html";
          return;
        }
        if (action === "wb-search-clear") {
          clearSearch();
          return;
        }
        if (action === "close-wb-filter") {
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          return;
        }
        if (action === "search-wb-filter") {
          if (filterSheet) {
            filterSheet.classList.remove("is-open");
            filterSheet.setAttribute("aria-hidden", "true");
          }
          applyFilter();
          return;
        }
        if (action === "reset-wb-filter") {
          ["wb-filter-type", "wb-filter-start", "wb-filter-end"].forEach(function (id) {
            var el = $(id);
            if (!el) return;
            if (el.tagName === "SELECT") el.selectedIndex = 0;
            else el.value = "";
          });
          if (searchInput) searchInput.value = "";
          applyFilter(undefined, true);
          toast("筛选已重置");
          return;
        }
        if (action === "wb-mark-all-read") {
          allRows().forEach(function (r) {
            r.read = "已读";
            if (global.WHHeaderBadges && global.WHHeaderBadges.markNotifyRead) {
              global.WHHeaderBadges.markNotifyRead(r);
            }
          });
          applyFilter(undefined, true);
          toast("已全部标记为已读");
          return;
        }

        var card = trigger.closest(".mp-wb-card");
        if (!card) return;
        var index = Number(card.getAttribute("data-index"));
        var row = state.filtered[index];
        if (!row) return;

        if (action === "wb-view") {
          handleView(row);
        }
      });
    }

    bindEvents();
    initFromQuery();
    applyFilter(undefined, true);
    global.WHNotifyMobilePage = {
      boot: bootNotifyMobilePage,
      showList: showList
    };
  }

  global.WHNotifyMobilePage = global.WHNotifyMobilePage || { boot: bootNotifyMobilePage };
  global.WHNotifyMobilePage.boot = bootNotifyMobilePage;
})(window);
