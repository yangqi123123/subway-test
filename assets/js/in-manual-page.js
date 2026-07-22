/**
 * 人工巡检记录 - Web / 移动端共用逻辑
 */
(function (global) {
  "use strict";

  function hasLogAction(row, actionName) {
    return (row.logs || []).some(function (log) {
      return log.action === actionName;
    });
  }

  function resolveProjectType(projectName, fallback) {
    if (projectName === "洪山路至小洪山商业公寓项目") return "重点项目";
    if (projectName) return fallback || "一般项目";
    return fallback || "一般项目";
  }

  function toDatetimeLocal(value) {
    if (!value) return "";
    var s = String(value).trim().replace(" ", "T");
    if (/^\d{4}-\d{2}-\d{2}$/.test(s)) s += "T00:00";
    return s;
  }

  function fromDatetimeLocal(value) {
    if (!value) return "";
    return String(value).trim().replace("T", " ");
  }

  function statusBadge(row) {
    if (hasLogAction(row, "拒绝")) {
      return { text: "已拒绝", className: "mp-disease-progress mp-disease-progress--reject" };
    }
    if (hasLogAction(row, "车间确认")) {
      return { text: "已完成", className: "mp-disease-progress mp-disease-progress--done" };
    }
    return { text: "待确认", className: "mp-disease-progress mp-disease-progress--pending" };
  }

  var DEFAULT_LINE = "8号线";
  var DEFAULT_PROGRESS = "地下室结构基本浇筑完成，剩余小部分暂未浇筑，目前正在搭建地上一层主体结构脚手架。";
  var DEFAULT_REMARK = "无";

  var SECTION_INFO = {
    "水果湖-洪山路": { start: "DK08+120", end: "DK09+450", length: "1330.00", method: "盾构" },
    "洪山路-小洪山": { start: "DK09+450", end: "DK10+720", length: "1270.00", method: "盾构" },
    "金潭路-宏图大道": { start: "DK02+330", end: "DK03+910", length: "1580.00", method: "明挖" },
  };

  function selectValues(el) {
    if (!el) return "";
    if (el.multiple) {
      return Array.prototype.filter.call(el.options, function (o) {
        return o.selected && o.value;
      }).map(function (o) {
        return o.value;
      }).join("、");
    }
    return String(el.value || "").trim();
  }

  function setSelectValues(el, value) {
    if (!el) return;
    var values = String(value || "")
      .split(/[、,，]/)
      .map(function (s) {
        return s.trim();
      })
      .filter(Boolean);
    Array.prototype.forEach.call(el.options, function (o) {
      o.selected = values.indexOf(o.value) >= 0;
    });
  }

  function todayLocal() {
    var d = new Date();
    function pad(n) {
      return (n < 10 ? "0" : "") + n;
    }
    return (
      d.getFullYear() +
      "-" +
      pad(d.getMonth() + 1) +
      "-" +
      pad(d.getDate()) +
      "T" +
      pad(d.getHours()) +
      ":" +
      pad(d.getMinutes())
    );
  }

  function renderSectionInfo() {
    var row = document.getElementById("f-section-info-row");
    var box = document.getElementById("f-section-info");
    var select = document.getElementById("f-section");
    if (!row || !box || !select) return;
    var selected = selectValues(select).split("、").filter(Boolean);
    var cards = selected
      .filter(function (name) {
        return SECTION_INFO[name];
      })
      .map(function (name) {
        var info = SECTION_INFO[name];
        return (
          '<div class="mp-section-info__card">' +
          '<div class="mp-section-info__title">' +
          name +
          '</div><div class="mp-section-info__grid">' +
          "<span>起点里程：" +
          info.start +
          "</span><span>终点里程：" +
          info.end +
          "</span><span>长度：" +
          info.length +
          "</span><span>施工方法：" +
          info.method +
          "</span></div></div>"
        );
      });
    box.innerHTML = cards.join("");
    row.hidden = !cards.length;
  }

  function bootManualPage(options) {
    options = options || {};
    var rows = (global.WH_MANUAL_ROWS || []).map(function (row) {
      return Object.assign({}, row, {
        projectType: resolveProjectType(row.projectName, row.projectType),
        logs: (row.logs || []).slice()
      });
    });

    var api = global.WHPatrolCrudPage.boot({
      mobile: !!options.mobile,
      prefix: "manual",
      rows: rows,
      nextId: { value: global.WH_MANUAL_NEXT_ID || 122821 },
      searchPage: "manual-search.html",
      listPage: "manual.html",
      emptyIcon: "fa-solid fa-person-walking",
      emptyText: "暂无人工巡检记录",
      newLogAction: "新增人工巡检",
      saveToast: "人工巡检记录已保存",
      uploadKinds: ["photo", "video"],
      dateField: "patrolDate",
      confirmMessages: {
        confirmTitle: "工班确认",
        confirmMsg: "确定通过该人工巡检记录？",
        rejectTitle: "拒绝受理",
        rejectMsg: "确定拒绝该人工巡检记录？",
        deleteTitle: "确认删除",
        deleteMsg: "确定删除该人工巡检记录吗？删除后不可恢复。"
      },
      confirmLabel: function (row) {
        return hasLogAction(row, "工班确认") ? "车间确认" : "工班确认";
      },
      confirmAction: function (row) {
        return hasLogAction(row, "工班确认") ? "车间确认" : "工班确认";
      },
      confirmDialog: function (row) {
        return hasLogAction(row, "工班确认")
          ? { title: "车间确认", msg: "确定车间确认该人工巡检记录？" }
          : { title: "工班确认", msg: "确定通过该人工巡检记录？" };
      },
      isRowLocked: function (row) {
        return hasLogAction(row, "车间确认") || hasLogAction(row, "拒绝");
      },
      showDelete: function () {
        return true;
      },
      formTitle: function (mode) {
        return mode === "edit" ? "编辑人工巡查记录" : "新建人工巡查记录";
      },
      detailTitle: function (row) {
        return "人工巡检详情";
      },
      stats: function (allRows) {
        return {
          total: allRows.length,
          month: allRows.filter(function (r) {
            return r.patrolDate && String(r.patrolDate).indexOf("2026-03") === 0;
          }).length,
          pending: allRows.filter(function (r) {
            return !hasLogAction(r, "车间确认") && !hasLogAction(r, "拒绝");
          }).length,
          completed: allRows.filter(function (r) {
            return hasLogAction(r, "车间确认");
          }).length
        };
      },
      statusBadge: statusBadge,
      cardTitle: function (row) {
        return row.projectName || "-";
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
          }).join(" / ") || "-";
        return [
          { label: "所属线路", value: row.line },
          { label: "所在区间/站点", value: place, fullWidth: true, nowrap: true },
          { label: "巡查人", value: row.user || "-" },
          { label: "巡查日期", value: row.patrolDate, nowrap: true, fullWidth: true },
          { label: "项目进展", value: row.progress, fullWidth: true }
        ];
      },
      mediaProjectName: function (row) {
        return row.projectName;
      },
      buildDetailHtml: function (row, h) {
        var records = row.records && row.records.length ? row.records : [row];
        var hasMultiple = records.length > 1;
        var commonLine = row.line || (records[0] && records[0].line) || "";
        var commonDirection = row.direction || (records[0] && records[0].direction) || "";
        var commonSection = row.section || (records[0] && records[0].section) || "";
        var commonStation = row.station || (records[0] && records[0].station) || "";
        var commonProjectName = row.projectName || (records[0] && records[0].projectName) || "";
        var commonProjectType = row.projectType || (records[0] && records[0].projectType) || "";
        var commonHtml = hasMultiple ? (
          '<dl class="mp-disease-detail-grid mp-disease-detail-grid--common">' +
          "<div><dt>所属线路</dt><dd>" + h.esc(commonLine) + "</dd></div>" +
          "<div><dt>上下行</dt><dd>" + h.esc(commonDirection || "-") + "</dd></div>" +
          "<div><dt>所在区间</dt><dd>" + h.esc(commonSection || "-") + "</dd></div>" +
          "<div><dt>站点</dt><dd>" + h.esc(commonStation || "-") + "</dd></div>" +
          '<div class="mp-disease-detail-grid__full"><dt>所在项目</dt><dd>' +
          h.esc(commonProjectName) +
          (commonProjectType ? " / " + h.esc(commonProjectType) : "") +
          "</dd></div></dl>"
        ) : "";
        return commonHtml + records.map(function (record, idx) {
          var commonFields = hasMultiple ? "" : (
            "<div><dt>所属线路</dt><dd>" + h.esc(record.line) + "</dd></div>" +
            "<div><dt>上下行</dt><dd>" + h.esc(record.direction || "-") + "</dd></div>" +
            "<div><dt>所在区间</dt><dd>" + h.esc(record.section || "-") + "</dd></div>" +
            "<div><dt>站点</dt><dd>" + h.esc(record.station || "-") + "</dd></div>" +
            '<div class="mp-disease-detail-grid__full"><dt>所在项目</dt><dd>' +
            h.esc(record.projectName) +
            (record.projectType ? " / " + h.esc(record.projectType) : "") +
            "</dd></div>"
          );
          return (
            '<dl class="mp-disease-detail-grid' + (idx > 0 ? ' mp-disease-detail-grid--follow' : '') + '">' +
            "<div><dt>编号</dt><dd>" +
            h.esc(record.id) +
            "</dd></div>" +
            commonFields +
            "<div><dt>巡查日期</dt><dd>" +
            h.esc(record.patrolDate) +
            "</dd></div>" +
            '<div class="mp-disease-detail-grid__full"><dt>巡查照片</dt><dd>' +
            h.mediaCell("photo", record, 3, true) +
            "</dd></div>" +
            '<div class="mp-disease-detail-grid__full"><dt>巡查视频</dt><dd>' +
            h.mediaCell("video", record, 2, true) +
            "</dd></div>" +
            '<div class="mp-disease-detail-grid__full"><dt>项目进展</dt><dd>' +
            h.esc(record.progress) +
            "</dd></div>" +
            '<div class="mp-disease-detail-grid__full"><dt>协调情况及备注</dt><dd>' +
            h.esc(record.remark || "-") +
            "</dd></div>" +
            "<div><dt>巡查人</dt><dd>" +
            h.esc(record.user) +
            "</dd></div>" +
            "<div><dt>更新时间</dt><dd>" +
            h.esc(record.updatedAt) +
            "</dd></div></dl>"
          );
        }).join("");
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
          user: fv("filter-user"),
          dateStart: fv("filter-date-start"),
          dateEnd: fv("filter-date-end")
        };
      },
      rowMatchesFilters: function (row, f) {
        if (f.line && row.line !== f.line) return false;
        if (f.direction && row.direction !== f.direction) return false;
        if (f.section && row.section !== f.section) return false;
        if (f.station && row.station !== f.station) return false;
        if (f.user && String(row.user || "").indexOf(f.user) < 0) return false;
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
          place: (section || "-") + " / " + (station || "-"),
          projectName: fh.fieldVal("f-project"),
          patrolDate: fromDatetimeLocal(fh.fieldVal("f-patrol-date")),
          progress: fh.fieldVal("f-progress"),
          remark: fh.fieldVal("f-remark")
        };
      },
      resetForm: function (fh) {
        fh.$("f-id").value = fh.genId();
        fh.$("f-line").value = DEFAULT_LINE;
        fh.$("f-direction").value = "";
        fh.$("f-section").value = "";
        fh.$("f-station").value = "";
        fh.$("f-project").value = "";
        fh.$("f-patrol-date").value = todayLocal();
        fh.$("f-progress").value = DEFAULT_PROGRESS;
        fh.$("f-remark").value = DEFAULT_REMARK;
        fh.clearUploads();
        fh.refreshFormPickers();
        renderSectionInfo();
      },
      loadForm: function (row, fh) {
        fh.$("f-id").value = row.id;
        fh.$("f-line").value = row.line || "";
        fh.$("f-direction").value = row.direction || "";
        fh.$("f-section").value = row.section || "";
        fh.$("f-station").value = row.station || "";
        fh.$("f-project").value = row.projectName || "";
        fh.$("f-patrol-date").value = toDatetimeLocal(row.patrolDate);
        fh.$("f-progress").value = row.progress || "";
        fh.$("f-remark").value = row.remark || "";
        fh.clearUploads();
        fh.refreshFormPickers();
        renderSectionInfo();
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
      buildRowFromForm: function (data, editingRow) {
        var now = "2026-05-12 18:30";
        return {
          id: data.id,
          line: data.line,
          direction: data.direction,
          section: data.section,
          station: data.station,
          place: data.place,
          projectName: data.projectName,
          projectType: resolveProjectType(data.projectName, editingRow ? editingRow.projectType : "一般项目"),
          progress: data.progress,
          remark: data.remark,
          user: editingRow ? editingRow.user : "李明",
          patrolDate: data.patrolDate,
          updatedAt: now,
          logs: editingRow
            ? editingRow.logs.slice()
            : [{ action: "新增人工巡检", user: "李明", time: now }]
        };
      }
    });
    var sectionSelect = document.getElementById("f-section");
    if (sectionSelect) {
      sectionSelect.addEventListener("change", renderSectionInfo);
    }
    return api;
  }

  global.WHInManualPage = { boot: bootManualPage };
})(typeof window !== "undefined" ? window : global);
