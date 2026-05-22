/**
 * 用户管理：新增/编辑表单与导入弹窗
 */
(function (global) {
  var LINE_OPTIONS = ["1号线", "2号线", "3号线", "4号线", "7号线", "8号线", "11号线", "19号线"];
  var SECTION_BY_LINE = {
    "1号线": ["循礼门-友谊路", "友谊路-利济北路"],
    "2号线": ["光谷广场-杨家湾", "街道口-中南路"],
    "7号线": ["园博园北-王家墩东", "武昌火车站-小东门"],
    "8号线": ["洪山路-小洪山", "洪山路-徐家棚", "徐家棚-徐东"],
    "11号线": ["光谷火车站-花山", "花山-左岭"],
    "19号线": ["花山河-光谷五路", "光谷五路-新月溪公园"],
  };
  var DEFAULT_SECTIONS = ["洪山路-小洪山", "松槐路-天阳大道", "花山河", "武昌火车站-小东门"];

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formLabel(label, required) {
    return (
      "<label>" +
      (required ? '<span class="text-rose-400">*</span> ' : "") +
      escapeHtml(label) +
      "</label>"
    );
  }

  function selectField(key, label, options, value, required) {
    var html = '<div class="wb-form-item">' + formLabel(label, required);
    html += '<select class="wh-input" data-form="' + key + '">';
    if (!required) html += '<option value="">请选择</option>';
    options.forEach(function (opt) {
      html +=
        '<option value="' +
        escapeHtml(opt) +
        '"' +
        (String(opt) === String(value) ? " selected" : "") +
        ">" +
        escapeHtml(opt) +
        "</option>";
    });
    html += "</select></div>";
    return html;
  }

  function inputField(key, label, value, required) {
    return (
      '<div class="wb-form-item">' +
      formLabel(label, required) +
      '<input class="wh-input" data-form="' +
      key +
      '" value="' +
      escapeHtml(value) +
      '" />' +
      "</div>"
    );
  }

  function passwordField(key, label, value, required, placeholder) {
    return (
      '<div class="wb-form-item">' +
      formLabel(label, required) +
      '<input class="wh-input" type="password" data-form="' +
      key +
      '" value="' +
      escapeHtml(value) +
      '" placeholder="' +
      escapeHtml(placeholder || "") +
      '" autocomplete="new-password" />' +
      "</div>"
    );
  }

  function buildUserFormHtml(row, roleOptions, deptOptions) {
    row = row || {};
    var isEdit = !!(row && row.userId);
    var line = row.lineName || "8号线";
    var sections = SECTION_BY_LINE[line] || DEFAULT_SECTIONS;

    return (
      '<div class="wb-form-grid wb-form-grid--user">' +
      inputField("userName", "用户名称", row.userName, true) +
      passwordField(
        "password",
        "用户密码",
        "",
        !isEdit,
        isEdit ? "留空则不修改密码" : "请输入登录密码"
      ) +
      inputField("nickName", "用户昵称", row.nickName, true) +
      selectField("deptName", "所属部门", deptOptions, row.deptName, true) +
      selectField("roleName", "角色", roleOptions, row.roleName, true) +
      inputField("postName", "岗位", row.postName || "", false) +
      selectField("lineName", "所属线路", LINE_OPTIONS, line, true) +
      selectField("sectionName", "所在区间", sections, row.sectionName, true) +
      inputField("phone", "手机号码", row.phone, true) +
      inputField("email", "邮箱", row.email, false) +
      selectField("sex", "性别", ["男", "女"], row.sex, false) +
      selectField("statusText", "状态", ["启用", "停用"], row.status ? "启用" : "停用", true) +
      '<div class="wb-form-item wb-form-item--full">' +
      formLabel("上传头像", false) +
      '<div class="wb-upload-zone wb-upload-zone--image" id="wb-avatar-zone">' +
      '<label class="wb-upload-drop">' +
      '<i class="fa-solid fa-image text-2xl text-cyan-300/80"></i>' +
      '<span class="wb-upload-drop__text">点击或拖拽上传头像</span>' +
      '<span class="wb-upload-drop__hint">仅支持 1 张图片（JPG/PNG）</span>' +
      '<input type="file" id="wb-avatar-input" accept="image/jpeg,image/png,image/webp" class="hidden" />' +
      "</label>" +
      '<div id="wb-avatar-preview" class="wb-upload-preview"></div>' +
      "</div></div>" +
      '<div class="wb-form-item wb-form-item--full">' +
      formLabel("上传飞手证", false) +
      '<div class="wb-upload-zone" id="wb-pilot-cert-zone">' +
      '<label class="wb-upload-drop wb-upload-drop--compact">' +
      '<i class="fa-solid fa-file-arrow-up text-xl text-cyan-300/80"></i>' +
      '<span class="wb-upload-drop__text">点击或拖拽上传飞手证</span>' +
      '<span class="wb-upload-drop__hint">支持 PDF/JPG/PNG，仅 1 个文件</span>' +
      '<input type="file" id="wb-pilot-cert-input" accept=".pdf,image/jpeg,image/png" class="hidden" />' +
      "</label>" +
      '<div id="wb-pilot-cert-name" class="wb-upload-file-name"></div>' +
      "</div></div>" +
      '<div class="wb-form-item wb-form-item--full">' +
      formLabel("备注", false) +
      '<textarea class="wh-input" data-form="remark">' +
      escapeHtml(row.remark) +
      "</textarea></div>" +
      "</div>"
    );
  }

  function mountSingleImageUpload(inputId, previewId, existingUrl) {
    var input = document.getElementById(inputId);
    var preview = document.getElementById(previewId);
    if (!input || !preview) return;

    var currentUrl = "";
    function renderPreview() {
      if (!currentUrl) {
        preview.innerHTML = "";
        return;
      }
      preview.innerHTML =
        '<div class="wb-upload-thumb">' +
        '<img src="' +
        currentUrl +
        '" alt="头像预览" />' +
        '<button type="button" class="wb-upload-remove" data-clear-avatar title="移除">×</button>' +
        "</div>";
      var btn = preview.querySelector("[data-clear-avatar]");
      if (btn) {
        btn.onclick = function () {
          currentUrl = "";
          input.value = "";
          renderPreview();
        };
      }
    }

    if (existingUrl) {
      currentUrl = existingUrl;
      renderPreview();
    }

    function pick(file) {
      if (!file || !file.type.match(/^image\//)) return;
      if (currentUrl && currentUrl.indexOf("blob:") === 0) URL.revokeObjectURL(currentUrl);
      currentUrl = URL.createObjectURL(file);
      renderPreview();
    }

    input.onchange = function () {
      pick(input.files && input.files[0]);
    };

    var drop = input.closest(".wb-upload-drop");
    if (drop) {
      drop.ondragover = function (e) {
        e.preventDefault();
        drop.classList.add("is-dragover");
      };
      drop.ondragleave = function () {
        drop.classList.remove("is-dragover");
      };
      drop.ondrop = function (e) {
        e.preventDefault();
        drop.classList.remove("is-dragover");
        pick(e.dataTransfer.files && e.dataTransfer.files[0]);
      };
    }
  }

  function mountSingleFileUpload(inputId, nameId, existingName) {
    var input = document.getElementById(inputId);
    var nameEl = document.getElementById(nameId);
    if (!input || !nameEl) return;

    var fileName = existingName || "";

    function renderName() {
      nameEl.innerHTML = fileName
        ? '<span class="wb-upload-chip"><i class="fa-regular fa-file-lines text-cyan-300"></i>' +
          escapeHtml(fileName) +
          '<button type="button" class="wb-upload-chip__clear" data-clear-cert>×</button></span>'
        : "";
      var clearBtn = nameEl.querySelector("[data-clear-cert]");
      if (clearBtn) {
        clearBtn.onclick = function () {
          fileName = "";
          input.value = "";
          renderName();
        };
      }
    }

    renderName();

    function pick(file) {
      if (!file) return;
      fileName = file.name;
      renderName();
    }

    input.onchange = function () {
      pick(input.files && input.files[0]);
    };

    var drop = input.closest(".wb-upload-drop");
    if (drop) {
      drop.ondragover = function (e) {
        e.preventDefault();
        drop.classList.add("is-dragover");
      };
      drop.ondragleave = function () {
        drop.classList.remove("is-dragover");
      };
      drop.ondrop = function (e) {
        e.preventDefault();
        drop.classList.remove("is-dragover");
        pick(e.dataTransfer.files && e.dataTransfer.files[0]);
      };
    }
  }

  function mountUserFormUploads(row) {
    row = row || {};
    mountSingleImageUpload("wb-avatar-input", "wb-avatar-preview", row.avatarUrl || "");
    mountSingleFileUpload("wb-pilot-cert-input", "wb-pilot-cert-name", row.pilotCertName || "");

    var lineSelect = document.querySelector('[data-form="lineName"]');
    var sectionSelect = document.querySelector('[data-form="sectionName"]');
    if (lineSelect && sectionSelect) {
      lineSelect.onchange = function () {
        var sections = SECTION_BY_LINE[lineSelect.value] || DEFAULT_SECTIONS;
        var prev = sectionSelect.value;
        sectionSelect.innerHTML = sections
          .map(function (s) {
            return (
              '<option value="' +
              escapeHtml(s) +
              '"' +
              (s === prev ? " selected" : "") +
              ">" +
              escapeHtml(s) +
              "</option>"
            );
          })
          .join("");
        if (sections.indexOf(prev) === -1) sectionSelect.selectedIndex = 0;
      };
    }
  }

  function bindImportDropzone() {
    var input = document.getElementById("wb-import-file");
    var drop = document.getElementById("wb-import-drop");
    var nameEl = document.getElementById("wb-import-file-name");
    if (!input || !drop) return;

    function showFile(file) {
      if (!file || !nameEl) return;
      nameEl.textContent = "已选择：" + file.name;
    }

    input.onchange = function () {
      showFile(input.files && input.files[0]);
    };

    drop.ondragover = function (e) {
      e.preventDefault();
      drop.classList.add("is-dragover");
    };
    drop.ondragleave = function () {
      drop.classList.remove("is-dragover");
    };
    drop.ondrop = function (e) {
      e.preventDefault();
      drop.classList.remove("is-dragover");
      var file = e.dataTransfer.files && e.dataTransfer.files[0];
      if (file) {
        try {
          var dt = new DataTransfer();
          dt.items.add(file);
          input.files = dt.files;
        } catch (err) {
          /* 部分环境不支持 DataTransfer 赋值 */
        }
        showFile(file);
      }
    };

    var template = document.getElementById("wb-import-template");
    if (template) {
      template.onclick = function (e) {
        e.preventDefault();
        if (global.WBSystem && global.WBSystem.toast) {
          global.WBSystem.toast("用户导入模板已开始下载");
        }
      };
    }
  }

  function openUserImportModal() {
    if (!global.WBSystem || !global.WBSystem.openModal) return;
    var html =
      '<div class="wb-import-body">' +
      '<label class="wb-import-drop" id="wb-import-drop">' +
      '<i class="fa-solid fa-inbox"></i>' +
      '<span class="wb-import-drop__title">点击或者拖拽到此处上传文件</span>' +
      '<input type="file" id="wb-import-file" accept=".xlsx,.xls" class="hidden" />' +
      "</label>" +
      '<div id="wb-import-file-name" class="wb-import-file-name"></div>' +
      '<div class="wb-import-meta">' +
      "<span>允许导入 xlsx、xls 文件</span>" +
      '<a href="#" id="wb-import-template" class="wb-import-template"><i class="fa-regular fa-file-excel"></i> 下载模板</a>' +
      "</div>" +
      '<label class="wb-import-switch">' +
      "<span>是否更新/覆盖已存在的用户数据</span>" +
      '<span class="wb-switch"><input type="checkbox" id="wb-import-overwrite" /><span class="wb-switch-slider"></span></span>' +
      "</label>" +
      "</div>";

    global.WBSystem.openModal(
      "用户导入",
      html,
      function () {
        var overwrite = document.getElementById("wb-import-overwrite");
        global.WBSystem.toast(
          overwrite && overwrite.checked ? "用户数据导入完成（已覆盖同名用户）" : "用户数据导入完成"
        );
      },
      bindImportDropzone
    );
  }

  global.WBUserForm = {
    buildUserFormHtml: buildUserFormHtml,
    mountUserFormUploads: mountUserFormUploads,
    openUserImportModal: openUserImportModal,
    LINE_OPTIONS: LINE_OPTIONS,
    SECTION_BY_LINE: SECTION_BY_LINE,
  };
})(window);
