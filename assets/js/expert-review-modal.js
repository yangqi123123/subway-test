/**
 * 专家工具 / 告警信息 共用：复核弹窗、审核弹窗
 */
(function () {
  var DEFAULT_PHOTOS = [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=300&q=80",
  ];

  var reviewDraft = {
    falseAlarm: "非误报",
    levelAdjust: "一级告警",
    scene: "",
    photos: DEFAULT_PHOTOS.slice(),
  };

  var objectUrls = [];
  var reviewSaveCallback = null;

  function nowStr() {
    var d = new Date();
    var p = function (n) {
      return String(n).padStart(2, "0");
    };
    return (
      d.getFullYear() +
      "-" +
      p(d.getMonth() + 1) +
      "-" +
      p(d.getDate()) +
      " " +
      p(d.getHours()) +
      ":" +
      p(d.getMinutes()) +
      ":" +
      p(d.getSeconds())
    );
  }

  function showToast(msg) {
    var el = document.getElementById("expert-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(showToast.timer);
    showToast.timer = setTimeout(function () {
      el.classList.remove("show");
    }, 1800);
  }

  function alarmIcon() {
    if (window.WuhanGIS && window.WuhanGIS.makeBadgeIcon) {
      return window.WuhanGIS.makeBadgeIcon("#ef4444", "fa-solid fa-circle-exclamation", 28);
    }
    return null;
  }

  function readFalseAlarmFromForm() {
    var checked = document.querySelector('input[name="review-false-alarm"]:checked');
    return checked ? checked.value : "非误报";
  }

  function toggleModalDetailFields() {
    var isMisreport = readFalseAlarmFromForm() === "误报";
    document.querySelectorAll("[data-review-field-group='detail']").forEach(function (el) {
      el.classList.toggle("is-hidden", isMisreport);
    });
  }

  function renderModalPhotos() {
    var wrap = document.getElementById("review-modal-photos");
    if (!wrap) return;
    wrap.innerHTML = reviewDraft.photos
      .map(function (src, index) {
        return (
          "<div class=\"expert-photo-item\"><img src=\"" +
          src +
          "\" alt=\"现场图" +
          (index + 1) +
          "\" /></div>"
        );
      })
      .join("");
  }

  function fillReviewForm(state) {
    state = state || {};
    reviewDraft.falseAlarm = state.falseAlarm || "非误报";
    reviewDraft.levelAdjust = state.levelAdjust || "一级告警";
    reviewDraft.scene = state.scene || state.detail || "";
    reviewDraft.photos = (state.photos && state.photos.length ? state.photos : DEFAULT_PHOTOS).slice();

    var projectRow = document.getElementById("review-project-name-row");
    if (projectRow) {
      projectRow.classList.toggle("is-hidden", !state.showProjectSelect);
    }

    document.querySelectorAll('input[name="review-false-alarm"]').forEach(function (input) {
      input.checked = input.value === reviewDraft.falseAlarm;
    });
    var level = document.getElementById("review-level-adjust");
    var scene = document.getElementById("review-scene");
    if (level) level.value = reviewDraft.levelAdjust;
    if (scene) scene.value = reviewDraft.scene;
    renderModalPhotos();
    toggleModalDetailFields();
  }

  function readReviewForm() {
    var level = document.getElementById("review-level-adjust");
    var scene = document.getElementById("review-scene");
    return {
      falseAlarm: readFalseAlarmFromForm(),
      levelAdjust: level ? level.value : reviewDraft.levelAdjust,
      scene: scene ? (scene.value || "").trim() : reviewDraft.scene,
      photos: reviewDraft.photos.slice(),
      mistaken: readFalseAlarmFromForm() === "误报" ? "是" : "否",
      detail: scene ? (scene.value || "").trim() : reviewDraft.scene,
    };
  }

  function openReviewModal(initialState, onSave) {
    var mask = document.getElementById("expert-review-modal-mask");
    if (!mask) return;
    reviewSaveCallback = onSave || null;
    fillReviewForm(initialState);
    if (typeof initialState.onFormReady === "function") {
      initialState.onFormReady(initialState);
    }
    mask.classList.add("show");
  }

  function closeReviewModal() {
    var mask = document.getElementById("expert-review-modal-mask");
    if (mask) mask.classList.remove("show");
    var input = document.getElementById("review-photo-input");
    if (input) input.value = "";
    reviewSaveCallback = null;
  }

  function saveReviewModal() {
    var data = readReviewForm();
    if (typeof reviewSaveCallback === "function") {
      reviewSaveCallback(data);
    }
    closeReviewModal();
    showToast("复核已提交");
  }

  function openAuditModal(onDecision) {
    var mask = document.getElementById("alert-audit-modal-mask");
    var opinion = document.getElementById("audit-opinion");
    if (!mask) return;
    mask._onDecision = onDecision;
    if (opinion) opinion.value = "";
    mask.classList.add("show");
  }

  function closeAuditModal() {
    var mask = document.getElementById("alert-audit-modal-mask");
    if (mask) {
      mask.classList.remove("show");
      mask._onDecision = null;
    }
  }

  function initReviewModal() {
    var mask = document.getElementById("expert-review-modal-mask");
    if (!mask) return;

    mask.addEventListener("click", function (e) {
      if (e.target === mask) closeReviewModal();
    });
    document.querySelectorAll("[data-action='close-review-modal']").forEach(function (btn) {
      btn.addEventListener("click", closeReviewModal);
    });
    var saveBtn = document.querySelector("[data-action='save-review-modal']");
    if (saveBtn) saveBtn.addEventListener("click", saveReviewModal);

    document.querySelectorAll('input[name="review-false-alarm"]').forEach(function (input) {
      input.addEventListener("change", toggleModalDetailFields);
    });

    var photoInput = document.getElementById("review-photo-input");
    if (photoInput) {
      photoInput.addEventListener("change", function () {
        var files = Array.prototype.slice.call(photoInput.files || []);
        if (!files.length) return;
        objectUrls.forEach(function (url) {
          try {
            URL.revokeObjectURL(url);
          } catch (e) {}
        });
        objectUrls = [];
        reviewDraft.photos = files.slice(0, 6).map(function (file) {
          var url = URL.createObjectURL(file);
          objectUrls.push(url);
          return url;
        });
        renderModalPhotos();
      });
    }
  }

  function initAuditModal() {
    var mask = document.getElementById("alert-audit-modal-mask");
    if (!mask) return;

    mask.addEventListener("click", function (e) {
      if (e.target === mask) closeAuditModal();
    });
    document.querySelectorAll("[data-action='close-audit-modal']").forEach(function (btn) {
      btn.addEventListener("click", closeAuditModal);
    });

    var rejectBtn = document.querySelector("[data-action='audit-reject']");
    var passBtn = document.querySelector("[data-action='audit-pass']");
    var opinion = document.getElementById("audit-opinion");

    if (rejectBtn) {
      rejectBtn.addEventListener("click", function () {
        var text = opinion ? (opinion.value || "").trim() : "";
        if (typeof mask._onDecision === "function") {
          mask._onDecision({ result: "审核不通过", opinion: text || "审批驳回" });
        }
        closeAuditModal();
        showToast("已驳回");
      });
    }
    if (passBtn) {
      passBtn.addEventListener("click", function () {
        var text = opinion ? (opinion.value || "").trim() : "";
        if (typeof mask._onDecision === "function") {
          mask._onDecision({ result: "审核通过", opinion: text || "同意" });
        }
        closeAuditModal();
        showToast("审批通过");
      });
    }
  }

  function init() {
    initReviewModal();
    initAuditModal();
  }

  window.WuhanExpertReviewModal = {
    openReview: openReviewModal,
    closeReview: closeReviewModal,
    openAudit: openAuditModal,
    closeAudit: closeAuditModal,
    showToast: showToast,
    nowStr: nowStr,
    DEFAULT_PHOTOS: DEFAULT_PHOTOS,
    fillReviewForm: fillReviewForm,
    readReviewForm: readReviewForm,
    init: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
