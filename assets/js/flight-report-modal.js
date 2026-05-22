/**
 * 飞行计划 · 飞行报告弹窗（复用飞行日志详情布局）
 */
(function (global) {
  var WUHAN = [30.5928, 114.3055];
  var trackPlayback = null;
  var mounted = false;
  var currentPlan = null;
  var currentReport = null;

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function flightStatusMeta(status) {
    var label = String(status || "成功").trim();
    if (label === "异常中止" || label === "手动取消") {
      return { label: label, text: "text-amber-200", dot: "bg-amber-400" };
    }
    if (label === "失败") {
      return { label: "失败", text: "text-rose-200", dot: "bg-rose-500" };
    }
    return { label: "成功", text: "text-emerald-200", dot: "bg-emerald-400" };
  }

  function statusHtml(status) {
    var meta = flightStatusMeta(status);
    return (
      '<span class="fr-status-pill ' +
      meta.text +
      '"><span class="fr-status-dot ' +
      meta.dot +
      '"></span>' +
      esc(meta.label) +
      "</span>"
    );
  }

  function levelClass(level) {
    if (/特别严重|严重|高/.test(level)) return "fr-level--high";
    if (/较重|中/.test(level)) return "fr-level--mid";
    return "fr-level--low";
  }

  var REPORT_BY_PLAN = {
    1: {
      taskId: "FL20260512001",
      flightStatus: "成功",
      duration: "36分02秒",
      maxHeight: "96.2 m",
      distance: "4.2 km",
      batteryUsed: "42%",
      track: [
        [30.6318, 114.4021],
        [30.6312, 114.4035],
        [30.6305, 114.4052],
        [30.6298, 114.4068],
      ],
      events: [
        { time: "2026-05-12 09:02:08", type: "系统", detail: "按计划自动起飞，开始执行车辆段常规巡检。" },
        { time: "2026-05-12 09:18:22", type: "系统", detail: "到达巡检点 #2，开始环境拍摄任务。" },
        { time: "2026-05-12 09:36:40", type: "系统", detail: "任务完成，自动返航降落。" },
      ],
      media: [
        { kind: "image", title: "围挡巡查-1", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80" },
        { kind: "image", title: "堆土复核-2", url: "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=800&q=80" },
        { kind: "image", title: "保护区边界", url: "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80" },
        {
          kind: "video",
          title: "航线回放片段",
          url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
          poster: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80",
        },
      ],
      supplement: "本次巡查未发现新增大型机械，现场围挡完整。建议下周对涉铁施工点复核。",
      alerts: [
        {
          projectName: "8号线车辆段涉铁施工",
          section: "武昌站—中南路",
          location: "车辆段北侧 120m",
          startTime: "2026-05-12 09:12",
          type: "堆土",
          level: "较重",
          warnMode: "无人机巡线",
        },
        {
          projectName: "保护区例行监测",
          section: "中南路—宝通寺",
          location: "友谊大道南侧",
          startTime: "2026-05-12 09:25",
          type: "围挡",
          level: "一般",
          warnMode: "全时全域",
        },
      ],
      aiSummary: "发现施工围挡 2 处，疑似堆土 1 处，均已纳入复核清单。",
    },
    4: {
      taskId: "FL20260512004",
      flightStatus: "成功",
      duration: "36分00秒",
      maxHeight: "88.5 m",
      distance: "3.6 km",
      batteryUsed: "51%",
      track: [
        [30.5389, 114.3446],
        [30.5382, 114.346],
        [30.5375, 114.3475],
        [30.5368, 114.349],
      ],
      events: [
        { time: "2026-05-12 09:02:05", type: "系统", detail: "青山站周期巡检任务起飞。" },
        { time: "2026-05-12 09:20:18", type: "飞手操作", detail: "操作员手动调整高度避让高压线（操作员：赵六）。" },
        { time: "2026-05-12 09:38:12", type: "系统", detail: "任务结束，正常降落。" },
      ],
      media: [
        { kind: "image", title: "青山段巡检", url: "https://images.unsplash.com/photo-1496307653780-42ee777d4833?auto=format&fit=crop&w=800&q=80" },
        { kind: "image", title: "站厅出入口", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80" },
        {
          kind: "video",
          title: "热成像录像",
          url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
          poster: "https://images.unsplash.com/photo-1511818966892-d7d671e672a2?auto=format&fit=crop&w=800&q=80",
        },
      ],
      supplement: "周期巡检完成，沿线未发现违规占道施工。",
      alerts: [
        {
          projectName: "青山站保护区巡查",
          section: "青山站—工业四路",
          location: "工业四路东侧 80m",
          startTime: "2026-05-12 09:15",
          type: "挖机",
          level: "特别严重",
          warnMode: "无人机巡线",
        },
      ],
      aiSummary: "识别临时堆料 1 处，已推送专家工具复核。",
    },
  };

  function defaultReport(plan) {
    return {
      taskId: "FL-" + plan.id,
      flightStatus: "成功",
      duration: "—",
      maxHeight: "—",
      distance: "6.8 km",
      batteryUsed: "—",
      track: [
        [30.5969, 114.3005],
        [30.5953, 114.3048],
        [30.5935, 114.3093],
        [30.5918, 114.3131],
      ],
      events: [
        { time: (plan.actualStart || "—") + " 00:05", type: "系统", detail: "飞行任务开始执行。" },
        { time: (plan.actualEnd || "—") + " 00:01", type: "系统", detail: "飞行任务结束，日志已自动生成。" },
      ],
      media: [
        { kind: "image", title: "巡查实拍", url: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80" },
        { kind: "image", title: "现场复核", url: "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=800&q=80" },
      ],
      supplement: "",
      alerts: [
        {
          projectName: plan.name,
          section: plan.line + "区间",
          location: plan.route,
          startTime: plan.actualStart || "—",
          type: "施工围挡",
          level: "一般",
          warnMode: "无人机巡线",
        },
      ],
      aiSummary: "AI 识别结果已关联至本次飞行报告。",
    };
  }

  function getReportData(plan) {
    var base = REPORT_BY_PLAN[plan.id] || defaultReport(plan);
    return Object.assign({}, base, {
      takeoff: plan.actualStart || "—",
      landing: plan.actualEnd || "—",
      operator: (plan.execMeta && plan.pilot) || plan.applicant || "—",
      taskId: plan.taskId || base.taskId,
    });
  }

  function defaultApprovalRecords(plan) {
    var base = [
      { person: "张工", time: "2026-05-13 09:24", status: "审批通过", opinion: "申请资料完整，航线与空域许可匹配。" },
      { person: "李工", time: "2026-05-13 09:42", status: "审批通过", opinion: "施工保护区范围核对无误，同意执行。" },
      { person: "陈工", time: "2026-05-13 10:05", status: "审批通过", opinion: "无人机巡查任务已按计划执行。" },
      { person: "王主任", time: "2026-05-13 10:20", status: "审批通过", opinion: "同意归档飞行报告。" },
      { person: "赵经理", time: "2026-05-13 10:36", status: "审批通过", opinion: "—" },
    ];
    if (plan && plan.audit === "已驳回") {
      return base.map(function (r, i) {
        return i === 2
          ? { person: r.person, time: "2026-05-13 10:12", status: "已驳回", opinion: "空域许可临期，请补充续期材料。" }
          : r;
      });
    }
    if (plan && plan.audit === "审核中") {
      return [
        { person: "张工", time: "2026-05-13 09:24", status: "审批通过", opinion: "申请资料完整。" },
        { person: "李工", time: "2026-05-13 09:42", status: "审批通过", opinion: "同意继续审批。" },
        { person: "陈工", time: "-", status: "待审批", opinion: "-" },
        { person: "王主任", time: "-", status: "待审批", opinion: "-" },
        { person: "赵经理", time: "-", status: "待审批", opinion: "-" },
      ];
    }
    return base;
  }

  function ensureStylesheet() {
    if (document.getElementById("flight-report-modal-css")) return;
    var link = document.createElement("link");
    link.id = "flight-report-modal-css";
    link.rel = "stylesheet";
    link.href = "assets/css/flight-report-modal.css";
    document.head.appendChild(link);
  }

  function ensureReportModal() {
    var modal = document.getElementById("report-modal");
    if (modal) return modal;
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="report-modal" class="modal-mask" role="dialog" aria-modal="true" aria-labelledby="fr-report-modal-title">' +
        '<div class="modal-card modal-card--report">' +
        '<div class="flex items-center justify-between px-5 py-4 border-b border-white/10 shrink-0">' +
        '<div><h3 id="fr-report-modal-title" class="text-base font-semibold text-white">飞行报告</h3>' +
        '<p id="report-modal-subtitle" class="text-xs text-slate-400 mt-1"></p></div>' +
        '<button type="button" class="wh-modal-close fr-report-modal-close" data-fr-report-close aria-label="关闭">×</button>' +
        "</div>" +
        '<div id="report-box" class="fr-report-body"></div>' +
        "</div></div>"
    );
    modal = document.getElementById("report-modal");
    var closeBtn = modal.querySelector("[data-fr-report-close]");
    if (closeBtn) closeBtn.addEventListener("click", close);
    modal.addEventListener("click", function (e) {
      if (e.target === modal) close();
    });
    return modal;
  }

  function ensureDom() {
    if (mounted) return;
    mounted = true;
    ensureStylesheet();
    ensureReportModal();

    if (!document.getElementById("wh-media-preview-mask")) {
      document.body.insertAdjacentHTML(
        "beforeend",
        '<div id="wh-media-preview-mask" class="wh-media-preview-mask" role="dialog" aria-modal="true">' +
          '<div class="wh-media-preview-shell">' +
          '<div class="wh-media-preview-head">' +
          '<div class="font-medium text-cyan-50" id="wh-media-preview-title">预览</div>' +
          '<button type="button" class="wh-modal-close" id="wh-media-preview-close" aria-label="关闭">×</button>' +
          "</div>" +
          '<div class="wh-media-preview-body" id="wh-media-preview-body"></div>' +
          "</div></div>"
      );
      document.getElementById("wh-media-preview-close").addEventListener("click", closeMediaPreview);
      document.getElementById("wh-media-preview-mask").addEventListener("click", function (e) {
        if (e.target.id === "wh-media-preview-mask") closeMediaPreview();
      });
    }
  }

  function openMediaPreview(payload) {
    ensureDom();
    var mask = document.getElementById("wh-media-preview-mask");
    var body = document.getElementById("wh-media-preview-body");
    document.getElementById("wh-media-preview-title").textContent = payload.title || "媒体预览";
    if (payload.kind === "video" && payload.url) {
      body.innerHTML =
        '<video class="wh-media-preview-video" src="' +
        esc(payload.url) +
        '" controls autoplay poster="' +
        esc(payload.poster || "") +
        '"></video>';
    } else {
      body.innerHTML =
        '<img class="wh-media-preview-image" src="' +
        esc(payload.url) +
        '" alt="' +
        esc(payload.title || "图片") +
        '">';
    }
    mask.classList.add("show");
  }

  function closeMediaPreview() {
    var mask = document.getElementById("wh-media-preview-mask");
    if (!mask) return;
    mask.classList.remove("show");
    var body = document.getElementById("wh-media-preview-body");
    if (body) body.innerHTML = "";
  }

  function basicRow(label, value) {
    return (
      '<div class="fr-basic-row"><div class="fr-basic-row__label">' +
      esc(label) +
      '</div><div class="fr-basic-row__value">' +
      value +
      "</div></div>"
    );
  }

  function renderBasicInfo(plan, report) {
    return (
      '<div class="fr-basic-grid">' +
      basicRow("关联计划", '<a href="#">' + esc(plan.name) + "</a>") +
      basicRow("飞行任务ID", esc(report.taskId)) +
      basicRow("飞行航线", esc(plan.route)) +
      basicRow("适用机场", esc(plan.airport)) +
      basicRow("适用航空器", esc(plan.drone)) +
      basicRow("操作员", esc(report.operator)) +
      basicRow("任务类型", esc(plan.type)) +
      basicRow("起飞时间", esc(report.takeoff)) +
      basicRow("降落时间", esc(report.landing)) +
      basicRow("飞行时长", esc(report.duration)) +
      basicRow("飞行状态", statusHtml(report.flightStatus)) +
      basicRow("最大高度", esc(report.maxHeight)) +
      basicRow("航程", esc(report.distance)) +
      basicRow("电池消耗", esc(report.batteryUsed)) +
      basicRow("AI识别摘要", esc(report.aiSummary)) +
      "</div>"
    );
  }

  function renderEvents(events) {
    if (!events || !events.length) {
      return '<div class="text-xs text-slate-400 py-2">暂无操作与事件记录</div>';
    }
    return events
      .map(function (evt) {
        return (
          '<div class="fr-event-item">' +
          '<div class="text-xs text-slate-300">' +
          esc(evt.time) +
          '</div><div class="text-xs text-slate-400 mt-1">事件类型：<span class="text-cyan-200">' +
          esc(evt.type) +
          '</span></div><div class="fr-event-detail text-sm text-sky-300 mt-1 leading-6">' +
          esc(evt.detail) +
          "</div></div>"
        );
      })
      .join("");
  }

  function renderMedia(media) {
    if (!media || !media.length) {
      return '<div class="text-xs text-slate-400">暂无巡查图片或视频</div>';
    }
    return (
      '<div class="fr-media-grid">' +
      media
        .map(function (item, index) {
          var isVideo = item.kind === "video";
          var src = isVideo ? item.poster || item.url : item.url;
          return (
            '<button type="button" class="fr-media-thumb" data-fr-media="' +
            index +
            '" title="' +
            esc(item.title) +
            '">' +
            (isVideo
              ? '<img src="' + esc(src) + '" alt="">'
              : '<img src="' + esc(src) + '" alt="' + esc(item.title) + '">') +
            '<span class="fr-media-thumb__badge' +
            (isVideo ? " fr-media-thumb__badge--video" : "") +
            '">' +
            (isVideo ? '<i class="fa-solid fa-play"></i> 视频' : "图片") +
            "</span></button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderAlerts(alerts) {
    if (!alerts || !alerts.length) {
      return '<div class="text-xs text-slate-400 py-3 px-2">本次飞行未关联预警信息</div>';
    }
    var rows = alerts
      .map(function (a) {
        return (
          "<tr>" +
          "<td>" +
          esc(a.projectName) +
          "</td><td>" +
          esc(a.section) +
          "</td><td>" +
          esc(a.location) +
          "</td><td>" +
          esc(a.startTime) +
          "</td><td>" +
          esc(a.type) +
          '</td><td><span class="' +
          levelClass(a.level) +
          '">' +
          esc(a.level) +
          "</span></td><td>" +
          esc(a.warnMode) +
          "</td></tr>"
        );
      })
      .join("");
    return (
      '<div class="fr-alert-table-wrap"><table class="fr-alert-table">' +
      "<colgroup>" +
      '<col class="col-project" /><col class="col-section" /><col class="col-location" /><col class="col-time" /><col class="col-type" /><col class="col-level" /><col class="col-mode" />' +
      "</colgroup><thead><tr>" +
      "<th>项目名称</th><th>报警区间</th><th>报警位置</th><th>开始时间</th><th>类型</th><th>等级</th><th>预警方式</th>" +
      "</tr></thead><tbody>" +
      rows +
      "</tbody></table></div>"
    );
  }

  function destroyTrack() {
    if (trackPlayback) {
      trackPlayback.destroy();
      trackPlayback = null;
    }
  }

  function initTrack(report) {
    destroyTrack();
    if (!global.WHTrackPlayback) return;
    trackPlayback = global.WHTrackPlayback.create({
      preset: "drone",
      mapContainerId: "fr-report-map",
      center: WUHAN,
      zoom: 12,
      statusEl: document.getElementById("fr-map-status-text"),
      nameEl: document.getElementById("fr-map-current-name"),
      timeEl: document.getElementById("fr-map-current-time"),
      fitPadding: [28, 28],
    });
    trackPlayback.draw(report.track || []);
    setTimeout(function () {
      var map = trackPlayback.getMap();
      if (map) map.invalidateSize();
    }, 120);
  }

  function csvEscape(val) {
    var s = String(val == null ? "" : val).replace(/"/g, '""');
    if (/[",\n\r]/.test(s)) return '"' + s + '"';
    return s;
  }

  function exportReport(plan, report) {
    if (!plan) return;
    if (!report) report = getReportData(plan);
    var noteEl = document.getElementById("fr-report-supplement");
    var supplement = noteEl ? noteEl.value.trim() : report.supplement || "";
    var lines = [["字段", "内容"].map(csvEscape).join(",")];
    function pushRow(label, value) {
      lines.push([label, value].map(csvEscape).join(","));
    }
    pushRow("关联计划", plan.name);
    pushRow("飞行任务ID", report.taskId);
    pushRow("飞行航线", plan.route);
    pushRow("适用机场", plan.airport);
    pushRow("适用航空器", plan.drone);
    pushRow("操作员", report.operator);
    pushRow("任务类型", plan.type);
    pushRow("起飞时间", report.takeoff);
    pushRow("降落时间", report.landing);
    pushRow("飞行时长", report.duration);
    pushRow("飞行状态", report.flightStatus);
    pushRow("最大高度", report.maxHeight);
    pushRow("航程", report.distance);
    pushRow("电池消耗", report.batteryUsed);
    pushRow("AI识别摘要", report.aiSummary);
    pushRow("报告补充说明", supplement);
    lines.push("");
    lines.push(["操作与事件", "", ""].map(csvEscape).join(","));
    lines.push(["时间", "事件类型", "详情"].map(csvEscape).join(","));
    (report.events || []).forEach(function (evt) {
      lines.push([evt.time, evt.type, evt.detail].map(csvEscape).join(","));
    });
    lines.push("");
    lines.push(["预警信息", "", "", "", "", "", ""].map(csvEscape).join(","));
    lines.push(
      ["项目名称", "报警区间", "报警位置", "开始时间", "类型", "等级", "预警方式"].map(csvEscape).join(",")
    );
    (report.alerts || []).forEach(function (a) {
      lines.push(
        [a.projectName, a.section, a.location, a.startTime, a.type, a.level, a.warnMode].map(csvEscape).join(",")
      );
    });
    var blob = new Blob(["\ufeff" + lines.join("\r\n")], { type: "text/csv;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var a = document.createElement("a");
    a.href = url;
    a.download = "飞行报告_" + (report.taskId || "plan-" + plan.id) + ".csv";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function showToast(text) {
    var old = document.getElementById("fr-report-toast");
    if (old) old.remove();
    var node = document.createElement("div");
    node.id = "fr-report-toast";
    node.className =
      "fixed right-5 bottom-5 z-[110] rounded bg-cyan-400 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg";
    node.textContent = text;
    document.body.appendChild(node);
    setTimeout(function () {
      node.remove();
    }, 1800);
  }

  function bindReportEvents(report, editable, options) {
    var box = document.getElementById("report-box");
    if (!box) return;

    box.querySelectorAll("[data-fr-media]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        var idx = Number(btn.getAttribute("data-fr-media"));
        var item = report.media[idx];
        if (item) openMediaPreview(item);
      });
    });

    var playBtn = document.getElementById("fr-report-play-track");
    if (playBtn) {
      playBtn.onclick = function () {
        if (trackPlayback) trackPlayback.play();
      };
    }
    var resetBtn = document.getElementById("fr-report-reset-map");
    if (resetBtn) {
      resetBtn.onclick = function () {
        if (trackPlayback) trackPlayback.fitBounds();
      };
    }

    var note = document.getElementById("fr-report-supplement");
    if (note) {
      note.readOnly = !editable;
      note.value = report.supplement || "";
      if (!editable) note.setAttribute("title", "查看模式下不可编辑，可点击保存归档当前说明");
    }

    var saveBtn = document.getElementById("fr-report-save-btn");
    if (saveBtn) {
      saveBtn.disabled = false;
      saveBtn.onclick = function () {
        var text = note ? note.value.trim() : "";
        report.supplement = text;
        if (currentReport) currentReport.supplement = text;
        if (options && typeof options.onSave === "function") {
          options.onSave(text, currentPlan, report);
        } else {
          showToast("报告补充说明已保存");
        }
      };
    }

    var exportBtn = document.getElementById("fr-report-export-btn");
    if (exportBtn) {
      exportBtn.onclick = function () {
        var plan = currentPlan;
        var data = currentReport || report;
        if (!plan || !data) return;
        exportReport(plan, data);
        if (options && typeof options.onExport === "function") {
          options.onExport(plan, data);
        } else {
          showToast("飞行报告已导出");
        }
      };
    }
  }

  function renderHtml(plan, report, approvalHtml, editable) {
    return (
      '<div class="fr-report-layout">' +
      '<div class="fr-report-main-row">' +
      '<section class="fr-report-col fr-report-col--left fr-report-panel fr-report-panel--align">' +
      '<h4 class="fr-report-panel__title">基本信息</h4>' +
      renderBasicInfo(plan, report) +
      "</section>" +
      '<section class="fr-report-col fr-report-col--center fr-report-panel fr-report-panel--align">' +
      '<div class="fr-track-toolbar">' +
      '<h4 class="fr-report-panel__title fr-report-panel__title--inline">飞行轨迹</h4>' +
      '<div class="fr-track-actions">' +
      '<button type="button" id="fr-report-play-track" class="wh-btn-primary px-3 py-1.5 text-xs"><i class="fa-solid fa-play mr-1"></i>播放轨迹</button>' +
      '<button type="button" id="fr-report-reset-map" class="wh-btn-ghost px-3 py-1.5 text-xs"><i class="fa-solid fa-location-crosshairs mr-1"></i>重置视角</button>' +
      "</div></div>" +
      '<div class="fl-map-shell track-map-shell">' +
      '<div id="fr-report-map" class="fr-map"></div>' +
      '<div class="track-map-panel">' +
      '<div class="track-map-panel__row"><span class="track-map-panel__label">轨迹状态</span><span id="fr-map-status-text">待播放</span></div>' +
      '<div class="track-map-panel__row"><span class="track-map-panel__label">当前位置</span><span id="fr-map-current-name">--</span></div>' +
      '<div class="track-map-panel__row"><span class="track-map-panel__label">定位时间</span><span id="fr-map-current-time">--</span></div>' +
      "</div></div>" +
      '<div class="fr-media-section">' +
      '<h4 class="fr-report-panel__title fr-report-panel__title--sub">巡查图片和视频</h4>' +
      renderMedia(report.media) +
      "</div></section>" +
      '<section class="fr-report-col fr-report-col--right fr-report-panel fr-report-panel--approval fr-report-panel--align">' +
      '<h4 class="fr-report-panel__title">审批记录</h4>' +
      '<div class="fr-approval-scroll">' +
      (approvalHtml || '<div class="text-xs text-slate-400">暂无审批记录</div>') +
      "</div></section></div>" +
      '<section class="fr-report-panel fr-report-events-bar">' +
      '<h4 class="fr-report-panel__title">操作与事件</h4>' +
      '<div class="fr-events-scroll">' +
      renderEvents(report.events) +
      "</div></section>" +
      '<section class="fr-report-panel fr-report-alerts-bar">' +
      '<h4 class="fr-report-panel__title">预警信息</h4>' +
      renderAlerts(report.alerts) +
      "</section>" +
      '<section class="fr-report-panel fr-report-supplement-bar">' +
      '<h4 class="fr-report-panel__title">报告补充说明</h4>' +
      '<textarea id="fr-report-supplement" class="wh-input fr-report-note px-3 py-2" placeholder="' +
      (editable ? "请填写本次飞行报告补充说明…" : "可填写补充说明后点击保存归档") +
      '"></textarea>' +
      '<div class="fr-report-supplement-actions">' +
      '<button type="button" id="fr-report-export-btn" class="wh-btn-gold px-5 py-2 text-sm"><i class="fa-solid fa-download mr-1.5"></i>导出</button>' +
      '<button type="button" id="fr-report-save-btn" class="wh-btn-primary px-5 py-2 text-sm"><i class="fa-solid fa-floppy-disk mr-1.5"></i>保存</button>' +
      "</div></section></div>"
    );
  }

  function open(plan, options) {
    options = options || {};
    if (!plan) return;
    ensureDom();

    var report = getReportData(plan);
    var approvalHtml = "";
    if (options.approvalHtml) {
      approvalHtml = options.approvalHtml;
    } else if (global.ApprovalTimeline) {
      var records = options.renderApprovalRecords
        ? options.renderApprovalRecords(plan)
        : defaultApprovalRecords(plan);
      approvalHtml = ApprovalTimeline.renderApprovalRecords(records);
    }

    var editable = options.editable !== false;
    currentPlan = plan;
    currentReport = report;
    var box = document.getElementById("report-box");
    if (!box) return;

    var subtitle = document.getElementById("report-modal-subtitle");
    if (subtitle) {
      subtitle.textContent = plan.name + " · " + (plan.route || "");
    }

    box.innerHTML = renderHtml(plan, report, approvalHtml, editable);
    bindReportEvents(report, editable, options);

    var modal = document.getElementById("report-modal");
    if (modal) modal.classList.add("show");

    setTimeout(function () {
      initTrack(report);
      setTimeout(function () {
        if (trackPlayback) {
          var map = trackPlayback.getMap();
          if (map) map.invalidateSize();
        }
      }, 200);
    }, 80);
  }

  function close() {
    destroyTrack();
    closeMediaPreview();
    var modal = document.getElementById("report-modal");
    if (modal) modal.classList.remove("show");
  }

  global.WHFlightReportModal = {
    open: open,
    close: close,
    exportReport: exportReport,
    getReportData: getReportData,
    openMediaPreview: openMediaPreview,
    closeMediaPreview: closeMediaPreview,
  };
})(window);
