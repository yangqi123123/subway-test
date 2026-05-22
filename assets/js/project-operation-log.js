/**
 * 项目管理 / 完工项目 — 操作记录时间线弹窗
 */
(function (global) {
  function escHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function defaultLogs(projectName) {
    var name = projectName || "该项目";
    return [
      { action: "新增项目", time: "2026-05-18 17:36:56", user: "王志颖" },
      { action: "修改项目状态信息", time: "2026-05-18 17:36:42", user: "王志颖" },
      { action: "修改项目参建单位信息", time: "2026-05-18 17:36:28", user: "王志颖" },
      { action: "修改项目交涉信息", time: "2026-05-18 17:36:14", user: "王志颖" },
      { action: "修改项目告知单", time: "2026-05-18 17:36:00", user: "王志颖" },
      { action: "修改监测台账", time: "2026-05-17 10:22:15", user: "杨俊杰" },
      { action: "修改" + name + "基本信息", time: "2026-05-16 09:18:03", user: "刘晓岚" }
    ];
  }

  function ensureStyles() {
    if (document.getElementById("project-operation-log-style")) return;
    var style = document.createElement("style");
    style.id = "project-operation-log-style";
    style.textContent =
      "#project-record-mask.show,#done-record-mask.show{display:flex}" +
      "#project-record-mask .record-dialog,#done-record-mask .record-dialog{width:min(760px,96vw);max-height:min(86vh,720px);border-radius:8px;border:1px solid rgba(34,211,238,.24);background:#071426;color:rgba(226,245,255,.92);box-shadow:0 24px 80px rgba(0,0,0,.55),0 0 30px rgba(34,211,238,.12);display:flex;flex-direction:column}" +
      "#project-record-mask .record-dialog.project-modal,#done-record-mask .record-dialog.project-modal{display:flex;flex-direction:column;overflow:hidden}" +
      "#project-record-mask .record-list,#done-record-mask .record-list{flex:1 1 auto;overflow-y:auto;max-height:min(60vh,520px)}" +
      "#project-record-mask .record-timeline,#done-record-mask .record-timeline{position:relative;padding-left:28px}" +
      "#project-record-mask .record-timeline::before,#done-record-mask .record-timeline::before{content:'';position:absolute;left:11px;top:10px;bottom:10px;width:1px;background:rgba(34,211,238,.28)}" +
      "#project-record-mask .record-item,#done-record-mask .record-item{position:relative;padding:0 0 22px;font-size:14px}" +
      "#project-record-mask .record-item:last-child,#done-record-mask .record-item:last-child{padding-bottom:0}" +
      "#project-record-mask .record-item::before,#done-record-mask .record-item::before{content:'';position:absolute;left:-28px;top:5px;width:10px;height:10px;border-radius:50%;border:2px solid #38bdf8;background:#071426;box-sizing:border-box;z-index:1;box-shadow:0 0 8px rgba(56,189,248,.35)}" +
      "#project-record-mask .record-item__title,#done-record-mask .record-item__title{margin:0 0 8px;font-size:14px;font-weight:500;color:rgba(240,253,250,.95);line-height:1.4}" +
      "#project-record-mask .record-item__meta,#done-record-mask .record-item__meta{font-size:12px;color:rgba(148,163,184,.95);line-height:1.55;margin:0}" +
      "#project-record-mask .record-empty,#done-record-mask .record-empty{text-align:center;color:rgba(148,163,184,.75);font-size:12px;padding:40px 0}" +
      "#record-mask.record-mask{position:fixed;inset:0;z-index:110;display:none;align-items:center;justify-content:center;background:rgba(2,8,23,.72);padding:24px}" +
      "#record-mask.record-mask.show{display:flex}" +
      "#record-mask .record-dialog{width:min(760px,96vw);max-height:min(86vh,720px);border-radius:8px;border:1px solid rgba(34,211,238,.24);background:#071426;color:rgba(226,245,255,.92);box-shadow:0 24px 80px rgba(0,0,0,.55),0 0 30px rgba(34,211,238,.12);display:flex;flex-direction:column;overflow:hidden}" +
      "#record-mask .record-dialog__head{flex-shrink:0}" +
      "#record-mask .record-list{flex:1 1 auto;overflow-y:auto;max-height:min(60vh,520px)}" +
      "#record-mask .record-timeline{position:relative;padding-left:28px}" +
      "#record-mask .record-timeline::before{content:'';position:absolute;left:11px;top:10px;bottom:10px;width:1px;background:rgba(34,211,238,.28)}" +
      "#record-mask .record-item{position:relative;padding:0 0 22px;font-size:14px}" +
      "#record-mask .record-item:last-child{padding-bottom:0}" +
      "#record-mask .record-item::before{content:'';position:absolute;left:-28px;top:5px;width:10px;height:10px;border-radius:50%;border:2px solid #38bdf8;background:#071426;box-sizing:border-box;z-index:1;box-shadow:0 0 8px rgba(56,189,248,.35)}" +
      "#record-mask .record-item__title{margin:0 0 8px;font-size:14px;font-weight:500;color:rgba(240,253,250,.95);line-height:1.4}" +
      "#record-mask .record-item__meta{font-size:12px;color:rgba(148,163,184,.95);line-height:1.55;margin:0}" +
      "#record-mask .record-empty{text-align:center;color:rgba(148,163,184,.75);font-size:12px;padding:40px 0}";
    document.head.appendChild(style);
  }

  function renderTimelineHtml(logs) {
    ensureStyles();

    if (!logs || !logs.length) {
      return '<div class="record-empty">暂无操作记录</div>';
    }
    return (
      '<div class="record-timeline">' +
      logs
        .map(function (log) {
          return (
            '<div class="record-item">' +
            '<p class="record-item__title">' +
            escHtml(log.action) +
            "</p>" +
            '<p class="record-item__meta">日期：' +
            escHtml(log.time) +
            "</p>" +
            '<p class="record-item__meta">操作者：' +
            escHtml(log.user) +
            "</p></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function getLogsForProject(row, logsById) {
    if (!row) return [];
    var id = row[0];
    var name = row[1];
    if (logsById && logsById[id] && logsById[id].length) return logsById[id];
    if (row.logs && row.logs.length) return row.logs;
    return defaultLogs(name);
  }

  function open(options) {
    options = options || {};
    ensureStyles();
    var mask = options.maskEl || document.getElementById(options.maskId || "project-record-mask");
    var body = options.bodyEl || document.getElementById(options.bodyId || "project-record-body");
    if (!mask || !body) return;
    var row = options.projects && options.projects[options.rowIndex];
    var logs = getLogsForProject(row, options.logsById);
    body.innerHTML = renderTimelineHtml(logs);
    mask.classList.add("show");
  }

  function close(maskEl) {
    maskEl = maskEl || document.getElementById("project-record-mask");
    if (maskEl) maskEl.classList.remove("show");
  }

  function bindClose(maskId, closeAction) {
    maskId = maskId || "project-record-mask";
    closeAction = closeAction || "close-project-record";
    document.addEventListener("click", function (event) {
      var trigger = event.target.closest("[data-action]");
      if (!trigger) return;
      if (trigger.getAttribute("data-action") === closeAction) {
        close(document.getElementById(maskId));
        return;
      }
      var mask = document.getElementById(maskId);
      if (mask && mask.classList.contains("show") && event.target === mask) {
        close(mask);
      }
    });
  }

  global.ProjectOperationLog = {
    defaultLogs: defaultLogs,
    ensureStyles: ensureStyles,
    renderTimelineHtml: renderTimelineHtml,
    open: open,
    close: close,
    bindClose: bindClose
  };
})(typeof window !== "undefined" ? window : global);
