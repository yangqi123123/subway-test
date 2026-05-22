/**
 * 消息模板：新增/编辑表单
 */
(function (global) {
  var MSG_TYPES = ["空域许可消息", "飞行计划审批", "告警消息"];

  var PRESETS = {
    空域许可消息: {
      vars: ["{航线名称}", "{到期时间}"],
      content: "{青山站外业巡检航线} 空域许可将于 {2026-08-30 12：00：00} 到期，请前往查看！",
    },
    飞行计划审批: {
      vars: ["{计划名称}", "{审批时间}", "{审批结果}"],
      content: "您提交的 {8 号线车辆段常规巡检} 飞行计划，于 {2026-08-30 12：00：00} 审批通过，请前往查看！",
    },
    告警消息: {
      vars: ["{项目名称}", "{区域}", "{位置}", "{报警时间}"],
      content:
        "{金融街六中北项目}，{中南医院站 - 湖北日报站}，{里程 V20+066 左线外侧} 于 {2026-08-30 12：00：00} 发生告警，请前往查看！",
    },
  };

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

  function varsHintHtml(msgType) {
    var preset = PRESETS[msgType] || PRESETS["空域许可消息"];
    return (
      '<div class="wb-msg-template-vars" id="wb-msg-template-vars">' +
      '<span class="wb-msg-template-vars__label">可用变量（点击插入）：</span>' +
      preset.vars
        .map(function (v) {
          return (
            '<button type="button" class="wb-msg-template-var" data-insert-var="' +
            escapeHtml(v) +
            '" title="插入到消息内容">' +
            escapeHtml(v) +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function insertVarIntoContent(varText) {
    var textarea = document.getElementById("wb-msg-content");
    if (!textarea || !varText) return;

    var start = typeof textarea.selectionStart === "number" ? textarea.selectionStart : textarea.value.length;
    var end = typeof textarea.selectionEnd === "number" ? textarea.selectionEnd : start;
    var before = textarea.value.slice(0, start);
    var after = textarea.value.slice(end);
    textarea.value = before + varText + after;
    var pos = start + varText.length;
    textarea.focus();
    if (typeof textarea.setSelectionRange === "function") {
      textarea.setSelectionRange(pos, pos);
    }
  }

  function bindVarInsertClicks() {
    document.querySelectorAll("#wb-msg-template-vars [data-insert-var]").forEach(function (btn) {
      btn.onclick = function () {
        insertVarIntoContent(btn.getAttribute("data-insert-var") || "");
      };
    });
  }

  function buildMsgTemplateFormHtml(row) {
    row = row || {};
    var msgType = row.msgType || MSG_TYPES[0];
    var preset = PRESETS[msgType] || PRESETS["空域许可消息"];
    var content = row.msgContent != null && row.msgContent !== "" ? row.msgContent : preset.content;
    var triggerDays = row.triggerDays != null ? row.triggerDays : "7";
    var showTrigger = msgType === "空域许可消息";

    var html =
      '<div class="wb-form-grid wb-form-grid--msg-template">' +
      '<div class="wb-form-item wb-form-item--full">' +
      formLabel("模板名称", true) +
      '<input class="wh-input" data-form="templateName" value="' +
      escapeHtml(row.templateName) +
      '" placeholder="请输入模板名称" />' +
      "</div>" +
      '<div class="wb-form-item">' +
      formLabel("消息类型", true) +
      '<select class="wh-input" data-form="msgType" id="wb-msg-type-select">';
    MSG_TYPES.forEach(function (t) {
      html +=
        '<option value="' +
        escapeHtml(t) +
        '"' +
        (t === msgType ? " selected" : "") +
        ">" +
        escapeHtml(t) +
        "</option>";
    });
    html += "</select></div>" +
      '<div class="wb-form-item wb-form-item--full wb-msg-trigger-wrap" id="wb-msg-trigger-wrap"' +
      (showTrigger ? "" : ' style="display:none"') +
      ">" +
      formLabel("触发条件", true) +
      '<div class="wb-msg-trigger-line">' +
      "<span>当任意航线的空域许可结束前</span>" +
      '<input type="number" class="wh-input wb-msg-trigger-days" data-form="triggerDays" min="1" max="365" value="' +
      escapeHtml(triggerDays) +
      '" />' +
      "<span>天时，发送提醒给相关人员</span>" +
      "</div></div>" +
      '<div class="wb-form-item wb-form-item--full">' +
      formLabel("消息内容", true) +
      '<textarea class="wh-input" data-form="msgContent" id="wb-msg-content" rows="5" placeholder="请输入消息内容">' +
      escapeHtml(content) +
      "</textarea>" +
      varsHintHtml(msgType) +
      "</div></div>";

    return html;
  }

  function syncMsgTemplateForm(forceDefaultContent) {
    var typeSelect = document.getElementById("wb-msg-type-select");
    var triggerWrap = document.getElementById("wb-msg-trigger-wrap");
    var contentEl = document.getElementById("wb-msg-content");
    var varsEl = document.getElementById("wb-msg-template-vars");
    if (!typeSelect) return;

    var msgType = typeSelect.value;
    var preset = PRESETS[msgType] || PRESETS["空域许可消息"];

    if (triggerWrap) {
      triggerWrap.style.display = msgType === "空域许可消息" ? "" : "none";
    }

    if (varsEl && varsEl.parentNode) {
      var next = document.createElement("div");
      next.innerHTML = varsHintHtml(msgType);
      varsEl.parentNode.replaceChild(next.firstChild, varsEl);
      bindVarInsertClicks();
    }

    if (contentEl && forceDefaultContent) {
      contentEl.value = preset.content;
    }
  }

  function mountMsgTemplateForm(row, isEdit) {
    var typeSelect = document.getElementById("wb-msg-type-select");
    if (!typeSelect) return;

    typeSelect.onchange = function () {
      syncMsgTemplateForm(true);
    };

    syncMsgTemplateForm(false);
    bindVarInsertClicks();
  }

  function validateMsgTemplateForm(data) {
    if (!data.templateName || !String(data.templateName).trim()) {
      return "请填写模板名称";
    }
    if (!data.msgType) {
      return "请选择消息类型";
    }
    if (data.msgType === "空域许可消息") {
      var days = parseInt(data.triggerDays, 10);
      if (!days || days < 1) {
        return "请填写有效的触发天数（≥1）";
      }
    }
    if (!data.msgContent || !String(data.msgContent).trim()) {
      return "请填写消息内容";
    }
    return "";
  }

  function collectMsgTemplateFormData() {
    var data = {};
    document.querySelectorAll("#wb-modal-body [data-form]").forEach(function (el) {
      data[el.getAttribute("data-form")] = el.value;
    });
    return data;
  }

  global.WBMsgTemplateForm = {
    MSG_TYPES: MSG_TYPES,
    PRESETS: PRESETS,
    buildMsgTemplateFormHtml: buildMsgTemplateFormHtml,
    mountMsgTemplateForm: mountMsgTemplateForm,
    validateMsgTemplateForm: validateMsgTemplateForm,
    collectMsgTemplateFormData: collectMsgTemplateFormData,
  };
})(window);
