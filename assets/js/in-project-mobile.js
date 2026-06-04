/**
 * 移动端项目管理 UI 增强：底部选择器、上滑加载、弹窗表单、删除确认
 */
(function (global) {
  "use strict";

  var ctx = null;
  var confirmCallback = null;
  var searchTimer = null;
  var pickerState = {
    key: null,
    multiple: false,
    selected: [],
    options: [],
    hiddenId: null,
    dynamicSelectId: null,
    title: "请选择"
  };

  var PICKER_KEYS = {
    "addr-type": { title: "地址类型", multiple: false, optionsKey: "addr" },
    category: { title: "工程类别", multiple: true, optionsKey: "category" },
    "struct-type": { title: "地铁结构类型", multiple: true, optionsKey: "structType" },
    "struct-status": { title: "地铁结构状态", multiple: true, optionsKey: "structStatus" },
    "doc-sign-unit": { title: "告知签收单位", multiple: false, optionsKey: "docUnits" }
  };

  function qs(sel, root) {
    return (root || document).querySelector(sel);
  }

  function qsa(sel, root) {
    return Array.prototype.slice.call((root || document).querySelectorAll(sel));
  }

  function esc(v) {
    return String(v || "").replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function getSelectLabel(select) {
    if (!select) return "请选择";
    var row = select.closest(".mp-form-row, .flex, label");
    if (!row) return "请选择";
    var label = row.querySelector(".project-form-label");
    if (!label && row.tagName === "LABEL") {
      label = row.querySelector("span");
    }
    if (label) return String(label.textContent || "").replace(/[：:\s]+$/g, "").trim() || "请选择";
    return "请选择";
  }

  function syncSelectPickerButton(select) {
    if (!select || !select.id) return;
    var btn = qs('[data-dynamic-select="' + select.id + '"]');
    if (!btn) return;
    var span = btn.querySelector(".mp-picker-field__text");
    if (!span) return;
    var opt = select.options[select.selectedIndex];
    var text = opt ? opt.text : "";
    var placeholder = btn.getAttribute("data-placeholder") || "请选择";
    var isEmpty = !text || /^请选择/.test(text) || text === "全部";
    span.textContent = isEmpty ? placeholder : text;
    span.classList.toggle("is-placeholder", isEmpty);
  }

  function enhanceSelect(select) {
    if (!select || select.tagName !== "SELECT") return;
    try {
    if (select.dataset.mpPickerBound === "1") {
      syncSelectPickerButton(select);
      return;
    }
    if (select.closest(".mp-picker-field")) return;

    if (!select.id) {
      select.id = "mp-sel-" + Math.random().toString(36).slice(2, 10);
    }

    select.dataset.mpPickerBound = "1";
    select.classList.add("mp-select-native");

    var labelText = getSelectLabel(select);
    var placeholder = /^请选择/.test(labelText) ? labelText : "请选择" + labelText.replace(/^是否/, "");

    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "mp-picker-field mp-select-picker";
    btn.setAttribute("data-dynamic-select", select.id);
    btn.setAttribute("data-picker-title", labelText);
    btn.setAttribute("data-placeholder", placeholder);

    var span = document.createElement("span");
    span.className = "mp-picker-field__text";
    btn.appendChild(span);

    var icon = document.createElement("i");
    icon.className = "fa-solid fa-chevron-down";
    btn.appendChild(icon);

    select.style.display = "none";
    select.parentNode.insertBefore(btn, select.nextSibling);
    syncSelectPickerButton(select);
    } catch (err) {
      console.warn("[WHProjectMobile] enhanceSelect skipped", err);
    }
  }

  function enhanceSelectFields(root) {
    qsa("select.wh-input, select.mp-field", root || document).forEach(enhanceSelect);
  }

  function closePicker() {
    var sheet = document.getElementById("mp-picker-sheet");
    if (sheet) sheet.classList.remove("is-open");
    pickerState.key = null;
    pickerState.hiddenId = null;
    pickerState.dynamicSelectId = null;
  }

  function renderPickerOptions() {
    var body = document.getElementById("mp-picker-body");
    if (!body) return;
    body.innerHTML = pickerState.options
      .map(function (opt) {
        var checked = pickerState.selected.indexOf(opt) >= 0;
        return (
          '<label class="mp-picker-option">' +
          '<input type="' +
          (pickerState.multiple ? "checkbox" : "radio") +
          '" name="mp-picker-opt" value="' +
          esc(opt) +
          '"' +
          (checked ? " checked" : "") +
          (pickerState.multiple ? "" : ' data-single="1"') +
          " />" +
          "<span>" +
          esc(opt) +
          "</span></label>"
        );
      })
      .join("");
  }

  function openDynamicPicker(selectId, title) {
    var select = document.getElementById(selectId);
    if (!select) return;
    var options = Array.from(select.options)
      .map(function (o) {
        return o.text;
      })
      .filter(function (t) {
        return t && t !== "请选择" && t !== "请选择站点" && t !== "请选择区间";
      });
    if (!options.length) return;

    var current = select.options[select.selectedIndex];
    pickerState.key = "__dynamic__";
    pickerState.dynamicSelectId = selectId;
    pickerState.multiple = false;
    pickerState.options = options;
    pickerState.hiddenId = null;
    pickerState.title = title || getSelectLabel(select);
    pickerState.selected = current && current.text && !/^请选择/.test(current.text) ? [current.text] : [];

    var titleEl = document.getElementById("mp-picker-title");
    if (titleEl) titleEl.textContent = pickerState.title;
    renderPickerOptions();
    var sheet = document.getElementById("mp-picker-sheet");
    if (sheet) sheet.classList.add("is-open");
  }

  function openPicker(key, currentValue, hiddenId) {
    var meta = PICKER_KEYS[key];
    if (!meta || !ctx) return;
    var options = ctx.getOptions(meta.optionsKey) || [];
    pickerState.key = key;
    pickerState.dynamicSelectId = null;
    pickerState.multiple = meta.multiple;
    pickerState.options = options;
    pickerState.hiddenId = hiddenId || "proj-" + key;
    pickerState.title = meta.title;
    pickerState.selected = meta.multiple
      ? (currentValue || "").split(/[,，、]/).map(function (s) {
          return s.trim();
        }).filter(Boolean)
      : currentValue
        ? [currentValue]
        : [];

    var title = document.getElementById("mp-picker-title");
    if (title) title.textContent = meta.title;
    renderPickerOptions();
    var sheet = document.getElementById("mp-picker-sheet");
    if (sheet) sheet.classList.add("is-open");
  }

  function confirmPicker() {
    if (!pickerState.key) return closePicker();
    var inputs = qsa('#mp-picker-body input[name="mp-picker-opt"]:checked');
    var values = inputs.map(function (inp) {
      return inp.value;
    });

    if (pickerState.key === "__dynamic__" && pickerState.dynamicSelectId) {
      var select = document.getElementById(pickerState.dynamicSelectId);
      if (select) {
        var picked = values[0] || "";
        var matched = -1;
        Array.prototype.forEach.call(select.options, function (opt, idx) {
          if (opt.text === picked) matched = idx;
        });
        if (matched >= 0) select.selectedIndex = matched;
        else if (picked) {
          select.selectedIndex = 0;
          if (select.options[0]) select.options[0].text = picked;
        }
        syncSelectPickerButton(select);
        select.dispatchEvent(new Event("change", { bubbles: true }));
      }
      closePicker();
      return;
    }

    var hidden = document.getElementById(pickerState.hiddenId);
    var btn = qs('[data-picker="' + pickerState.key + '"]');
    var text = values.length ? (pickerState.multiple ? values.join("、") : values[0]) : "";
    if (hidden) hidden.value = text;
    if (btn) {
      var span = btn.querySelector(".mp-picker-field__text");
      if (span) {
        span.textContent = text || btn.getAttribute("data-placeholder") || "请选择";
        span.classList.toggle("is-placeholder", !text);
      }
    }
    closePicker();
  }

  function syncPickerButtons(root) {
    qsa(".mp-picker-field:not(.mp-select-picker)", root).forEach(function (btn) {
      var key = btn.getAttribute("data-picker");
      var hiddenId = btn.getAttribute("data-hidden-id") || (key === "doc-sign-unit" ? "doc-notice-sign-unit" : "proj-" + key);
      var hidden = document.getElementById(hiddenId);
      var span = btn.querySelector(".mp-picker-field__text");
      if (!span) return;
      var val = hidden ? hidden.value : "";
      span.textContent = val || btn.getAttribute("data-placeholder") || "请选择";
      span.classList.toggle("is-placeholder", !val);
    });
    qsa("select.mp-select-native", root).forEach(syncSelectPickerButton);
  }

  function showConfirm(options) {
    options = options || {};
    var mask = document.getElementById("mp-confirm-mask");
    var msg = document.getElementById("mp-confirm-msg");
    var titleEl = document.getElementById("mp-confirm-title");
    var okBtn = mask ? mask.querySelector("[data-action='mp-confirm-ok']") : null;
    if (!mask || !msg) {
      if (global.confirm(options.message || "确定？")) {
        if (typeof options.onConfirm === "function") options.onConfirm();
      }
      return;
    }
    if (titleEl) titleEl.textContent = options.title || "确认操作";
    msg.textContent = options.message || "";
    if (okBtn) {
      okBtn.textContent = options.okText || "确定";
      okBtn.classList.toggle("mp-confirm-mask__btn--danger", !!options.danger);
    }
    confirmCallback = typeof options.onConfirm === "function" ? options.onConfirm : null;
    mask.classList.add("is-open");
    mask.setAttribute("aria-hidden", "false");
  }

  function confirmDelete(message, onConfirm) {
    showConfirm({
      title: "确认删除",
      message: message || "确定要删除吗？此操作不可恢复。",
      okText: "确定删除",
      danger: true,
      onConfirm: onConfirm
    });
  }

  function closeConfirm() {
    var mask = document.getElementById("mp-confirm-mask");
    if (mask) {
      mask.classList.remove("is-open");
      mask.setAttribute("aria-hidden", "true");
    }
    confirmCallback = null;
  }

  function pickerFieldHtml(key, label, placeholder, hiddenId, required) {
    return (
      '<div class="mp-form-row mp-form-row--picker">' +
      '<label class="project-form-label' +
      (required ? " project-required" : "") +
      '">' +
      label +
      "</label>" +
      '<button type="button" class="mp-picker-field" data-picker="' +
      key +
      '" data-hidden-id="' +
      hiddenId +
      '" data-placeholder="' +
      esc(placeholder) +
      '">' +
      '<span class="mp-picker-field__text is-placeholder">' +
      esc(placeholder) +
      "</span>" +
      '<i class="fa-solid fa-chevron-down"></i></button>' +
      '<input type="hidden" id="' +
      hiddenId +
      '" value="" />' +
      "</div>"
    );
  }

  function buildContactFormHtml(activeUnit, editContact) {
    editContact = editContact || {};
    return (
      '<div class="mp-modal-form">' +
      '<p class="mp-modal-form__tip">当前单位：' +
      esc(activeUnit) +
      "</p>" +
      '<div class="mp-form-row"><label class="project-form-label project-required">联系人姓名</label>' +
      '<input id="contact-name" class="wh-input mp-field" placeholder="请输入联系人姓名" value="' +
      esc(editContact.name) +
      '" /></div>' +
      '<div class="mp-form-row"><label class="project-form-label project-required">联系电话</label>' +
      '<input id="contact-phone" class="wh-input mp-field" placeholder="请输入联系电话" value="' +
      esc(editContact.phone) +
      '" /></div>' +
      '<div class="mp-form-row"><label class="project-form-label">其他联系方式</label>' +
      '<input id="contact-other" class="wh-input mp-field" placeholder="如邮箱、微信号、办公电话等" value="' +
      esc(editContact.otherContact) +
      '" /></div></div>'
    );
  }

  var TECH_REPLY_TYPES = ["OA流转回复意见", "书面回函"];

  function docTip(category) {
    return '<p class="mp-modal-form__tip">资料类别：' + esc(category) + "</p>";
  }

  function inputRow(id, label, value, required, type) {
    return (
      '<div class="mp-form-row"><label class="project-form-label' +
      (required ? " project-required" : "") +
      '">' +
      label +
      '</label><input id="' +
      id +
      '" class="wh-input mp-field" type="' +
      (type || "text") +
      '" value="' +
      esc(value) +
      '" /></div>'
    );
  }

  function unitSelectRow(id, label, value, options, required) {
    options = options || [];
    return (
      '<div class="mp-form-row"><label class="project-form-label' +
      (required ? " project-required" : "") +
      '">' +
      label +
      '</label><select id="' +
      id +
      '" class="wh-input mp-field"><option value="">请选择</option>' +
      options
        .map(function (opt) {
          var sel = value === opt ? " selected" : "";
          return '<option value="' + esc(opt) + '"' + sel + ">" + esc(opt) + "</option>";
        })
        .join("") +
      "</select></div>"
    );
  }

  function typeSelectRow(id, label, value, options, required) {
    return unitSelectRow(id, label, value, options, required);
  }

  function uploadRow(inputKey, fileMeta, label, inputId) {
    inputId = inputId || inputKey + "-input";
    fileMeta = fileMeta || {};
    var fileName = fileMeta.fileName || fileMeta.name || "";
    var fileUrl = fileMeta.fileUrl || fileMeta.url || "";
    var mimeType = fileMeta.mimeType || "";
    var hasFile = fileName && fileName !== "未选择文件" && fileName !== "未上传资料";
    if (!fileUrl && hasFile && global.ProjectDocShared && global.ProjectDocShared.resolveDemoFileUrl) {
      fileUrl = global.ProjectDocShared.resolveDemoFileUrl(fileName);
    }
    return (
      '<div class="mp-form-row"><label class="project-form-label">' +
      label +
      '</label><div class="mp-doc-upload" data-upload-key="' +
      esc(inputKey) +
      '">' +
      '<label class="project-upload__btn mp-btn mp-btn--ghost"><i class="fa-solid fa-upload"></i>上传文件' +
      '<input id="' +
      inputId +
      '" type="file" class="hidden" data-upload-input="' +
      esc(inputKey) +
      '"></label>' +
      '<div class="mp-doc-upload__file' +
      (hasFile ? "" : " hidden") +
      '" id="' +
      esc(inputKey) +
      '-file">' +
      '<button type="button" class="mp-doc-upload__preview project-link-action" data-action="preview-doc-upload" data-upload-key="' +
      esc(inputKey) +
      '">' +
      esc(fileName) +
      '</button><button type="button" class="mp-doc-upload__remove" data-action="delete-doc-upload" data-upload-key="' +
      esc(inputKey) +
      '" aria-label="删除附件"><i class="fa-regular fa-trash-can"></i></button></div>' +
      '<span class="mp-doc-upload__empty' +
      (hasFile ? " hidden" : "") +
      '" id="' +
      esc(inputKey) +
      '-empty">未选择文件</span>' +
      '<input type="hidden" id="' +
      esc(inputKey) +
      '-url" value="' +
      esc(fileUrl) +
      '" />' +
      '<input type="hidden" id="' +
      esc(inputKey) +
      '-mime" value="' +
      esc(mimeType) +
      '" /></div></div>'
    );
  }

  function syncDocUpload(inputKey, fileName, fileUrl, mimeType) {
    var hasFile = fileName && fileName !== "未选择文件" && fileName !== "未上传资料";
    var fileWrap = document.getElementById(inputKey + "-file");
    var emptyEl = document.getElementById(inputKey + "-empty");
    var urlEl = document.getElementById(inputKey + "-url");
    var mimeEl = document.getElementById(inputKey + "-mime");
    var previewBtn = fileWrap ? fileWrap.querySelector("[data-action='preview-doc-upload']") : null;
    if (!fileUrl && hasFile && global.ProjectDocShared && global.ProjectDocShared.resolveDemoFileUrl) {
      fileUrl = global.ProjectDocShared.resolveDemoFileUrl(fileName);
    }
    if (previewBtn) previewBtn.textContent = fileName || "未选择文件";
    if (fileWrap) fileWrap.classList.toggle("hidden", !hasFile);
    if (emptyEl) emptyEl.classList.toggle("hidden", !!hasFile);
    if (urlEl) urlEl.value = fileUrl || "";
    if (mimeEl) mimeEl.value = mimeType || (global.ProjectDocShared ? global.ProjectDocShared.inferMimeFromFileName(fileName) : "");
  }

  function resolveUploadPreviewPayload(inputKey) {
    var urlEl = document.getElementById(inputKey + "-url");
    var fileWrap = document.getElementById(inputKey + "-file");
    var previewBtn = fileWrap ? fileWrap.querySelector("[data-action='preview-doc-upload']") : null;
    var name = previewBtn ? previewBtn.textContent.trim() : "";
    var url = urlEl ? urlEl.value : "";
    var mimeEl = document.getElementById(inputKey + "-mime");
    var mime = mimeEl ? mimeEl.value : "";
    var input = document.querySelector('[data-upload-input="' + inputKey + '"]');
    if (!url && input && input.files && input.files[0]) {
      url = URL.createObjectURL(input.files[0]);
      if (!mime) mime = input.files[0].type;
      if (!name) name = input.files[0].name;
    }
    if (!url && name && global.ProjectPreviewMock) {
      url = global.ProjectPreviewMock.resolveMockPreviewUrl(name, "");
    } else if (!url && name && global.ProjectDocShared) {
      url = global.ProjectDocShared.resolveFilePreviewUrl(name, "", mime);
    }
    if (!mime && global.ProjectDocShared) {
      mime = global.ProjectDocShared.resolveFilePreviewMime(name, mime);
    }
    var kind = global.ProjectDocShared ? global.ProjectDocShared.inferPreviewKind(mime, name) : "file";
    return { url: url, name: name, mimeType: mime, kind: kind, title: "文件预览", tip: name || "资料文件预览" };
  }

  function clearDocUpload(inputKey) {
    var input = document.querySelector('[data-upload-input="' + inputKey + '"]');
    if (input) input.value = "";
    syncDocUpload(inputKey, "", "", "");
  }

  function buildDocFormHtml(category, docItem, unitOptions) {
    docItem = docItem || {};
    unitOptions = unitOptions || [];
    var html = '<div class="mp-modal-form">' + docTip(category);

    if (category === "项目告知单") {
      html +=
        inputRow("doc-notice-name", "告知单名称", docItem.noticeName, true) +
        inputRow("doc-notice-no", "告知单编号", docItem.noticeNo, true) +
        inputRow("doc-notice-issuer", "告知单签发人", docItem.issuer) +
        inputRow("doc-notice-issue-date", "告知单签发日期", docItem.issueDate, false, "date");
      html += pickerFieldHtml("doc-sign-unit", "告知签收单位", "请选择告知签收单位", "doc-notice-sign-unit", false);
      html +=
        inputRow("doc-notice-sign-person", "告知单签收人员", docItem.signPerson) +
        inputRow("doc-notice-sign-phone", "告知单签收电话", docItem.signPhone) +
        uploadRow("doc-file", docItem, "告知单资料");
    } else if (category === "项目运营发函") {
      html +=
        inputRow("doc-ops-name", "运营发函名称", docItem.letterName, true) +
        unitSelectRow("doc-primary-unit", "主送单位", docItem.primaryUnit, unitOptions) +
        inputRow("doc-primary-contact", "主送单位联系人", docItem.primaryContact) +
        inputRow("doc-primary-phone", "主送单位电话", docItem.primaryPhone) +
        unitSelectRow("doc-cc-unit", "抄送单位", docItem.ccUnit, unitOptions) +
        inputRow("doc-ops-date", "运营发函日期", docItem.letterDate, true, "date") +
        uploadRow("doc-file", docItem, "运营发函资料");
    } else if (category === "项目外部来函") {
      html +=
        inputRow("doc-ext-name", "外部来函名称", docItem.letterName, true) +
        unitSelectRow("doc-from-unit", "外部来函单位", docItem.fromUnit, unitOptions) +
        inputRow("doc-ext-contact", "外部来函联系人", docItem.fromContact) +
        inputRow("doc-ext-phone", "外部来函电话", docItem.fromPhone) +
        inputRow("doc-ext-date", "外部来函日期", docItem.letterDate, true, "date") +
        uploadRow("doc-file", docItem, "外部来函资料");
    } else if (category === "技术中心回函") {
      html +=
        inputRow("doc-tech-name", "技术中心回函名称", docItem.techReplyName, true) +
        typeSelectRow("doc-tech-type", "技术中心回函类型", docItem.techReplyType, TECH_REPLY_TYPES) +
        inputRow("doc-tech-handler", "技术中心经办人", docItem.techHandler) +
        inputRow("doc-tech-date", "技术回函日期", docItem.techReplyDate, true, "date") +
        uploadRow("doc-file", docItem, "技术中心回函资料");
    } else if (category === "项目安全影响评估") {
      html +=
        inputRow("doc-safety-name", "安全影响评估名称", docItem.safetyName, true) +
        inputRow("doc-safety-date", "安全影响评估日期", docItem.safetyDate, true, "date") +
        unitSelectRow("doc-safety-unit", "安全影响评估单位", docItem.safetyUnit, unitOptions) +
        uploadRow("doc-file", docItem, "安全影响评估资料");
    } else if (category === "项目初始化状态报告") {
      html +=
        inputRow("doc-init-name", "初始化状态报告名称", docItem.initReportName, true) +
        inputRow("doc-init-date", "初始化状态报告日期", docItem.initReportDate, true, "date") +
        uploadRow("doc-file", docItem, "初始化状态报告资料");
    } else if (category === "项目专项施工方案及专家意见") {
      html +=
        inputRow("doc-special-name", "专项施工方案及专家意见名称", docItem.specialName, true) +
        inputRow("doc-special-date", "专项施工方案及专家意见日期", docItem.specialDate, true, "date") +
        uploadRow(
          "doc-file-digital",
          { fileName: docItem.fileNameDigital, fileUrl: docItem.fileUrlDigital, mimeType: docItem.mimeTypeDigital },
          "专项施工方案资料（电子版）",
          "doc-file-digital-input"
        ) +
        uploadRow(
          "doc-file-scan",
          { fileName: docItem.fileNameScan, fileUrl: docItem.fileUrlScan, mimeType: docItem.mimeTypeScan },
          "专项施工方案资料（扫描版）",
          "doc-file-scan-input"
        );
    } else if (category === "项目第三方监测方案及专家意见") {
      html +=
        inputRow("doc-monitor-name", "第三方监测方案及专家意见名称", docItem.monitorName, true) +
        inputRow("doc-monitor-date", "第三方监测方案及专家意见日期", docItem.monitorDate, true, "date") +
        uploadRow("doc-file", docItem, "第三方监测方案及专家意见资料");
    } else if (category === "安全协议") {
      html +=
        inputRow("doc-agreement-name", "安全协议名称", docItem.agreementName, true) +
        inputRow("doc-agreement-date", "安全协议日期", docItem.agreementDate, true, "date") +
        uploadRow("doc-file", docItem, "安全协议资料");
    } else if (category === "其他资料") {
      html +=
        inputRow("doc-material-name", "资料名称", docItem.materialName, true) +
        inputRow("doc-material-date", "资料日期", docItem.materialDate, true, "date") +
        uploadRow("doc-file", docItem, "资料文件");
    } else {
      html += inputRow("doc-name", "名称", docItem.name, true) + uploadRow("doc-file", docItem, "资料文件");
    }

    return html + "</div>";
  }

  function buildNoticeDocFormHtml(category, docItem, unitOptions) {
    return buildDocFormHtml(category, docItem, unitOptions);
  }

  function setFieldValue(id, value) {
    var el = document.getElementById(id);
    if (!el) return;
    if (el.tagName === "SELECT") {
      var matched = false;
      Array.prototype.forEach.call(el.options, function (opt, idx) {
        if (!matched && (opt.value === value || opt.text === value)) {
          el.selectedIndex = idx;
          matched = true;
        }
      });
      syncSelectPickerButton(el);
      return;
    }
    el.value = value || "";
  }

  function mountDocForm(category, docItem) {
    docItem = docItem || {};
    category = category || "项目告知单";
    var root = document.getElementById("modal-body");
    if (!root) return;

    if (category === "项目告知单") {
      var hidden = document.getElementById("doc-notice-sign-unit");
      if (hidden) hidden.value = docItem.signUnit || "";
    }
    if (category === "项目运营发函") {
      setFieldValue("doc-primary-unit", docItem.primaryUnit);
      setFieldValue("doc-cc-unit", docItem.ccUnit);
    }
    if (category === "项目外部来函") {
      setFieldValue("doc-from-unit", docItem.fromUnit);
    }
    if (category === "项目安全影响评估") {
      setFieldValue("doc-safety-unit", docItem.safetyUnit);
    }
    if (category === "技术中心回函") {
      setFieldValue("doc-tech-type", docItem.techReplyType);
    }

    syncPickerButtons(root);
    enhanceSelectFields(root);
    syncDocUpload("doc-file", docItem.fileName, docItem.fileUrl, docItem.mimeType);
    if (category === "项目专项施工方案及专家意见") {
      syncDocUpload("doc-file-digital", docItem.fileNameDigital, docItem.fileUrlDigital, docItem.mimeTypeDigital);
      syncDocUpload("doc-file-scan", docItem.fileNameScan, docItem.fileUrlScan, docItem.mimeTypeScan);
    }
  }

  function mountNoticeDocForm(docItem) {
    mountDocForm("项目告知单", docItem);
  }

  function exchangeMediaBlock(kind, idPrefix) {
    var isPhoto = kind === "photo";
    var label = isPhoto ? "交涉现场照片" : "交涉现场视频";
    var accept = isPhoto
      ? "image/jpeg,image/png,image/webp,image/gif,.jpg,.jpeg,.png,.webp,.gif"
      : "video/mp4,video/webm,video/quicktime,.mp4,.webm,.mov";
    var hint = isPhoto
      ? "支持 JPG、PNG、WEBP、GIF，最多上传 9 张，单张不超过 20MB"
      : "支持 MP4、WEBM、MOV，最多上传 9 个，单个不超过 200MB";
    return (
      '<div class="mp-form-row mp-form-row--full"><label class="project-form-label">' +
      label +
      '</label><div class="mp-exchange-media"><div class="flex flex-wrap gap-3 items-start">' +
      '<label id="' +
      idPrefix +
      '-tile" class="upload-tile"><i class="fa-solid fa-plus text-lg"></i><span>上传</span>' +
      '<input id="' +
      idPrefix +
      '-input" type="file" multiple accept="' +
      accept +
      '" /></label>' +
      '<div id="' +
      idPrefix +
      '-list" class="flex flex-wrap gap-2 flex-1 min-w-0"></div></div>' +
      '<p id="' +
      idPrefix +
      '-hint" class="upload-hint">' +
      hint +
      "</p></div></div>"
    );
  }

  function buildExchangeFormHtml(item) {
    item = item || {};
    if (item.attachment && !item.attachmentUrl && global.ProjectPreviewMock) {
      item.attachmentUrl = global.ProjectPreviewMock.resolveMockPreviewUrl(item.attachment, "");
    }
    if (item.attachment && !item.attachmentMimeType && global.ProjectDocShared) {
      item.attachmentMimeType = global.ProjectDocShared.inferMimeFromFileName(item.attachment);
    }
    var fileMeta = {
      fileName: item.attachment,
      fileUrl: item.attachmentUrl,
      mimeType: item.attachmentMimeType
    };
    return (
      '<div class="mp-modal-form">' +
      '<p class="mp-modal-form__tip">填写交底交涉记录</p>' +
      inputRow("exchange-date", "项目交涉日期", item.date, true, "date") +
      inputRow("exchange-unit", "项目交涉单位", item.unit, true) +
      '<div class="mp-form-row mp-form-row--full"><label class="project-form-label">项目交涉内容</label>' +
      '<textarea id="exchange-content" class="wh-input mp-field mp-field--area" placeholder="请输入项目交涉内容">' +
      esc(item.content) +
      "</textarea></div>" +
      unitSelectRow("exchange-procedure", "是否履行保护区程序", item.procedure || "是", ["否", "是"], true) +
      exchangeMediaBlock("photo", "exchange-photo") +
      exchangeMediaBlock("video", "exchange-video") +
      uploadRow("exchange-file", fileMeta, "交涉资料") +
      "</div>"
    );
  }

  function mountExchangeForm(item) {
    item = item || {};
    setFieldValue("exchange-procedure", item.procedure || "是");
    syncDocUpload("exchange-file", item.attachment, item.attachmentUrl, item.attachmentMimeType);
    var root = document.getElementById("modal-body");
    if (root) enhanceSelectFields(root);
  }

  function buildMonitorLogFormHtml(item) {
    item = item || {};
    return (
      '<div class="mp-modal-form">' +
      '<p class="mp-modal-form__tip">填写第三方监测日志信息</p>' +
      inputRow("mon-log-date", "日期", item.date, true, "date") +
      inputRow("mon-log-period", "监测报告期数", item.reportPeriod, true) +
      '<div class="mp-form-row mp-form-row--full"><label class="project-form-label">监测数据</label>' +
      '<textarea id="mon-log-data" class="wh-input mp-field mp-field--area">' +
      esc(item.monitorData) +
      "</textarea></div>" +
      unitSelectRow("mon-log-warning", "是否超预警", item.overWarning || "否", ["否", "是"], true) +
      "</div>"
    );
  }

  function mountMonitorLogForm(item) {
    item = item || {};
    setFieldValue("mon-log-warning", item.overWarning || "否");
    var root = document.getElementById("modal-body");
    if (root) enhanceSelectFields(root);
  }

  function openFilePreview(payload) {
    payload = payload || {};
    var name = payload.name || "";
    var mime = payload.mimeType || "";
    var url = payload.url || "";
    if (!url && global.ProjectDocShared) {
      url = global.ProjectDocShared.resolveFilePreviewUrl(name, url, mime);
      mime = global.ProjectDocShared.resolveFilePreviewMime(name, mime);
      payload.kind = global.ProjectDocShared.inferPreviewKind(mime, name);
    }
    if (!url) {
      if (ctx && ctx.showToast) ctx.showToast("暂无可预览文件");
      return;
    }
    payload.url = url;
    payload.mimeType = mime;
    if (!payload.kind && global.ProjectDocShared) {
      payload.kind = global.ProjectDocShared.inferPreviewKind(mime, name);
    }
    var mask = document.getElementById("mp-file-preview-mask");
    var body = document.getElementById("mp-file-preview-body");
    var titleEl = document.getElementById("mp-file-preview-title");
    if (!mask || !body) {
      openMediaPreview(url);
      return;
    }
    var kind = payload.kind || "";
    mime = payload.mimeType || "";
    var title = payload.title || payload.name || "文件预览";
    if (titleEl) titleEl.textContent = title;
    var useInline =
      global.ProjectPreviewMock && global.ProjectPreviewMock.isInlinePreviewUrl
        ? global.ProjectPreviewMock.isInlinePreviewUrl(url)
        : url.indexOf("data:") === 0 || /\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url);
    var mockVideo =
      global.ProjectPreviewMock && global.ProjectPreviewMock.isMockVideoPlaceholder
        ? global.ProjectPreviewMock.isMockVideoPlaceholder(url, name)
        : false;
    var html = "";
    if (kind === "image" || mime.indexOf("image/") === 0 || useInline || mockVideo) {
      html =
        '<div class="mp-file-preview__media-wrap">' +
        '<img class="mp-file-preview__img" src="' +
        esc(url) +
        '" alt="' +
        esc(payload.name || "预览") +
        '" />' +
        (mockVideo
          ? '<p class="mp-file-preview__mock-tip">演示视频预览（Mock 封面）</p>'
          : "") +
        "</div>";
    } else if (kind === "video" || mime.indexOf("video/") === 0) {
      html = '<video class="mp-file-preview__video" src="' + esc(url) + '" controls playsinline></video>';
    } else if (mime === "application/pdf" && url.indexOf("blob:") === 0) {
      html = '<iframe class="mp-file-preview__frame" src="' + esc(url) + '" title="' + esc(title) + '"></iframe>';
    } else {
      html =
        '<img class="mp-file-preview__img" src="' +
        esc(url) +
        '" alt="' +
        esc(payload.name || "文件预览") +
        '" />';
    }
    body.innerHTML = html;
    mask.classList.add("show");
    mask.setAttribute("aria-hidden", "false");
    document.body.classList.add("mp-scroll-locked");
  }

  function closeFilePreview() {
    var mask = document.getElementById("mp-file-preview-mask");
    var body = document.getElementById("mp-file-preview-body");
    if (mask) {
      mask.classList.remove("show");
      mask.setAttribute("aria-hidden", "true");
    }
    if (body) body.innerHTML = "";
    document.body.classList.remove("mp-scroll-locked");
  }

  function openMediaPreview(src) {
    if (!src) return;
    var mask = document.getElementById("mp-media-preview");
    var img = document.getElementById("mp-media-preview-img");
    if (!mask || !img) return;
    img.src = src;
    mask.classList.add("is-open");
    mask.setAttribute("aria-hidden", "false");
  }

  function closeMediaPreview() {
    var mask = document.getElementById("mp-media-preview");
    var img = document.getElementById("mp-media-preview-img");
    if (mask) {
      mask.classList.remove("is-open");
      mask.setAttribute("aria-hidden", "true");
    }
    if (img) img.removeAttribute("src");
  }

  function bindMediaPreview() {
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-action='mp-media-preview']");
      if (trigger) {
        e.preventDefault();
        var src = trigger.getAttribute("data-src") || trigger.getAttribute("src");
        openFilePreview({ url: src, name: "图片预览", kind: "image", mimeType: "image/jpeg" });
        return;
      }
      if (e.target.closest("[data-action='mp-media-preview-close']") || e.target.id === "mp-media-preview") {
        closeMediaPreview();
        return;
      }
      if (e.target.closest("[data-action='mp-file-preview-close']") || e.target.id === "mp-file-preview-mask") {
        closeFilePreview();
      }
    });
  }

  function bindListSearchClear() {
    var clearBtn = document.getElementById("project-search-clear");
    var searchInput = document.getElementById("project-search-trigger");
    var searchWrap = document.querySelector(".mp-search-input-wrap");
    if (!clearBtn || !searchInput) return;

    function syncClearVisible() {
      clearBtn.hidden = !(searchInput.value || "").trim();
    }

    clearBtn.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();
      searchInput.value = "";
      syncClearVisible();
      if (ctx && ctx.clearListSearch) ctx.clearListSearch();
    });

    if (searchWrap) {
      searchWrap.addEventListener("click", function (e) {
        if (e.target.closest("#project-search-clear")) return;
      });
    }

    syncClearVisible();
    global.WHProjectMobile.syncListSearchClear = syncClearVisible;
  }

  function bindDocUploadActions() {
    document.addEventListener("click", function (e) {
      var previewBtn = e.target.closest("[data-action='preview-doc-upload']");
      if (previewBtn) {
        e.preventDefault();
        e.stopPropagation();
        var key = previewBtn.getAttribute("data-upload-key");
        if (key) openFilePreview(resolveUploadPreviewPayload(key));
        return;
      }
      var deleteBtn = e.target.closest("[data-action='delete-doc-upload']");
      if (deleteBtn) {
        e.preventDefault();
        e.stopPropagation();
        var delKey = deleteBtn.getAttribute("data-upload-key");
        if (delKey) clearDocUpload(delKey);
      }
    });
  }

  function bindRecordScrollLock() {
    var mask = document.getElementById("project-record-mask");
    if (!mask) return;
    function sync() {
      var locked = mask.classList.contains("show");
      document.body.classList.toggle("mp-scroll-locked", locked);
    }
    sync();
    var obs = new MutationObserver(sync);
    obs.observe(mask, { attributes: true, attributeFilter: ["class"] });
  }

  function bindTabScroll() {
    var wrap = document.getElementById("project-tabs-wrap");
    if (!wrap) return;
  }

  function bindSearchInput() {
    document.addEventListener("click", function (e) {
      var trigger = e.target.closest("[data-action='open-project-search']");
      if (!trigger) return;
      e.preventDefault();
      global.location.href = "project-search.html";
    });
    var trigger = document.getElementById("project-search-trigger");
    if (trigger) {
      trigger.addEventListener("click", function (e) {
        e.preventDefault();
        global.location.href = "project-search.html";
      });
    }
  }

  function bindDetailTabSwipe() {
    var detail = document.getElementById("project-detail-view");
    var tabsWrap = document.getElementById("project-tabs-wrap");
    if (!detail || !tabsWrap) return;

    var tabOrder = ["base", "status", "units", "docs", "exchange", "monitor"];
    var startX = 0;
    var startY = 0;
    var tracking = false;

    function currentTab() {
      var active = detail.querySelector(".done-tab.active");
      return active ? active.getAttribute("data-tab") : "base";
    }

    function goTab(tab) {
      var btn = detail.querySelector('.done-tab[data-tab="' + tab + '"]');
      if (btn) btn.click();
    }

    detail.addEventListener(
      "touchstart",
      function (e) {
        if (!e.touches || !e.touches.length) return;
        if (e.target.closest(".mp-detail-tabs-wrap, .mp-picker-field, .mp-detail-footer")) return;
        startX = e.touches[0].clientX;
        startY = e.touches[0].clientY;
        tracking = true;
      },
      { passive: true }
    );

    detail.addEventListener(
      "touchend",
      function (e) {
        if (!tracking || !e.changedTouches || !e.changedTouches.length) return;
        tracking = false;
        var dx = e.changedTouches[0].clientX - startX;
        var dy = e.changedTouches[0].clientY - startY;
        if (Math.abs(dx) < 48 || Math.abs(dx) < Math.abs(dy)) return;
        var idx = tabOrder.indexOf(currentTab());
        if (idx < 0) return;
        if (dx < 0 && idx < tabOrder.length - 1) goTab(tabOrder[idx + 1]);
        if (dx > 0 && idx > 0) goTab(tabOrder[idx - 1]);
      },
      { passive: true }
    );

  }

  function bindPickers() {
    document.addEventListener("click", function (e) {
      var field = e.target.closest(".mp-picker-field");
      if (field && !field.disabled) {
        var modal = document.getElementById("project-modal-mask");
        var detail = document.getElementById("project-detail-view");
        if (detail && detail.classList.contains("project-readonly") && (!modal || !modal.classList.contains("show"))) {
          return;
        }
        var dynamicId = field.getAttribute("data-dynamic-select");
        if (dynamicId) {
          openDynamicPicker(dynamicId, field.getAttribute("data-picker-title"));
          return;
        }
        var key = field.getAttribute("data-picker");
        var hiddenId = field.getAttribute("data-hidden-id") || "proj-" + key;
        var hidden = document.getElementById(hiddenId);
        openPicker(key, hidden ? hidden.value : "", hiddenId);
        return;
      }

      var act = e.target.closest("[data-action]");
      if (!act) return;
      var action = act.getAttribute("data-action");
      if (action === "mp-picker-cancel" || action === "mp-picker-mask-close") closePicker();
      if (action === "mp-picker-confirm") confirmPicker();
      if (action === "mp-confirm-cancel" || action === "mp-confirm-mask-close") closeConfirm();
      if (action === "mp-confirm-ok") {
        var fn = confirmCallback;
        closeConfirm();
        if (fn) fn();
      }
    });

    var pickerBody = document.getElementById("mp-picker-body");
    if (pickerBody) {
      pickerBody.addEventListener("change", function (e) {
        if (!pickerState.multiple && e.target.matches('input[data-single="1"]')) {
          qsa('#mp-picker-body input[data-single="1"]').forEach(function (inp) {
            if (inp !== e.target) inp.checked = false;
          });
          e.target.checked = true;
        }
      });
    }

    var filterSheet = document.getElementById("project-filter-sheet");
    if (filterSheet) {
      filterSheet.addEventListener("transitionend", function () {
        if (filterSheet.classList.contains("is-open")) {
          enhanceSelectFields(filterSheet);
        }
      });
    }
  }

  function bindInfiniteScroll() {
    var scroller =
      document.querySelector("#project-list-view .mp-list-scroll") ||
      document.getElementById("project-app") ||
      document.getElementById("project-list-view");
    if (!scroller || !ctx) return;
    var loading = false;
    scroller.addEventListener(
      "scroll",
      function () {
        if (loading || !ctx.hasMore()) return;
        var el = document.getElementById("mp-load-more-sentinel");
        if (!el) return;
        var rect = el.getBoundingClientRect();
        var rootRect = scroller.getBoundingClientRect();
        if (rect.top < rootRect.bottom + 80) {
          loading = true;
          ctx.loadMore();
          loading = false;
        }
      },
      { passive: true }
    );
  }

  function updateDetailFooter(mode) {
    var footer = document.getElementById("mp-detail-footer");
    var detail = document.getElementById("project-detail-view");
    if (!footer || !detail) return;
    var readonly = mode === "detail";
    footer.classList.toggle("hidden", readonly);
    detail.classList.toggle("mp-detail-view--readonly", readonly);
  }

  function init(api) {
    ctx = api;
    bindPickers();
    bindTabScroll();
    bindSearchInput();
    bindDetailTabSwipe();
    bindMediaPreview();
    bindDocUploadActions();
    bindListSearchClear();
    bindRecordScrollLock();
    bindInfiniteScroll();
    enhanceSelectFields(document.getElementById("project-detail-view"));
    enhanceSelectFields(document.getElementById("project-filter-sheet"));
    syncPickerButtons();
    global.WHProjectMobile = {
      syncPickersFromForm: syncPickerButtons,
      enhanceSelectFields: enhanceSelectFields,
      updateDetailFooter: updateDetailFooter,
      closePicker: closePicker,
      confirm: confirmDelete,
      showConfirm: showConfirm,
      showConfirm: showConfirm,
      buildContactFormHtml: buildContactFormHtml,
      buildDocFormHtml: buildDocFormHtml,
      buildNoticeDocFormHtml: buildNoticeDocFormHtml,
      buildMonitorLogFormHtml: buildMonitorLogFormHtml,
      buildExchangeFormHtml: buildExchangeFormHtml,
      mountDocForm: mountDocForm,
      mountNoticeDocForm: mountNoticeDocForm,
      mountMonitorLogForm: mountMonitorLogForm,
      mountExchangeForm: mountExchangeForm,
      openFilePreview: openFilePreview,
      syncDocUpload: syncDocUpload,
      clearDocUpload: clearDocUpload,
      syncListSearchClear: function () {}
    };
  }

  global.WHProjectMobile = {
    init: init,
    syncPickersFromForm: syncPickerButtons,
    enhanceSelectFields: enhanceSelectFields,
    updateDetailFooter: updateDetailFooter,
    confirm: confirmDelete,
    showConfirm: showConfirm,
    buildContactFormHtml: buildContactFormHtml,
    buildDocFormHtml: buildDocFormHtml,
    buildNoticeDocFormHtml: buildNoticeDocFormHtml,
    buildMonitorLogFormHtml: buildMonitorLogFormHtml,
    buildExchangeFormHtml: buildExchangeFormHtml,
    mountDocForm: mountDocForm,
    mountNoticeDocForm: mountNoticeDocForm,
    mountMonitorLogForm: mountMonitorLogForm,
    mountExchangeForm: mountExchangeForm,
    openFilePreview: openFilePreview,
    syncDocUpload: syncDocUpload,
    clearDocUpload: clearDocUpload,
    syncListSearchClear: function () {}
  };
})(window);
