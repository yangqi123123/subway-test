/**
 * 项目相关资料 — 分类表单、列表、校验（项目管理 / 完工项目共用）
 */
(function (global) {
  var DOC_CATEGORY_LIST = [
    "项目告知单",
    "项目运营发函",
    "项目外部来函",
    "技术中心回函",
    "项目安全影响评估",
    "项目初始化状态报告",
    "项目专项施工方案及专家意见",
    "项目第三方监测方案及专家意见",
    "安全协议",
    "其他资料"
  ];

  var TECH_REPLY_TYPES = ["OA流转回复意见", "书面回函"];

  var DOC_LABEL_NOWRAP_CATEGORIES = ["项目专项施工方案及专家意见", "项目第三方监测方案及专家意见"];

  /** 与新增弹窗一致的展示字段（两列布局） */
  var DOC_FIELD_SCHEMAS = {
    "项目告知单": [
      { label: "告知单名称", key: "noticeName" },
      { label: "告知单编号", key: "noticeNo" },
      { label: "告知单签发人", key: "issuer" },
      { label: "告知单签发日期", key: "issueDate" },
      { label: "告知签收单位", key: "signUnit" },
      { label: "告知单签收人员", key: "signPerson" },
      { label: "告知单签收电话", key: "signPhone" },
      { label: "告知单资料", key: "fileName", type: "file" }
    ],
    "项目运营发函": [
      { label: "运营发函名称", key: "letterName" },
      { label: "主送单位", key: "primaryUnit" },
      { label: "主送单位联系人", key: "primaryContact" },
      { label: "主送单位电话", key: "primaryPhone" },
      { label: "抄送单位", key: "ccUnit" },
      { label: "运营发函日期", key: "letterDate" },
      { label: "运营发函资料", key: "fileName", type: "file" }
    ],
    "项目外部来函": [
      { label: "外部来函名称", key: "letterName" },
      { label: "外部来函单位", key: "fromUnit" },
      { label: "外部来函联系人", key: "fromContact" },
      { label: "外部来函电话", key: "fromPhone" },
      { label: "外部来函日期", key: "letterDate" },
      { label: "外部来函资料", key: "fileName", type: "file" }
    ],
    "技术中心回函": [
      { label: "技术中心回函名称", key: "techReplyName" },
      { label: "技术中心回函类型", key: "techReplyType" },
      { label: "技术中心经办人", key: "techHandler" },
      { label: "技术回函日期", key: "techReplyDate" },
      { label: "技术中心回函资料", key: "fileName", type: "file" }
    ],
    "项目安全影响评估": [
      { label: "安全影响评估名称", key: "safetyName" },
      { label: "安全影响评估日期", key: "safetyDate" },
      { label: "安全影响评估单位", key: "safetyUnit" },
      { label: "安全影响评估资料", key: "fileName", type: "file" }
    ],
    "项目初始化状态报告": [
      { label: "初始化状态报告名称", key: "initReportName" },
      { label: "初始化状态报告日期", key: "initReportDate" },
      { label: "初始化状态报告资料", key: "fileName", type: "file" }
    ],
    "项目专项施工方案及专家意见": [
      { label: "专项施工方案及专家意见名称", key: "specialName" },
      { label: "专项施工方案及专家意见日期", key: "specialDate" },
      { label: "专项施工方案及专家意见资料（电子版）", key: "fileNameDigital", type: "file" },
      { label: "专项施工方案及专家意见资料（扫描版）", key: "fileNameScan", type: "file" }
    ],
    "项目第三方监测方案及专家意见": [
      { label: "第三方监测方案及专家意见名称", key: "monitorName" },
      { label: "第三方监测方案及专家意见日期", key: "monitorDate" },
      { label: "第三方监测方案及专家意见资料", key: "fileName", type: "file" }
    ],
    "安全协议": [
      { label: "安全协议名称", key: "agreementName" },
      { label: "安全协议日期", key: "agreementDate" },
      { label: "安全协议资料", key: "fileName", type: "file" }
    ],
    "其他资料": [
      { label: "资料名称", key: "materialName" },
      { label: "资料日期", key: "materialDate" },
      { label: "资料文件", key: "fileName", type: "file" }
    ]
  };

  function createHandlers(ctx) {
    function ensureDocCardStyles() {
      if (document.getElementById("project-doc-card-style")) return;
      var style = document.createElement("style");
      style.id = "project-doc-card-style";
      style.textContent =
        ".proj-doc-section{border-bottom:1px solid rgba(34,211,238,.1);padding-bottom:24px;margin-bottom:8px}" +
        ".proj-doc-section__head{display:flex;align-items:center;margin-bottom:14px;gap:12px}" +
        ".proj-doc-section__head h3{font-size:14px;font-weight:600;color:#f0fdfa;margin:0;flex:1}" +
        ".proj-doc-cards{display:flex;flex-direction:column;gap:12px}" +
        ".proj-doc-card{display:flex;align-items:stretch;gap:0;border:1px solid rgba(34,211,238,.18);border-radius:10px;background:rgba(8,15,35,.55);overflow:hidden}" +
        ".proj-doc-card__main{flex:1 1 auto;min-width:0;padding:16px 18px}" +
        ".proj-doc-card__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 28px}" +
        ".proj-doc-field{display:flex;align-items:flex-start;gap:10px;min-width:0;font-size:12px;line-height:1.45}" +
        ".proj-doc-field__label{flex:0 0 132px;color:rgba(148,163,184,.95);text-align:right}" +
        ".proj-doc-field__value{flex:1 1 auto;min-width:0;color:rgba(226,245,255,.92);word-break:break-all}" +
        ".proj-doc-field__empty{color:rgba(100,116,139,.9)}" +
        ".proj-doc-card__actions{flex:0 0 auto;display:flex;flex-direction:column;justify-content:center;gap:10px;padding:16px 18px;border-left:1px solid rgba(34,211,238,.12);background:rgba(2,8,23,.35)}" +
        ".proj-doc-card__actions .unit-inline-action{display:block;text-align:center;white-space:nowrap}" +
        ".proj-doc-card--nowrap-labels .proj-doc-field__label,.proj-doc-field__label--nowrap{white-space:nowrap;flex:0 0 auto;max-width:none}" +
        ".proj-doc-form--long-label .project-form-label{width:auto;flex:0 0 auto;min-width:300px;white-space:nowrap;line-height:32px}" +
        ".proj-doc-form--long-label label.flex.items-start .project-form-label{line-height:1.45;padding-top:8px}" +
        ".proj-doc-form--long-label .proj-doc-form__control{flex:0 0 300px;width:300px;max-width:300px;min-width:0}" +
        "@media(max-width:900px){.proj-doc-card{flex-direction:column}.proj-doc-card__actions{flex-direction:row;border-left:0;border-top:1px solid rgba(34,211,238,.12)}.proj-doc-card__grid{grid-template-columns:1fr}.proj-doc-field__label{flex:0 0 108px}}";
      document.head.appendChild(style);
    }

    function getDocFieldSchema(category) {
      return DOC_FIELD_SCHEMAS[category] || [
        { label: "名称", key: "name" },
        { label: "日期", key: "date" },
        { label: "文件", key: "fileName", type: "file" }
      ];
    }

    function renderDocFieldValue(file, field, category, index, previewAction) {
      if (field.type === "file") {
        var fileName = file[field.key];
        if (!fileName) {
          return '<span class="proj-doc-field__empty">未上传</span>';
        }
        return (
          '<span class="project-link-action" data-action="' +
          previewAction +
          '" data-doc="' +
          category +
          '" data-index="' +
          index +
          '" data-file-key="' +
          field.key +
          '">' +
          ctx.escapeHtml(fileName) +
          "</span>"
        );
      }
      var text = file[field.key];
      if (text === undefined || text === null || String(text).trim() === "") {
        return '<span class="proj-doc-field__empty">-</span>';
      }
      return ctx.escapeHtml(String(text));
    }

    function renderDocCard(category, file, index, editAction, deleteAction, previewAction) {
      var fields = getDocFieldSchema(category);
      var nowrapCard = DOC_LABEL_NOWRAP_CATEGORIES.indexOf(category) >= 0;
      var gridHtml = fields
        .map(function (field) {
          return (
            '<div class="proj-doc-field">' +
            '<span class="proj-doc-field__label' +
            (nowrapCard ? " proj-doc-field__label--nowrap" : "") +
            '">' +
            ctx.escapeHtml(field.label) +
            "：</span>" +
            '<span class="proj-doc-field__value">' +
            renderDocFieldValue(file, field, category, index, previewAction) +
            "</span></div>"
          );
        })
        .join("");
      return (
        '<article class="proj-doc-card' +
        (nowrapCard ? " proj-doc-card--nowrap-labels" : "") +
        '">' +
        '<div class="proj-doc-card__main"><div class="proj-doc-card__grid">' +
        gridHtml +
        "</div></div>" +
        '<div class="proj-doc-card__actions">' +
        '<span class="unit-inline-action" data-action="' +
        editAction +
        '" data-doc="' +
        category +
        '" data-index="' +
        index +
        '">编辑</span>' +
        '<span class="unit-inline-action unit-inline-action--danger" data-action="' +
        deleteAction +
        '" data-doc="' +
        category +
        '" data-index="' +
        index +
        '">删除</span>' +
        "</div></article>"
      );
    }

    function filePreviewPayload(item, fileKey) {
      var payload = {
        kind: "file",
        title: "文件预览",
        name: "",
        url: "",
        mimeType: "",
        tip: "资料文件预览"
      };
      if (fileKey === "fileNameDigital") {
        payload.name = item.fileNameDigital || "";
        payload.url = item.fileUrlDigital || "";
        payload.mimeType = item.mimeTypeDigital || "";
      } else if (fileKey === "fileNameScan") {
        payload.name = item.fileNameScan || "";
        payload.url = item.fileUrlScan || "";
        payload.mimeType = item.mimeTypeScan || "";
      } else {
        payload.name = item.fileName || docDisplayName(item, "");
        payload.url = item.fileUrl || "";
        payload.mimeType = item.mimeType || "";
      }
      if (!payload.name) payload.name = docPreviewLabel(item, "");
      if (!payload.url) payload.url = docPreviewUrl(item);
      if (!payload.mimeType) payload.mimeType = docPreviewMime(item);
      payload.tip = payload.name || "资料文件预览";
      return payload;
    }

    function readDocFilePart(prefix, existingDoc, fieldKeys) {
      prefix = prefix || "doc-file";
      fieldKeys = fieldKeys || { name: "fileName", url: "fileUrl", mime: "mimeType" };
      existingDoc = existingDoc || {};
      var input = document.getElementById(prefix + "-input");
      var picked = input && input.files && input.files[0] ? input.files[0] : null;
      var out = {};
      out[fieldKeys.name] = picked ? picked.name : (existingDoc[fieldKeys.name] || "");
      out[fieldKeys.url] = picked ? URL.createObjectURL(picked) : (existingDoc[fieldKeys.url] || "");
      out[fieldKeys.mime] = picked ? picked.type : (existingDoc[fieldKeys.mime] || "");
      return out;
    }

    function docDisplayName(item, category) {
      if (category === "项目告知单") return item.noticeName || item.name || "-";
      if (category === "项目运营发函" || category === "项目外部来函") return item.letterName || item.name || "-";
      if (category === "技术中心回函") return item.techReplyName || item.name || "-";
      if (category === "项目安全影响评估") return item.safetyName || item.name || "-";
      if (category === "项目初始化状态报告") return item.initReportName || item.name || "-";
      if (category === "项目专项施工方案及专家意见") return item.specialName || item.name || "-";
      if (category === "项目第三方监测方案及专家意见") return item.monitorName || item.name || "-";
      if (category === "安全协议") return item.agreementName || item.name || "-";
      if (category === "其他资料") return item.materialName || item.name || "-";
      return item.name || "-";
    }

    function docDisplayDate(item, category) {
      if (category === "项目告知单") return item.issueDate || item.date || "-";
      if (category === "项目运营发函") return item.letterDate || item.date || "-";
      if (category === "项目外部来函") return item.letterDate || item.date || "-";
      if (category === "技术中心回函") return item.techReplyDate || item.date || "-";
      if (category === "项目安全影响评估") return item.safetyDate || item.date || "-";
      if (category === "项目初始化状态报告") return item.initReportDate || item.date || "-";
      if (category === "项目专项施工方案及专家意见") return item.specialDate || item.date || "-";
      if (category === "项目第三方监测方案及专家意见") return item.monitorDate || item.date || "-";
      if (category === "安全协议") return item.agreementDate || item.date || "-";
      if (category === "其他资料") return item.materialDate || item.date || "-";
      return item.date || "-";
    }

    function docPreviewLabel(item, category) {
      if (category === "项目专项施工方案及专家意见") {
        var parts = [];
        if (item.fileNameDigital) parts.push(item.fileNameDigital);
        if (item.fileNameScan) parts.push(item.fileNameScan);
        return parts.length ? parts.join(" / ") : "未上传";
      }
      return item.fileName || docDisplayName(item, category);
    }

    function docPreviewUrl(item) {
      return item.fileUrl || item.fileUrlDigital || item.fileUrlScan || "";
    }

    function docPreviewMime(item) {
      return item.mimeType || item.mimeTypeDigital || item.mimeTypeScan || "";
    }

    function selectOptions(list, selected) {
      return list
        .map(function (opt) {
          return (
            '<option value="' +
            ctx.escapeHtml(opt) +
            '"' +
            (opt === selected ? " selected" : "") +
            ">" +
            ctx.escapeHtml(opt) +
            "</option>"
          );
        })
        .join("");
    }

    function buildDocFormHtml(category, docItem) {
      docItem = docItem || {};
      var head =
        '<div class="text-xs text-cyan-200/75 bg-slate-950/35 border border-cyan-400/10 rounded px-3 py-2">资料类别：' +
        category +
        "</div>";
      var upload = ctx.uploadField("doc-file", docItem.fileName || "", "未上传资料");

      if (category === "项目告知单") {
        return (
          '<div class="space-y-4 max-w-[640px] mx-auto">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">告知单名称：</span><input id="doc-notice-name" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.noticeName || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">告知单编号：</span><input id="doc-notice-no" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.noticeNo || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">告知单签发人：</span><input id="doc-notice-issuer" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.issuer || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">告知单签发日期：</span><input id="doc-notice-issue-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.issueDate || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3 project-form-row--select"><span class="project-form-label">告知签收单位：</span><div id="doc-notice-sign-unit" class="wh-search-select flex-1 min-w-0"></div></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">告知单签收人员：</span><input id="doc-notice-sign-person" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.signPerson || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">告知单签收电话：</span><input id="doc-notice-sign-phone" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.signPhone || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3"><span class="project-form-label">告知单资料：</span><div class="flex-1">' +
          upload +
          "</div></label></div>"
        );
      }

      if (category === "项目运营发函") {
        return (
          '<div class="space-y-4 max-w-[640px] mx-auto">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">运营发函名称：</span><input id="doc-ops-name" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.letterName || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3 project-form-row--select"><span class="project-form-label">主送单位：</span><div id="doc-primary-unit" class="wh-search-select flex-1 min-w-0"></div></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">主送单位联系人：</span><input id="doc-primary-contact" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.primaryContact || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">主送单位电话：</span><input id="doc-primary-phone" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.primaryPhone || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3 project-form-row--select"><span class="project-form-label">抄送单位：</span><div id="doc-cc-unit" class="wh-search-select flex-1 min-w-0"></div></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">运营发函日期：</span><input id="doc-ops-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.letterDate || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3"><span class="project-form-label">运营发函资料：</span><div class="flex-1">' +
          upload +
          "</div></label></div>"
        );
      }

      if (category === "项目外部来函") {
        return (
          '<div class="space-y-4 max-w-[640px] mx-auto">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">外部来函名称：</span><input id="doc-ext-name" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.letterName || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3 project-form-row--select"><span class="project-form-label">外部来函单位：</span><div id="doc-from-unit" class="wh-search-select flex-1 min-w-0"></div></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">外部来函联系人：</span><input id="doc-ext-contact" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.fromContact || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">外部来函电话：</span><input id="doc-ext-phone" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.fromPhone || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">外部来函日期：</span><input id="doc-ext-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.letterDate || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3"><span class="project-form-label">外部来函资料：</span><div class="flex-1">' +
          upload +
          "</div></label></div>"
        );
      }

      if (category === "技术中心回函") {
        return (
          '<div class="space-y-4 max-w-[640px] mx-auto">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">技术中心回函名称：</span><input id="doc-tech-name" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.techReplyName || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">技术中心回函类型：</span><select id="doc-tech-type" class="wh-input h-8 flex-1 px-2"><option value="">请选择回函类型</option>' +
          selectOptions(TECH_REPLY_TYPES, docItem.techReplyType || "") +
          "</select></label>" +
          '<label class="flex items-center gap-3"><span class="project-form-label">技术中心经办人：</span><input id="doc-tech-handler" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.techHandler || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">技术回函日期：</span><input id="doc-tech-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.techReplyDate || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3"><span class="project-form-label">技术中心回函资料：</span><div class="flex-1">' +
          upload +
          "</div></label></div>"
        );
      }

      if (category === "项目安全影响评估") {
        return (
          '<div class="space-y-4 max-w-[640px] mx-auto">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">安全影响评估名称：</span><input id="doc-safety-name" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.safetyName || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">安全影响评估日期：</span><input id="doc-safety-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.safetyDate || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label">安全影响评估单位：</span><select id="doc-safety-unit" class="wh-input h-8 flex-1 px-2"><option value="">请选择评估单位</option>' +
          selectOptions(ctx.getDocUnitOptions(), docItem.safetyUnit || "") +
          "</select></label>" +
          '<label class="flex items-start gap-3"><span class="project-form-label">安全影响评估资料：</span><div class="flex-1">' +
          upload +
          "</div></label></div>"
        );
      }

      if (category === "项目初始化状态报告") {
        return (
          '<div class="space-y-4 max-w-[640px] mx-auto">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">初始化状态报告名称：</span><input id="doc-init-name" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.initReportName || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">初始化状态报告日期：</span><input id="doc-init-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.initReportDate || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3"><span class="project-form-label">初始化状态报告资料：</span><div class="flex-1">' +
          upload +
          "</div></label></div>"
        );
      }

      if (category === "项目专项施工方案及专家意见") {
        return (
          '<div class="space-y-4 mx-auto proj-doc-form--long-label">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">专项施工方案及专家意见名称：</span><input id="doc-special-name" class="wh-input h-8 px-2 proj-doc-form__control" value="' +
          ctx.escapeHtml(docItem.specialName || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">专项施工方案及专家意见日期：</span><input id="doc-special-date" type="date" class="wh-input h-8 px-2 proj-doc-form__control" value="' +
          ctx.escapeHtml(docItem.specialDate || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3"><span class="project-form-label">专项施工方案及专家意见资料（电子版）：</span><div class="proj-doc-form__control">' +
          ctx.uploadField("doc-file-digital", docItem.fileNameDigital || "", "未上传电子版") +
          "</div></label>" +
          '<label class="flex items-start gap-3"><span class="project-form-label">专项施工方案及专家意见资料（扫描版）：</span><div class="proj-doc-form__control">' +
          ctx.uploadField("doc-file-scan", docItem.fileNameScan || "", "未上传扫描版") +
          "</div></label></div>"
        );
      }

      if (category === "项目第三方监测方案及专家意见") {
        return (
          '<div class="space-y-4 mx-auto proj-doc-form--long-label">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">第三方监测方案及专家意见名称：</span><input id="doc-monitor-name" class="wh-input h-8 px-2 proj-doc-form__control" value="' +
          ctx.escapeHtml(docItem.monitorName || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">第三方监测方案及专家意见日期：</span><input id="doc-monitor-date" type="date" class="wh-input h-8 px-2 proj-doc-form__control" value="' +
          ctx.escapeHtml(docItem.monitorDate || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3"><span class="project-form-label">第三方监测方案及专家意见资料：</span><div class="proj-doc-form__control">' +
          upload +
          "</div></label></div>"
        );
      }

      if (category === "安全协议") {
        return (
          '<div class="space-y-4 max-w-[640px] mx-auto">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">安全协议名称：</span><input id="doc-agreement-name" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.agreementName || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">安全协议日期：</span><input id="doc-agreement-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.agreementDate || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3"><span class="project-form-label">安全协议资料：</span><div class="flex-1">' +
          upload +
          "</div></label></div>"
        );
      }

      if (category === "其他资料") {
        return (
          '<div class="space-y-4 max-w-[640px] mx-auto">' +
          head +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">资料名称：</span><input id="doc-material-name" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.materialName || "") +
          '" /></label>' +
          '<label class="flex items-center gap-3"><span class="project-form-label project-required">资料日期：</span><input id="doc-material-date" type="date" class="wh-input h-8 flex-1 px-2" value="' +
          ctx.escapeHtml(docItem.materialDate || "") +
          '" /></label>' +
          '<label class="flex items-start gap-3"><span class="project-form-label">资料文件：</span><div class="flex-1">' +
          upload +
          "</div></label></div>"
        );
      }

      return (
        '<div class="space-y-4 max-w-[560px] mx-auto">' +
        head +
        '<label class="flex items-center gap-3"><span class="project-form-label project-required">名称：</span><input id="doc-name" class="wh-input h-8 flex-1 px-2" value="' +
        ctx.escapeHtml(docItem.name || "") +
        '" /></label></div>'
      );
    }

    function mountDocModalSelects(category, docItem) {
      ctx.setDocModalSelects([]);
      if (typeof global.WHSearchSelect === "undefined") return;
      var opts = ctx.getDocUnitOptions();
      docItem = docItem || {};
      var selects = [];
      if (category === "项目告知单") {
        var noticeSign = global.WHSearchSelect.create(
          document.getElementById("doc-notice-sign-unit"),
          opts,
          "请搜索或选择告知签收单位"
        );
        if (noticeSign) {
          noticeSign.setValue(docItem.signUnit || "");
          selects.push(noticeSign);
        }
      } else if (category === "项目运营发函") {
        var primary = global.WHSearchSelect.create(document.getElementById("doc-primary-unit"), opts, "请搜索或选择主送单位");
        var cc = global.WHSearchSelect.create(document.getElementById("doc-cc-unit"), opts, "请搜索或选择抄送单位");
        if (primary) {
          primary.setValue(docItem.primaryUnit || "");
          selects.push(primary);
        }
        if (cc) {
          cc.setValue(docItem.ccUnit || "");
          selects.push(cc);
        }
      } else if (category === "项目外部来函") {
        var fromUnit = global.WHSearchSelect.create(document.getElementById("doc-from-unit"), opts, "请搜索或选择外部来函单位");
        if (fromUnit) {
          fromUnit.setValue(docItem.fromUnit || "");
          selects.push(fromUnit);
        }
      }
      ctx.setDocModalSelects(selects);
    }

    function val(id) {
      var el = document.getElementById(id);
      return el && el.value ? el.value.trim() : "";
    }

    function collectDocRecord(category, existingDoc) {
      existingDoc = existingDoc || {};
      var selects = ctx.getDocModalSelects();

      if (category === "项目告知单") {
        return Object.assign(
          {
            noticeName: val("doc-notice-name"),
            noticeNo: val("doc-notice-no"),
            issuer: val("doc-notice-issuer"),
            issueDate: val("doc-notice-issue-date"),
            signUnit: selects[0] ? selects[0].getValue() : "",
            signPerson: val("doc-notice-sign-person"),
            signPhone: val("doc-notice-sign-phone")
          },
          readDocFilePart("doc-file", existingDoc)
        );
      }
      if (category === "项目运营发函") {
        return Object.assign(
          {
            letterName: val("doc-ops-name"),
            primaryUnit: selects[0] ? selects[0].getValue() : "",
            primaryContact: val("doc-primary-contact"),
            primaryPhone: val("doc-primary-phone"),
            ccUnit: selects[1] ? selects[1].getValue() : "",
            letterDate: val("doc-ops-date")
          },
          readDocFilePart("doc-file", existingDoc)
        );
      }
      if (category === "项目外部来函") {
        return Object.assign(
          {
            letterName: val("doc-ext-name"),
            fromUnit: selects[0] ? selects[0].getValue() : "",
            fromContact: val("doc-ext-contact"),
            fromPhone: val("doc-ext-phone"),
            letterDate: val("doc-ext-date")
          },
          readDocFilePart("doc-file", existingDoc)
        );
      }
      if (category === "技术中心回函") {
        return Object.assign(
          {
            techReplyName: val("doc-tech-name"),
            techReplyType: val("doc-tech-type"),
            techHandler: val("doc-tech-handler"),
            techReplyDate: val("doc-tech-date")
          },
          readDocFilePart("doc-file", existingDoc)
        );
      }
      if (category === "项目安全影响评估") {
        return Object.assign(
          {
            safetyName: val("doc-safety-name"),
            safetyDate: val("doc-safety-date"),
            safetyUnit: val("doc-safety-unit")
          },
          readDocFilePart("doc-file", existingDoc)
        );
      }
      if (category === "项目初始化状态报告") {
        return Object.assign(
          {
            initReportName: val("doc-init-name"),
            initReportDate: val("doc-init-date")
          },
          readDocFilePart("doc-file", existingDoc)
        );
      }
      if (category === "项目专项施工方案及专家意见") {
        return Object.assign(
          {
            specialName: val("doc-special-name"),
            specialDate: val("doc-special-date")
          },
          readDocFilePart("doc-file-digital", existingDoc, {
            name: "fileNameDigital",
            url: "fileUrlDigital",
            mime: "mimeTypeDigital"
          }),
          readDocFilePart("doc-file-scan", existingDoc, {
            name: "fileNameScan",
            url: "fileUrlScan",
            mime: "mimeTypeScan"
          })
        );
      }
      if (category === "项目第三方监测方案及专家意见") {
        return Object.assign(
          {
            monitorName: val("doc-monitor-name"),
            monitorDate: val("doc-monitor-date")
          },
          readDocFilePart("doc-file", existingDoc)
        );
      }
      if (category === "安全协议") {
        return Object.assign(
          {
            agreementName: val("doc-agreement-name"),
            agreementDate: val("doc-agreement-date")
          },
          readDocFilePart("doc-file", existingDoc)
        );
      }
      if (category === "其他资料") {
        return Object.assign(
          {
            materialName: val("doc-material-name"),
            materialDate: val("doc-material-date")
          },
          readDocFilePart("doc-file", existingDoc)
        );
      }
      return Object.assign({ name: val("doc-name"), date: val("doc-date") }, readDocFilePart("doc-file", existingDoc));
    }

    function validateDocRecord(category, record) {
      if (category === "项目告知单") {
        if (!record.noticeName || !record.noticeNo) {
          ctx.showToast("请先填写告知单名称和告知单编号");
          return false;
        }
      } else if (category === "项目运营发函") {
        if (!record.letterName || !record.letterDate) {
          ctx.showToast("请先填写运营发函名称和运营发函日期");
          return false;
        }
      } else if (category === "项目外部来函") {
        if (!record.letterName || !record.letterDate) {
          ctx.showToast("请先填写外部来函名称和外部来函日期");
          return false;
        }
      } else if (category === "技术中心回函") {
        if (!record.techReplyName || !record.techReplyDate) {
          ctx.showToast("请先填写技术中心回函名称和技术回函日期");
          return false;
        }
      } else if (category === "项目安全影响评估") {
        if (!record.safetyName || !record.safetyDate) {
          ctx.showToast("请先填写安全影响评估名称和评估日期");
          return false;
        }
      } else if (category === "项目初始化状态报告") {
        if (!record.initReportName || !record.initReportDate) {
          ctx.showToast("请先填写初始化状态报告名称和报告日期");
          return false;
        }
      } else if (category === "项目专项施工方案及专家意见") {
        if (!record.specialName || !record.specialDate) {
          ctx.showToast("请先填写专项施工方案及专家意见名称和日期");
          return false;
        }
      } else if (category === "项目第三方监测方案及专家意见") {
        if (!record.monitorName || !record.monitorDate) {
          ctx.showToast("请先填写第三方监测方案及专家意见名称和日期");
          return false;
        }
      } else if (category === "安全协议") {
        if (!record.agreementName || !record.agreementDate) {
          ctx.showToast("请先填写安全协议名称和协议日期");
          return false;
        }
      } else if (category === "其他资料") {
        if (!record.materialName || !record.materialDate) {
          ctx.showToast("请先填写资料名称和资料日期");
          return false;
        }
      }

      return true;
    }

    function docRows() {
      ensureDocCardStyles();
      var lib = ctx.getDocLibrary();
      var listEl = document.getElementById(ctx.listId);
      if (!listEl) return;
      var openAction = ctx.openDocAction || "open-doc-modal";
      var previewAction = ctx.previewDocAction || "preview-doc";
      var editAction = ctx.editDocAction || "edit-doc";
      var deleteAction = ctx.deleteDocAction || "delete-doc";

      listEl.innerHTML = DOC_CATEGORY_LIST.map(function (name) {
        var files = lib[name] || [];
        return (
          '<section class="proj-doc-section">' +
          '<div class="proj-doc-section__head">' +
          '<h3>' +
          ctx.escapeHtml(name) +
          '</h3><button type="button" class="px-4 py-1.5 rounded text-xs wh-btn-primary" data-action="' +
          openAction +
          '" data-doc="' +
          ctx.escapeHtml(name) +
          '"><i class="fa-solid fa-plus mr-1"></i>新增</button></div>' +
          (files.length
            ? '<div class="proj-doc-cards">' +
              files
                .map(function (file, index) {
                  return renderDocCard(name, file, index, editAction, deleteAction, previewAction);
                })
                .join("") +
              "</div>"
            : '<div class="project-empty"><i class="fa-regular fa-folder-open text-2xl mb-1"></i>暂无上传文件</div>') +
          "</section>"
        );
      }).join("");
    }

    function buildPreviewPayload(category, item) {
      return {
        kind: "file",
        title: "文件预览",
        category: category,
        name: docPreviewLabel(item, category),
        date: docDisplayDate(item, category),
        url: docPreviewUrl(item),
        mimeType: docPreviewMime(item),
        tip: docDisplayName(item, category) || "资料文件预览"
      };
    }

    function createEmptyLibrary() {
      var lib = {};
      DOC_CATEGORY_LIST.forEach(function (name) {
        lib[name] = [];
      });
      return lib;
    }

    return {
      DOC_CATEGORY_LIST: DOC_CATEGORY_LIST,
      createEmptyLibrary: createEmptyLibrary,
      docRows: docRows,
      buildDocFormHtml: buildDocFormHtml,
      mountDocModalSelects: mountDocModalSelects,
      collectDocRecord: collectDocRecord,
      validateDocRecord: validateDocRecord,
      buildPreviewPayload: buildPreviewPayload,
      filePreviewPayload: filePreviewPayload,
      docDisplayName: docDisplayName,
      docDisplayDate: docDisplayDate
    };
  }

  global.ProjectDocShared = {
    DOC_CATEGORY_LIST: DOC_CATEGORY_LIST,
    createHandlers: createHandlers
  };
})(typeof window !== "undefined" ? window : global);
