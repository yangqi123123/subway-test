/**
 * 告警信息：态势感知地图 + 区间树状列表 + 详情/复核/审核流程
 */
(function () {
  var FALLBACK_PHOTOS = [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=300&q=80",
  ];
  var DEFAULT_PHOTOS =
    window.WuhanExpertReviewModal && window.WuhanExpertReviewModal.DEFAULT_PHOTOS.length
      ? window.WuhanExpertReviewModal.DEFAULT_PHOTOS
      : FALLBACK_PHOTOS;

  function createProject(base) {
    return Object.assign(
      {
        id: 0,
        projectName: "",
        alarmPosition: "",
        alarmArea: "",
        startTime: "",
        latestTime: "",
        source: "AI",
        handleMode: "AI",
        workflowStatus: "未复核",
        mistaken: "否",
        detail: "",
        image: DEFAULT_PHOTOS[0] || "",
        alarmCount: 1,
        latlng: [30.5859, 114.3122],
        mapCenter: [30.5859, 114.3122],
        zoom: 14,
        type: "疑似机械施工",
        code: "7.0.346.E",
        section: "",
        location: "",
        lastTime: "",
        moment: "已生成",
        patrolAction: "生成  查看  典型事件标注",
        review: {
          falseAlarm: "非误报",
          levelAdjust: "一级告警",
          scene: "",
          photos: DEFAULT_PHOTOS.slice(),
        },
        alarmRecord: { code: "7.0.346.E", startTime: "", endTime: "", duration: "-" },
        uavRecord: {
          time: "",
          user: "hudanfeng",
          mistaken: "否",
          level: "一级告警",
          situation: "",
          image: DEFAULT_PHOTOS[0] || "",
        },
        disposalRecord: [{ time: "", type: "alarm", text: "告警产生，系统发送告警信息" }],
        locationNote: "",
      },
      base
    );
  }

  function formatAlarmShortLabel(datetime) {
    if (!datetime) return "";
    var text = String(datetime).trim();
    var match = text.match(/^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}:\d{2}:\d{2})/);
    if (match) return match[2] + "-" + match[3] + " " + match[4];
    return text;
  }

  function formatAlarmDurationLabel(startDt, endDt) {
    var start = parseAlertTime(startDt);
    var end = parseAlertTime(endDt);
    if (!start || !end || end <= start) return "—";
    var seconds = Math.round((end.getTime() - start.getTime()) / 1000);
    if (seconds < 60) return seconds + "s";
    if (seconds < 3600) return Math.round(seconds / 60) + "min";
    var hours = Math.floor(seconds / 3600);
    var mins = Math.round((seconds % 3600) / 60);
    return mins ? hours + "小时" + mins + "分" : hours + "小时";
  }

  function getAlarmRecordDisplay(item) {
    var rec = item.alarmRecord || {};
    var start = rec.startTime || formatAlarmShortLabel(item.startTime);
    var end = rec.endTime || formatAlarmShortLabel(item.lastTime || item.latestTime);
    var duration = rec.duration;
    if (!duration || duration === "-") {
      duration = formatAlarmDurationLabel(item.startTime, item.lastTime || item.latestTime);
    }
    var range =
      start && end ? start + " ~" + end : rec.time || start || end || "—";
    return {
      code: rec.code || item.code || "—",
      duration: duration,
      range: range,
    };
  }

  function projectToAlarmRow(project) {
    var latlng = project.latlng || [30.5859, 114.3122];
    return {
      location: project.location || project.alarmPosition || project.projectName,
      time: project.latestTime || project.startTime,
      source: project.source,
      status: project.workflowStatus,
      lat: latlng[0],
      lng: latlng[1],
    };
  }

  var intervalTree = [
    {
      id: "interval-zhongnan",
      area: "中南医院站-湖北日报站",
      startTime: "2026-03-05 08:14:49",
      count: 4,
      expanded: true,
      projects: [
        createProject({
          id: 201,
          projectName: "金融街六中北项目",
          alarmPosition: "里程 V20+066 左线外侧",
          alarmArea: "中南医院站-湖北日报站",
          startTime: "2026-03-05 08:14:49",
          latestTime: "2026-03-05 18:30:46",
          lastTime: "2026-03-05 18:30:46",
          section: "中南医院站-湖北日报站",
          location: "里程 V20+066 左线外侧",
          workflowStatus: "未复核",
          handleMode: "AI",
          detail: "",
          locationNote: "金融街T2北侧围挡外，破拆机械作业面，需持续盯控。",
          latlng: [30.5859, 114.3122],
          mapCenter: [30.5859, 114.3122],
          alarmRecord: {
            code: "7.0.346.E",
            startTime: "03-05 08:14:49",
            endTime: "03-05 09:14:49",
            duration: "60s",
          },
          disposalRecord: [
            { time: "2026-04-07 02:05:50", type: "alarm", text: "告警产生，系统发送告警信息" },
            { time: "2026-04-07 10:08:50", type: "step", text: "hudanfeng确认接受工单，即将前往现场" },
            {
              time: "2026-04-07 10:10:50",
              type: "review",
              text: "hudanfeng提交现场复核情况",
              review: true,
              falseAlarm: "否",
              levelAdjust: "一级告警",
              scene: "金融街T2大楼破拆机拆除",
            },
          ],
          uavRecord: {
            time: "2026-04-07 10:10",
            user: "hudanfeng",
            mistaken: "否",
            level: "一级告警",
            situation: "金融街T2大楼破拆机拆除",
            image: DEFAULT_PHOTOS[0],
          },
        }),
        createProject({
          id: 202,
          projectName: "武铁投二期基坑工程",
          alarmPosition: "里程 V20+058 右线外侧",
          alarmArea: "中南医院站-湖北日报站",
          startTime: "2026-03-05 09:02:11",
          latestTime: "2026-03-05 17:48:20",
          lastTime: "2026-03-05 17:48:20",
          section: "中南医院站-湖北日报站",
          location: "里程 V20+058 右线外侧",
          workflowStatus: "已复核",
          handleMode: "AI+传统",
          source: "AI+传统",
          mistaken: "否",
          detail: "现场有破拆机械挖掘施工，动静比较大",
          image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=220&q=80",
          latlng: [30.5842, 114.3188],
          mapCenter: [30.5842, 114.3188],
          review: {
            falseAlarm: "非误报",
            levelAdjust: "二级告警",
            scene: "现场有破拆机械挖掘施工，动静比较大",
            photos: [DEFAULT_PHOTOS[1]],
          },
          uavRecord: {
            time: "2026-03-05 17:48",
            user: "hudanfeng",
            mistaken: "否",
            level: "二级告警",
            situation: "现场有破拆机械挖掘施工，动静比较大",
            image: "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=520&q=80",
          },
          disposalRecord: [
            { time: "2026-03-05 09:02:11", type: "alarm", text: "告警产生，系统发送告警信息" },
            {
              time: "2026-03-05 17:48:20",
              type: "review",
              text: "hudanfeng提交现场复核情况",
              review: true,
              falseAlarm: "非误报",
              levelAdjust: "二级告警",
              scene: "现场有破拆机械挖掘施工，动静比较大",
            },
          ],
        }),
        createProject({
          id: 203,
          projectName: "轨道交通配套施工",
          alarmPosition: "里程 V20+040 左线外侧",
          alarmArea: "中南医院站-湖北日报站",
          startTime: "2026-03-04 11:52:14",
          latestTime: "2026-03-04 18:22:07",
          lastTime: "2026-03-04 18:22:07",
          section: "中南医院站-湖北日报站",
          location: "里程 V20+040 左线外侧",
          workflowStatus: "审核通过",
          handleMode: "AI",
          source: "传统",
          mistaken: "否",
          detail: "现场复核属实，已督促降噪",
          latlng: [30.5878, 114.3004],
          mapCenter: [30.5878, 114.3004],
          review: {
            falseAlarm: "非误报",
            levelAdjust: "一级告警",
            scene: "现场复核属实，已督促降噪",
          },
          uavRecord: {
            time: "2026-03-04 18:22",
            user: "wangweiwei",
            mistaken: "否",
            level: "一级告警",
            situation: "现场复核属实，已督促降噪",
            image: DEFAULT_PHOTOS[0],
          },
          disposalRecord: [
            { time: "2026-03-04 11:52:14", type: "alarm", text: "告警产生，系统发送告警信息" },
            {
              time: "2026-03-04 16:10:00",
              type: "review",
              text: "wangweiwei提交现场复核情况",
              review: true,
              falseAlarm: "非误报",
              levelAdjust: "一级告警",
              scene: "现场复核属实，已督促降噪",
            },
            {
              time: "2026-03-04 18:22:07",
              type: "audit",
              text: "管理员审批",
              auditor: "wangweiwei",
              result: "审核通过",
              opinion: "现场管控措施到位，同意结案。",
            },
          ],
        }),
        createProject({
          id: 204,
          projectName: "市政道路改造工程",
          alarmPosition: "里程 V20+030 左线外侧",
          alarmArea: "中南医院站-湖北日报站",
          startTime: "2026-03-04 11:55:14",
          latestTime: "2026-03-04 12:20:29",
          lastTime: "2026-03-04 12:20:29",
          section: "中南医院站-湖北日报站",
          location: "里程 V20+030 左线外侧",
          workflowStatus: "审核不通过",
          handleMode: "传统",
          source: "AI+传统",
          mistaken: "否",
          detail: "现场照片不清晰，需补充复核",
          latlng: [30.5835, 114.3055],
          mapCenter: [30.5835, 114.3055],
          review: {
            falseAlarm: "非误报",
            levelAdjust: "一级告警",
            scene: "现场照片不清晰，需补充复核",
          },
          disposalRecord: [
            { time: "2026-03-04 11:55:14", type: "alarm", text: "告警产生，系统发送告警信息" },
            {
              time: "2026-03-04 12:05:00",
              type: "review",
              text: "hudanfeng提交现场复核情况",
              review: true,
              falseAlarm: "非误报",
              levelAdjust: "一级告警",
              scene: "现场照片不清晰，需补充复核",
            },
            {
              time: "2026-03-04 12:20:29",
              type: "audit",
              text: "管理员审批",
              auditor: "wangweiwei",
              result: "审核不通过",
              opinion: "复核材料不完整，请补充现场近景照片后重新提交。",
            },
          ],
        }),
      ],
    },
    {
      id: "interval-yuehuatan",
      area: "岳家嘴-梨园",
      startTime: "2026-03-05 05:55:29",
      count: 1,
      expanded: false,
      projects: [
        createProject({
          id: 301,
          projectName: "梨园站附属施工",
          alarmPosition: "里程 Y16+581",
          alarmArea: "岳家嘴-梨园",
          startTime: "2026-03-05 05:55:29",
          latestTime: "2026-03-05 05:55:29",
          lastTime: "2026-03-05 05:55:29",
          section: "岳家嘴-梨园",
          location: "里程 Y16+581",
          source: "传统",
          handleMode: "传统",
          workflowStatus: "未复核",
          latlng: [30.5677, 114.3651],
          mapCenter: [30.5677, 114.3651],
          disposalRecord: [
            { time: "2026-03-05 05:55:29", type: "alarm", text: "告警产生，系统发送告警信息" },
          ],
        }),
      ],
    },
  ];

  var currentAlert = null;
  var detailMapApi = null;
  var listMapApi = null;
  var locateMarker = null;

  function allProjects() {
    var list = [];
    intervalTree.forEach(function (interval) {
      interval.projects.forEach(function (p) {
        list.push(p);
      });
    });
    return list;
  }

  function findProject(id) {
    var found = null;
    intervalTree.some(function (interval) {
      return interval.projects.some(function (p) {
        if (String(p.id) === String(id)) {
          found = p;
          return true;
        }
      });
    });
    return found;
  }

  function statusClass(status) {
    if (status === "未复核") return "alert-wf-status--pending";
    if (status === "已复核") return "alert-wf-status--reviewed";
    if (status === "审核通过") return "alert-wf-status--passed";
    if (status === "审核不通过") return "alert-wf-status--rejected";
    return "";
  }

  var INTERVAL_ORDER = [];

  var activeListFilters = {
    handleMode: "",
    timeStart: "",
    timeEnd: "",
    source: "",
    intervalStart: "",
    intervalEnd: "",
  };

  function rebuildIntervalOrder() {
    INTERVAL_ORDER = intervalTree.map(function (interval) {
      return interval.area;
    });
  }

  function intervalOrderIndex(area) {
    var idx = INTERVAL_ORDER.indexOf(area);
    return idx < 0 ? null : idx;
  }

  function projectIntervalInRange(project, interval, filters) {
    var area = project.alarmArea || interval.area;
    var idx = intervalOrderIndex(area);
    if (idx == null) return true;
    var startIdx = filters.intervalStart ? intervalOrderIndex(filters.intervalStart) : null;
    var endIdx = filters.intervalEnd ? intervalOrderIndex(filters.intervalEnd) : null;
    if (startIdx == null && endIdx == null) return true;
    if (startIdx != null && endIdx != null && startIdx > endIdx) {
      var tmp = startIdx;
      startIdx = endIdx;
      endIdx = tmp;
    }
    if (startIdx != null && idx < startIdx) return false;
    if (endIdx != null && idx > endIdx) return false;
    return true;
  }

  function parseAlertTime(str) {
    if (!str) return null;
    var normalized = String(str).trim().replace(" ", "T");
    var date = new Date(normalized);
    return isNaN(date.getTime()) ? null : date;
  }

  function readListFiltersFromForm() {
    var handleModeEl = document.getElementById("alert-filter-handle-mode");
    var timeStartEl = document.getElementById("alert-filter-time-start");
    var timeEndEl = document.getElementById("alert-filter-time-end");
    var sourceEl = document.getElementById("alert-filter-source");
    var intervalStartEl = document.getElementById("alert-filter-interval-start");
    var intervalEndEl = document.getElementById("alert-filter-interval-end");
    return {
      handleMode: handleModeEl ? handleModeEl.value : "",
      timeStart: timeStartEl ? timeStartEl.value : "",
      timeEnd: timeEndEl ? timeEndEl.value : "",
      source: sourceEl ? sourceEl.value : "",
      intervalStart: intervalStartEl ? intervalStartEl.value : "",
      intervalEnd: intervalEndEl ? intervalEndEl.value : "",
    };
  }

  function resetListFilterForm() {
    ["alert-filter-handle-mode", "alert-filter-source", "alert-filter-interval-start", "alert-filter-interval-end"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = "";
    });
    ["alert-filter-time-start", "alert-filter-time-end"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) el.value = "";
    });
    activeListFilters = {
      handleMode: "",
      timeStart: "",
      timeEnd: "",
      source: "",
      intervalStart: "",
      intervalEnd: "",
    };
  }

  function projectMatchesListFilters(project, interval, filters) {
    if (!projectIntervalInRange(project, interval, filters)) return false;
    if (filters.handleMode && project.handleMode !== filters.handleMode) return false;
    if (filters.source && project.source !== filters.source) return false;
    var projectTime = parseAlertTime(project.startTime);
    if (filters.timeStart) {
      var rangeStart = parseAlertTime(filters.timeStart);
      if (rangeStart && projectTime && projectTime < rangeStart) return false;
    }
    if (filters.timeEnd) {
      var rangeEnd = parseAlertTime(filters.timeEnd);
      if (rangeEnd && projectTime && projectTime > rangeEnd) return false;
    }
    return true;
  }

  function getFilteredTreeGroups() {
    var filters = activeListFilters;
    var groups = [];
    intervalTree.forEach(function (interval) {
      var projects = interval.projects.filter(function (p) {
        return projectMatchesListFilters(p, interval, filters);
      });
      if (!projects.length) return;
      groups.push({ interval: interval, projects: projects });
    });
    return groups;
  }

  function csvEscape(value) {
    var text = value == null ? "" : String(value);
    if (/[",\r\n]/.test(text)) return '"' + text.replace(/"/g, '""') + '"';
    return text;
  }

  function exportFilteredAlerts() {
    var groups = getFilteredTreeGroups();
    var headers = [
      "项目名称",
      "报警位置",
      "报警区间",
      "开始时间",
      "最新时间",
      "告警来源",
      "告警处理状态",
      "处理状态",
      "是否误报",
      "复核情况",
    ];
    var lines = [headers.join(",")];
    groups.forEach(function (group) {
      group.projects.forEach(function (p) {
        lines.push(
          [
            p.projectName,
            p.alarmPosition,
            p.alarmArea,
            p.startTime,
            p.latestTime,
            p.source,
            p.handleMode,
            p.workflowStatus,
            p.mistaken || "—",
            p.detail || "—",
          ]
            .map(csvEscape)
            .join(",")
        );
      });
    });
    var blob = new Blob(["\uFEFF" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "告警列表_" + new Date().toISOString().slice(0, 10) + ".csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    if (window.WuhanExpertReviewModal && window.WuhanExpertReviewModal.showToast) {
      window.WuhanExpertReviewModal.showToast("已导出 " + (lines.length - 1) + " 条告警记录");
    }
  }

  function populateIntervalFilterOptions() {
    rebuildIntervalOrder();
    var startSelect = document.getElementById("alert-filter-interval-start");
    var endSelect = document.getElementById("alert-filter-interval-end");
    if (!startSelect || !endSelect) return;
    var startCurrent = startSelect.value;
    var endCurrent = endSelect.value;
    var optionsHtml = "";
    intervalTree.forEach(function (interval) {
      optionsHtml +=
        '<option value="' +
        interval.area.replace(/"/g, "&quot;") +
        '">' +
        interval.area +
        "</option>";
    });
    startSelect.innerHTML = '<option value="">起始区间</option>' + optionsHtml;
    endSelect.innerHTML = '<option value="">终止区间</option>' + optionsHtml;
    if (startCurrent) startSelect.value = startCurrent;
    if (endCurrent) endSelect.value = endCurrent;
  }

  function initListFilters() {
    populateIntervalFilterOptions();
    var searchBtn = document.getElementById("alert-filter-search");
    var resetBtn = document.getElementById("alert-filter-reset");
    var exportBtn = document.getElementById("alert-filter-export");
    if (searchBtn) {
      searchBtn.addEventListener("click", function () {
        activeListFilters = readListFiltersFromForm();
        renderTree();
      });
    }
    if (resetBtn) {
      resetBtn.addEventListener("click", function () {
        resetListFilterForm();
        renderTree();
      });
    }
    if (exportBtn) {
      exportBtn.addEventListener("click", exportFilteredAlerts);
    }
  }

  function renderActions(project) {
    var s = project.workflowStatus;
    var btns = [];
    btns.push('<button type="button" class="alert-op-btn" data-action="detail" data-id="' + project.id + '">详情</button>');
    if (s === "未复核") {
      btns.push('<button type="button" class="alert-op-btn" data-action="review" data-id="' + project.id + '">复核</button>');
    }
    if (s === "已复核") {
      btns.push('<button type="button" class="alert-op-btn" data-action="audit" data-id="' + project.id + '">审核</button>');
    }
    btns.push('<button type="button" class="alert-op-btn" data-action="locate" data-id="' + project.id + '">定位</button>');
    return btns.join("");
  }

  function renderTree() {
    var body = document.getElementById("alert-tree-body");
    if (!body) return;
    var rows = [];
    var groups = getFilteredTreeGroups();

    if (!groups.length) {
      body.innerHTML =
        '<tr><td colspan="13" class="alert-tree-empty">暂无符合筛选条件的告警记录</td></tr>';
      return;
    }

    groups.forEach(function (group) {
      var interval = group.interval;
      var visibleCount = group.projects.length;
      rows.push(
        '<tr class="alert-tree-row--parent" data-interval-id="' +
          interval.id +
          '">' +
          '<td class="alert-tree-toggle"><i class="fa-solid fa-chevron-' +
          (interval.expanded ? "down" : "right") +
          '"></i></td>' +
          "<td>—</td>" +
          "<td>—</td>" +
          "<td>" +
          interval.area +
          "</td>" +
          "<td>" +
          interval.startTime +
          "</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td><td>—</td>" +
          "<td><strong>" +
          visibleCount +
          "</strong></td>" +
          "<td>—</td>" +
          "</tr>"
      );

      group.projects.forEach(function (p) {
        var hidden = interval.expanded ? "" : " is-collapsed";
        rows.push(
          '<tr class="alert-tree-row--child' +
            hidden +
            '" data-interval-id="' +
            interval.id +
            '" data-project-id="' +
            p.id +
            '">' +
            '<td></td>' +
            '<td class="alert-tree-name--child">' +
            p.projectName +
            "</td>" +
            "<td>" +
            p.alarmPosition +
            "</td>" +
            "<td>" +
            p.alarmArea +
            "</td>" +
            "<td>" +
            p.startTime +
            "</td>" +
            "<td>" +
            p.latestTime +
            "</td>" +
            "<td>" +
            p.source +
            "</td>" +
            '<td><span class="alert-wf-status ' +
            statusClass(p.workflowStatus) +
            '">' +
            p.workflowStatus +
            "</span></td>" +
            "<td>" +
            (p.mistaken || "—") +
            "</td>" +
            "<td>" +
            (p.detail || "—") +
            "</td>" +
            '<td><img src="' +
            p.image +
            '" alt="" class="h-12 w-16 rounded object-cover border border-white/10" /></td>' +
            '<td class="alert-tree-count-hidden">—</td>' +
            "<td>" +
            renderActions(p) +
            "</td>" +
            "</tr>"
        );
      });
    });

    body.innerHTML = rows.join("");
    bindTreeEvents();
  }

  function bindTreeEvents() {
    document.querySelectorAll(".alert-tree-row--parent").forEach(function (row) {
      row.addEventListener("click", function (e) {
        if (e.target.closest("[data-action]")) return;
        var id = row.getAttribute("data-interval-id");
        var interval = intervalTree.filter(function (x) {
          return x.id === id;
        })[0];
        if (!interval) return;
        interval.expanded = !interval.expanded;
        renderTree();
      });
    });

    document.querySelectorAll("[data-action]").forEach(function (btn) {
      btn.addEventListener("click", function (e) {
        e.stopPropagation();
        var id = btn.getAttribute("data-id");
        var action = btn.getAttribute("data-action");
        var project = findProject(id);
        if (!project) return;
        if (action === "detail") showDetailView(project);
        if (action === "review") openReviewFor(project);
        if (action === "audit") openAuditFor(project);
        if (action === "locate") locateProject(project);
      });
    });
  }

  function locateProject(project) {
    if (!listMapApi || !listMapApi.map) return;
    var map = listMapApi.map;
    map.setView(project.latlng, project.zoom || 14);
    if (locateMarker) {
      map.removeLayer(locateMarker);
    }
    var icon = window.WuhanGIS && window.WuhanGIS.makeBadgeIcon
      ? window.WuhanGIS.makeBadgeIcon("#ef4444", "fa-solid fa-location-crosshairs", 28)
      : null;
    locateMarker = L.marker(project.latlng, { icon: icon || undefined, zIndexOffset: 800 }).addTo(map);
    locateMarker.bindTooltip(project.projectName, { permanent: false, direction: "top" }).openTooltip();
    if (window.WuhanExpertReviewModal) {
      window.WuhanExpertReviewModal.showToast("已在地图上定位：" + project.projectName);
    }
  }

  function openReviewFor(project) {
    if (!window.WuhanExpertReviewModal) return;
    window.WuhanExpertReviewModal.openReview(
      {
        falseAlarm: project.review ? project.review.falseAlarm : "非误报",
        levelAdjust: project.review ? project.review.levelAdjust : "一级告警",
        scene: project.review ? project.review.scene : project.detail,
        photos: project.review && project.review.photos ? project.review.photos : [project.image],
      },
      function (data) {
        var t = window.WuhanExpertReviewModal.nowStr();
        project.workflowStatus = "已复核";
        project.mistaken = data.mistaken;
        project.detail = data.scene || data.detail;
        project.review = {
          falseAlarm: data.falseAlarm,
          levelAdjust: data.levelAdjust,
          scene: data.scene,
          photos: data.photos.slice(),
        };
        project.uavRecord = Object.assign({}, project.uavRecord, {
          time: t.slice(0, 16),
          mistaken: data.mistaken,
          level: data.levelAdjust,
          situation: data.scene,
          image: data.photos[0] || project.image,
        });
        project.image = data.photos[0] || project.image;
        project.disposalRecord.push({
          time: t,
          type: "review",
          text: (project.uavRecord.user || "值班人员") + "提交现场复核情况",
          review: true,
        });
        renderTree();
        if (currentAlert && currentAlert.id === project.id) fillDetail(project);
      }
    );
  }

  function openAuditFor(project) {
    if (!window.WuhanExpertReviewModal) return;
    window.WuhanExpertReviewModal.openAudit(function (decision) {
      var t = window.WuhanExpertReviewModal.nowStr();
      project.workflowStatus = decision.result;
      project.disposalRecord.push({
        time: t,
        type: "audit",
        text: "管理员审批",
        auditor: "管理员",
        result: decision.result,
        opinion: decision.opinion,
      });
      renderTree();
      if (currentAlert && currentAlert.id === project.id) fillDetail(project);
    });
  }

  function renderDisposal(item) {
    if (window.AlertDisposalTimeline) {
      return AlertDisposalTimeline.render(item);
    }
    return '<div class="alert-disposal-empty">暂无处警记录</div>';
  }

  function fillDetail(item) {
    var noteText = (item.locationNote || "").trim();
    document.getElementById("alert-detail-grid").innerHTML = [
      ["项目名称", item.projectName || "—"],
      ["报警类型", item.type],
      ["报警区间", item.section],
      ["位置", item.location],
      ["测点编码", '<span class="alert-code-tag">' + item.code + "</span>"],
      ["报警开始时间", item.startTime],
      ["最新报警时间", item.lastTime],
      ["处理状态", item.workflowStatus],
      ["频谱图", "已生成"],
      [
        "频谱图操作",
        '<span class="alert-detail-link">生成</span><a href="map-expert.html" class="alert-detail-link">查看</a><span class="alert-detail-link">典型事件标注</span>',
      ],
      [
        "当前位置备注",
        noteText
          ? noteText
          : '<span class="alert-detail-note-empty">暂无备注</span>',
        "full",
      ],
    ]
      .map(function (pair) {
        var fullClass = pair[2] === "full" ? " alert-detail-item--full" : "";
        return (
          '<div class="alert-detail-item' +
          fullClass +
          '"><div class="alert-detail-key">' +
          pair[0] +
          '</div><div class="alert-detail-val">' +
          (pair[1] || "&nbsp;") +
          "</div></div>"
        );
      })
      .join("");

    var alarmRec = getAlarmRecordDisplay(item);
    document.getElementById("record-alarm").innerHTML =
      '<div class="flex items-center justify-center gap-3 mb-3">' +
      '<span class="alert-dot"></span>' +
      '<span class="alert-code-tag">' +
      alarmRec.code +
      "</span>" +
      '<span class="alert-duration-pill">持续时间：' +
      alarmRec.duration +
      "</span></div>" +
      '<div class="text-center text-[18px] text-slate-500">' +
      alarmRec.range +
      "</div>";

    document.getElementById("record-uav").innerHTML =
      '<div class="alert-uav-shot"><img src="' +
      (item.uavRecord.image || item.image) +
      '" alt="无人机实拍记录" /></div>';
    document.getElementById("record-disposal").innerHTML = renderDisposal(item);
  }

  function showListView() {
    document.getElementById("view-list").classList.remove("hidden-view");
    document.getElementById("view-detail").classList.add("hidden-view");
    setTimeout(function () {
      if (listMapApi && listMapApi.map) listMapApi.map.invalidateSize();
    }, 80);
  }

  function showDetailView(item) {
    currentAlert = item;
    fillDetail(item);
    document.getElementById("view-list").classList.add("hidden-view");
    document.getElementById("view-detail").classList.remove("hidden-view");

    mountDetailMap(item);
    setTimeout(function () {
      if (detailMapApi && detailMapApi.map && detailMapApi.map.invalidateSize) {
        detailMapApi.map.invalidateSize();
      }
    }, 50);
  }

  function mountDetailMap(item) {
    if (!window.WuhanSituationGIS || !window.WuhanSituationGIS.mountAlarmMap) return;
    var container = document.getElementById("alert-detail-map");
    if (!container) return;
    if (detailMapApi && detailMapApi.map) {
      detailMapApi.map.remove();
      detailMapApi = null;
    }
    container.innerHTML = "";
    var row = projectToAlarmRow(item);
    detailMapApi = window.WuhanSituationGIS.mountAlarmMap("alert-detail-map", {
      rows: [row],
      highlightLocation: row.location,
      focusZoom: item.zoom != null ? item.zoom : 14,
      zoomControl: true,
    });
  }

  function initSituationMap() {
    if (window.WuhanSituationGIS && window.WuhanSituationGIS.mountAlarmMap) {
      listMapApi = window.WuhanSituationGIS.mountAlarmMap("alerts-situation-map", {
        onMarkerClick: function () {},
      });
    }
  }

  function getAlertByQuery() {
    var params = new URLSearchParams(window.location.search);
    var id = params.get("id");
    if (id) return findProject(id) || allProjects()[0];
    if (params.get("view") === "detail") {
      return findProject(201) || allProjects()[0];
    }
    return null;
  }

  function initNavigation() {
    var backBtn = document.getElementById("alert-back-list");
    if (backBtn) backBtn.addEventListener("click", showListView);
  }

  function init() {
    initListFilters();
    renderTree();
    initSituationMap();
    initNavigation();
    currentAlert = allProjects()[0];
    var queryAlert = getAlertByQuery();
    if (queryAlert && new URLSearchParams(window.location.search).get("view") === "detail") {
      showDetailView(queryAlert);
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
