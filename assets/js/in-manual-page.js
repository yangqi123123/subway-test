/**
 * 人工巡查记录 — Web / 移动端共用逻辑
 */
(function (global) {
  "use strict";

  function hasLogAction(row, actionName) {
    return (row.logs || []).some(function (log) {
      return log.action === actionName;
    });
  }

  function statusBadge(row) {
    if (hasLogAction(row, "拒绝")) {
      return { text: "已拒绝", className: "mp-disease-progress mp-disease-progress--reject" };
    }
    if (hasLogAction(row, "工班确认")) {
      return { text: "已确认", className: "mp-disease-progress mp-disease-progress--done" };
    }
    return { text: "待确认", className: "mp-disease-progress mp-disease-progress--pending" };
  }

  function bootManualPage(options) {
    options = options || {};
    var rows = (global.WH_MANUAL_ROWS || []).map(function (row) {
      return Object.assign({}, row, { logs: (row.logs || []).slice() });
    });

    return global.WHPatrolCrudPage.boot({
      mobile: !!options.mobile,
      prefix: "manual",
      rows: rows,
      nextId: { value: global.WH_MANUAL_NEXT_ID || 122821 },
      searchPage: "manual-search.html",
      listPage: "manual.html",
      emptyIcon: "fa-solid fa-person-walking",
      emptyText: "暂无人工巡查记录",
      newLogAction: "新增人工巡查",
      saveToast: "人工巡查记录已保存",
      uploadKinds: ["photo", "video"],
      dateField: "patrolDate",
      confirmMessages: {
        confirmTitle: "工班确认",
        confirmMsg: "确定通过该人工巡查记录？",
        rejectTitle: "拒绝受理",
        rejectMsg: "确定拒绝该人工巡查记录？",
      },
      formTitle: function (mode) {
        return mode === "edit" ? "编辑人工巡查记录" : "新建人工巡查记录";
      },
      detailTitle: function (row) {
        return row.id + " · 人工巡查详情";
      },
      stats: function (allRows) {
        return {
          total: allRows.length,
          month: allRows.filter(function (r) {
            return r.patrolDate && String(r.patrolDate).indexOf("2026-03") === 0;
          }).length,
          pending: allRows.filter(function (r) {
            return !hasLogAction(r, "工班确认") && !hasLogAction(r, "拒绝");
          }).length,
          completed: allRows.filter(function (r) {
            return hasLogAction(r, "工班确认");
          }).length,
        };
      },
      statusBadge: statusBadge,
      cardTitle: function (row) {
        return row.projectName || "—";
      },
      rowMatchesSearch: function (row, query) {
        var q = (query || "").trim();
        if (!q) return true;
        return String(row.projectName || "").indexOf(q) >= 0;
      },
      cardMeta: function (row) {
        var place =
          [row.section, row.station].filter(function (s) {
            return s && String(s).trim();
          }).join(" / ") || "—";
        return [
          { label: "所属线路", value: row.line },
          { label: "所在区间/站点", value: place, fullWidth: true, nowrap: true },
          { label: "巡查人", value: row.user || "—" },
          { label: "巡查日期", value: row.patrolDate, nowrap: true, fullWidth: true },
          { label: "项目进展", value: row.progress, fullWidth: true },
        ];
      },
      mediaProjectName: function (row) {
        return row.projectName;
      },
      buildDetailHtml: function (row, h) {
        return (
          '<dl class="mp-disease-detail-grid">' +
          "<div><dt>编号</dt><dd>" +
          h.esc(row.id) +
          "</dd></div>" +
          "<div><dt>所属线路</dt><dd>" +
          h.esc(row.line) +
          "</dd></div>" +
          "<div><dt>上下行</dt><dd>" +
          h.esc(row.direction || "—") +
          "</dd></div>" +
          "<div><dt>所在区间</dt><dd>" +
          h.esc(row.section || "—") +
          "</dd></div>" +
          "<div><dt>站点</dt><dd>" +
          h.esc(row.station || "—") +
          "</dd></div>" +
          "<div><dt>所在项目</dt><dd>" +
          h.esc(row.projectName) +
          "</dd></div>" +
          "<div><dt>巡查日期</dt><dd>" +
          h.esc(row.patrolDate) +
          "</dd></div>" +
          '<div class="mp-disease-detail-grid__full"><dt>巡查照片</dt><dd>' +
          h.mediaCell("photo", row, 3, true) +
          "</dd></div>" +
          '<div class="mp-disease-detail-grid__full"><dt>巡查视频</dt><dd>' +
          h.mediaCell("video", row, 2, true) +
          "</dd></div>" +
          '<div class="mp-disease-detail-grid__full"><dt>项目进展</dt><dd>' +
          h.esc(row.progress) +
          "</dd></div>" +
          '<div class="mp-disease-detail-grid__full"><dt>协调情况及备注</dt><dd>' +
          h.esc(row.remark || "—") +
          "</dd></div>" +
          "<div><dt>巡查人</dt><dd>" +
          h.esc(row.user) +
          "</dd></div>" +
          "<div><dt>更新时间</dt><dd>" +
          h.esc(row.updatedAt) +
          "</dd></div></dl>"
        );
      },
      readFiltersFromForm: function () {
        function fv(id) {
          var el = document.getElementById(id);
          return el ? String(el.value || "").trim() : "";
        }
        return {
          line: fv("filter-line"),
          direction: fv("filter-direction"),
          section: fv("filter-section"),
          station: fv("filter-station"),
          dateStart: fv("filter-date-start"),
          dateEnd: fv("filter-date-end"),
        };
      },
      rowMatchesFilters: function (row, f) {
        if (f.line && row.line !== f.line) return false;
        if (f.direction && row.direction !== f.direction) return false;
        if (f.section && row.section !== f.section) return false;
        if (f.station && row.station !== f.station) return false;
        return true;
      },
      readForm: function (fh) {
        var section = fh.fieldVal("f-section");
        var station = fh.fieldVal("f-station");
        return {
          id: fh.fieldVal("f-id"),
          line: fh.fieldVal("f-line"),
          direction: fh.fieldVal("f-direction"),
          section: section,
          station: station,
          place: (section || "—") + " / " + (station || "—"),
          projectName: fh.fieldVal("f-project"),
          patrolDate: fh.fieldVal("f-patrol-date"),
          progress: fh.fieldVal("f-progress"),
          remark: fh.fieldVal("f-remark"),
        };
      },
      resetForm: function (fh) {
        fh.$("f-id").value = fh.genId();
        fh.$("f-line").value = "";
        fh.$("f-direction").value = "";
        fh.$("f-section").value = "";
        fh.$("f-station").value = "";
        fh.$("f-project").value = "";
        fh.$("f-patrol-date").value = "";
        fh.$("f-progress").value = "";
        fh.$("f-remark").value = "";
        fh.clearUploads();
        fh.refreshFormPickers();
      },
      loadForm: function (row, fh) {
        fh.$("f-id").value = row.id;
        fh.$("f-line").value = row.line || "";
        fh.$("f-direction").value = row.direction || "";
        fh.$("f-section").value = row.section || "";
        fh.$("f-station").value = row.station || "";
        fh.$("f-project").value = row.projectName || "";
        fh.$("f-patrol-date").value = row.patrolDate || "";
        fh.$("f-progress").value = row.progress || "";
        fh.$("f-remark").value = row.remark || "";
        fh.clearUploads();
        fh.refreshFormPickers();
      },
      validateForm: function (fh) {
        if (!fh.fieldVal("f-line")) {
          fh.showToast("请选择所属线路");
          return false;
        }
        if (!fh.fieldVal("f-direction")) {
          fh.showToast("请选择上下行");
          return false;
        }
        if (!fh.fieldVal("f-project")) {
          fh.showToast("请选择所在项目");
          return false;
        }
        if (!fh.fieldVal("f-patrol-date")) {
          fh.showToast("请填写巡查日期");
          return false;
        }
        if (!fh.fieldVal("f-progress")) {
          fh.showToast("请填写项目进展");
          return false;
        }
        return true;
      },
      buildRowFromForm: function (data, editingRow, fh) {
        var now = "2026-05-12 18:30";
        return {
          id: data.id,
          line: data.line,
          direction: data.direction,
          section: data.section,
          station: data.station,
          place: data.place,
          projectName: data.projectName,
          progress: data.progress,
          remark: data.remark,
          user: editingRow ? editingRow.user : "当前用户",
          patrolDate: data.patrolDate,
          updatedAt: now,
          logs: editingRow
            ? editingRow.logs.slice()
            : [{ action: "新增人工巡查", user: "当前用户", time: now }],
        };
      },
    });
  }

  global.WHInManualPage = { boot: bootManualPage };
})(typeof window !== "undefined" ? window : global);
