/**
 * 告警详情 / 待办告警详情 — 处警记录共用时间轴渲染
 */
(function (global) {
  function escHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function ensureOperationLogStyles() {
    if (global.ProjectOperationLog && global.ProjectOperationLog.ensureStyles) {
      global.ProjectOperationLog.ensureStyles();
    }
  }

  function recordMetaLine(label, value) {
    return (
      '<p class="record-item__meta">' +
      escHtml(label) +
      "：" +
      escHtml(value == null || value === "" ? "—" : value) +
      "</p>"
    );
  }

  var DISPOSAL_AUDIT_SAMPLES = {
    pass: {
      time: "2026-04-07 11:30:00",
      text: "管理员审批",
      auditor: "wangweiwei",
      result: "审核通过",
      opinion: "现场管控措施到位，同意结案。",
    },
    reject: {
      time: "2026-04-07 12:20:00",
      text: "管理员审批",
      auditor: "wangweiwei",
      result: "审核不通过",
      opinion: "复核材料不完整，请补充现场近景照片后重新提交。",
    },
  };

  function findAuditRecord(records, result) {
    var found = null;
    (records || []).forEach(function (record) {
      if (record.type === "audit" && record.result === result) found = record;
    });
    return found;
  }

  function mergeAuditSample(record, sample) {
    return Object.assign({}, sample, record || {});
  }

  function prepareRecords(item) {
    var records = (item.disposalRecord || []).slice();
    var hasAudit = records.some(function (record) {
      return record.type === "audit";
    });
    if (!hasAudit) {
      records.push(
        mergeAuditSample(findAuditRecord(records, "审核通过"), DISPOSAL_AUDIT_SAMPLES.pass)
      );
      records.push(
        mergeAuditSample(findAuditRecord(records, "审核不通过"), DISPOSAL_AUDIT_SAMPLES.reject)
      );
    }
    return records;
  }

  function renderDisposalFieldRows(rows) {
    if (!rows || !rows.length) return "";
    return (
      '<div class="alert-disposal-detail">' +
      rows
        .map(function (row) {
          var valueClass = row[2] || "alert-uav-shot__highlight";
          return (
            "<div>" +
            row[0] +
            '：<span class="' +
            valueClass +
            '">' +
            (row[1] || "—") +
            "</span></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function disposalTimelineNodeClass(record) {
    if (record.type === "audit") {
      if (record.result === "审核通过") return "pass";
      if (record.result === "审核不通过") return "reject";
      return "wait";
    }
    if (record.review || record.type === "review") return "pass";
    if (record.type === "alarm") return "wait";
    return "";
  }

  function renderReviewDetail(record, uav) {
    uav = uav || {};
    return renderDisposalFieldRows([
      ["是否误报", record.falseAlarm || uav.mistaken || "否"],
      ["报警级别调整", record.levelAdjust || uav.level || "—"],
      ["现场情况", record.scene || uav.situation || "—"],
    ]);
  }

  function renderAuditDetail(record) {
    var statusClass =
      record.result === "审核通过"
        ? "alert-uav-shot__highlight alert-disposal-result--pass"
        : "alert-uav-shot__highlight alert-disposal-result--reject";
    return renderDisposalFieldRows([
      ["审核人", record.auditor || record.user || "管理员"],
      ["审核状态", record.result || "—", statusClass],
      ["审核意见", record.opinion || "—"],
    ]);
  }

  function renderTimelineItem(record, detailHtml, last) {
    var nodeClass = disposalTimelineNodeClass(record);
    return (
      '<div class="alert-timeline-item' +
      (last ? " alert-timeline-item--last" : "") +
      (nodeClass ? " alert-timeline-item--" + nodeClass : "") +
      '">' +
      '<div class="alert-timeline-item__rail" aria-hidden="true">' +
      '<span class="alert-timeline-item__dot"></span>' +
      (last ? "" : '<span class="alert-timeline-item__line"></span>') +
      "</div>" +
      '<div class="alert-timeline-item__body">' +
      '<div class="alert-time">' +
      (record.time || "—") +
      "</div>" +
      '<div class="alert-disposal-text">' +
      (record.text || "") +
      "</div>" +
      (detailHtml || "") +
      "</div></div>"
    );
  }

  function renderReviewRecordMeta(record, uav) {
    uav = uav || {};
    return (
      recordMetaLine("是否误报", record.falseAlarm || uav.mistaken || "否") +
      recordMetaLine("报警级别调整", record.levelAdjust || uav.level || "—") +
      recordMetaLine("现场情况", record.scene || uav.situation || "—")
    );
  }

  function renderAuditRecordMeta(record) {
    return (
      recordMetaLine("审核人", record.auditor || record.user || "管理员") +
      recordMetaLine("审核状态", record.result || "—") +
      recordMetaLine("审核意见", record.opinion || "—")
    );
  }

  function renderApprovalRecordMeta(record) {
    return (
      recordMetaLine("是否误报", record.falseAlarm || "—") +
      recordMetaLine("是否违规施工", record.illegalConstruction || "—") +
      recordMetaLine("风险等级", record.riskLevel || "—") +
      recordMetaLine("审批内容", record.approvalContent || record.opinion || "—")
    );
  }

  /** 移动端：与项目管理「操作记录」一致的纵向时间轴 */
  function renderAsRecordLog(item) {
    item = item || {};
    ensureOperationLogStyles();
    var uav = item.uavRecord || {};
    var records = prepareRecords(item);
    if (!records.length) {
      return '<div class="record-empty">暂无处警记录</div>';
    }
    return (
      '<div class="record-timeline">' +
      records
        .map(function (record) {
          var meta = recordMetaLine("日期", record.time || "—");
          if (record.review || record.type === "review") {
            meta += renderReviewRecordMeta(record, uav);
          } else if (record.type === "audit") {
            meta += renderAuditRecordMeta(record);
          }
          return (
            '<div class="record-item">' +
            '<p class="record-item__title">' +
            escHtml(record.text || "") +
            "</p>" +
            meta +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function renderApprovalAsRecordLog(item) {
    item = item || {};
    ensureOperationLogStyles();
    var records = (item.approvalRecords || []).slice();
    if (!records.length) {
      return '<div class="record-empty">暂无审批记录</div>';
    }
    return (
      '<div class="record-timeline">' +
      records
        .map(function (record) {
          return (
            '<div class="record-item">' +
            '<p class="record-item__title">' +
            escHtml(record.text || "审批") +
            "</p>" +
            recordMetaLine("日期", record.time || "—") +
            renderApprovalRecordMeta(record) +
            "</div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function render(item) {
    item = item || {};
    var uav = item.uavRecord || {};
    var records = prepareRecords(item);
    if (!records.length) {
      return '<div class="alert-disposal-empty">暂无处警记录</div>';
    }
    return (
      '<div class="alert-disposal-scroll">' +
      '<div class="alert-timeline">' +
      records
        .map(function (record, index) {
          var detailHtml = "";
          if (record.review || record.type === "review") {
            detailHtml = renderReviewDetail(record, uav);
          } else if (record.type === "audit") {
            detailHtml = renderAuditDetail(record);
          }
          return renderTimelineItem(record, detailHtml, index === records.length - 1);
        })
        .join("") +
      "</div></div>"
    );
  }

  function renderApprovalDetail(record) {
    return renderDisposalFieldRows([
      ["是否误报", record.falseAlarm || "—"],
      ["是否违规施工", record.illegalConstruction || "—"],
      ["风险等级", record.riskLevel || "—"],
      ["审批内容", record.approvalContent || record.opinion || "—"],
    ]);
  }

  function renderApproval(item) {
    item = item || {};
    var records = (item.approvalRecords || []).slice();
    if (!records.length) {
      return '<div class="alert-disposal-empty">暂无审批记录</div>';
    }
    return (
      '<div class="alert-disposal-scroll">' +
      '<div class="alert-timeline">' +
      records
        .map(function (record, index) {
          var nodeClass = record.result === "审核不通过" ? "reject" : "pass";
          return (
            '<div class="alert-timeline-item' +
            (index === records.length - 1 ? " alert-timeline-item--last" : "") +
            (nodeClass ? " alert-timeline-item--" + nodeClass : "") +
            '">' +
            '<div class="alert-timeline-item__rail" aria-hidden="true">' +
            '<span class="alert-timeline-item__dot"></span>' +
            (index === records.length - 1 ? "" : '<span class="alert-timeline-item__line"></span>') +
            "</div>" +
            '<div class="alert-timeline-item__body">' +
            '<div class="alert-time">' +
            (record.time || "—") +
            "</div>" +
            '<div class="alert-disposal-text">' +
            (record.text || "审批") +
            "</div>" +
            renderApprovalDetail(record) +
            "</div></div>"
          );
        })
        .join("") +
      "</div></div>"
    );
  }

  global.AlertDisposalTimeline = {
    render: render,
    renderApproval: renderApproval,
    renderAsRecordLog: renderAsRecordLog,
    renderApprovalAsRecordLog: renderApprovalAsRecordLog,
    prepareRecords: prepareRecords,
  };
})(typeof window !== "undefined" ? window : global);
