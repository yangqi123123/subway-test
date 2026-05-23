/**
 * 飞行计划 · 飞行报告弹窗（文档式：时间-项目名称标题 + 飞行信息 + 事件分析）
 */
(function (global) {
  function assetUrl(rel) {
    return typeof whAsset === "function" ? whAsset(rel) : rel;
  }
  var TRACK_IMG = "assets/images/flight-report-track.png";
  var EVENT_IMG = "assets/images/flight-report-event.png";

  var mounted = false;
  var currentPlan = null;
  var currentReport = null;
  var html2pdfLoadPromise = null;
  var pdfExporting = false;

  var FLIGHT_LOG_PLAN_ID = {
    FL20251225001: 1,
    FL20251224008: 4,
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function pad2(n) {
    return String(n).padStart(2, "0");
  }

  function parseDatePart(str) {
    if (!str || str === "-" || str === "—") return "";
    var m = String(str).match(/(\d{4})-(\d{2})-(\d{2})/);
    if (m) return m[1] + m[2] + m[3];
    return "";
  }

  function formatReportTitle(plan) {
    var datePart =
      parseDatePart(plan.actualEnd) ||
      parseDatePart(plan.actualStart) ||
      parseDatePart(plan.submit) ||
      "00000000";
    return datePart + "-" + (plan.name || "飞行任务") + "的飞行报告";
  }

  function formatPublishTime(plan) {
    var base = plan.actualEnd && plan.actualEnd !== "-" ? plan.actualEnd : plan.submit;
    if (!base || base === "-") {
      var d = new Date();
      return (
        d.getFullYear() +
        "-" +
        pad2(d.getMonth() + 1) +
        "-" +
        pad2(d.getDate()) +
        " " +
        pad2(d.getHours()) +
        ":" +
        pad2(d.getMinutes()) +
        ":" +
        pad2(d.getSeconds())
      );
    }
    if (/:\d{2}$/.test(base)) return base;
    return base + " 14:31:52";
  }

  function droneCodeFromName(name) {
    var s = String(name || "");
    if (/M350/i.test(s)) return "UAV-M350-001";
    if (/M30T/i.test(s)) return "UAV-M30T-002";
    if (/M300/i.test(s)) return "UAV-M300-003";
    return "UAV-" + String(Math.abs(planIdFallback(s))).slice(-6);
  }

  function planIdFallback(s) {
    var h = 0;
    for (var i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return Math.abs(h);
  }

  var REPORT_BY_PLAN = {
    1: {
      taskId: "FL20260512001",
      droneCode: "UAV-M350-001",
      flightStatus: "成功",
      duration: "36分02秒",
      durationSec: 2162,
      maxHeight: "96.2 m",
      distance: "6771.32米",
      takeoffBattery: "98%",
      landingBattery: "56%",
      takeoffPos: "车辆段北侧起飞点（114.4021, 30.6318）",
      landingPos: "车辆段南侧降落点（114.4068, 30.6298）",
      weather: "晴，微风，能见度良好",
      publisher: "张三",
      event: {
        project: "8号线车辆段涉铁施工",
        alertTime: "2026-05-12 09:12:08",
        coordinates: "114.4052, 30.6305",
        location: "湖北省武汉市武昌区友谊大道南侧车辆段北侧 120m",
        type: "全部 > 堆土",
        level: "较重",
        warnMode: "无人机巡线",
        eventImage: assetUrl(EVENT_IMG),
        unit: "武汉地保",
        person: "张三",
        processTime: "2026-05-12 10:20:15",
        falseAlarm: "否",
        illegalConstruction: "否",
        riskLevel: "中风险",
        approvalContent:
          "经现场复核，堆土位于保护区控制线外，已督促施工单位限期清运；同意归档本次飞行报告。",
      },
    },
    4: {
      taskId: "FL20260512004",
      droneCode: "UAV-M350-004",
      flightStatus: "成功",
      duration: "36分00秒",
      durationSec: 2160,
      maxHeight: "88.5 m",
      distance: "6771.32米",
      takeoffBattery: "100%",
      landingBattery: "49%",
      takeoffPos: "青山机场起飞坪（114.3446, 30.5389）",
      landingPos: "工业四路巡检终点（114.3490, 30.5368）",
      weather: "多云，东北风 2 级",
      publisher: "赵六",
      event: {
        project: "青山站保护区巡查",
        alertTime: "2026-05-12 09:15:22",
        coordinates: "114.3475, 30.5375",
        location: "湖北省武汉市青山区工业四路东侧 80m",
        type: "全部 > 挖掘机",
        level: "特别严重",
        warnMode: "无人机巡线",
        eventImage: assetUrl(EVENT_IMG),
        unit: "武汉地保",
        person: "赵六",
        processTime: "2026-05-12 10:05:40",
        falseAlarm: "否",
        illegalConstruction: "是",
        riskLevel: "高风险",
        approvalContent:
          "识别到挖掘机作业，已派发人工现场核查并启动专家工具复核；审批通过，纳入本周督办清单。",
      },
    },
  };

  function defaultEvent(plan) {
    return {
      project: plan.name,
      alertTime: (plan.actualStart && plan.actualStart !== "-" ? plan.actualStart : plan.submit) + "",
      coordinates: "114.3055, 30.5928",
      location: (plan.route || "武汉市") + " 巡查航线覆盖区域",
      type: "全部 > 施工围挡",
      level: "一般",
      warnMode: "无人机巡线",
      eventImage: assetUrl(EVENT_IMG),
      unit: "武汉地保",
      person: (plan.execMeta && plan.execMeta.pilot) || plan.applicant || "值班员",
      processTime: formatPublishTime(plan),
      falseAlarm: "否",
      illegalConstruction: "否",
      riskLevel: "低风险",
      approvalContent: "本次飞行巡查未发现新增违规施工，同意结案。",
    };
  }

  function defaultReport(plan) {
    return {
      taskId: "FL-" + plan.id,
      droneCode: droneCodeFromName(plan.drone),
      flightStatus: plan.exec === "已执行" ? "成功" : "待执行",
      duration: "—",
      durationSec: 808,
      maxHeight: "—",
      distance: "6771.32米",
      takeoffBattery: "—",
      landingBattery: "—",
      takeoffPos: plan.route || "—",
      landingPos: plan.route || "—",
      weather: "—",
      publisher: plan.applicant || "系统自动",
      event: defaultEvent(plan),
    };
  }

  function getReportData(plan) {
    var base = REPORT_BY_PLAN[plan.id] || defaultReport(plan);
    var operator = (plan.execMeta && plan.execMeta.pilot) || plan.applicant || "—";
    var report = Object.assign({}, base, {
      takeoff: plan.actualStart && plan.actualStart !== "-" ? plan.actualStart : "—",
      landing: plan.actualEnd && plan.actualEnd !== "-" ? plan.actualEnd : "—",
      operator: operator,
      taskId: plan.taskId || base.taskId,
      droneName: plan.drone || "—",
      airport: plan.airport || "—",
      taskType: plan.type || "—",
      relatedPlan: plan.name || "—",
      trackImage: assetUrl(TRACK_IMG),
      eventImage: (base.event && base.event.eventImage) || assetUrl(EVENT_IMG),
    });
    if (plan.reportOverrides) {
      var overrides = Object.assign({}, plan.reportOverrides);
      var eventPatch = overrides.event;
      delete overrides.event;
      Object.assign(report, overrides);
      if (eventPatch) {
        report.event = Object.assign({}, report.event || defaultEvent(plan), eventPatch);
      }
    }
    return report;
  }

  function ensureStylesheet() {
    if (document.getElementById("flight-report-modal-css")) return;
    var link = document.createElement("link");
    link.id = "flight-report-modal-css";
    link.rel = "stylesheet";
    link.href = assetUrl("assets/css/flight-report-modal.css");
    document.head.appendChild(link);
  }

  function ensureReportModal() {
    var modal = document.getElementById("report-modal");
    if (modal) return modal;
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="report-modal" class="modal-mask" role="dialog" aria-modal="true" aria-labelledby="fr-report-modal-title">' +
        '<div class="modal-card modal-card--report">' +
        '<div class="fr-report-toolbar">' +
        '<h3 id="fr-report-modal-title" class="fr-report-toolbar__title">飞行报告</h3>' +
        '<button type="button" class="wh-modal-close fr-report-modal-close" data-fr-report-close aria-label="关闭">×</button>' +
        "</div>" +
        '<div id="report-box" class="fr-report-body"></div>' +
        "</div></div>"
    );
    modal = document.getElementById("report-modal");
    modal.querySelector("[data-fr-report-close]").addEventListener("click", close);
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
    document.getElementById("wh-media-preview-title").textContent = payload.title || "图片预览";
    body.innerHTML =
      '<img class="wh-media-preview-image" src="' +
      esc(payload.url) +
      '" alt="' +
      esc(payload.title || "图片") +
      '">';
    mask.classList.add("show");
  }

  function closeMediaPreview() {
    var mask = document.getElementById("wh-media-preview-mask");
    if (!mask) return;
    mask.classList.remove("show");
    var body = document.getElementById("wh-media-preview-body");
    if (body) body.innerHTML = "";
  }

  function docRow2(l1, v1, l2, v2) {
    return (
      "<tr><th>" +
      esc(l1) +
      '</th><td class="fr-doc-table__val">' +
      esc(v1) +
      "</td><th>" +
      esc(l2) +
      '</th><td class="fr-doc-table__val">' +
      esc(v2) +
      "</td></tr>"
    );
  }

  function docRowFull(label, value, extraClass) {
    return (
      '<tr class="' +
      (extraClass || "") +
      '"><th>' +
      esc(label) +
      '</th><td class="fr-doc-table__val fr-doc-table__val--wide" colspan="3">' +
      esc(value) +
      "</td></tr>"
    );
  }

  function renderTrackBlock(plan, report) {
    var aircraft = report.droneName || plan.drone || "—";
    return (
      '<div class="fr-doc-track">' +
      '<img class="fr-doc-track__img" src="' +
      esc(report.trackImage || assetUrl(TRACK_IMG)) +
      '" alt="飞行轨迹" />' +
      '<div class="fr-doc-track__bar">' +
      '<div class="fr-doc-track__cell"><span class="fr-doc-track__label">飞行器</span><span class="fr-doc-track__value">' +
      esc(aircraft) +
      "</span></div>" +
      '<div class="fr-doc-track__cell"><span class="fr-doc-track__label">实际执行时间</span><span class="fr-doc-track__value">' +
      esc(report.takeoff) +
      "</span></div>" +
      '<div class="fr-doc-track__cell"><span class="fr-doc-track__label">实际结束时间</span><span class="fr-doc-track__value">' +
      esc(report.landing) +
      "</span></div>" +
      '<div class="fr-doc-track__cell"><span class="fr-doc-track__label">实际飞行距离</span><span class="fr-doc-track__value">' +
      esc(report.distance) +
      "</span></div>" +
      '<div class="fr-doc-track__cell"><span class="fr-doc-track__label">实际飞行时长</span><span class="fr-doc-track__value">' +
      esc(String(report.durationSec != null ? report.durationSec + "秒" : report.duration)) +
      "</span></div>" +
      "</div></div>"
    );
  }

  function renderFlightTable(plan, report) {
    return (
      '<table class="fr-doc-table" aria-label="飞行信息">' +
      docRow2("任务 ID", report.taskId, "无人机编号", report.droneCode) +
      docRow2("无人机名称", report.droneName, "所属机场", report.airport) +
      docRow2("操作员", report.operator, "任务类型", report.taskType) +
      docRow2("关联计划", report.relatedPlan, "起飞时间", report.takeoff) +
      docRow2("降落时间", report.landing, "飞行时长", report.duration) +
      docRow2("起飞位置", report.takeoffPos, "降落位置", report.landingPos) +
      docRow2("最大飞行高度", report.maxHeight, "总飞行距离", report.distance) +
      docRow2("起飞电量", report.takeoffBattery, "降落电量", report.landingBattery) +
      docRow2("飞行状态", report.flightStatus, "天气情况", report.weather) +
      "</table>"
    );
  }

  function renderEventSection(report) {
    var ev = report.event || defaultEvent(currentPlan || {});
    var imgUrl = ev.eventImage || assetUrl(EVENT_IMG);
    var imgCell =
      '<img class="fr-doc-event-img" src="' +
      esc(imgUrl) +
      '" alt="事件图片" data-fr-event-preview role="button" tabindex="0" title="点击放大" />';

    return (
      '<h4 class="fr-doc__section-hd">事件分析</h4>' +
      '<div class="fr-doc__section-body">' +
      '<table class="fr-doc-table" aria-label="事件信息">' +
      docRow2("对应项目", ev.project, "预警时间", ev.alertTime) +
      docRow2("地理坐标", ev.coordinates, "类型", ev.type) +
      docRowFull("位置", ev.location) +
      docRow2("等级", ev.level, "预警方式", ev.warnMode) +
      '<tr class="fr-doc-table__img-row"><th>事件图片</th><td colspan="3">' +
      imgCell +
      "</td></tr>" +
      "</table>" +
      '<table class="fr-doc-table" aria-label="处理信息">' +
      docRow2("处理单位", ev.unit, "处理人员", ev.person) +
      docRow2("处理时间", ev.processTime, "是否误报", ev.falseAlarm) +
      docRow2("是否违规施工", ev.illegalConstruction, "风险等级", ev.riskLevel) +
      '<tr class="fr-doc-table__approval-row"><th>审批内容</th><td class="fr-doc-table__val fr-doc-table__val--wide" colspan="3">' +
      esc(ev.approvalContent) +
      "</td></tr>" +
      "</table></div>"
    );
  }

  function renderDocContent(plan, report) {
    var title = formatReportTitle(plan);
    var publishTime = formatPublishTime(plan);
    var publisher = report.publisher || plan.applicant || "系统自动";

    return (
      '<article class="fr-doc">' +
      '<header class="fr-doc__head">' +
      '<h2 class="fr-doc__title">' +
      esc(title) +
      "</h2>" +
      '<div class="fr-doc__meta">' +
      "<span><strong>发布人员：</strong>" +
      esc(publisher) +
      "</span>" +
      "<span><strong>发布时间：</strong>" +
      esc(publishTime) +
      "</span>" +
      "</div></header>" +
      '<h4 class="fr-doc__section-hd">飞行报告</h4>' +
      '<div class="fr-doc__section-body">' +
      renderTrackBlock(plan, report) +
      renderFlightTable(plan, report) +
      "</div>" +
      renderEventSection(report) +
      "</article>"
    );
  }

  function renderHtml(plan, report) {
    return (
      '<div class="fr-doc-wrap">' +
      renderDocContent(plan, report) +
      '<footer class="fr-doc__foot">' +
      '<button type="button" id="fr-report-export-btn" class="wh-btn-gold px-5 py-2"><i class="fa-solid fa-file-pdf mr-1.5"></i>导出报告</button>' +
      "</footer></div>"
    );
  }

  function planFromFlightLog(item) {
    if (!item) return null;
    var planId = item.planId || FLIGHT_LOG_PLAN_ID[item.id] || 1;
    var executed = item.status === "成功" || item.status === "异常中止" || item.status === "手动取消" || item.status === "失败";
    return {
      id: planId,
      taskId: item.id,
      name: item.planName || item.planCode || "飞行任务",
      route: item.planCode || item.planName || "—",
      airport: item.airport || "—",
      drone: item.deviceName || item.deviceCode || "—",
      type: item.taskType || "—",
      line: item.line || "—",
      applicant: item.operator || "—",
      actualStart: item.takeoff || "—",
      actualEnd: item.landing || "—",
      submit: item.takeoff || "—",
      audit: "审核通过",
      exec: executed ? "已执行" : "未执行",
      reportOverrides: {
        taskId: item.id,
        droneCode: item.droneNo,
        droneName: item.deviceName || item.deviceCode,
        operator: item.operator,
        duration: item.duration,
        takeoffPos: item.takeoffPos,
        landingPos: item.landingPos,
        maxHeight: item.maxHeight ? item.maxHeight + " m" : "—",
        distance: item.totalDistance ? item.totalDistance + " km" : reportDistanceFallback(item),
        takeoffBattery: item.takeoffPower,
        landingBattery: item.landingPower,
        flightStatus: item.status,
        weather: item.weather,
        publisher: item.operator,
      },
    };
  }

  function reportDistanceFallback(item) {
    if (item && item.totalDistance && !/单位|保留/.test(String(item.totalDistance))) {
      return item.totalDistance + " km";
    }
    return "6771.32米";
  }

  function loadHtml2Pdf() {
    if (global.html2pdf && global.html2pdf().set) return Promise.resolve(global.html2pdf);
    if (html2pdfLoadPromise) return html2pdfLoadPromise;
    html2pdfLoadPromise = new Promise(function (resolve, reject) {
      var existing = document.getElementById("html2pdf-bundle");
      if (existing) {
        existing.addEventListener("load", function () {
          resolve(global.html2pdf);
        });
        existing.addEventListener("error", reject);
        return;
      }
      var script = document.createElement("script");
      script.id = "html2pdf-bundle";
      script.src =
        "https://cdnjs.cloudflare.com/ajax/libs/html2pdf.js/0.10.2/html2pdf.bundle.min.js";
      script.crossOrigin = "anonymous";
      script.onload = function () {
        resolve(global.html2pdf);
      };
      script.onerror = function () {
        reject(new Error("html2pdf load failed"));
      };
      document.head.appendChild(script);
    });
    return html2pdfLoadPromise;
  }

  function pdfFilename(plan) {
    var part = parseDatePart(plan.actualEnd) || parseDatePart(plan.actualStart) || String(plan.id || "report");
    return "飞行报告_" + part + ".pdf";
  }

  function preparePdfElement(plan, report) {
    var box = document.getElementById("report-box");
    var liveDoc = box && box.querySelector(".fr-doc");
    if (liveDoc && currentPlan && plan && currentPlan.id === plan.id && currentPlan.taskId === plan.taskId) {
      var clone = liveDoc.cloneNode(true);
      return { element: clone, cleanup: function () {} };
    }
    var wrapper = document.createElement("div");
    wrapper.className = "fr-pdf-export-root";
    wrapper.setAttribute("aria-hidden", "true");
    wrapper.style.cssText =
      "position:fixed;left:-12000px;top:0;width:860px;z-index:-1;pointer-events:none;background:#fff;";
    wrapper.innerHTML = renderDocContent(plan, report);
    document.body.appendChild(wrapper);
    var element = wrapper.querySelector(".fr-doc");
    return {
      element: element,
      cleanup: function () {
        if (wrapper.parentNode) wrapper.parentNode.removeChild(wrapper);
      },
    };
  }

  function exportReportPdf(plan, report) {
    if (!plan) return Promise.reject(new Error("no plan"));
    if (!report) report = getReportData(plan);
    if (pdfExporting) return Promise.resolve();
    pdfExporting = true;

    var prep = preparePdfElement(plan, report);
    if (!prep.element) {
      pdfExporting = false;
      return Promise.reject(new Error("no element"));
    }

    return loadHtml2Pdf()
      .then(function (html2pdf) {
        return html2pdf()
          .set({
            margin: [8, 8, 10, 8],
            filename: pdfFilename(plan),
            image: { type: "jpeg", quality: 0.94 },
            html2canvas: {
              scale: 2,
              useCORS: true,
              allowTaint: true,
              logging: false,
              backgroundColor: "#ffffff",
            },
            jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
            pagebreak: { mode: ["css", "legacy"] },
          })
          .from(prep.element)
          .save();
      })
      .finally(function () {
        prep.cleanup();
        pdfExporting = false;
      });
  }

  function exportReport(plan, report) {
    showToast("正在生成 PDF…");
    return exportReportPdf(plan, report)
      .then(function () {
        showToast("飞行报告 PDF 已导出");
      })
      .catch(function () {
        showToast("PDF 导出失败，请稍后重试");
      });
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

  function bindReportEvents(report, options) {
    var box = document.getElementById("report-box");
    if (!box) return;

    var previewImg = box.querySelector("[data-fr-event-preview]");
    if (previewImg) {
      var openPreview = function () {
        openMediaPreview({
          title: "事件图片",
          url: (report.event && report.event.eventImage) || assetUrl(EVENT_IMG),
        });
      };
      previewImg.addEventListener("click", openPreview);
      previewImg.addEventListener("keydown", function (e) {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          openPreview();
        }
      });
    }

    var exportBtn = document.getElementById("fr-report-export-btn");
    if (exportBtn) {
      exportBtn.onclick = function () {
        var plan = currentPlan;
        var data = currentReport || report;
        if (!plan || !data) return;
        exportReport(plan, data).then(function () {
          if (options && typeof options.onExport === "function") {
            options.onExport(plan, data);
          }
        });
      };
    }
  }

  function open(plan, options) {
    options = options || {};
    if (!plan) return;
    ensureDom();

    var report = getReportData(plan);
    currentPlan = plan;
    currentReport = report;

    var box = document.getElementById("report-box");
    if (!box) return;

    box.innerHTML = renderHtml(plan, report);
    bindReportEvents(report, options);

    var modal = document.getElementById("report-modal");
    if (modal) modal.classList.add("show");

    var toolbarTitle = document.getElementById("fr-report-modal-title");
    if (toolbarTitle) toolbarTitle.textContent = formatReportTitle(plan);
  }

  function close() {
    closeMediaPreview();
    var modal = document.getElementById("report-modal");
    if (modal) modal.classList.remove("show");
  }

  global.WHFlightReportModal = {
    open: open,
    close: close,
    exportReport: exportReport,
    exportReportPdf: exportReportPdf,
    getReportData: getReportData,
    planFromFlightLog: planFromFlightLog,
    openMediaPreview: openMediaPreview,
    closeMediaPreview: closeMediaPreview,
    formatReportTitle: formatReportTitle,
  };
})(window);
