/**
 * 专家工具：GIS 单点展示 + 最新告警复核编辑弹窗
 */
(function () {
  var EXPERT_LABEL = "中南医院站-湖北日报站";

  var DEFAULT_PHOTOS = [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=300&q=80",
    "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=300&q=80",
  ];

  var reviewState = {
    falseAlarm: "非误报",
    levelAdjust: "一级告警",
    scene: "现场工地有破拆机械作业",
    photos: DEFAULT_PHOTOS.slice(),
  };

  var objectUrls = [];

  function getExpertRow() {
    if (window.WuhanSituationGIS && window.WuhanSituationGIS.EXPERT_ALARM_ROW) {
      return window.WuhanSituationGIS.EXPERT_ALARM_ROW;
    }
    return {
      location: EXPERT_LABEL,
      lat: 30.5859,
      lng: 114.3122,
    };
  }

  function updateMapCaption() {
    var caption = document.getElementById("expert-map-caption");
    if (!caption) return;
    caption.textContent = "告警区间：" + EXPERT_LABEL;
  }

  function initExpertMap() {
    if (!window.WuhanSituationGIS || !window.WuhanSituationGIS.mountAlarmMap) return;
    var row = getExpertRow();
    window.WuhanSituationGIS.mountAlarmMap("expert-gis-map", {
      rows: [row],
      center: [row.lat, row.lng],
      zoom: 13,
      focusZoom: 14,
      tooltipClass: "sit-alarm-tooltip",
    });
    updateMapCaption();
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

  function setReviewLine(key, text) {
    var line = document.querySelector('[data-review-line="' + key + '"] [data-review-val]');
    if (line) line.textContent = text;
  }

  function renderCardPhotos() {
    var wrap = document.getElementById("expert-review-photos");
    if (!wrap) return;
    wrap.innerHTML = reviewState.photos
      .map(function (src) {
        return (
          '<img src="' +
          src +
          '" class="h-12 w-full object-cover border border-white/10" alt="现场图" />'
        );
      })
      .join("");
  }

  function renderModalPhotos() {
    var wrap = document.getElementById("review-modal-photos");
    if (!wrap) return;
    wrap.innerHTML = reviewState.photos
      .map(function (src, index) {
        return (
          '<div class="expert-photo-item"><img src="' +
          src +
          '" alt="现场图' +
          (index + 1) +
          '" /></div>'
        );
      })
      .join("");
  }

  function syncReviewCard() {
    setReviewLine("falseAlarm", reviewState.falseAlarm);
    setReviewLine("levelAdjust", reviewState.levelAdjust);
    setReviewLine("scene", reviewState.scene);
    renderCardPhotos();

    var levelLine = document.querySelector('[data-review-line="levelAdjust"]');
    var sceneLine = document.querySelector('[data-review-line="scene"]');
    var photosLabel = document.getElementById("expert-review-photos");
    var isMisreport = reviewState.falseAlarm === "误报";
    if (levelLine) levelLine.style.display = isMisreport ? "none" : "";
    if (sceneLine) sceneLine.style.display = isMisreport ? "none" : "";
    if (photosLabel) photosLabel.style.display = isMisreport ? "none" : "";
    if (photosLabel && photosLabel.previousElementSibling) {
      photosLabel.previousElementSibling.style.display = isMisreport ? "none" : "";
    }
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

  function fillReviewForm() {
    document.querySelectorAll('input[name="review-false-alarm"]').forEach(function (input) {
      input.checked = input.value === reviewState.falseAlarm;
    });
    var level = document.getElementById("review-level-adjust");
    var scene = document.getElementById("review-scene");
    if (level) level.value = reviewState.levelAdjust;
    if (scene) scene.value = reviewState.scene;
    renderModalPhotos();
    toggleModalDetailFields();
  }

  function openReviewModal() {
    var mask = document.getElementById("expert-review-modal-mask");
    if (!mask) return;
    fillReviewForm();
    mask.classList.add("show");
  }

  function closeReviewModal() {
    var mask = document.getElementById("expert-review-modal-mask");
    if (mask) mask.classList.remove("show");
    var input = document.getElementById("review-photo-input");
    if (input) input.value = "";
  }

  function revokeObjectUrls() {
    objectUrls.forEach(function (url) {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    });
    objectUrls = [];
  }

  function saveReviewModal() {
    reviewState.falseAlarm = readFalseAlarmFromForm();
    if (reviewState.falseAlarm !== "误报") {
      var level = document.getElementById("review-level-adjust");
      var scene = document.getElementById("review-scene");
      reviewState.levelAdjust = level ? level.value : reviewState.levelAdjust;
      reviewState.scene = scene ? (scene.value || "").trim() || reviewState.scene : reviewState.scene;
    }
    syncReviewCard();
    closeReviewModal();
    showToast("复核情况已保存");
  }

  function initReviewEdit() {
    var card = document.getElementById("expert-review-card");
    var btnEdit = document.getElementById("btn-review-edit");
    var mask = document.getElementById("expert-review-modal-mask");
    if (!card || !btnEdit || !mask) return;

    syncReviewCard();

    card.addEventListener("click", function (e) {
      if (e.target.closest("#btn-review-edit")) return;
      card.classList.add("is-active");
    });

    btnEdit.addEventListener("click", function (e) {
      e.stopPropagation();
      openReviewModal();
    });

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
        revokeObjectUrls();
        var added = files.slice(0, 6).map(function (file) {
          var url = URL.createObjectURL(file);
          objectUrls.push(url);
          return url;
        });
        reviewState.photos = added;
        renderModalPhotos();
      });
    }
  }

  var ALERT_DETAIL_URL = "map-alerts.html?view=detail&id=2&from=expert";

  var locationNoteText = "";

  function renderLocationNoteReadonly() {
    var readonly = document.getElementById("expert-location-note-readonly");
    if (!readonly) return;
    var text = (locationNoteText || "").trim();
    if (!text) {
      readonly.textContent = "暂无备注";
      readonly.classList.add("is-empty");
      return;
    }
    readonly.textContent = text;
    readonly.classList.remove("is-empty");
  }

  function setLocationNoteEditing(editing) {
    var readonly = document.getElementById("expert-location-note-readonly");
    var input = document.getElementById("expert-location-note-input");
    var actions = document.getElementById("expert-location-note-actions");
    if (!readonly || !input || !actions) return;

    if (editing) {
      input.value = locationNoteText;
      readonly.classList.add("hidden");
      input.classList.remove("hidden");
      actions.classList.add("is-editing");
      input.focus();
      return;
    }

    input.classList.add("hidden");
    readonly.classList.remove("hidden");
    actions.classList.remove("is-editing");
    renderLocationNoteReadonly();
  }

  function initGoAlertDetail() {
    var btn = document.getElementById("btn-go-alert-detail");
    if (!btn) return;
    btn.addEventListener("click", function () {
      window.location.href = ALERT_DETAIL_URL;
    });
  }

  function initLocationNote() {
    var btnEdit = document.getElementById("btn-location-note-edit");
    var btnSave = document.getElementById("btn-location-note-save");
    var btnCancel = document.getElementById("btn-location-note-cancel");
    if (!btnEdit || !btnSave || !btnCancel) return;

    renderLocationNoteReadonly();
    setLocationNoteEditing(false);

    btnEdit.addEventListener("click", function () {
      setLocationNoteEditing(true);
    });

    btnCancel.addEventListener("click", function () {
      setLocationNoteEditing(false);
    });

    btnSave.addEventListener("click", function () {
      var input = document.getElementById("expert-location-note-input");
      locationNoteText = input ? (input.value || "").trim() : "";
      setLocationNoteEditing(false);
      showToast(locationNoteText ? "位置备注已保存" : "位置备注已清空");
    });
  }

  var SPEC_TIME_LABELS = [
    "8:32",
    "8:32",
    "8:32",
    "8:32",
    "8:32",
    "8:31",
    "8:31",
    "8:31",
    "8:31",
  ];
  var SPEC_FREQ_HZ = [2400, 2430, 2460, 2490, 2520, 2550];

  function specSeeded(n) {
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function specIntensity(col, row, cols, rows) {
    var fx = col / Math.max(cols - 1, 1);
    var ty = row / Math.max(rows - 1, 1);
    var base = specSeeded(col * 17 + row * 31) * 0.38;
    var band = Math.exp(-Math.pow((fx - 0.54) / 0.11, 2)) * 0.52;
    var burst = Math.exp(-Math.pow((ty - 0.46) / 0.16, 2)) * band * 0.9;
    var edge = specSeeded(col * 3 + row) * 0.12 * band;
    return Math.min(1, base + band * 0.28 + burst + edge);
  }

  function specColor(t) {
    var blue = [71, 166, 255];
    var orange = [255, 191, 51];
    var red = [255, 77, 79];
    var dark = [8, 14, 28];
    var a;
    var b;
    var u;
    if (t < 0.38) {
      u = t / 0.38;
      a = dark;
      b = blue;
    } else if (t < 0.72) {
      u = (t - 0.38) / 0.34;
      a = blue;
      b = orange;
    } else {
      u = (t - 0.72) / 0.28;
      a = orange;
      b = red;
    }
    return (
      "rgb(" +
      Math.round(a[0] + (b[0] - a[0]) * u) +
      "," +
      Math.round(a[1] + (b[1] - a[1]) * u) +
      "," +
      Math.round(a[2] + (b[2] - a[2]) * u) +
      ")"
    );
  }

  function renderSpecAxes() {
    var axisY = document.getElementById("expert-spec-axis-y");
    var axisX = document.getElementById("expert-spec-axis-x");
    if (!axisY || !axisX) return;
    axisY.innerHTML = SPEC_TIME_LABELS.map(function (t) {
      return "<span>" + t + "</span>";
    }).join("");
    axisX.innerHTML = SPEC_FREQ_HZ.map(function (hz) {
      return "<span>" + hz + "</span>";
    }).join("");
  }

  function drawExpertSpectrum() {
    var canvas = document.getElementById("expert-spectrum-canvas");
    if (!canvas) return;
    var wrap = canvas.parentElement;
    if (!wrap) return;
    var w = wrap.clientWidth;
    var h = wrap.clientHeight;
    if (w < 4 || h < 4) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var cols = Math.max(48, Math.floor(w / 2));
    var rows = Math.max(40, Math.floor(h / 2));
    var cellW = w / cols;
    var cellH = h / rows;
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var v = specIntensity(col, row, cols, rows);
        ctx.fillStyle = specColor(v);
        ctx.fillRect(col * cellW, row * cellH, cellW + 0.5, cellH + 0.5);
      }
    }
  }

  function initExpertSpectrum() {
    renderSpecAxes();
    drawExpertSpectrum();
    window.addEventListener("resize", drawExpertSpectrum);
  }

  function init() {
    initExpertMap();
    initExpertSpectrum();
    initReviewEdit();
    initGoAlertDetail();
    initLocationNote();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
