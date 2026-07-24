/**
 * 用户管理：新增/编辑表单与导入弹窗
 */
(function (global) {
  var LINE_OPTIONS = ["1号线", "2号线", "3号线", "4号线", "7号线", "8号线", "11号线", "19号线"];
  var USER_TYPE_OPTIONS = ["内部", "外部"];
  var SECTION_BY_LINE = {
    "1号线": ["循礼门-友谊路", "友谊路-利济北路"],
    "2号线": ["光谷广场-杨家湾", "街道口-中南路"],
    "7号线": ["园博园北-王家墩东", "武昌火车站-小东门"],
    "8号线": ["洪山路-小洪山", "洪山路-徐家棚", "徐家棚-徐东"],
    "11号线": ["光谷火车站-花山", "花山-左岭"],
    "19号线": ["花山河-光谷五路", "光谷五路-新月溪公园"],
  };
  var DEFAULT_SECTIONS = ["洪山路-小洪山", "松槐路-天阳大道", "花山河", "武昌火车站-小东门"];
  var STATION_PLACEHOLDER = "请选择站点";

  function stationsFromSections(sections) {
    var map = {};
    (sections || []).forEach(function (section) {
      String(section)
        .split("-")
        .forEach(function (part) {
          part = part.trim();
          if (part) map[part] = true;
        });
    });
    return Object.keys(map);
  }

  var STATION_BY_LINE = {};
  Object.keys(SECTION_BY_LINE).forEach(function (line) {
    STATION_BY_LINE[line] = stationsFromSections(SECTION_BY_LINE[line]);
  });
  ["3号线", "4号线"].forEach(function (line) {
    if (!STATION_BY_LINE[line]) STATION_BY_LINE[line] = stationsFromSections(DEFAULT_SECTIONS);
  });

  function parseSectionFields(row) {
    row = row || {};
    if (row.sectionStart && row.sectionEnd) {
      return { start: row.sectionStart, end: row.sectionEnd };
    }
    var name = String(row.sectionName || "").trim();
    if (!name) return { start: "", end: "" };
    var parts = name.split("-").map(function (p) {
      return p.trim();
    });
    if (parts.length >= 2) {
      return { start: parts[0], end: parts[parts.length - 1] };
    }
    return { start: name, end: "" };
  }

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function detailValueHtml(value, multiline) {
    var text = value === undefined || value === null || value === "" ? "—" : String(value);
    var cls =
      "wb-detail-value" +
      (text === "—" ? " wb-detail-value--empty" : "") +
      (multiline ? " wb-detail-value--multiline" : "");
    return '<div class="' + cls + '">' + escapeHtml(text) + "</div>";
  }

  function detailRowHtml(label, value, full, multiline) {
    return (
      '<label class="wb-detail-form-item' +
      (full ? " wb-detail-form-item--full" : "") +
      '"><span class="wb-detail-form-label">' +
      escapeHtml(label) +
      "：</span>" +
      detailValueHtml(value, multiline) +
      "</label>"
    );
  }

  function buildUserDetailHtml(row) {
    row = row || {};
    var section = parseSectionFields(row);
    var sectionText =
      row.sectionName ||
      (section.start && section.end ? section.start + "-" + section.end : section.start || section.end || "");
    var lineText = row.lineName;
    if (Array.isArray(row.sections) && row.sections.length) {
      var lineSet = {};
      var lineList = [];
      row.sections.forEach(function (s) {
        if (s.lineName && !lineSet[s.lineName]) {
          lineSet[s.lineName] = true;
          lineList.push(s.lineName);
        }
      });
      lineText = lineList.join("、");
      sectionText = row.sections
        .map(function (s) {
          return (s.lineName ? s.lineName + " " : "") + (s.start || "") + "-" + (s.end || "");
        })
        .join("、");
    }
    var avatarHtml = row.avatarUrl
      ? '<div class="wb-detail-value"><img src="' +
        escapeHtml(row.avatarUrl) +
        '" alt="用户头像" class="h-14 w-14 rounded-full border border-cyan-400/20 object-cover" /></div>'
      : detailValueHtml("");
    var pilotHtml = row.pilotCertName
      ? '<div class="wb-detail-value"><span class="inline-flex items-center gap-2 text-cyan-100/90"><i class="fa-regular fa-file-lines text-cyan-300/80"></i>' +
        escapeHtml(row.pilotCertName) +
        "</span></div>"
      : detailValueHtml("");

    var html = '<div class="wb-detail-form-grid">';
    html += detailRowHtml("用户编号", row.userId);
    html += detailRowHtml("用户名称", row.userName);
    html += detailRowHtml("用户昵称", row.nickName);
    html += detailRowHtml("用户类型", row.userType);
    html += detailRowHtml("所属部门", row.deptName);
    html += detailRowHtml("角色", row.roleName);
    html += detailRowHtml("岗位", row.postName);
    html += detailRowHtml("所属线路", lineText);
    html += detailRowHtml("所属区间", sectionText, true);
    html += detailRowHtml("手机号码", row.phone);
    html += detailRowHtml("邮箱", row.email);
    html += detailRowHtml("性别", row.sex);
    html +=
      '<label class="wb-detail-form-item"><span class="wb-detail-form-label">状态：</span>' +
      detailValueHtml(row.status ? "启用" : "停用") +
      "</label>";
    html += detailRowHtml("创建时间", row.createTime);
    html +=
      '<label class="wb-detail-form-item wb-detail-form-item--full"><span class="wb-detail-form-label">头像：</span>' +
      avatarHtml +
      "</label>";
    html +=
      '<label class="wb-detail-form-item wb-detail-form-item--full"><span class="wb-detail-form-label">飞手证：</span>' +
      pilotHtml +
      "</label>";
    html += detailRowHtml("备注", row.remark, true, true);
    html += "</div>";
    return html;
  }

  function formLabel(label, required) {
    return (
      "<label>" +
      (required ? '<span class="text-rose-400">*</span> ' : "") +
      escapeHtml(label) +
      "</label>"
    );
  }

  function selectField(key, label, options, value, required, emptyLabel) {
    var html = '<div class="wb-form-item">' + formLabel(label, required);
    html += '<select class="wh-input" data-form="' + key + '">';
    if (emptyLabel !== false) {
      var placeholder =
        emptyLabel != null ? emptyLabel : !required ? "请选择" : null;
      if (placeholder) {
        html += '<option value="">' + escapeHtml(placeholder) + "</option>";
      }
    }
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

  function searchSelectPlaceholder(key, label, value, placeholder) {
    var html = '<div class="wb-form-item">' + formLabel(label, false);
    html += '<div id="' + key + '" class="wh-form-search-select"></div>';
    html += '<input type="hidden" data-form="' + key + '" id="' + key + '-value" value="' + escapeHtml(value || "") + '" />';
    html += "</div>";
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

  function lineSectionSelectHtml(kind, options, value, placeholder) {
    var html =
      '<select class="wh-input wb-line-section__sel" data-ls="' + kind + '">' +
      '<option value="">' + escapeHtml(placeholder) + "</option>";
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
    return html + "</select>";
  }

  function lineSectionRowHtml(item) {
    item = item || {};
    var line = item.lineName || "";
    var stations = line ? STATION_BY_LINE[line] || stationsFromSections(DEFAULT_SECTIONS) : [];
    return (
      '<tr class="wb-line-section-row">' +
      "<td>" +
      lineSectionSelectHtml("line", LINE_OPTIONS, line, "请选择线路") +
      "</td>" +
      "<td>" +
      lineSectionSelectHtml("start", stations, item.start || "", STATION_PLACEHOLDER) +
      "</td>" +
      "<td>" +
      lineSectionSelectHtml("end", stations, item.end || "", STATION_PLACEHOLDER) +
      "</td>" +
      '<td class="wb-line-section__op"><button type="button" class="wb-line-section__del">删除</button></td>' +
      "</tr>"
    );
  }

  function buildLineSectionBlockHtml() {
    return (
      '<div class="wb-form-item wb-form-item--full wb-line-section">' +
      '<div class="wb-line-section__head">' +
      formLabel("线路区间", true) +
      '<button type="button" class="wb-line-section__add" id="wb-line-section-add">' +
      '<i class="fa-solid fa-plus"></i> 新增</button>' +
      "</div>" +
      '<div class="wb-line-section__wrap">' +
      '<table class="wb-line-section__table">' +
      "<thead><tr><th>所属线路</th><th>起始区间</th><th>终点区间</th>" +
      '<th class="wb-line-section__op">操作</th></tr></thead>' +
      '<tbody id="wb-line-section-rows"></tbody>' +
      "</table>" +
      "</div>" +
      "</div>"
    );
  }

  function buildUserFormHtml(row, roleOptions, deptOptions) {
    row = row || {};
    var isEdit = !!(row && row.userId);

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
      selectField("userType", "用户类型", USER_TYPE_OPTIONS, row.userType || "内部", true) +
      selectField("deptName", "所属部门", deptOptions, row.deptName, true) +
      selectField("roleName", "角色", roleOptions, row.roleName, true) +
      searchSelectPlaceholder("wb-post-select", "岗位", row.postName || "", "选择岗位时请先选择部门") +
      inputField("phone", "手机号码", row.phone, true) +
      inputField("email", "邮箱", row.email, false) +
      selectField("sex", "性别", ["男", "女"], row.sex, false) +
      selectField("statusText", "状态", ["启用", "停用"], row.status ? "启用" : "停用", true) +
      buildLineSectionBlockHtml() +
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

    // 岗位搜索选择框
    (function initPostSelect() {
      var wrap = document.getElementById("wb-post-select");
      if (!wrap || !window.WHSearchSelect) return;
      var hidden = document.getElementById("wb-post-select-value");
      var sel = WHSearchSelect.create(wrap, ["请先选择部门"], "选择岗位时请先选择部门");
      if (row.postName) sel.setValue(row.postName);
      if (hidden) sel.wrap.addEventListener("hidden", function () { hidden.value = sel.getValue(); });

      var deptSelect = document.querySelector('[data-form="deptName"]');
      if (deptSelect) {
        deptSelect.onchange = function () {
          var dept = deptSelect.value;
          var posts = (window.__postRows || []).filter(function (p) { return p.deptName === dept; });
          var options = posts.map(function (p) { return p.postName; });
          sel.setValue("");
          if (!options.length) {
            options = ["该部门暂无岗位"];
          }
          // Re-create the select with new options
          sel.wrap.innerHTML = "";
          sel = WHSearchSelect.create(wrap, options, dept ? "请选择岗位" : "选择岗位时请先选择部门");
          if (row.postName && posts.some(function (p) { return p.postName === row.postName; })) {
            sel.setValue(row.postName);
          }
          if (hidden) sel.wrap.addEventListener("hidden", function () { hidden.value = sel.getValue(); });
        };
      }
    })();

    initLineSectionRows(row);
  }

  function initLineSectionRows(row) {
    row = row || {};
    var tbody = document.getElementById("wb-line-section-rows");
    var addBtn = document.getElementById("wb-line-section-add");
    if (!tbody || !addBtn) return;

    var items = [];
    if (Array.isArray(row.sections) && row.sections.length) {
      items = row.sections.map(function (s) {
        return { lineName: s.lineName || "", start: s.start || "", end: s.end || "" };
      });
    } else {
      var section = parseSectionFields(row);
      if (row.lineName || section.start || section.end) {
        items.push({ lineName: row.lineName || "", start: section.start, end: section.end });
      }
    }
    if (!items.length) items.push({ lineName: "", start: "", end: "" });

    function render() {
      tbody.innerHTML = items
        .map(function (item) {
          return lineSectionRowHtml(item);
        })
        .join("");
    }

    function fillRowStations(tr, line) {
      var stations = line ? STATION_BY_LINE[line] || stationsFromSections(DEFAULT_SECTIONS) : [];
      tr.querySelectorAll('select[data-ls="start"], select[data-ls="end"]').forEach(function (sel) {
        var html = '<option value="">' + escapeHtml(STATION_PLACEHOLDER) + "</option>";
        stations.forEach(function (s) {
          html += '<option value="' + escapeHtml(s) + '">' + escapeHtml(s) + "</option>";
        });
        sel.innerHTML = html;
      });
    }

    addBtn.onclick = function () {
      tbody.insertAdjacentHTML("beforeend", lineSectionRowHtml({ lineName: "", start: "", end: "" }));
    };

    tbody.addEventListener("click", function (e) {
      var del = e.target.closest(".wb-line-section__del");
      if (!del) return;
      var tr = del.closest("tr");
      if (tr) tr.remove();
      if (!tbody.querySelector("tr")) {
        tbody.insertAdjacentHTML("beforeend", lineSectionRowHtml({ lineName: "", start: "", end: "" }));
      }
    });

    tbody.addEventListener("change", function (e) {
      var sel = e.target.closest('select[data-ls="line"]');
      if (!sel) return;
      var tr = sel.closest("tr");
      if (tr) fillRowStations(tr, sel.value);
    });

    render();
  }

  function collectLineSections() {
    var tbody = document.getElementById("wb-line-section-rows");
    var sections = [];
    if (!tbody) return sections;
    tbody.querySelectorAll("tr.wb-line-section-row").forEach(function (tr) {
      var line = tr.querySelector('select[data-ls="line"]');
      var start = tr.querySelector('select[data-ls="start"]');
      var end = tr.querySelector('select[data-ls="end"]');
      sections.push({
        lineName: line ? line.value : "",
        start: start ? start.value : "",
        end: end ? end.value : "",
      });
    });
    return sections;
  }

  function applyUserFormData(row, data) {
    if (!data.userType || USER_TYPE_OPTIONS.indexOf(data.userType) < 0) {
      if (global.WBSystem && global.WBSystem.toast) {
        global.WBSystem.toast("请选择用户类型");
      }
      return false;
    }
    var sections = collectLineSections();
    if (!sections.length) {
      if (global.WBSystem && global.WBSystem.toast) {
        global.WBSystem.toast("请至少新增一条线路区间");
      }
      return false;
    }
    for (var i = 0; i < sections.length; i++) {
      var s = sections[i];
      if (!s.lineName) {
        if (global.WBSystem && global.WBSystem.toast) {
          global.WBSystem.toast("请选择第 " + (i + 1) + " 行的所属线路");
        }
        return false;
      }
      if (!s.start || !s.end) {
        if (global.WBSystem && global.WBSystem.toast) {
          global.WBSystem.toast("请选择第 " + (i + 1) + " 行的起始区间与终点区间站点");
        }
        return false;
      }
      if (s.start === s.end) {
        if (global.WBSystem && global.WBSystem.toast) {
          global.WBSystem.toast("第 " + (i + 1) + " 行的起始区间与终点区间不能相同");
        }
        return false;
      }
    }
    // 获取岗位值（可能来自搜索选择框）
    var postName = data.postName;
    if (!postName) {
      var hiddenVal = document.getElementById("wb-post-select-value");
      if (hiddenVal && hiddenVal.value) postName = hiddenVal.value;
    }
    var patch = {
      userName: (data.userName || "").trim(),
      nickName: (data.nickName || "").trim(),
      userType: data.userType,
      deptName: data.deptName,
      roleName: data.roleName,
      postName: postName || (data.postName || "").trim(),
      lineName: sections[0].lineName,
      sectionStart: sections[0].start,
      sectionEnd: sections[0].end,
      sectionName: sections[0].start + "-" + sections[0].end,
      sections: sections,
      phone: (data.phone || "").trim(),
      email: (data.email || "").trim(),
      sex: data.sex || "",
      status: data.statusText === "启用",
      remark: (data.remark || "").trim(),
    };
    if (row) {
      Object.keys(patch).forEach(function (key) {
        row[key] = patch[key];
      });
      return true;
    }
    return patch;
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

  function buildResetPasswordFormHtml(row) {
    row = row || {};
    return (
      '<div class="px-1 py-1">' +
      '<p class="text-sm text-slate-300 mb-4 leading-relaxed">为用户 <b class="text-cyan-300">' +
      escapeHtml(row.userName || row.nickName || "—") +
      "</b> 设置新登录密码。</p>" +
      '<div class="wb-form-grid" style="grid-template-columns:1fr">' +
      '<div class="wb-form-item">' +
      formLabel("新的密码", true) +
      '<input class="wh-input" type="password" id="wb-reset-pwd-new" data-form="newPassword" ' +
      'minlength="5" maxlength="20" placeholder="请输入 5-20 位新密码" autocomplete="new-password" />' +
      '<p class="text-[11px] text-slate-500 mt-1.5">密码长度为 5-20 位</p>' +
      "</div></div></div>"
    );
  }

  function openResetPasswordModal(row) {
    if (!global.WBSystem || !global.WBSystem.openModal) return;
    row = row || {};
    global.WBSystem.openModal(
      "重置密码",
      buildResetPasswordFormHtml(row),
      function () {
        var input = document.getElementById("wb-reset-pwd-new");
        var pwd = input ? String(input.value || "").trim() : "";
        if (!pwd) {
          global.WBSystem.toast("请输入新的密码");
          return false;
        }
        if (pwd.length < 5 || pwd.length > 20) {
          global.WBSystem.toast("密码长度为 5-20 位");
          return false;
        }
        global.WBSystem.toast("已重置 " + (row.userName || "") + " 的密码");
      },
      function () {
        var input = document.getElementById("wb-reset-pwd-new");
        if (input) input.value = "";
      },
      { saveLabel: "确定", keepOpen: false }
    );
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
    buildUserDetailHtml: buildUserDetailHtml,
    mountUserFormUploads: mountUserFormUploads,
    applyUserFormData: applyUserFormData,
    parseSectionFields: parseSectionFields,
    openUserImportModal: openUserImportModal,
    openResetPasswordModal: openResetPasswordModal,
    USER_TYPE_OPTIONS: USER_TYPE_OPTIONS,
    SECTION_BY_LINE: SECTION_BY_LINE,
    STATION_BY_LINE: STATION_BY_LINE,
    STATION_PLACEHOLDER: STATION_PLACEHOLDER,
  };
})(window);
