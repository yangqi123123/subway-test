/**
 * 移动端告警信息启动
 */
(function (global) {
  "use strict";

  function resolvePatrolHome() {
    return "../home.html";
  }

  function updateNavTitle(text) {
    var el = global.document.getElementById("patrol-alerts-nav-title");
    if (el) el.textContent = text || "告警信息";
  }

  function isAlertDetailModalOpen() {
    var mask = global.document.getElementById("wh-alert-detail-modal-mask");
    return !!(mask && mask.classList.contains("show"));
  }

  function bindNavBack() {
    document.addEventListener("click", function (event) {
      var btn = event.target.closest("[data-action='mp-nav-back']");
      if (!btn) return;

      var reviewMask = global.document.getElementById("expert-review-modal-mask");
      if (reviewMask && reviewMask.classList.contains("show")) {
        event.preventDefault();
        event.stopPropagation();
        var reviewClose = reviewMask.querySelector("[data-action='close-review-modal']");
        if (reviewClose) reviewClose.click();
        return;
      }

      var auditMask = global.document.getElementById("alert-audit-modal-mask");
      if (auditMask && auditMask.classList.contains("show")) {
        event.preventDefault();
        event.stopPropagation();
        var auditClose = auditMask.querySelector("[data-action='close-audit-modal']");
        if (auditClose) auditClose.click();
        return;
      }

      if (isAlertDetailModalOpen()) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHMapAlerts && typeof global.WHMapAlerts.closeDetail === "function") {
          global.WHMapAlerts.closeDetail();
        }
        return;
      }

      var uavDetail = global.document.getElementById("patrol-alerts-uav-detail-view");
      var list = global.document.getElementById("patrol-alerts-list-view");
      if (uavDetail && !uavDetail.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        if (global.WHMapAlertsMobile && typeof global.WHMapAlertsMobile.showList === "function") {
          global.WHMapAlertsMobile.showList();
        }
        return;
      }

      if (list && !list.classList.contains("hidden")) {
        event.preventDefault();
        event.stopPropagation();
        global.location.href = resolvePatrolHome();
      }
    });
  }

  function patchViewNav() {
    var listEl = global.document.getElementById("patrol-alerts-list-view");
    var uavDetailEl = global.document.getElementById("patrol-alerts-uav-detail-view");
    if (!listEl) return;

    function sync() {
      if (isAlertDetailModalOpen()) {
        var titleEl = global.document.getElementById("wh-alert-detail-title");
        updateNavTitle(titleEl && titleEl.textContent ? titleEl.textContent : "告警详情");
        return;
      }
      if (uavDetailEl && !uavDetailEl.classList.contains("hidden")) {
        var nameEl = global.document.getElementById("detail-uav-alert-title");
        updateNavTitle(nameEl && nameEl.textContent ? nameEl.textContent : "告警详情");
        return;
      }
      updateNavTitle("告警信息");
    }

    [listEl, uavDetailEl].forEach(function (node) {
      if (!node) return;
      var observer = new MutationObserver(sync);
      observer.observe(node, { attributes: true, attributeFilter: ["class"] });
    });
    var detailMask = global.document.getElementById("wh-alert-detail-modal-mask");
    if (detailMask) {
      var maskObserver = new MutationObserver(sync);
      maskObserver.observe(detailMask, { attributes: true, attributeFilter: ["class"] });
    }
    global.addEventListener("wh-patrol-alerts-view-change", sync);
    sync();
  }

  function initPickers() {
    var sheet = global.document.getElementById("patrol-alerts-filter-sheet");
    if (!sheet || !global.WHProjectMobile || !global.WHProjectMobile.enhanceSelectFields) return;
    global.WHProjectMobile.enhanceSelectFields(sheet);
  }

  function formatAlertGeoCoord(project) {
    if (!project) return "—";
    var lat = project.latitude;
    var lng = project.longitude;
    if (lat == null || lng == null) return project.geoCoord || "—";
    return Number(lng).toFixed(4) + ", " + Number(lat).toFixed(4);
  }

  function toggleUavReviewDetailFields() {
    var checked = global.document.querySelector('input[name="uav-review-false-alarm"]:checked');
    var isMisreport = checked && checked.value === "是";
    global.document.querySelectorAll("[data-uav-detail-field]").forEach(function (el) {
      el.classList.toggle("is-hidden", isMisreport);
    });
  }

  function fillUavReviewModal(project) {
    var WA = global.WHMapAlerts;
    var timeEl = global.document.getElementById("uav-review-time");
    var coordEl = global.document.getElementById("uav-review-coord");
    var projectEl = global.document.getElementById("uav-review-project");
    var positionEl = global.document.getElementById("uav-review-position");
    var typeEl = global.document.getElementById("uav-review-type");
    var levelEl = global.document.getElementById("uav-review-level");
    var sourceEl = global.document.getElementById("uav-review-source");

    if (timeEl) timeEl.textContent = project.alertTime || project.latestTime || project.startTime || "—";
    if (coordEl) coordEl.textContent = formatAlertGeoCoord(project);
    if (projectEl) projectEl.textContent = project.projectName || "—";
    if (positionEl) positionEl.textContent = project.alarmPosition || project.position || project.location || "—";
    if (typeEl) typeEl.textContent = project.alarmType || project.type || "—";
    if (levelEl) levelEl.textContent = project.riskLevel || (project.uavRecord && project.uavRecord.level) || "—";
    if (sourceEl) sourceEl.textContent = WA ? WA.formatAlertSourceDisplay(project.source) : (project.source || "—");

    var falseAlarmInputs = global.document.querySelectorAll('input[name="uav-review-false-alarm"]');
    falseAlarmInputs.forEach(function (input) { input.checked = input.value === "否"; });
    var illegalInputs = global.document.querySelectorAll('input[name="uav-review-illegal"]');
    illegalInputs.forEach(function (input) { input.checked = input.value === "否"; });
    var riskLevel = global.document.getElementById("uav-review-risk-level");
    if (riskLevel) riskLevel.value = "一级告警";
    var content = global.document.getElementById("uav-review-content");
    if (content) content.value = "";
    toggleUavReviewDetailFields();
  }

  function readUavReviewForm() {
    var falseAlarmChecked = global.document.querySelector('input[name="uav-review-false-alarm"]:checked');
    var illegalChecked = global.document.querySelector('input[name="uav-review-illegal"]:checked');
    var riskLevel = global.document.getElementById("uav-review-risk-level");
    var content = global.document.getElementById("uav-review-content");
    return {
      falseAlarm: falseAlarmChecked ? falseAlarmChecked.value : "否",
      illegal: illegalChecked ? illegalChecked.value : "否",
      riskLevel: riskLevel ? riskLevel.value : "一级告警",
      content: content ? (content.value || "").trim() : ""
    };
  }

  function setShellTabbarHidden(hidden) {
    try {
      var target = global.top || global.parent;
      if (target && target !== global) {
        target.postMessage({ type: "wh-miniapp-tabbar", hidden: !!hidden }, "*");
      }
    } catch (e) {}
  }

  function openUavReviewModal(project) {
    var modal = global.document.getElementById("uav-review-modal");
    if (!modal) return;
    modal._currentProject = project;
    fillUavReviewModal(project);
    modal.classList.add("is-open");
    modal.setAttribute("aria-hidden", "false");
    global.document.body.classList.add("mp-scroll-locked");
    setShellTabbarHidden(true);
  }

  function closeUavReviewModal() {
    var modal = global.document.getElementById("uav-review-modal");
    if (!modal) return;
    modal.classList.remove("is-open");
    modal.setAttribute("aria-hidden", "true");
    modal._currentProject = null;
    global.document.body.classList.remove("mp-scroll-locked");
    setShellTabbarHidden(false);
  }

  function saveUavReviewModal() {
    var modal = global.document.getElementById("uav-review-modal");
    var project = modal ? modal._currentProject : null;
    var data = readUavReviewForm();
    if (project) {
      project.workflowStatus = "已复核";
      project.review = {
        falseAlarm: data.falseAlarm,
        illegal: data.illegal,
        riskLevel: data.riskLevel,
        content: data.content,
        reviewTime: new Date().toLocaleString("zh-CN")
      };
      project.mistaken = data.falseAlarm === "是" ? "是" : "否";
    }
    closeUavReviewModal();
    showToast("复核已保存");
    if (global.WHMapAlertsMobile && typeof global.WHMapAlertsMobile.refresh === "function") {
      global.WHMapAlertsMobile.refresh();
    }
  }

  function showToast(msg) {
    var el = global.document.getElementById("patrol-alerts-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast._t);
    showToast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 1800);
  }

  function initUavReviewModal() {
    global.document.addEventListener("click", function (event) {
      var openBtn = event.target.closest("[data-action='alert-review-uav']");
      if (openBtn) {
        event.preventDefault();
        event.stopPropagation();
        var id = openBtn.getAttribute("data-id");
        var WA = global.WHMapAlerts;
        var project = WA && WA.findProject ? WA.findProject(id) : null;
        if (project) openUavReviewModal(project);
        return;
      }
      var closeBtn = event.target.closest("[data-action='close-uav-review-modal']");
      if (closeBtn) {
        event.preventDefault();
        event.stopPropagation();
        closeUavReviewModal();
        return;
      }
      var saveBtn = event.target.closest("[data-action='save-uav-review-modal']");
      if (saveBtn) {
        event.preventDefault();
        event.stopPropagation();
        saveUavReviewModal();
        return;
      }
    });

    global.document.addEventListener("change", function (event) {
      if (event.target.matches('input[name="uav-review-false-alarm"]')) {
        toggleUavReviewDetailFields();
      }
    });

    var modal = global.document.getElementById("uav-review-modal");
    if (modal) {
      modal.addEventListener("click", function (event) {
        if (event.target === modal || event.target.classList.contains("mp-uav-review-modal__mask")) {
          closeUavReviewModal();
        }
      });
    }

    if (global.WHMapAlerts) {
      global.WHMapAlerts.openUavReview = openUavReviewModal;
    }
  }

  function start() {
    var params = new URLSearchParams(global.location.search);
    var hideHeader = params.get("hideHeader") === "1";
    if (hideHeader) {
      var header = global.document.querySelector(".miniapp-navbar");
      if (header) header.hidden = true;
      var app = global.document.getElementById("patrol-alerts-app");
      if (app) app.style.paddingTop = "0";
      var body = global.document.body;
      if (body) body.classList.add("mp-patrol-alerts-embedded");
    }

    bindNavBack();
    initUavReviewModal();
    if (global.MiniAppFrame && global.MiniAppFrame.syncTabbar) {
      global.MiniAppFrame.syncTabbar();
    }
    initPickers();
    if (global.WHMapAlertsMobilePage && global.WHMapAlertsMobilePage.boot) {
      global.WHMapAlertsMobilePage.boot();
    }
    patchViewNav();
    global.addEventListener("pageshow", function (event) {
      if (!event.persisted) return;
      if (!global.document.getElementById("patrol-alerts-app")) return;
      var pageParams = new URLSearchParams(global.location.search);
      if (pageParams.get("fromGis") === "1" && pageParams.get("id")) return;
      if (global.WHMapAlerts && typeof global.WHMapAlerts.resetPatrolAlertsEntryView === "function") {
        global.WHMapAlerts.resetPatrolAlertsEntryView();
      }
    });
  }

  if (global.document.readyState === "loading") {
    global.document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})(window);