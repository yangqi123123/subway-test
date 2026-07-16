/**
 * 移动端系统通知页面
 */
(function (global) {
  "use strict";

  var STORAGE_NOTIFY_EXTRA = "whmetro-notify-extra";
  var STORAGE_NOTIFY_MANUAL_DETAIL = "whmetro-notify-manual-detail";
  var STORAGE_NOTIFY_OPEN_DETAIL = "whmetro-notify-open-detail";
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

  function uniqueUsers(projects) {
    var users = [];
    (projects || []).forEach(function (proj) {
      var u = proj.user || "李明";
      if (users.indexOf(u) < 0) users.push(u);
    });
    return users;
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

  function getSectionAdjustMockRows() {
    return [
      {
        id: "adjust-001",
        title: "您已被临时调配至【洪山路-徐家棚】",
        type: "区间调配",
        time: "2026-07-16 09:53",
        read: "未读",
        source: "区间临时调配",
        user: "王强",
        personName: "王强",
        line: "8号线",
        fromSection: "水果湖-洪山路",
        toSection: "洪山路-徐家棚",
        startTime: "2026-07-16 09:53",
        endTime: "2026-07-16 17:53",
        reason: "本工班李明调休，临时补位",
        operator: "工班长-李明"
      },
      {
        id: "adjust-002",
        title: "王强已被临时调配至【洪山路-徐家棚】",
        type: "区间调配",
        time: "2026-07-16 09:53",
        read: "未读",
        source: "区间临时调配",
        user: "李明",
        personName: "王强",
        line: "8号线",
        fromSection: "水果湖-洪山路",
        toSection: "洪山路-徐家棚",
        startTime: "2026-07-16 09:53",
        endTime: "2026-07-16 17:53",
        reason: "本工班李明调休，临时补位",
        operator: "工班长-李明"
      },
      {
        id: "adjust-003",
        title: "您的责任区间已变更为【水果湖-洪山路】",
        type: "区间调配",
        time: "2026-07-16 10:20",
        read: "未读",
        source: "用户管理",
        userName: "张三",
        oldLine: "8号线",
        oldStartSection: "洪山路",
        oldEndSection: "徐家棚",
        newLine: "8号线",
        newStartSection: "水果湖",
        newEndSection: "洪山路",
        operator: "管理员-admin"
      },
      {
        id: "adjust-004",
        title: "王强的责任区间已变更为【水果湖-洪山路】",
        type: "区间调配",
        time: "2026-07-16 10:25",
        read: "未读",
        source: "用户管理",
        userName: "王强",
        oldLine: "8号线",
        oldStartSection: "洪山路",
        oldEndSection: "徐家棚",
        newLine: "8号线",
        newStartSection: "水果湖",
        newEndSection: "洪山路",
        operator: "管理员-admin"
      }
    ].map(normalizeNotifyRow);
  }

  function readExtraNotifyRows() {
    try {
      var raw = global.localStorage.getItem(STORAGE_NOTIFY_EXTRA);
      var stored = raw ? JSON.parse(raw).map(normalizeNotifyRow) : [];
      var mockRows = getSectionAdjustMockRows();
      var mockById = {};
      mockRows.forEach(function (r) { if (r.id) mockById[r.id] = r; });
      var storedById = {};
      stored.forEach(function (r) { if (r.id) storedById[r.id] = r; });
      // 保留已有 mock 的本地状态（如已读），同时补充新增的 mock 数据
      var merged = mockRows.map(function (r) { return storedById[r.id] || r; });
      var nonMockStored = stored.filter(function (r) { return !r.id || !mockById[r.id]; });
      return merged.concat(nonMockStored);
    } catch (e) {
      return getSectionAdjustMockRows();
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

  function isSectionAdjustNotify(row) {
    return row && row.type === "区间调配";
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
      var searchable = [row.title, row.projectName, row.progress, row.source, row.personName, row.userName].join(" ");
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
      set("stat-unread", rows.filter(function (r) { return isManualNotify(r); }).length);
      set("stat-approval-msg", rows.filter(function (r) { return r.type === "审批消息"; }).length);
      set("stat-airspace", rows.filter(function (r) { return isAirspaceNotify(r); }).length);
      set("stat-section-adjust", rows.filter(function (r) { return isSectionAdjustNotify(r); }).length);
      if (global.WHHeaderBadges && global.WHHeaderBadges.refresh) {
        global.WHHeaderBadges.refresh();
      }
    }

    function renderManualNotifyCard(row, index) {
      var read = row.read || "未读";
      var isTodayTaskNotify = row.source === "今日巡线" && Array.isArray(row.projects) && row.projects.length > 0;
      if (isTodayTaskNotify) {
        var firstProject = row.projects[0];
        var title;
        if (row.projects.length === 1) {
          title = (firstProject.projectName || firstProject.section || "项目") + "已完成巡查";
        } else {
          title = (firstProject.section || firstProject.projectName || "项目") + "已完成巡查";
        }
        var users = uniqueUsers(row.projects).join("、") || "李明";
        return (
          '<article class="mp-project-card mp-wb-card mp-wb-card--todo" data-index="' + index + '" role="listitem">' +
          '<div class="mp-wb-card__head">' +
          '<h3 class="mp-project-card__title mp-wb-card__title">' + esc(title) + '</h3>' +
          '<span class="mp-wb-tag ' + readClass(read) + '">' + esc(read) + '</span></div>' +
          '<div class="mp-wb-card__rows">' +
          '<div class="mp-wb-card__row"><span class="mp-wb-card__label">通知类型</span><span class="mp-wb-card__value">' + esc(row.type || "项目巡查") + '</span></div>' +
          '<div class="mp-wb-card__row"><span class="mp-wb-card__label">发布时间</span><span class="mp-wb-card__value">' + esc(row.time || "-") + '</span></div>' +
          '<div class="mp-wb-card__row"><span class="mp-wb-card__label">巡查人员</span><span class="mp-wb-card__value">' + esc(users) + '</span></div>' +
          '</div>' +
          '<div class="mp-project-card__actions">' +
          '<button type="button" class="mp-project-action" data-action="wb-view">查看</button>' +
          '</div></article>'
        );
      }
      var manualProject = row.projects && row.projects[0] ? row.projects[0] : row;
      var manualTitle = (manualProject.projectName || manualProject.section || "项目") + "已完成巡查";
      var manualUser = manualProject.user || "李明";
      return (
        '<article class="mp-project-card mp-wb-card mp-wb-card--todo" data-index="' + index + '" role="listitem">' +
        '<div class="mp-wb-card__head">' +
        '<h3 class="mp-project-card__title mp-wb-card__title">' + esc(manualTitle) + '</h3>' +
        '<span class="mp-wb-tag ' + readClass(read) + '">' + esc(read) + '</span></div>' +
        '<div class="mp-wb-card__rows">' +
        '<div class="mp-wb-card__row"><span class="mp-wb-card__label">通知类型</span><span class="mp-wb-card__value">' + esc(row.type || "项目巡查") + '</span></div>' +
        '<div class="mp-wb-card__row"><span class="mp-wb-card__label">发布时间</span><span class="mp-wb-card__value">' + esc(row.time || "-") + '</span></div>' +
        '<div class="mp-wb-card__row"><span class="mp-wb-card__label">巡查人员</span><span class="mp-wb-card__value">' + esc(manualUser) + '</span></div>' +
        '</div>' +
        '<div class="mp-project-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="wb-view-manual">查看</button>' +
        '</div></article>'
      );
    }

    function renderSectionAdjustCard(row, index) {
      var read = row.read || "未读";
      return (
        '<article class="mp-project-card mp-wb-card mp-wb-card--todo" data-index="' + index + '" role="listitem">' +
        '<div class="mp-wb-card__head">' +
        '<h3 class="mp-project-card__title mp-wb-card__title">' + esc(row.title) + '</h3>' +
        '<span class="mp-wb-tag ' + readClass(read) + '">' + esc(read) + '</span></div>' +
        '<div class="mp-wb-card__rows">' +
        '<div class="mp-wb-card__row"><span class="mp-wb-card__label">通知类型</span><span class="mp-wb-card__value">' + esc(row.type || "区间调配") + '</span></div>' +
        '<div class="mp-wb-card__row"><span class="mp-wb-card__label">发布时间</span><span class="mp-wb-card__value">' + esc(row.time || "-") + '</span></div>' +
        '</div>' +
        '<div class="mp-project-card__actions">' +
        '<button type="button" class="mp-project-action" data-action="wb-view">查看</button>' +
        '</div></article>'
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
        if (isSectionAdjustNotify(row)) return renderSectionAdjustCard(row, index);
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

    function restoreDetailFromQuery() {
      try {
        var params = new URLSearchParams(global.location.search);
        var openDetailFlag = params.get("openDetail");
        var notifyId = params.get("notifyId");
        if (!notifyId) {
          try {
            notifyId = global.sessionStorage.getItem(STORAGE_NOTIFY_OPEN_DETAIL);
          } catch (e) {}
        }
        if (!notifyId || !detailView || !detailBody) return;
        var targetRow = null;
        var rows = state.filtered.length ? state.filtered : allRows();
        rows.forEach(function (row) {
          if (String(row.id || "") === String(notifyId)) targetRow = row;
        });
        if (!targetRow) return;
        markRowRead(targetRow);
        openDetail(targetRow);
        clearNotifyOpenDetail();
        if (openDetailFlag && global.history && typeof global.history.replaceState === "function") {
          var cleanUrl = global.location.pathname + global.location.hash;
          global.history.replaceState(null, "", cleanUrl);
        }
      } catch (e) {}
    }

    function buildDetailGrid(pairs) {
      return '<dl class="mp-disease-detail-grid">' + pairs.filter(function (p) {
        return p[1] != null && p[1] !== "";
      }).map(function (p) {
        return "<dt>" + esc(p[0]) + "</dt><dd>" + esc(p[1]) + "</dd>";
      }).join("") + '</dl>';
    }

    function getProjectTypeLabel(proj) {
      return proj.projectType || proj.type || "一般项目";
    }

    function buildSortedProjectItems(projects, includeTemp) {
      var indexed = (projects || []).map(function (proj, idx) {
        return { proj: proj, idx: idx, typeLabel: getProjectTypeLabel(proj) };
      });
      var keys = [], normals = [], temps = [];
      indexed.forEach(function (item) {
        if (item.typeLabel === "重点项目") keys.push(item);
        else if (item.typeLabel === "临时项目") temps.push(item);
        else normals.push(item);
      });
      var result = keys.concat(normals);
      if (includeTemp) result = result.concat(temps);
      return result;
    }

    function renderProjectItem(proj, originalIdx, clickable, action) {
      var name = esc(proj.projectName || proj.title || proj.name || "项目");
      var typeLabel = esc(getProjectTypeLabel(proj));
      var tagClass = "mp-wb-detail-project__tag";
      if (typeLabel === "重点项目") tagClass += " is-key";
      else if (typeLabel === "临时项目") tagClass += " is-temp";
      else tagClass += " is-normal";
      if (clickable) {
        return '<button type="button" class="mp-wb-detail-project" data-action="' + esc(action || "wb-view-project") + '" data-project-index="' + originalIdx + '">' +
          '<span class="mp-wb-detail-project__name">' + name + '</span>' +
          '<span class="' + tagClass + '">' + typeLabel + '</span>' +
          '</button>';
      }
      return '<div class="mp-wb-detail-project is-disabled">' +
        '<span class="mp-wb-detail-project__name">' + name + '</span>' +
        '<span class="' + tagClass + '">' + typeLabel + '</span>' +
        '</div>';
    }

    function renderProjectList(items, clickable, action) {
      if (!items || !items.length) {
        return '<p class="mp-wb-detail-hint">暂无项目</p>';
      }
      return '<div class="mp-wb-detail-projects">' +
        items.map(function (item) { return renderProjectItem(item.proj, item.idx, clickable, action); }).join("") +
        '</div>';
    }

    function buildAggregatedNotifyDetailHtml(row) {
      var projects = row.projects || [];
      var firstProject = projects[0] || {};
      var title;
      if (projects.length === 1) {
        title = (firstProject.projectName || firstProject.section || "项目") + "已完成巡查";
      } else {
        title = (firstProject.section || firstProject.projectName || "项目") + "已完成巡查";
      }
      var users = uniqueUsers(projects).join("、") || "李明";
      var doneItems = buildSortedProjectItems(projects, true);
      var pendingProjects = (row.pendingProjects || []).filter(function (proj) {
        return getProjectTypeLabel(proj) !== "临时项目";
      });
      var pendingItems = buildSortedProjectItems(pendingProjects, false);
      return '<section class="mp-patrol-alert-section mp-todo-detail-section">' +
        '<h4 class="mp-patrol-alert-section__title">项目巡查</h4>' +
        '<div class="mp-patrol-alert-section__body">' +
        '<dl class="mp-disease-detail-grid">' +
        '<div class="mp-disease-detail-grid__full"><dt>标题</dt><dd>' + esc(title) + '</dd></div>' +
        '<div class="mp-disease-detail-grid__full"><dt>通知类型</dt><dd>' + esc(row.type || "项目巡查") + '</dd></div>' +
        '<div class="mp-disease-detail-grid__full"><dt>发布时间</dt><dd>' + esc(row.time || "-") + '</dd></div>' +
        '<div class="mp-disease-detail-grid__full"><dt>巡查人员</dt><dd>' + esc(users) + '</dd></div>' +
        '</dl>' +
        '<div class="mp-wb-detail-section">' +
        '<h5 class="mp-wb-detail-section__title">已完成项目</h5>' +
        renderProjectList(doneItems, true, "wb-view-project") +
        '</div>' +
        '<div class="mp-wb-detail-section">' +
        '<h5 class="mp-wb-detail-section__title">未完成项目</h5>' +
        renderProjectList(pendingItems, true, "wb-view-project-pending") +
        '</div>' +
        '</div></section>';
    }

    function buildSectionAdjustDetailHtml(row) {
      var pairs = [
        ["标题", row.title],
        ["通知类型", row.type || "区间调配"],
        ["发布时间", row.time || "-"]
      ];
      if (row.source === "用户管理") {
        pairs.push(["用户姓名", row.userName || "-"]);
        pairs.push(["原所属线路", row.oldLine || "-"]);
        pairs.push(["原起始区间", row.oldStartSection || "-"]);
        pairs.push(["原终点区间", row.oldEndSection || "-"]);
        pairs.push(["新所属线路", row.newLine || "-"]);
        pairs.push(["新起始区间", row.newStartSection || "-"]);
        pairs.push(["新终点区间", row.newEndSection || "-"]);
      } else {
        pairs.push(["被调配人", row.personName || row.user || "-"]);
        pairs.push(["所属线路", row.line || "-"]);
        pairs.push(["原区间", row.fromSection || "-"]);
        pairs.push(["目标区间", row.toSection || "-"]);
        pairs.push(["调配时段", (row.startTime || "-") + " 至 " + (row.endTime || "-")]);
        pairs.push(["调配原因", row.reason || "-"]);
      }
      pairs.push(["操作人", row.operator || "-"]);
      return '<section class="mp-patrol-alert-section mp-todo-detail-section"><h4 class="mp-patrol-alert-section__title">区间调配</h4><div class="mp-patrol-alert-section__body">' + buildDetailGrid(pairs) + '</div></section>';
    }

    function buildNotifyDetailHtml(row) {
      if (isSectionAdjustNotify(row)) {
        return buildSectionAdjustDetailHtml(row);
      }
      if (isManualNotify(row) && row.source === "今日巡线" && Array.isArray(row.projects) && row.projects.length > 0) {
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
      if (titleEl) {
        if (isSectionAdjustNotify(row)) {
          titleEl.textContent = "区间调配";
        } else if (isManualNotify(row) && row.source === "今日巡线" && Array.isArray(row.projects) && row.projects.length > 0) {
          titleEl.textContent = "项目巡查";
        } else if (isManualNotify(row)) {
          titleEl.textContent = "人工巡检详情";
        } else {
          titleEl.textContent = "详情";
        }
      }
      if (global.WHPatrolMediaGallery && typeof global.WHPatrolMediaGallery.bind === "function") {
        global.WHPatrolMediaGallery.bind(detailBody);
      }
      if (listView) listView.classList.add("hidden");
      detailView.classList.remove("hidden");
      global.dispatchEvent(new Event("wh-wb-view-change"));
    }

    function showList() {
      if (detailView) detailView.classList.add("hidden");
      if (listView) listView.classList.remove("hidden");
      clearNotifyOpenDetail();
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

    function cacheNotifyOpenDetail(row) {
      if (!row || !row.id) return;
      try {
        global.sessionStorage.setItem(STORAGE_NOTIFY_OPEN_DETAIL, row.id);
      } catch (e) {}
    }

    function clearNotifyOpenDetail() {
      try {
        global.sessionStorage.removeItem(STORAGE_NOTIFY_OPEN_DETAIL);
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
      cacheNotifyOpenDetail(row);
      var href = buildManualDetailHref(project);
      if (row.id) {
        href += "&fromNotifyDetail=1&notifyId=" + encodeURIComponent(row.id);
      }
      global.location.href = href;
    }

    function openProjectPatrolList(row, projectIndex) {
      var pendingProjects = row && row.pendingProjects ? row.pendingProjects : [];
      var project = pendingProjects[projectIndex];
      if (!project) return;
      markRowRead(row);
      var projectName = project.projectName || project.title || project.name || "";
      var href = "../../patrol/pages/project-patrol.html?source=notify";
      if (projectName) href += "&project=" + encodeURIComponent(projectName);
      if (row.id) href += "&notifyId=" + encodeURIComponent(row.id);
      global.location.href = href;
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

        if (action === "wb-view-project-pending") {
          var pendingCard = trigger.closest(".mp-wb-card");
          var pendingDetail = trigger.closest(".mp-detail-view");
          var pendingRow = null;
          if (pendingCard) {
            var pendingIndex = Number(pendingCard.getAttribute("data-index"));
            pendingRow = state.filtered[pendingIndex];
          } else if (pendingDetail && state.lastViewedRow) {
            pendingRow = state.lastViewedRow;
          }
          if (!pendingRow) return;
          var pendingPidx = Number(trigger.getAttribute("data-project-index"));
          openProjectPatrolList(pendingRow, pendingPidx);
          return;
        }

        if (action === "wb-view-manual") {
          var manualCard = trigger.closest(".mp-wb-card");
          if (!manualCard) return;
          var manualIndex = Number(manualCard.getAttribute("data-index"));
          var manualRow = state.filtered[manualIndex];
          if (!manualRow) return;
          markRowRead(manualRow);
          var manualProject = manualRow.projects && manualRow.projects[0] ? manualRow.projects[0] : manualRow;
          cacheNotifyManualProject(manualProject);
          global.location.href = buildManualDetailHref(manualProject);
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
    setTimeout(restoreDetailFromQuery, 50);
    global.WHNotifyMobilePage = {
      boot: bootNotifyMobilePage,
      showList: showList
    };
  }

  global.WHNotifyMobilePage = global.WHNotifyMobilePage || { boot: bootNotifyMobilePage };
  global.WHNotifyMobilePage.boot = bootNotifyMobilePage;
})(window);
