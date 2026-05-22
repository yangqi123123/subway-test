/**
 * 审批记录 / 处警记录 共用纵向时间轴（单节点圆点，状态徽章无内嵌圆点）
 */
(function (global) {
  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function statusBadge(text) {
    var label = text || "—";
    var type = "wh-status--pending";
    if (label === "审核通过" || label === "审批通过") type = "wh-status--done";
    else if (label === "审核中" || label === "待审批" || label === "告警" || label === "复核") type = "wh-status--progress";
    else if (label === "已驳回" || label === "驳回" || label === "审核不通过") type = "wh-status--pending";
    return '<span class="wh-status ' + type + '">' + esc(label) + "</span>";
  }

  function approvalNodeClass(status) {
    if (status === "审批通过" || status === "审核通过") return "pass";
    if (status === "审核中" || status === "待审批") return "wait";
    if (status === "已驳回" || status === "驳回" || status === "审核不通过") return "reject";
    return "";
  }

  function disposalNodeClass(record) {
    if (record.type === "audit") {
      if (record.result === "审核通过") return "pass";
      if (record.result === "审核不通过") return "reject";
      return "wait";
    }
    if (record.review || record.type === "review") return "pass";
    if (record.type === "alarm") return "wait";
    return "";
  }

  function disposalStatusLabel(record) {
    if (record.type === "audit") return record.result || "审核";
    if (record.review || record.type === "review") return "复核";
    if (record.type === "alarm") return "告警";
    return "记录";
  }

  function disposalTitle(record) {
    var text = record.text || "";
    var m = text.match(/^(.+?)(提交|确认|审批)/);
    if (m) return m[1];
    if (text.length > 24) return text.slice(0, 24) + "…";
    return text || "系统";
  }

  function renderItem(options) {
    options = options || {};
    var nodeClass = options.nodeClass || "";
    var last = !!options.last;
    var title = options.title != null ? options.title : "";
    var badge = options.badge != null ? options.badge : "";
    var time = options.time != null ? options.time : "—";
    var body = options.body || "";

    return (
      '<div class="approval-item ' +
      esc(nodeClass) +
      (last ? " approval-item--last" : "") +
      '">' +
      '<div class="approval-item__rail" aria-hidden="true">' +
      '<span class="approval-item__dot"></span>' +
      (last ? "" : '<span class="approval-item__line"></span>') +
      "</div>" +
      '<div class="approval-item__content">' +
      '<div class="flex flex-wrap items-center gap-3">' +
      '<span class="font-semibold text-cyan-100">' +
      esc(title) +
      "</span>" +
      badge +
      '<span class="text-xs text-slate-400">' +
      esc(time) +
      "</span>" +
      "</div>" +
      (body ? '<div class="mt-2 text-xs text-slate-300 leading-5">' + body + "</div>" : "") +
      "</div></div>"
    );
  }

  function renderApprovalRecords(records) {
    records = records || [];
    return (
      '<div class="approval-records-scroll">' +
      records
        .map(function (r, i) {
          var badgeText = r.status === "待审批" ? "审核中" : r.status;
          return renderItem({
            nodeClass: approvalNodeClass(r.status),
            last: i === records.length - 1,
            title: r.person,
            badge: statusBadge(badgeText),
            time: r.time,
            body: "审批意见：" + esc(r.opinion || "—"),
          });
        })
        .join("") +
      "</div>"
    );
  }

  var DISPOSAL_AUDIT_SAMPLES = {
    pass: {
      time: "2026-04-07 11:30:00",
      text: "管理员审批",
      type: "audit",
      auditor: "wangweiwei",
      result: "审核通过",
      opinion: "现场管控措施到位，同意结案。",
    },
    reject: {
      time: "2026-04-07 12:20:00",
      text: "管理员审批",
      type: "audit",
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

  function prepareDisposalRecords(records) {
    records = (records || []).slice();
    var hasAudit = records.some(function (record) {
      return record.type === "audit";
    });
    if (!hasAudit) {
      records.push(
        Object.assign({}, DISPOSAL_AUDIT_SAMPLES.pass, findAuditRecord(records, "审核通过") || {})
      );
      records.push(
        Object.assign({}, DISPOSAL_AUDIT_SAMPLES.reject, findAuditRecord(records, "审核不通过") || {})
      );
    }
    return records;
  }

  function renderDisposalRecords(records, uav) {
    uav = uav || {};
    records = prepareDisposalRecords(records);
    if (!records.length) return '<div class="text-xs text-slate-400">暂无处警记录</div>';

    return (
      '<div class="approval-records-scroll">' +
      records
        .map(function (record, i) {
          var body = "";
          if (record.review || record.type === "review") {
            body =
              "是否误报：" +
              esc(record.falseAlarm || uav.mistaken || "否") +
              "；级别：" +
              esc(record.levelAdjust || uav.level || "—") +
              "；现场：" +
              esc(record.scene || uav.situation || "—");
          } else if (record.type === "audit") {
            body =
              "审核人：" +
              esc(record.auditor || "管理员") +
              "；意见：" +
              esc(record.opinion || "—");
          } else if (record.text) {
            body = esc(record.text);
          }

          return renderItem({
            nodeClass: disposalNodeClass(record),
            last: i === records.length - 1,
            title: disposalTitle(record),
            badge: statusBadge(disposalStatusLabel(record)),
            time: record.time || "—",
            body: body,
          });
        })
        .join("") +
      "</div>"
    );
  }

  global.ApprovalTimeline = {
    esc: esc,
    statusBadge: statusBadge,
    renderItem: renderItem,
    renderApprovalRecords: renderApprovalRecords,
    renderDisposalRecords: renderDisposalRecords,
    prepareDisposalRecords: prepareDisposalRecords,
    approvalNodeClass: approvalNodeClass,
    disposalNodeClass: disposalNodeClass,
  };
})(window);
