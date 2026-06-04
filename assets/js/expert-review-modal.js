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
    projectName: "",
    falseAlarm: "非误报",
    levelAdjust: "一级告警",
    scene: "",
    photos: DEFAULT_PHOTOS.slice(),
  };

  var batchReviewDraft = {
    projectName: "",
    falseAlarm: "非误报",
    levelAdjust: "一级告警",
    scene: "",
    photos: DEFAULT_PHOTOS.slice(),
  };

  var batchProjectSelectInst = null;

  var activePhotoScope = "modal";

  var objectUrls = [];
  var reviewSaveCallback = null;
  var reviewPickerState = {
    selectId: null,
    options: [],
    selected: [],
    title: "请选择",
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

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

  function syncSelectPickerButton(select) {
    if (!select) return;
    var btn = document.querySelector('[data-dynamic-select="' + select.id + '"]');
    if (!btn) return;
    var span = btn.querySelector(".mp-picker-field__text");
    if (!span) return;
    var opt = select.options[select.selectedIndex];
    var text = opt ? opt.text : "";
    var placeholder = btn.getAttribute("data-placeholder") || "请选择";
    var skipEmpty = btn.getAttribute("data-skip-empty") !== "0";
    var isEmpty = !text || (skipEmpty && text === placeholder);
    span.textContent = isEmpty ? placeholder : text;
    span.classList.toggle("is-placeholder", isEmpty);
  }

  function bindSelectPicker(select, meta) {
    meta = meta || {};
    if (!select || select.dataset.mpPickerBound === "1") {
      syncSelectPickerButton(select);
      return;
    }
    if (!document.getElementById("mp-picker-sheet")) {
      select.dataset.mpPickerBound = "1";
      select.classList.add("expert-select");
      return;
    }
    select.dataset.mpPickerBound = "1";
    select.classList.add("mp-select-native");
    select.style.display = "none";

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mp-picker-field mp-select-picker";
    btn.setAttribute("data-dynamic-select", select.id);
    btn.setAttribute("data-picker-title", meta.pickerTitle || "请选择");
    btn.setAttribute("data-placeholder", meta.placeholder || "请选择");
    btn.setAttribute("data-skip-empty", meta.skipEmpty === false ? "0" : "1");

    var span = document.createElement("span");
    span.className = "mp-picker-field__text";
    btn.appendChild(span);

    var icon = document.createElement("i");
    icon.className = "fa-solid fa-chevron-down";
    btn.appendChild(icon);

    select.parentNode.insertBefore(btn, select.nextSibling);
    syncSelectPickerButton(select);
  }

  function bindProjectSelectPicker(select) {
    bindSelectPicker(select, {
      pickerTitle: "项目名称",
      placeholder: "请选择项目名称",
      skipEmpty: true,
    });
  }

  function bindLevelSelectPicker(select) {
    bindSelectPicker(select, {
      pickerTitle: "报警级别调整",
      placeholder: "请选择报警级别",
      skipEmpty: false,
    });
  }

  function getDraft(scope) {
    return scope === "batch" ? batchReviewDraft : reviewDraft;
  }

  function populateProjectSelectOptionsFor(selectId, options, current) {
    var select = document.getElementById(selectId);
    if (!select) return;
    var list = (options && options.length ? options : []).slice();
    if (current && list.indexOf(current) < 0) list.unshift(current);
    select.innerHTML =
      '<option value="">请选择项目名称</option>' +
      list
        .map(function (name) {
          return '<option value="' + esc(name) + '">' + esc(name) + "</option>";
        })
        .join("");
    if (current) {
      Array.prototype.forEach.call(select.options, function (opt, idx) {
        if (opt.text === current || opt.value === current) select.selectedIndex = idx;
      });
    }
    bindProjectSelectPicker(select);
  }

  function populateProjectSelectOptions(options, current) {
    populateProjectSelectOptionsFor("review-project-name-select", options, current);
  }

  function closeReviewProjectPicker() {
    var sheet = document.getElementById("mp-picker-sheet");
    if (sheet) sheet.classList.remove("is-open");
    reviewPickerState.selectId = null;
  }

  function renderReviewProjectPickerOptions() {
    var body = document.getElementById("mp-picker-body");
    if (!body) return;
    body.innerHTML = reviewPickerState.options
      .map(function (opt) {
        var checked = reviewPickerState.selected.indexOf(opt) >= 0;
        return (
          '<label class="mp-picker-option">' +
          '<input type="radio" name="mp-picker-opt" value="' +
          esc(opt) +
          '"' +
          (checked ? " checked" : "") +
          ' data-single="1" />' +
          "<span>" +
          esc(opt) +
          "</span></label>"
        );
      })
      .join("");
  }

  function openReviewSelectPicker(selectId) {
    var select = document.getElementById(selectId);
    if (!select) return;
    var btn = document.querySelector('[data-dynamic-select="' + selectId + '"]');
    var placeholder = (btn && btn.getAttribute("data-placeholder")) || "请选择";
    var skipEmpty = !btn || btn.getAttribute("data-skip-empty") !== "0";
    var options = Array.prototype.map
      .call(select.options, function (o) {
        return o.text;
      })
      .filter(function (t) {
        return t && (!skipEmpty || t !== placeholder);
      });
    if (!options.length) return;

    var current = select.options[select.selectedIndex];
    reviewPickerState.selectId = selectId;
    reviewPickerState.options = options;
    reviewPickerState.selected =
      current && current.text && (!skipEmpty || current.text !== placeholder) ? [current.text] : [];

    var titleEl = document.getElementById("mp-picker-title");
    if (titleEl) titleEl.textContent = (btn && btn.getAttribute("data-picker-title")) || "请选择";
    renderReviewProjectPickerOptions();

    var sheet = document.getElementById("mp-picker-sheet");
    if (sheet) sheet.classList.add("is-open");
  }

  function confirmReviewSelectPicker() {
    var select = document.getElementById(reviewPickerState.selectId || "review-project-name-select");
    if (!select) return closeReviewProjectPicker();
    var checked = document.querySelector('#mp-picker-body input[name="mp-picker-opt"]:checked');
    var picked = checked ? checked.value : "";
    if (picked) {
      var matched = -1;
      Array.prototype.forEach.call(select.options, function (opt, idx) {
        if (opt.text === picked || opt.value === picked) matched = idx;
      });
      if (matched >= 0) select.selectedIndex = matched;
    }
    var scope = reviewPickerState.selectId && reviewPickerState.selectId.indexOf("wb-batch-") === 0 ? "batch" : "modal";
    var draft = getDraft(scope);
    var selectId = reviewPickerState.selectId || "";
    if (selectId.indexOf("level-adjust") >= 0) {
      draft.levelAdjust = picked || (select.options[select.selectedIndex] && select.options[select.selectedIndex].value) || "";
    } else {
      draft.projectName = picked || "";
    }
    syncSelectPickerButton(select);
    closeReviewProjectPicker();
  }

  function openReviewPhotoPreview(src) {
    var sheet = document.getElementById("review-photo-preview-sheet");
    var img = document.getElementById("review-photo-preview-img");
    if (!sheet || !img || !src) return;
    img.src = src;
    sheet.classList.add("is-open");
    sheet.setAttribute("aria-hidden", "false");
  }

  function closeReviewPhotoPreview() {
    var sheet = document.getElementById("review-photo-preview-sheet");
    var img = document.getElementById("review-photo-preview-img");
    if (sheet) {
      sheet.classList.remove("is-open");
      sheet.setAttribute("aria-hidden", "true");
    }
    if (img) img.src = "";
  }

  function removeReviewPhoto(index, scope) {
    var draft = getDraft(scope || activePhotoScope);
    if (index < 0 || index >= draft.photos.length) return;
    var removed = draft.photos.splice(index, 1)[0];
    if (removed && removed.indexOf("blob:") === 0) {
      try {
        URL.revokeObjectURL(removed);
      } catch (e) {}
      objectUrls = objectUrls.filter(function (url) {
        return url !== removed;
      });
    }
    if (scope === "batch") renderBatchReviewPhotos();
    else renderModalPhotos();
  }

  function renderPhotosTo(wrapId, draft, scope) {
    var wrap = document.getElementById(wrapId);
    if (!wrap) return;
    activePhotoScope = scope || "modal";
    if (!draft.photos.length) {
      wrap.innerHTML = '<div class="mp-todo-photo-empty">暂无现场照片</div>';
      return;
    }
    wrap.innerHTML = draft.photos
      .map(function (src, index) {
        return (
          '<div class="expert-photo-item mp-todo-photo-item">' +
          '<button type="button" class="mp-todo-photo-item__thumb" data-action="preview-review-photo" data-photo-scope="' +
          esc(scope || "modal") +
          '" data-photo-index="' +
          index +
          '">' +
          '<img src="' +
          esc(src) +
          '" alt="现场图' +
          (index + 1) +
          '" /></button>' +
          '<button type="button" class="mp-todo-photo-item__remove" data-action="remove-review-photo" data-photo-scope="' +
          esc(scope || "modal") +
          '" data-photo-index="' +
          index +
          '" aria-label="删除照片"><i class="fa-solid fa-xmark"></i></button>' +
          "</div>"
        );
      })
      .join("");
  }

  function renderModalPhotos() {
    renderPhotosTo("review-modal-photos", reviewDraft, "modal");
  }

  function renderBatchReviewPhotos() {
    renderPhotosTo("wb-batch-modal-photos", batchReviewDraft, "batch");
  }

  function buildDesktopBatchReviewFormHtml() {
    return (
      '<section class="wb-todo-batch-review-form">' +
      '<div class="wb-todo-batch-review-form__title">编辑复核情况</div>' +
      '<div class="expert-form-row"><label class="expert-form-label">项目名称</label>' +
      '<div id="wb-batch-project-name-select" class="w-full" data-input-id="wb-batch-project-name-value"></div></div>' +
      '<div class="expert-form-row"><label class="expert-form-label">是否误报</label>' +
      '<div class="expert-radio-group">' +
      '<label><input type="radio" name="wb-batch-false-alarm" value="非误报" checked /> 非误报</label>' +
      '<label><input type="radio" name="wb-batch-false-alarm" value="误报" /> 误报</label>' +
      "</div></div>" +
      '<div class="expert-form-row" data-batch-review-field-group="detail"><label class="expert-form-label" for="wb-batch-level-adjust">报警级别调整</label>' +
      '<select id="wb-batch-level-adjust" class="expert-select wh-input w-full">' +
      '<option value="一级告警">一级告警</option><option value="二级告警">二级告警</option><option value="三级告警">三级告警</option>' +
      "</select></div>" +
      '<div class="expert-form-row" data-batch-review-field-group="detail"><label class="expert-form-label" for="wb-batch-scene">现场情况</label>' +
      '<textarea id="wb-batch-scene" class="expert-textarea" placeholder="请填写现场复核情况"></textarea></div>' +
      '<div class="expert-form-row" data-batch-review-field-group="detail"><label class="expert-form-label">现场照片</label>' +
      '<div id="wb-batch-modal-photos" class="expert-photo-grid"></div>' +
      '<input id="wb-batch-photo-input" type="file" accept="image/*" multiple hidden />' +
      '<button type="button" class="expert-photo-upload-btn" data-action="pick-review-photo" data-photo-scope="batch">+ 添加照片</button>' +
      "</div></section>"
    );
  }

  function buildInlineReviewFormHtml() {
    return (
      '<section class="mp-patrol-alert-section mp-todo-batch-review-form">' +
      '<h4 class="mp-patrol-alert-section__title">编辑复核情况</h4>' +
      '<div class="mp-modal-form">' +
      '<div class="mp-form-row mp-form-row--full">' +
      '<label class="project-form-label" for="wb-batch-project-name-select">项目名称</label>' +
      '<select id="wb-batch-project-name-select" class="wh-input mp-field mp-select-native"><option value="">请选择项目名称</option></select>' +
      "</div>" +
      '<div class="mp-form-row mp-form-row--full">' +
      '<label class="project-form-label">是否误报</label>' +
      '<div class="mp-todo-radio-group">' +
      '<label><input type="radio" name="wb-batch-false-alarm" value="非误报" checked /> 非误报</label>' +
      '<label><input type="radio" name="wb-batch-false-alarm" value="误报" /> 误报</label>' +
      "</div></div>" +
      '<div class="mp-form-row mp-form-row--full" data-batch-review-field-group="detail">' +
      '<label class="project-form-label" for="wb-batch-level-adjust">报警级别调整</label>' +
      '<select id="wb-batch-level-adjust" class="wh-input mp-field">' +
      '<option value="一级告警">一级告警</option><option value="二级告警">二级告警</option><option value="三级告警">三级告警</option>' +
      "</select></div>" +
      '<div class="mp-form-row mp-form-row--full" data-batch-review-field-group="detail">' +
      '<label class="project-form-label" for="wb-batch-scene">现场情况</label>' +
      '<textarea id="wb-batch-scene" class="wh-input mp-field mp-field--textarea" placeholder="请填写现场复核情况"></textarea>' +
      "</div>" +
      '<div class="mp-form-row mp-form-row--full" data-batch-review-field-group="detail">' +
      '<label class="project-form-label">现场照片</label>' +
      '<div id="wb-batch-modal-photos" class="mp-todo-photo-grid"></div>' +
      '<input id="wb-batch-photo-input" type="file" accept="image/*" multiple hidden />' +
      '<button type="button" class="mp-todo-photo-upload-btn" data-action="pick-review-photo" data-photo-scope="batch">+ 添加照片</button>' +
      "</div></div></section>"
    );
  }

  function toggleBatchReviewDetailFields() {
    var checked = document.querySelector('input[name="wb-batch-false-alarm"]:checked');
    var isMisreport = checked && checked.value === "误报";
    document.querySelectorAll('[data-batch-review-field-group="detail"]').forEach(function (el) {
      el.classList.toggle("is-hidden", isMisreport);
    });
  }

  function mountBatchProjectSearchSelect(options, current) {
    batchProjectSelectInst = null;
    var wrap = document.getElementById("wb-batch-project-name-select");
    if (!wrap) return;
    if (wrap.tagName === "SELECT") {
      populateProjectSelectOptionsFor("wb-batch-project-name-select", options || [], current || "");
      batchReviewDraft.projectName = current || "";
      return;
    }
    if (window.WHSearchSelect) {
      batchProjectSelectInst = WHSearchSelect.mountById(
        "wb-batch-project-name-select",
        "请搜索或选择项目名称",
        options || []
      );
      if (batchProjectSelectInst && current) {
        batchProjectSelectInst.setValue(current);
      }
    }
    batchReviewDraft.projectName = current || "";
  }

  function initInlineReviewForm(state) {
    state = state || {};
    batchReviewDraft.projectName = state.projectName || "";
    batchReviewDraft.falseAlarm = state.falseAlarm || "非误报";
    batchReviewDraft.levelAdjust = state.levelAdjust || "一级告警";
    batchReviewDraft.scene = state.scene || state.detail || "";
    batchReviewDraft.photos = (state.photos && state.photos.length ? state.photos : DEFAULT_PHOTOS).slice();

    mountBatchProjectSearchSelect(state.projectNameOptions || [], batchReviewDraft.projectName);
    document.querySelectorAll('input[name="wb-batch-false-alarm"]').forEach(function (input) {
      input.checked = input.value === batchReviewDraft.falseAlarm;
    });
    var level = document.getElementById("wb-batch-level-adjust");
    var scene = document.getElementById("wb-batch-scene");
    if (level) {
      level.value = batchReviewDraft.levelAdjust;
      bindLevelSelectPicker(level);
    }
    if (scene) scene.value = batchReviewDraft.scene;
    renderBatchReviewPhotos();
    toggleBatchReviewDetailFields();
  }

  function readInlineReviewForm() {
    var level = document.getElementById("wb-batch-level-adjust");
    var scene = document.getElementById("wb-batch-scene");
    var select = document.getElementById("wb-batch-project-name-select");
    var falseChecked = document.querySelector('input[name="wb-batch-false-alarm"]:checked');
    var projectName = batchReviewDraft.projectName || "";
    if (batchProjectSelectInst && batchProjectSelectInst.getValue) {
      var picked = batchProjectSelectInst.getValue();
      if (picked) projectName = picked;
    } else if (select && select.tagName === "SELECT" && select.selectedIndex > 0) {
      projectName = select.options[select.selectedIndex].text;
    }
    return {
      projectName: projectName,
      falseAlarm: falseChecked ? falseChecked.value : batchReviewDraft.falseAlarm,
      levelAdjust: level ? level.value : batchReviewDraft.levelAdjust,
      scene: scene ? (scene.value || "").trim() : batchReviewDraft.scene,
      photos: batchReviewDraft.photos.slice(),
      mistaken: falseChecked && falseChecked.value === "误报" ? "是" : "否",
      detail: scene ? (scene.value || "").trim() : batchReviewDraft.scene,
    };
  }

  function fillReviewForm(state) {
    state = state || {};
    reviewDraft.projectName = state.projectName || "";
    reviewDraft.falseAlarm = state.falseAlarm || "非误报";
    reviewDraft.levelAdjust = state.levelAdjust || "一级告警";
    reviewDraft.scene = state.scene || state.detail || "";
    reviewDraft.photos = (state.photos && state.photos.length ? state.photos : DEFAULT_PHOTOS).slice();

    var projectRow = document.getElementById("review-project-name-row");
    var projectSelect = document.getElementById("review-project-name-select");
    var isMobileProjectSelect = projectSelect && projectSelect.tagName === "SELECT";
    if (projectRow) {
      if (isMobileProjectSelect) {
        projectRow.classList.toggle("is-hidden", state.showProjectSelect === false);
      } else {
        projectRow.classList.toggle("is-hidden", !state.showProjectSelect);
      }
    }
    if (isMobileProjectSelect && state.showProjectSelect !== false) {
      populateProjectSelectOptions(state.projectNameOptions || [], reviewDraft.projectName);
    }

    document.querySelectorAll('input[name="review-false-alarm"]').forEach(function (input) {
      input.checked = input.value === reviewDraft.falseAlarm;
    });
    var level = document.getElementById("review-level-adjust");
    var scene = document.getElementById("review-scene");
    if (level) {
      level.value = reviewDraft.levelAdjust;
      bindLevelSelectPicker(level);
    }
    if (scene) scene.value = reviewDraft.scene;
    renderModalPhotos();
    toggleModalDetailFields();
  }

  function readReviewForm() {
    var level = document.getElementById("review-level-adjust");
    var scene = document.getElementById("review-scene");
    var select = document.getElementById("review-project-name-select");
    var projectName = reviewDraft.projectName || "";
    if (select && select.tagName === "SELECT" && select.selectedIndex > 0) {
      projectName = select.options[select.selectedIndex].text;
    }
    return {
      projectName: projectName,
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
    closeReviewPhotoPreview();
    reviewSaveCallback = null;
  }

  function saveReviewModal() {
    var data = readReviewForm();
    if (typeof reviewSaveCallback === "function") {
      reviewSaveCallback(data);
    }
    closeReviewModal();
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
        files.slice(0, 6 - reviewDraft.photos.length).forEach(function (file) {
          var url = URL.createObjectURL(file);
          objectUrls.push(url);
          reviewDraft.photos.push(url);
        });
        photoInput.value = "";
        renderModalPhotos();
      });
    }

    document.addEventListener("change", function (e) {
      if (e.target.matches('input[name="wb-batch-false-alarm"]')) toggleBatchReviewDetailFields();
      if (e.target.id === "wb-batch-photo-input") {
        var batchInput = e.target;
        var files = Array.prototype.slice.call(batchInput.files || []);
        if (!files.length) return;
        files.slice(0, 6 - batchReviewDraft.photos.length).forEach(function (file) {
          var url = URL.createObjectURL(file);
          objectUrls.push(url);
          batchReviewDraft.photos.push(url);
        });
        batchInput.value = "";
        renderBatchReviewPhotos();
      }
    });

    document.addEventListener("click", function (e) {
      var field = e.target.closest(".mp-picker-field[data-dynamic-select]");
      if (field) {
        openReviewSelectPicker(field.getAttribute("data-dynamic-select"));
        return;
      }

      var act = e.target.closest("[data-action]");
      if (!act) return;
      var action = act.getAttribute("data-action");

      if (action === "mp-picker-cancel" || action === "mp-picker-mask-close") {
        closeReviewProjectPicker();
        return;
      }
      if (action === "mp-picker-confirm") {
        confirmReviewSelectPicker();
        return;
      }
      if (action === "pick-review-photo") {
        var scope = act.getAttribute("data-photo-scope") || "modal";
        var inputId = scope === "batch" ? "wb-batch-photo-input" : "review-photo-input";
        var input = document.getElementById(inputId);
        if (input) input.click();
        return;
      }
      if (action === "preview-review-photo") {
        var previewScope = act.getAttribute("data-photo-scope") || "modal";
        var previewIdx = Number(act.getAttribute("data-photo-index"));
        var previewDraft = getDraft(previewScope);
        if (!Number.isNaN(previewIdx) && previewDraft.photos[previewIdx]) {
          openReviewPhotoPreview(previewDraft.photos[previewIdx]);
        }
        return;
      }
      if (action === "remove-review-photo") {
        var removeScope = act.getAttribute("data-photo-scope") || "modal";
        var removeIdx = Number(act.getAttribute("data-photo-index"));
        if (!Number.isNaN(removeIdx)) removeReviewPhoto(removeIdx, removeScope);
        return;
      }
      if (action === "close-review-photo-preview") {
        closeReviewPhotoPreview();
      }
    });

    var pickerBody = document.getElementById("mp-picker-body");
    if (pickerBody) {
      pickerBody.addEventListener("change", function (e) {
        if (e.target.matches('input[data-single="1"]')) {
          pickerBody.querySelectorAll('input[data-single="1"]').forEach(function (inp) {
            if (inp !== e.target) inp.checked = false;
          });
          e.target.checked = true;
        }
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
    buildInlineReviewFormHtml: buildInlineReviewFormHtml,
    buildDesktopBatchReviewFormHtml: buildDesktopBatchReviewFormHtml,
    initInlineReviewForm: initInlineReviewForm,
    readInlineReviewForm: readInlineReviewForm,
    init: init,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
