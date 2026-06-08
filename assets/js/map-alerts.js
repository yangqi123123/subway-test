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

  function patrolEventImageUrl() {
    var root = typeof window !== "undefined" ? window : typeof globalThis !== "undefined" ? globalThis : {};
    if (root.WHPatrolPreviewAssets && root.WHPatrolPreviewAssets.eventUrl) {
      return root.WHPatrolPreviewAssets.eventUrl();
    }
    if (typeof root.whAsset === "function") return root.whAsset("assets/images/flight-report-event.png");
    return DEFAULT_PHOTOS[0];
  }

  /** 告警来源 / 处理状态（全时全域） */
  var ALERT_SOURCE_AI = "全时全域·AI";
  var ALERT_SOURCE_TRADITIONAL = "全时全域·传统";
  var ALERT_SOURCE_MIXED = "全时全域·传统+AI";
  var ALERT_SOURCE_UAV = "无人机";
  var ALERT_SOURCE_FULLTIME = "全时全域";
  var ALERT_HANDLE_MODE_OPTIONS = [ALERT_SOURCE_AI, ALERT_SOURCE_TRADITIONAL, ALERT_SOURCE_MIXED];

  function isFulltimeAlertSource(source) {
    if (source == null || source === "") return false;
    if (source === ALERT_SOURCE_UAV) return false;
    return String(source).indexOf("全时全域") >= 0;
  }

  function formatAlertSourceDisplay(source) {
    if (source == null || source === "") return "—";
    if (isFulltimeAlertSource(source)) return ALERT_SOURCE_FULLTIME;
    return String(source);
  }

  function createProject(base) {
    return Object.assign(
      {
        id: 0,
        projectName: "",
        alarmPosition: "",
        alarmArea: "",
        startTime: "",
        latestTime: "",
        source: ALERT_SOURCE_AI,
        handleMode: ALERT_SOURCE_AI,
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
      count: 5,
      expanded: true,
      projects: [
        createProject({
          id: 205,
          projectName: "梨园站保护区无人机巡线",
          alarmPosition: "里程 V20+072 左线外侧",
          alarmArea: "中南医院站-湖北日报站",
          startTime: "2026-05-13 11:22:18",
          latestTime: "2026-05-13 11:28:46",
          lastTime: "2026-05-13 11:28:46",
          section: "中南医院站-湖北日报站",
          location: "里程 V20+072 左线外侧",
          source: ALERT_SOURCE_UAV,
          line: "2号线",
          flightLine: "2号线",
          flightRoute: "梨园-中南医院演示航线",
          flightAirport: "梨园机场",
          flightDrone: "梨园巡检无人机 M30T",
          handleMode: ALERT_SOURCE_AI,
          workflowStatus: "未复核",
          mistaken: "否",
          type: "疑似机械施工",
          code: "7.0.348.U",
          detail: "",
          locationNote: "无人机巡线识别保护区外侧疑似机械作业，待 AI 复核确认。",
          latlng: [30.5868, 114.3145],
          mapCenter: [30.5868, 114.3145],
          aiAlertId: "UAV-20260513-205",
          alertTime: "2026-05-13 11:22:18",
          geoCoord: "114.3145, 30.5868",
          position: "保护区范围内",
          riskLevel: "严重",
          image: DEFAULT_PHOTOS[2] || DEFAULT_PHOTOS[0],
          approvalRecords: [
            {
              time: "2026-05-13 11:35:20",
              text: "AI识别审批",
              falseAlarm: "否",
              illegalConstruction: "是",
              riskLevel: "严重",
              approvalContent: "无人机识别到保护区外侧疑似机械作业，已推送现场核查。",
            },
            {
              time: "2026-05-13 14:20:08",
              text: "值班员复核审批",
              falseAlarm: "否",
              illegalConstruction: "否",
              riskLevel: "一般",
              approvalContent: "现场复核为塔吊例行维保作业，已要求施工方加强降噪与围挡管控。",
            },
          ],
          alarmRecord: {
            code: "7.0.348.U",
            startTime: "05-13 11:22:18",
            endTime: "05-13 11:28:46",
            duration: "6min",
          },
          disposalRecord: [
            { time: "2026-05-13 11:22:18", type: "alarm", text: "无人机巡线识别风险，系统推送告警信息" },
          ],
          uavRecord: {
            time: "2026-05-13 11:28:46",
            user: "梨园巡检组",
            mistaken: "否",
            level: "严重",
            situation: "无人机航拍可见保护区外侧机械作业面",
            image: DEFAULT_PHOTOS[2] || DEFAULT_PHOTOS[0],
          },
        }),
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
          handleMode: ALERT_SOURCE_AI,
          line: "2号线",
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
            image: patrolEventImageUrl(),
          },
          image: patrolEventImageUrl(),
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
          handleMode: ALERT_SOURCE_MIXED,
          source: ALERT_SOURCE_MIXED,
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
          projectName: "后湖大道市政管廊项目",
          alarmPosition: "里程Z31+480,左线外侧15米",
          alarmArea: "宏图大道-市民之家",
          startTime: "2026-03-05 09:10:02",
          latestTime: "2026-03-05 09:18:44",
          lastTime: "2026-03-05 09:18:44",
          section: "宏图大道-市民之家",
          location: "里程Z31+480,左线外侧15米",
          workflowStatus: "已复核",
          source: ALERT_SOURCE_TRADITIONAL,
          handleMode: ALERT_SOURCE_TRADITIONAL,
          mistaken: "否",
          detail: "现场钻探施工已复核，管控措施已落实",
          latlng: [30.618, 114.328],
          mapCenter: [30.618, 114.328],
          type: "疑似钻探施工",
          review: {
            falseAlarm: "非误报",
            levelAdjust: "二级告警",
            scene: "现场钻探施工已复核，管控措施已落实",
            photos: [DEFAULT_PHOTOS[1]],
          },
          alarmRecord: {
            code: "7.0.347.T",
            startTime: "03-05 09:10:02",
            endTime: "03-05 09:18:44",
            duration: "8min",
          },
          disposalRecord: [
            { time: "2026-03-05 09:10:02", type: "alarm", text: "告警产生，系统发送告警信息" },
            {
              time: "2026-03-05 09:18:44",
              type: "review",
              text: "hudanfeng提交现场复核情况",
              review: true,
              falseAlarm: "非误报",
              levelAdjust: "二级告警",
              scene: "现场钻探施工已复核，管控措施已落实",
            },
          ],
        }),
        /* 演示数据暂隐藏：审核通过
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
          handleMode: ALERT_SOURCE_AI,
          source: ALERT_SOURCE_TRADITIONAL,
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
        演示数据暂隐藏：审核不通过
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
          handleMode: ALERT_SOURCE_TRADITIONAL,
          source: ALERT_SOURCE_MIXED,
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
        */
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
          source: ALERT_SOURCE_TRADITIONAL,
          handleMode: ALERT_SOURCE_TRADITIONAL,
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

  function projectFromGisAlarm(id) {
    var gis = window.WuhanGIS;
    if (!gis || !Array.isArray(gis.defaultAlarmDetails)) return null;
    var alarm = null;
    gis.defaultAlarmDetails.some(function (item) {
      if (String(item.alertId) === String(id)) {
        alarm = item;
        return true;
      }
    });
    if (!alarm) return null;
    var ll = alarm.ll || [30.618, 114.328];
    return createProject({
      id: alarm.alertId,
      projectName: alarm.projectName,
      alarmPosition: alarm.alarmPosition,
      alarmArea: alarm.alarmSection,
      section: alarm.alarmSection,
      location: alarm.alarmPosition,
      startTime: alarm.startTime,
      latestTime: alarm.latestTime,
      lastTime: alarm.latestTime,
      workflowStatus: alarm.status || "未复核",
      source: ALERT_SOURCE_TRADITIONAL,
      handleMode: ALERT_SOURCE_TRADITIONAL,
      mistaken: "否",
      detail: alarm.status === "已复核" ? "现场复核已完成" : "",
      latlng: ll,
      mapCenter: ll,
      type: "疑似钻探施工",
      review: {
        falseAlarm: "非误报",
        levelAdjust: "二级告警",
        scene: alarm.status === "已复核" ? "现场复核已完成" : "",
        photos: DEFAULT_PHOTOS.slice(0, 1),
      },
      alarmRecord: {
        code: "7.0.347.T",
        startTime: formatAlarmShortLabel(alarm.startTime),
        endTime: formatAlarmShortLabel(alarm.latestTime),
        duration: formatAlarmDurationLabel(alarm.startTime, alarm.latestTime),
      },
      disposalRecord: [
        { time: alarm.startTime, type: "alarm", text: "告警产生，系统发送告警信息" },
      ].concat(
        alarm.status === "已复核"
          ? [
              {
                time: alarm.latestTime,
                type: "review",
                text: "hudanfeng提交现场复核情况",
                review: true,
                falseAlarm: "非误报",
                levelAdjust: "二级告警",
                scene: "现场复核已完成",
              },
            ]
          : []
      ),
    });
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
    if (found) return found;
    return projectFromGisAlarm(id);
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
    workflowStatus: "",
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

  function matchesWorkflowStatusFilter(project, status) {
    if (!status) return true;
    var workflowStatus = project.workflowStatus || "";
    if (status === "未复核") return workflowStatus === "未复核";
    if (status === "已复核") return workflowStatus !== "未复核";
    return workflowStatus === status;
  }

  function readListFiltersFromForm() {
    var workflowStatusEl = document.getElementById("alert-filter-handle-mode");
    var timeStartEl = document.getElementById("alert-filter-time-start");
    var timeEndEl = document.getElementById("alert-filter-time-end");
    var sourceEl = document.getElementById("alert-filter-source");
    var intervalStartEl = document.getElementById("alert-filter-interval-start");
    var intervalEndEl = document.getElementById("alert-filter-interval-end");
    return {
      workflowStatus: workflowStatusEl ? workflowStatusEl.value : "",
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
      workflowStatus: "",
      timeStart: "",
      timeEnd: "",
      source: "",
      intervalStart: "",
      intervalEnd: "",
    };
  }

  function projectMatchesListFilters(project, interval, filters) {
    if (!projectIntervalInRange(project, interval, filters)) return false;
    if (!matchesWorkflowStatusFilter(project, filters.workflowStatus)) return false;
    if (filters.source) {
      if (filters.source === ALERT_SOURCE_FULLTIME) {
        if (!isFulltimeAlertSource(project.source)) return false;
      } else if (project.source !== filters.source) return false;
    }
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

  function getFilteredProjects() {
    return getFilteredTreeGroups().reduce(function (list, group) {
      return list.concat(group.projects);
    }, []);
  }

  function applyListFiltersFromForm() {
    activeListFilters = readListFiltersFromForm();
  }

  function notifyListChanged() {
    renderTree();
    if (typeof document !== "undefined") {
      document.dispatchEvent(new Event("wh-map-alerts-list-change"));
    }
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
            formatAlertSourceDisplay(p.source),
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

  var ALERT_FLIGHT_PREFILL_BY_LINE = {
    "2号线": {
      line: "2号线",
      route: "梨园-中南医院演示航线",
      airport: "梨园机场",
      drone: "梨园巡检无人机 M30T",
    },
    "5号线": {
      line: "5号线",
      route: "青山站周期巡检航线",
      airport: "青山机场",
      drone: "青山巡检无人机 M350",
    },
    "8号线": {
      line: "8号线",
      route: "车辆段日常巡查航线",
      airport: "车辆段机场",
      drone: "车辆段无人机 M350",
    },
  };

  var reviewProjectSelectInst = null;

  function isUavSourceAlert(project) {
    return project.source === ALERT_SOURCE_UAV;
  }

  function isAiClassSource(project) {
    return project.source === ALERT_SOURCE_AI || project.source === ALERT_SOURCE_MIXED;
  }

  function usesReviewDropdown(project) {
    return isAiClassSource(project);
  }

  function collectProjectNameOptions() {
    var names = [];
    allProjects().forEach(function (p) {
      if (p.projectName && names.indexOf(p.projectName) < 0) names.push(p.projectName);
    });
    return names.sort(function (a, b) {
      return a.localeCompare(b, "zh-CN");
    });
  }

  function getReviewProjectSelect() {
    if (!window.WHSearchSelect) return null;
    if (!reviewProjectSelectInst) {
      reviewProjectSelectInst = WHSearchSelect.mountById(
        "review-project-name-select",
        "请搜索或选择项目名称",
        collectProjectNameOptions()
      );
    }
    return reviewProjectSelectInst;
  }

  function resolveFlightPrefill(project) {
    if (project.flightRoute) {
      return {
        line: project.flightLine || project.line || "2号线",
        route: project.flightRoute,
        airport: project.flightAirport,
        drone: project.flightDrone,
      };
    }
    var line = project.line || "2号线";
    return ALERT_FLIGHT_PREFILL_BY_LINE[line] || ALERT_FLIGHT_PREFILL_BY_LINE["2号线"];
  }

  function buildAlertFlightPlanName(project) {
    var time = project.latestTime || project.startTime || "";
    return (project.projectName || "告警复核") + (time ? " " + time : "");
  }

  function restoreReviewMenu(menu) {
    if (!menu || !menu._origParent) return;
    menu.classList.remove("alert-review-menu--floating", "is-visible");
    menu.style.left = "";
    menu.style.top = "";
    menu._origParent.appendChild(menu);
  }

  function positionFloatingReviewMenu(wrap) {
    var menu = wrap.querySelector(".alert-review-menu");
    var btn = wrap.querySelector('[data-action="review-menu"]');
    if (!menu || !btn) return;
    if (!menu._origParent) menu._origParent = wrap;
    wrap._reviewMenuEl = menu;
    document.body.appendChild(menu);
    menu.classList.add("alert-review-menu--floating", "is-visible");
    var rect = btn.getBoundingClientRect();
    var gap = 4;
    var menuW = menu.offsetWidth || 108;
    var menuH = menu.offsetHeight || 72;
    var left = rect.right - menuW;
    var top = rect.bottom + gap;
    if (top + menuH > window.innerHeight - 8) {
      top = rect.top - menuH - gap;
    }
    left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
    top = Math.max(8, Math.min(top, window.innerHeight - menuH - 8));
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function closeAllReviewMenus(exceptWrap) {
    document.querySelectorAll("body > .alert-review-menu").forEach(function (menu) {
      var parent = menu._origParent;
      if (exceptWrap && parent === exceptWrap) return;
      restoreReviewMenu(menu);
    });
    document.querySelectorAll(".alert-op-review-wrap.is-open").forEach(function (wrap) {
      if (exceptWrap && wrap === exceptWrap) return;
      wrap.classList.remove("is-open");
      var menu = wrap._reviewMenuEl || wrap.querySelector(".alert-review-menu");
      if (menu && menu.parentElement === document.body) restoreReviewMenu(menu);
    });
  }

  function renderReviewAction(project) {
    return (
      '<span class="alert-op-review-wrap">' +
      '<button type="button" class="alert-op-btn" data-action="review-menu" data-id="' +
      project.id +
      '">复核</button>' +
      '<div class="alert-review-menu" role="menu">' +
      '<button type="button" class="alert-review-menu__item" data-action="review-manual" data-id="' +
      project.id +
      '">人工复核</button>' +
      '<button type="button" class="alert-review-menu__item" data-action="review-uav" data-id="' +
      project.id +
      '">无人机复核</button>' +
      "</div></span>"
    );
  }

  function renderActions(project) {
    var s = project.workflowStatus;
    var isUav = isUavSourceAlert(project);
    var btns = [];
    btns.push('<button type="button" class="alert-op-btn" data-action="detail" data-id="' + project.id + '">详情</button>');
    if (isUav || s === "未复核") {
      if (usesReviewDropdown(project)) btns.push(renderReviewAction(project));
      else btns.push('<button type="button" class="alert-op-btn" data-action="review" data-id="' + project.id + '">复核</button>');
    }
    if (!isUav && s === "已复核") {
      // btns.push('<button type="button" class="alert-op-btn" data-action="audit" data-id="' + project.id + '">审核</button>');
    }
    btns.push('<button type="button" class="alert-op-btn" data-action="locate" data-id="' + project.id + '">定位</button>');
    return '<div class="disease-op-actions">' + btns.join("") + "</div>";
  }

  function openAiReviewFor(project) {
    var aiId = project.aiAlertId || "UAV-" + project.id;
    var base = typeof whPageHref === "function" ? whPageHref("ai/ai.html") : "ai/ai.html";
    window.location.href = base + "?id=" + encodeURIComponent(aiId) + "&from=alerts";
  }

  function openDroneReviewFor(project) {
    var flight = resolveFlightPrefill(project);
    var prefill = {
      name: buildAlertFlightPlanName(project),
      line: flight.line,
      route: flight.route,
      airport: flight.airport,
      drone: flight.drone,
      type: "告警复核",
      lockType: true,
      submitExec: "未执行",
      alertId: project.id,
    };
    try {
      sessionStorage.setItem("whFlightPlanAlertPrefill", JSON.stringify(prefill));
    } catch (e) {}
    var base =
      typeof whPageHref === "function" ? whPageHref("map/map-flight-plan.html") : "map-flight-plan.html";
    window.location.href = base + "?create=1&fromAlert=1&alertId=" + encodeURIComponent(String(project.id));
  }

  function renderTree() {
    closeAllReviewMenus();
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
          '<td class="disease-col-actions">—</td>' +
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
            formatAlertSourceDisplay(p.source) +
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
            '<td class="disease-col-actions">' +
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

    document.querySelectorAll(".alert-tree-row--child").forEach(function (row) {
      row.style.cursor = "pointer";
      row.addEventListener("click", function (e) {
        if (e.target.closest("[data-action], button, a, input, .disease-col-actions")) return;
        var id = row.getAttribute("data-project-id");
        var project = findProject(id);
        if (project) showDetailView(project);
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
        if (action === "review-menu") {
          var wrap = btn.closest(".alert-op-review-wrap");
          if (!wrap) return;
          var willOpen = !wrap.classList.contains("is-open");
          closeAllReviewMenus();
          if (willOpen) {
            wrap.classList.add("is-open");
            positionFloatingReviewMenu(wrap);
          }
          return;
        }
        if (action === "review-manual") {
          closeAllReviewMenus();
          openManualReviewFor(project);
          return;
        }
        if (action === "review-uav") {
          closeAllReviewMenus();
          openDroneReviewFor(project);
          return;
        }
        if (action === "review") {
          if (isUavSourceAlert(project)) openAiReviewFor(project);
          else openReviewFor(project);
        }
        if (action === "audit") openAuditFor(project);
        if (action === "locate") locateProject(project);
      });
    });

    if (!bindTreeEvents.reviewMenuDocBound) {
      bindTreeEvents.reviewMenuDocBound = true;
      document.addEventListener("click", function (e) {
        if (e.target.closest(".alert-review-menu") || e.target.closest(".alert-op-review-wrap")) return;
        closeAllReviewMenus();
      });
      window.addEventListener("resize", closeAllReviewMenus);
      var treeWrap = document.querySelector(".alert-tree-wrap");
      if (treeWrap) treeWrap.addEventListener("scroll", closeAllReviewMenus);
      var pageRoot = document.getElementById("page-root");
      if (pageRoot) pageRoot.addEventListener("scroll", closeAllReviewMenus);
    }
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

  function applyManualReviewSave(project, data, projectName) {
    if (!window.WuhanExpertReviewModal) return;
    var t = window.WuhanExpertReviewModal.nowStr();
    if (projectName) project.projectName = projectName;
    project.workflowStatus = "已复核";
    project.mistaken = data.mistaken;
    project.detail = data.scene || data.detail;
    project.review = {
      falseAlarm: data.falseAlarm,
      levelAdjust: data.levelAdjust,
      scene: data.scene,
      photos: data.photos.slice(),
      linkedProjectName: projectName || project.projectName,
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
    notifyListChanged();
    if (currentAlert && currentAlert.id === project.id) fillDetail(project);
  }

  function openReviewFor(project) {
    if (!window.WuhanExpertReviewModal) return;
    window.WuhanExpertReviewModal.openReview(
      {
        falseAlarm: project.review ? project.review.falseAlarm : "非误报",
        levelAdjust: project.review ? project.review.levelAdjust : "一级告警",
        scene: project.review ? project.review.scene : project.detail,
        photos: project.review && project.review.photos ? project.review.photos : [project.image],
        showProjectSelect: false,
      },
      function (data) {
        applyManualReviewSave(project, data);
      }
    );
  }

  function openManualReviewFor(project) {
    if (!window.WuhanExpertReviewModal) return;
    var selectEl = document.getElementById("review-project-name-select");
    var mobileSelect = selectEl && selectEl.tagName === "SELECT";
    window.WuhanExpertReviewModal.openReview(
      {
        falseAlarm: project.review ? project.review.falseAlarm : "非误报",
        levelAdjust: project.review ? project.review.levelAdjust : "一级告警",
        scene: project.review ? project.review.scene : project.detail,
        photos: project.review && project.review.photos ? project.review.photos : [project.image],
        showProjectSelect: true,
        projectName: project.projectName,
        projectNameOptions: collectProjectNameOptions(),
        onFormReady: mobileSelect
          ? undefined
          : function () {
              var sel = getReviewProjectSelect();
              if (sel) sel.setValue(project.projectName || "");
            },
      },
      function (data) {
        var picked = data.projectName || project.projectName;
        if (!mobileSelect) {
          var sel = getReviewProjectSelect();
          if (sel && sel.getValue) {
            var fromSelect = sel.getValue();
            if (fromSelect) picked = fromSelect;
          }
        }
        applyManualReviewSave(project, data, picked);
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
      notifyListChanged();
      if (currentAlert && currentAlert.id === project.id) fillDetail(project);
    });
  }

  function isPatrolMobileAlertPage() {
    return !!(
      document.body &&
      (document.body.classList.contains("mp-patrol-page") ||
        document.body.classList.contains("mp-patrol-alerts-page") ||
        document.body.classList.contains("mp-todo-page"))
    );
  }

  function traditionalDetailSpectrumRows(item) {
    if (isPatrolMobileAlertPage()) return [];
    var rows = [["频谱图", item.moment || "已生成"]];
    rows.push(["频谱图操作", renderSpectrumOpsHtml(item)]);
    return rows;
  }

  function renderDisposal(item) {
    if (window.AlertDisposalTimeline) {
      if (isPatrolMobileAlertPage() && AlertDisposalTimeline.renderAsRecordLog) {
        return AlertDisposalTimeline.renderAsRecordLog(item);
      }
      return AlertDisposalTimeline.render(item);
    }
    return '<div class="alert-disposal-empty">暂无处警记录</div>';
  }

  function renderApprovalRecords(item) {
    if (window.AlertDisposalTimeline && window.AlertDisposalTimeline.renderApproval) {
      if (isPatrolMobileAlertPage() && AlertDisposalTimeline.renderApprovalAsRecordLog) {
        return AlertDisposalTimeline.renderApprovalAsRecordLog(item);
      }
      return AlertDisposalTimeline.renderApproval(item);
    }
    return '<div class="alert-disposal-empty">暂无审批记录</div>';
  }

  function escHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function buildExpertToolsHref(item, extraParams) {
    item = item || {};
    var params = ["from=alerts"];
    if (item.id != null) params.push("alertId=" + encodeURIComponent(item.id));
    var loc = item.section || item.alarmArea || item.location || "";
    if (loc) params.push("location=" + encodeURIComponent(loc));
    if (extraParams && extraParams.length) params = params.concat(extraParams);
    var base =
      typeof whPageHref === "function" ? whPageHref("map/map-expert.html") : "map-expert.html";
    return base + (base.indexOf("?") >= 0 ? "&" : "?") + params.join("&");
  }

  function shouldNavigateSpectrumInTop() {
    return (
      document.documentElement.classList.contains("wh-embed-mode") ||
      document.body.getAttribute("data-shell") === "embed" ||
      window.self !== window.top
    );
  }

  function resolveAbsoluteHref(href) {
    try {
      return new URL(href, window.location.href).href;
    } catch (e) {
      return href;
    }
  }

  function navigateSpectrumExternal(href) {
    var url = resolveAbsoluteHref(href);
    if (shouldNavigateSpectrumInTop()) {
      try {
        window.top.location.href = url;
        return;
      } catch (e) {
        /* ignore cross-origin */
      }
    }
    window.location.href = url;
  }

  function renderSpectrumOpsHtml(item) {
    return (
      '<span class="alert-detail-link" data-spectrum-action="generate" role="button" tabindex="0">生成</span>' +
      '<a href="' +
      escHtml(buildExpertToolsHref(item)) +
      '" class="alert-detail-link" data-spectrum-action="view" target="_top" rel="noopener noreferrer">查看</a>' +
      '<a href="' +
      escHtml(buildExpertToolsHref(item, ["annotate=1"])) +
      '" class="alert-detail-link" data-spectrum-action="annotate" target="_top" rel="noopener noreferrer">典型事件标注</a>'
    );
  }

  function showAlertDetailToast(msg) {
    if (window.WuhanExpertReviewModal && window.WuhanExpertReviewModal.showToast) {
      window.WuhanExpertReviewModal.showToast(msg);
      return;
    }
    var el = document.getElementById("patrol-toast") || document.getElementById("expert-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showAlertDetailToast._t);
    showAlertDetailToast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 1800);
  }

  function refreshSpectrumStatusCell() {
    var grid = document.getElementById("alert-detail-grid");
    if (!grid || !currentAlert) return;
    grid.querySelectorAll(".alert-detail-item").forEach(function (node) {
      var key = node.querySelector(".alert-detail-key");
      if (!key || key.textContent !== "频谱图") return;
      var val = node.querySelector(".alert-detail-val");
      if (val) val.textContent = currentAlert.moment || "已生成";
    });
  }

  function initAlertDetailSpectrumOps() {
    if (initAlertDetailSpectrumOps.bound) return;
    initAlertDetailSpectrumOps.bound = true;
    document.addEventListener("click", function (e) {
      var actionEl = e.target.closest("[data-spectrum-action]");
      if (!actionEl || !actionEl.closest("#alert-detail-grid")) return;
      var action = actionEl.getAttribute("data-spectrum-action");
      if (action === "view" || action === "annotate") {
        if (!shouldNavigateSpectrumInTop()) return;
        var href = actionEl.getAttribute("href");
        if (!href) return;
        e.preventDefault();
        navigateSpectrumExternal(href);
        return;
      }
      e.preventDefault();
      if (!currentAlert) return;
      if (action === "generate") {
        currentAlert.moment = "已生成";
        refreshSpectrumStatusCell();
        showAlertDetailToast("频谱图已生成");
      }
    });
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Enter" && e.key !== " ") return;
      var actionEl = e.target.closest('[data-spectrum-action="generate"]');
      if (!actionEl || !actionEl.closest("#alert-detail-grid")) return;
      e.preventDefault();
      actionEl.click();
    });
  }

  function formatAlertGeoCoord(item) {
    if (item.geoCoord) return item.geoCoord;
    var ll = item.latlng;
    if (ll && ll.length >= 2) {
      return ll[1].toFixed(4) + ", " + ll[0].toFixed(4);
    }
    return "—";
  }

  function renderDetailGridRows(rows) {
    return rows
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
  }

  function setDetailSideLayout(isUavDetail) {
    var alarmCard = document.getElementById("record-alarm-card");
    var uavCard = document.getElementById("record-uav-card");
    var disposalTitle = document.getElementById("record-disposal-title");
    var detailShell = document.querySelector(".alert-detail-shell");
    if (alarmCard) alarmCard.classList.toggle("hidden", !!isUavDetail);
    if (uavCard) uavCard.classList.toggle("hidden", !isUavDetail);
    if (disposalTitle) disposalTitle.textContent = isUavDetail ? "审批记录" : "处警记录";
    if (detailShell) detailShell.classList.toggle("alert-detail-shell--uav", !!isUavDetail);
  }

  function isPortalDetailMode() {
    return !document.getElementById("record-alarm");
  }

  function fillDetailPortal(item) {
    var grid = document.getElementById("alert-detail-grid");
    if (!grid || !item) return;
    var disposalHost = document.getElementById("patrol-alert-disposal");
    var isUav = isUavSourceAlert(item);

    if (isUav) {
      grid.innerHTML = renderDetailGridRows([
        ["项目名称", item.projectName || "—"],
        ["告警来源", formatAlertSourceDisplay(item.source)],
        ["预警时间", item.alertTime || item.latestTime || item.startTime || "—"],
        ["地理坐标", formatAlertGeoCoord(item)],
        ["位置", item.position || item.alarmArea || item.location || "—"],
        ["等级", item.riskLevel || (item.uavRecord && item.uavRecord.level) || "—"],
      ]);
      if (disposalHost) {
        var uavImg =
          (item.uavRecord && item.uavRecord.image) || item.image
            ? '<div class="alert-uav-shot"><img src="' +
              ((item.uavRecord && item.uavRecord.image) || item.image) +
              '" alt="无人机实拍记录" /></div>'
            : "";
        disposalHost.innerHTML =
          uavImg + '<div class="mp-patrol-alert-disposal__section"><h4>审批记录</h4>' + renderApprovalRecords(item) + "</div>";
      }
      return;
    }

    var noteText = (item.locationNote || "").trim();
    grid.innerHTML = renderDetailGridRows(
      [
        ["项目名称", item.projectName || "—"],
        ["告警来源", formatAlertSourceDisplay(item.source || item.handleMode)],
        ["报警类型", item.type || "—"],
        ["报警区间", item.section || "—"],
        ["位置", item.location || item.alarmPosition || "—"],
        ["测点编码", item.code || "—"],
        ["报警开始时间", item.startTime || "—"],
        ["最新报警时间", item.lastTime || item.latestTime || "—"],
        ["处理状态", item.workflowStatus || "—"],
      ]
        .concat(traditionalDetailSpectrumRows(item))
        .concat([
          [
            "当前位置备注",
            noteText ? noteText : "暂无备注",
            "full",
          ],
        ])
    );
    if (disposalHost) {
      disposalHost.innerHTML =
        '<div class="mp-patrol-alert-disposal__section"><h4>处警记录</h4>' + renderDisposal(item) + "</div>";
    }
  }

  function fillUavSourceDetail(item) {
    var grid = document.getElementById("alert-detail-grid");
    if (grid) {
      grid.innerHTML = renderDetailGridRows([
        ["项目名称", item.projectName || "—"],
        ["告警来源", formatAlertSourceDisplay(item.source)],
        ["预警时间", item.alertTime || item.latestTime || item.startTime || "—"],
        [
          "地理坐标",
          '<span class="text-[#f8ff4d]">' + formatAlertGeoCoord(item) + "</span>",
        ],
        ["位置", item.position || item.alarmArea || item.location || "—"],
        ["等级", item.riskLevel || (item.uavRecord && item.uavRecord.level) || "—"],
      ]);
    }
    var recordAlarm = document.getElementById("record-alarm");
    if (recordAlarm) recordAlarm.innerHTML = "";
    var recordUav = document.getElementById("record-uav");
    if (recordUav) {
      recordUav.innerHTML =
        '<div class="alert-uav-shot"><img src="' +
        ((item.uavRecord && item.uavRecord.image) || item.image) +
        '" alt="无人机实拍记录" /></div>';
    }
    var recordDisposal = document.getElementById("record-disposal");
    if (recordDisposal) recordDisposal.innerHTML = renderApprovalRecords(item);
  }

  function fillTraditionalDetail(item) {
    var noteText = (item.locationNote || "").trim();
    var grid = document.getElementById("alert-detail-grid");
    if (grid) grid.innerHTML = renderDetailGridRows(
      [
        ["项目名称", item.projectName || "—"],
        ["告警来源", formatAlertSourceDisplay(item.source)],
        ["报警类型", item.type],
        ["报警区间", item.section],
        ["位置", item.location],
        ["测点编码", '<span class="alert-code-tag">' + item.code + "</span>"],
        ["报警开始时间", item.startTime],
        ["最新报警时间", item.lastTime],
        ["处理状态", item.workflowStatus],
      ]
        .concat(traditionalDetailSpectrumRows(item))
        .concat([
          [
            "当前位置备注",
            noteText
              ? noteText
              : '<span class="alert-detail-note-empty">暂无备注</span>',
            "full",
          ],
        ])
    );

    var alarmRec = getAlarmRecordDisplay(item);
    var recordAlarm = document.getElementById("record-alarm");
    if (recordAlarm) {
      var alarmHeadClass = isPatrolMobileAlertPage()
        ? "mp-alert-record__head"
        : "flex items-center justify-center gap-3 mb-3";
      var rangeClass = isPatrolMobileAlertPage()
        ? "mp-alert-record__range"
        : "text-center text-[18px] text-slate-500";
      recordAlarm.innerHTML =
        '<div class="' +
        alarmHeadClass +
        '">' +
        '<span class="alert-dot"></span>' +
        '<span class="alert-code-tag">' +
        alarmRec.code +
        "</span>" +
        '<span class="alert-duration-pill">持续时间：' +
        alarmRec.duration +
        "</span></div>" +
        '<p class="' +
        rangeClass +
        '">' +
        alarmRec.range +
        "</p>";
    }

    var recordUav = document.getElementById("record-uav");
    if (recordUav) {
      recordUav.innerHTML =
        '<div class="alert-uav-shot"><img src="' +
        ((item.uavRecord && item.uavRecord.image) || item.image) +
        '" alt="无人机实拍记录" /></div>';
    }
    var recordDisposal = document.getElementById("record-disposal");
    if (recordDisposal) recordDisposal.innerHTML = renderDisposal(item);
  }

  function updateAlertDetailFlag(item, flagId) {
    var flag = document.getElementById(flagId || "patrol-alert-flag");
    if (!flag || !item) return;
    var label = String(item.type || "疑似钻探施工");
    if (label.length > 4) {
      var mid = Math.ceil(label.length / 2);
      flag.innerHTML = label.slice(0, mid) + "<br />" + label.slice(mid);
    } else {
      flag.textContent = label;
    }
  }

  var patrolUavDetailMapApi = null;

  function destroyPatrolUavDetailMap() {
    if (patrolUavDetailMapApi && patrolUavDetailMapApi.map) {
      patrolUavDetailMapApi.map.remove();
      patrolUavDetailMapApi = null;
    }
    var mapEl = document.getElementById("patrol-uav-alert-detail-map");
    if (mapEl) mapEl.innerHTML = "";
  }

  function mountPatrolUavDetailMap(item) {
    if (!window.WuhanSituationGIS || !window.WuhanSituationGIS.mountAlarmMap) return;
    var containerId = "patrol-uav-alert-detail-map";
    var container = document.getElementById(containerId);
    if (!container) return;
    destroyPatrolUavDetailMap();
    var row = projectToAlarmRow(item);
    patrolUavDetailMapApi = window.WuhanSituationGIS.mountAlarmMap(containerId, {
      rows: [row],
      highlightLocation: row.location,
      focusZoom: item.zoom != null ? item.zoom : 14,
      zoomControl: true,
    });
    setTimeout(function () {
      if (patrolUavDetailMapApi && patrolUavDetailMapApi.map && patrolUavDetailMapApi.map.invalidateSize) {
        patrolUavDetailMapApi.map.invalidateSize();
      }
    }, 80);
    setTimeout(function () {
      if (patrolUavDetailMapApi && patrolUavDetailMapApi.map && patrolUavDetailMapApi.map.invalidateSize) {
        patrolUavDetailMapApi.map.invalidateSize();
      }
    }, 320);
  }

  function renderPatrolUavApprovalTimeline(item) {
    if (window.AlertDisposalTimeline && window.AlertDisposalTimeline.renderApproval) {
      return window.AlertDisposalTimeline.renderApproval(item);
    }
    return '<div class="alert-disposal-empty">暂无审批记录</div>';
  }

  function fillPatrolAlertsUavDetail(item) {
    if (!item) return;
    currentAlert = item;
    updateAlertDetailFlag(item, "patrol-uav-alert-flag");

    var grid = document.getElementById("patrol-uav-alert-detail-grid");
    if (grid) {
      grid.innerHTML = renderDetailGridRows([
        ["项目名称", item.projectName || "—"],
        ["告警来源", formatAlertSourceDisplay(item.source)],
        ["预警时间", item.alertTime || item.latestTime || item.startTime || "—"],
        ["地理坐标", formatAlertGeoCoord(item)],
        ["位置", item.position || item.alarmArea || item.location || "—"],
        ["等级", item.riskLevel || (item.uavRecord && item.uavRecord.level) || "—"],
      ]);
    }

    var recordUav = document.getElementById("patrol-uav-record-uav");
    if (recordUav) {
      recordUav.innerHTML =
        '<div class="alert-uav-shot"><img src="' +
        ((item.uavRecord && item.uavRecord.image) || item.image) +
        '" alt="无人机实拍记录" /></div>';
    }

    var recordDisposal = document.getElementById("patrol-uav-record-disposal");
    if (recordDisposal) {
      recordDisposal.innerHTML = renderPatrolUavApprovalTimeline(item);
    }

    mountPatrolUavDetailMap(item);
  }

  function fillDetail(item) {
    if (isPortalDetailMode()) {
      fillDetailPortal(item);
      return;
    }
    var isUavDetail = isUavSourceAlert(item);
    setDetailSideLayout(isUavDetail);
    if (isUavDetail) fillUavSourceDetail(item);
    else fillTraditionalDetail(item);
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
    setTimeout(function () {
      if (detailMapApi && detailMapApi.map && detailMapApi.map.invalidateSize) {
        detailMapApi.map.invalidateSize();
      }
    }, 80);
    setTimeout(function () {
      if (detailMapApi && detailMapApi.map && detailMapApi.map.invalidateSize) {
        detailMapApi.map.invalidateSize();
      }
    }, 320);
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

  var PATROL_ALERT_OPEN_KEY = "whPatrolAlertOpenId";
  var PATROL_ALERT_FROM_GIS_KEY = "whPatrolAlertFromGis";
  var consumedPatrolAlertsDeepLinkId = null;

  function consumePatrolAlertsDeepLinkOnBoot() {
    if (consumedPatrolAlertsDeepLinkId !== null) return consumedPatrolAlertsDeepLinkId;

    var params = new URLSearchParams(window.location.search);
    var fromGis = params.get("fromGis") === "1";
    var id = params.get("id");
    if (fromGis && id) {
      consumedPatrolAlertsDeepLinkId = String(id).trim();
      clearPatrolAlertsDeepLinkState();
      return consumedPatrolAlertsDeepLinkId;
    }

    try {
      if (sessionStorage.getItem(PATROL_ALERT_FROM_GIS_KEY) === "1") {
        id = sessionStorage.getItem(PATROL_ALERT_OPEN_KEY);
        sessionStorage.removeItem(PATROL_ALERT_OPEN_KEY);
        sessionStorage.removeItem(PATROL_ALERT_FROM_GIS_KEY);
        if (id) {
          consumedPatrolAlertsDeepLinkId = String(id).trim();
          clearPatrolAlertsDeepLinkState();
          return consumedPatrolAlertsDeepLinkId;
        }
      }
    } catch (e) {}

    clearPatrolAlertsDeepLinkState();
    consumedPatrolAlertsDeepLinkId = "";
    return "";
  }

  function readPatrolAlertsDeepLinkId() {
    if (typeof window === "undefined") return "";
    if (consumedPatrolAlertsDeepLinkId === null) {
      return consumePatrolAlertsDeepLinkOnBoot();
    }
    return consumedPatrolAlertsDeepLinkId || "";
  }

  function resetPatrolAlertsEntryView() {
    finishPatrolAlertsDeepLink();
    if (!document.getElementById("patrol-alerts-app")) return;
    if (window.WHMapAlertsMobile && typeof window.WHMapAlertsMobile.showList === "function") {
      window.WHMapAlertsMobile.showList();
    } else if (typeof closeDetailModal === "function") {
      closeDetailModal();
    }
  }

  function clearPatrolAlertsDeepLinkState() {
    try {
      sessionStorage.removeItem(PATROL_ALERT_OPEN_KEY);
      sessionStorage.removeItem(PATROL_ALERT_FROM_GIS_KEY);
    } catch (e) {}
    if (typeof window === "undefined" || !window.history || !window.history.replaceState) return;
    var url = new URL(window.location.href);
    if (!url.searchParams.has("id") && !url.searchParams.has("fromGis")) return;
    url.searchParams.delete("id");
    url.searchParams.delete("fromGis");
    var query = url.searchParams.toString();
    window.history.replaceState(null, "", url.pathname + (query ? "?" + query : "") + url.hash);
  }

  function finishPatrolAlertsDeepLink() {
    consumedPatrolAlertsDeepLinkId = "";
    clearPatrolAlertsDeepLinkState();
  }

  function closeDetailModal() {
    var mask = document.getElementById("wh-alert-detail-modal-mask");
    if (mask) {
      mask.classList.remove("show");
      mask.setAttribute("aria-hidden", "true");
    }
    if (detailMapApi && detailMapApi.map) {
      detailMapApi.map.remove();
      detailMapApi = null;
    }
    var mapEl = document.getElementById("alert-detail-map");
    if (mapEl) mapEl.innerHTML = "";
    if (document.getElementById("patrol-alerts-app")) {
      finishPatrolAlertsDeepLink();
    }
  }

  function openDetailModal(item) {
    if (!item) return false;
    var mask = document.getElementById("wh-alert-detail-modal-mask");
    if (!mask) {
      if (document.getElementById("view-detail")) {
        showDetailView(item);
        return true;
      }
      return false;
    }
    currentAlert = item;
    updateAlertDetailFlag(item);
    fillDetail(item);
    mountDetailMap(item);
    mask.classList.add("show");
    mask.setAttribute("aria-hidden", "false");
    setTimeout(function () {
      if (detailMapApi && detailMapApi.map && detailMapApi.map.invalidateSize) {
        detailMapApi.map.invalidateSize();
      }
    }, 80);
    return true;
  }

  function initPortalDetailModal() {
    initAlertDetailSpectrumOps();
    if (initPortalDetailModal.bound) return;
    initPortalDetailModal.bound = true;
    var mask = document.getElementById("wh-alert-detail-modal-mask");
    if (!mask) return;
    mask.addEventListener("click", function (e) {
      if (e.target === mask) closeDetailModal();
    });
    mask.querySelectorAll("[data-action='close-alert-detail-modal']").forEach(function (btn) {
      btn.addEventListener("click", closeDetailModal);
    });
  }

  function applyAlertFlightPlanSubmission() {
    var raw;
    try {
      raw = sessionStorage.getItem("whAlertFlightPlanSubmitted");
      if (!raw) return;
      sessionStorage.removeItem("whAlertFlightPlanSubmitted");
    } catch (e) {
      return;
    }
    var payload;
    try {
      payload = JSON.parse(raw);
    } catch (e2) {
      return;
    }
    var project = findProject(payload.alertId);
    if (!project) return;
    project.flightPlanAudit = payload.audit || "-";
    project.linkedFlightPlanName = payload.planName || "";
    if (payload.planId != null) project.linkedFlightPlanId = payload.planId;
    if (window.WuhanGIS && window.WuhanGIS.getFlightPlanForAlert) {
      var stored = window.WuhanGIS.getFlightPlanForAlert(payload.alertId);
      if (stored) {
        project.linkedFlightPlanId = stored.id;
        project.linkedFlightPlanName = stored.name || project.linkedFlightPlanName;
      }
    }
    var t =
      window.WuhanExpertReviewModal && window.WuhanExpertReviewModal.nowStr
        ? window.WuhanExpertReviewModal.nowStr()
        : new Date().toISOString().slice(0, 19).replace("T", " ");
    if (!project.disposalRecord) project.disposalRecord = [];
    project.disposalRecord.push({
      time: t,
      type: "flight-plan",
      text: "已提交无人机复核飞行计划（" + (payload.planName || "") + "）",
      auditStatus: payload.audit || "-",
    });
    notifyListChanged();
    if (currentAlert && currentAlert.id === project.id) fillDetail(project);
  }

  function schedulePatrolAlertsDeepLink() {
    var deepLinkId = readPatrolAlertsDeepLinkId();
    if (!deepLinkId) return;

    function attempt() {
      if (!readPatrolAlertsDeepLinkId()) return;
      if (window.WHMapAlertsMobile && typeof window.WHMapAlertsMobile.showDetail === "function") {
        window.WHMapAlertsMobile.showDetail(String(deepLinkId));
        return;
      }
      var project = findProject(deepLinkId);
      if (!project) return;
      if (isUavSourceAlert(project)) return;
      if (openDetailModal(project)) finishPatrolAlertsDeepLink();
    }
    setTimeout(attempt, 0);
    setTimeout(attempt, 150);
    setTimeout(attempt, 450);
  }

  function init() {
    initPortalDetailModal();
    initAlertDetailSpectrumOps();
    if (document.getElementById("patrol-alerts-app")) {
      applyAlertFlightPlanSubmission();
      populateIntervalFilterOptions();
      consumePatrolAlertsDeepLinkOnBoot();
      schedulePatrolAlertsDeepLink();
      return;
    }
    if (!document.getElementById("alert-tree-body")) return;
    applyAlertFlightPlanSubmission();
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

  var WHMapAlerts = {
    openDetail: openDetailModal,
    closeDetail: closeDetailModal,
    initPortalDetailModal: initPortalDetailModal,
    fillDetailPortal: fillDetailPortal,
    updateAlertDetailFlag: updateAlertDetailFlag,
    findProject: findProject,
    createProject: createProject,
    fillDetail: fillDetail,
    fillPatrolAlertsUavDetail: fillPatrolAlertsUavDetail,
    destroyPatrolUavDetailMap: destroyPatrolUavDetailMap,
    openManualReview: openManualReviewFor,
    openDroneReview: openDroneReviewFor,
    openReview: openReviewFor,
    openAiReview: openAiReviewFor,
    allProjects: allProjects,
    getFilteredProjects: getFilteredProjects,
    applyListFiltersFromForm: applyListFiltersFromForm,
    readListFiltersFromForm: readListFiltersFromForm,
    resetListFilterForm: resetListFilterForm,
    populateIntervalFilterOptions: populateIntervalFilterOptions,
    applyAlertFlightPlanSubmission: applyAlertFlightPlanSubmission,
    statusClass: statusClass,
    isUavSourceAlert: isUavSourceAlert,
    usesReviewDropdown: usesReviewDropdown,
    ALERT_SOURCE_AI: ALERT_SOURCE_AI,
    ALERT_SOURCE_TRADITIONAL: ALERT_SOURCE_TRADITIONAL,
    ALERT_SOURCE_MIXED: ALERT_SOURCE_MIXED,
    ALERT_SOURCE_UAV: ALERT_SOURCE_UAV,
    ALERT_SOURCE_FULLTIME: ALERT_SOURCE_FULLTIME,
    formatAlertSourceDisplay: formatAlertSourceDisplay,
    isFulltimeAlertSource: isFulltimeAlertSource,
    ALERT_HANDLE_MODE_OPTIONS: ALERT_HANDLE_MODE_OPTIONS,
    readPatrolAlertsDeepLinkId: readPatrolAlertsDeepLinkId,
    clearPatrolAlertsDeepLinkState: clearPatrolAlertsDeepLinkState,
    finishPatrolAlertsDeepLink: finishPatrolAlertsDeepLink,
    resetPatrolAlertsEntryView: resetPatrolAlertsEntryView,
    consumePatrolAlertsDeepLinkOnBoot: consumePatrolAlertsDeepLinkOnBoot,
  };

  if (typeof window !== "undefined") {
    window.WHMapAlerts = WHMapAlerts;
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
