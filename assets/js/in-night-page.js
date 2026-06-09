/**
 * 夜班作业 — Web / 移动端共用逻辑
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

  function bootNightPage(options) {
    options = options || {};
    var rows = (global.WH_NIGHT_ROWS || []).map(function (row) {
      return Object.assign({}, row, { logs: (row.logs || []).slice() });
    });

    return global.WHPatrolCrudPage.boot({
      mobile: !!options.mobile,
      prefix: "night",
      rows: rows,
      nextId: { value: global.WH_NIGHT_NEXT_ID || 4628 },
      searchPage: "night-search.html",
      listPage: "night.html",
      emptyIcon: "fa-solid fa-moon",
      emptyText: "暂无夜班作业数据",
      newLogAction: "新增夜班作业",
      saveToast: "夜班作业已保存",
      uploadKinds: ["doc", "photo", "video"],
      dateField: "time",
      confirmMessages: {
        confirmTitle: "工班确认",
        confirmMsg: "确定通过该夜班作业记录？",
        rejectTitle: "拒绝受理",
        rejectMsg: "确定拒绝该夜班作业记录？",
      },
      formTitle: function (mode) {
        return mode === "edit" ? "编辑夜班作业" : "新建夜班作业";
      },
      detailTitle: function (row) {
        return row.id + " · 夜班作业详情";
      },
      stats: function (allRows) {
        return {
          total: allRows.length,
          month: allRows.filter(function (r) {
            return r.time && String(r.time).indexOf("2026-03") === 0;
          }).length,
          pending: allRows.filter(function (r) {
            return !hasLogAction(r, "工班确认") && !hasLogAction(r, "拒绝");
          }).length,
          completed: allRows.filter(function (r) {
            return hasLogAction(r, "工班确认") || (r.desc && r.desc.indexOf("已完成") >= 0);
          }).length,
        };
      },
      statusBadge: statusBadge,
      cardTitle: function (row) {
        return row.desc || "—";
      },
      rowMatchesSearch: function (row, query) {
        var q = (query || "").trim();
        if (!q) return true;
        return String(row.desc || "").indexOf(q) >= 0;
      },
      cardMeta: function (row) {
        return [
          { label: "所属线路", value: row.line },
          { label: "上下行", value: row.direction },
          { label: "作业时间", value: row.time, nowrap: true, fullWidth: true },
          { label: "作业单位", value: row.company || "—" },
          { label: "提交人", value: row.user || "—" },
          { label: "更新时间", value: row.updatedAt, nowrap: true, fullWidth: true },
        ];
      },
      mediaProjectName: function (row) {
        return row.place;
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
          h.esc(row.direction) +
          "</dd></div>" +
          "<div><dt>所在区间</dt><dd>" +
          h.esc(row.section || "—") +
          "</dd></div>" +
          "<div><dt>站点</dt><dd>" +
          h.esc(row.station || "—") +
          "</dd></div>" +
          '<div class="mp-disease-detail-grid__full"><dt>夜班作业描述</dt><dd>' +
          h.esc(row.desc) +
          "</dd></div>" +
          "<div><dt>作业单位</dt><dd>" +
          h.esc(row.company || "—") +
          "</dd></div>" +
          "<div><dt>特种作业类型</dt><dd>" +
          h.esc(row.specialType || "—") +
          "</dd></div>" +
          '<div class="mp-disease-detail-grid__full"><dt>特种作业资料</dt><dd>' +
          h.esc(row.docNames || "—") +
          "</dd></div>" +
          '<div class="mp-disease-detail-grid__full"><dt>作业照片</dt><dd>' +
          h.mediaCell("photo", row, 3, true) +
          "</dd></div>" +
          '<div class="mp-disease-detail-grid__full"><dt>作业视频</dt><dd>' +
          h.mediaCell("video", row, 2, true) +
          "</dd></div>" +
          "<div><dt>作业时间</dt><dd>" +
          h.esc(row.time) +
          "</dd></div>" +
          "<div><dt>提交人</dt><dd>" +
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
        var direction = fh.fieldVal("f-direction");
        var place =
          (section || "—") +
          " / " +
          (direction || "—") +
          (station ? " · " + station : "");
        return {
          id: fh.fieldVal("f-id"),
          line: fh.fieldVal("f-line"),
          direction: direction,
          section: section,
          station: station,
          place: place,
          desc: fh.fieldVal("f-desc"),
          company: fh.fieldVal("f-company"),
          specialType: fh.fieldVal("f-special-type"),
          time: fh.fieldVal("f-time"),
        };
      },
      resetForm: function (fh) {
        fh.$("f-id").value = fh.genId();
        fh.$("f-line").value = "";
        fh.$("f-direction").value = "";
        fh.$("f-section").value = "";
        fh.$("f-station").value = "";
        fh.$("f-desc").value = "";
        fh.$("f-company").value = "";
        fh.$("f-special-type").value = "";
        fh.$("f-time").value = "";
        fh.clearUploads();
        fh.refreshFormPickers();
      },
      loadForm: function (row, fh) {
        fh.$("f-id").value = row.id;
        fh.$("f-line").value = row.line || "";
        fh.$("f-direction").value = row.direction || "";
        fh.$("f-section").value = row.section || "";
        fh.$("f-station").value = row.station || "";
        fh.$("f-desc").value = row.desc || "";
        fh.$("f-company").value = row.company || "";
        fh.$("f-special-type").value = row.specialType || "";
        fh.$("f-time").value = row.time || "";
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
        if (!fh.fieldVal("f-desc")) {
          fh.showToast("请填写夜班作业描述");
          return false;
        }
        if (!fh.fieldVal("f-time")) {
          fh.showToast("请填写作业时间");
          return false;
        }
        return true;
      },
      buildRowFromForm: function (data, editingRow, fh) {
        var now = "2026-05-12 18:30";
        return {
          id: data.id,
          time: data.time,
          line: data.line,
          direction: data.direction,
          section: data.section,
          station: data.station,
          place: data.place,
          desc: data.desc,
          company: data.company,
          specialType: data.specialType,
          user: editingRow ? editingRow.user : "当前用户",
          updatedAt: now,
          logs: editingRow
            ? editingRow.logs.slice()
            : [{ action: "新增夜班作业", user: "当前用户", time: now }],
        };
      },
    });
  }

  global.WHInNightPage = { boot: bootNightPage };
})(typeof window !== "undefined" ? window : global);
