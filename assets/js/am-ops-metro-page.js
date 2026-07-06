/**
 * 资源监控 — Web / 移动端共用逻辑
 */
(function (global) {
  "use strict";

  function bootOpsMetroPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var serverId = options.serverId || "metro";

    function $(sel) {
      return document.querySelector(sel);
    }

    function showToast(msg) {
      var toastEl = document.getElementById("ops-toast");
      if (toastEl) {
        toastEl.textContent = msg;
        toastEl.classList.add("show");
        clearTimeout(showToast._t);
        showToast._t = setTimeout(function () {
          toastEl.classList.remove("show");
        }, 1800);
        return;
      }
      if (isMobile) return;
      var box = document.getElementById("ops-toast-box");
      if (box) box.remove();
      box = document.createElement("div");
      box.id = "ops-toast-box";
      box.className =
        "fixed bottom-5 right-5 z-[1300] rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg";
      box.textContent = msg;
      document.body.appendChild(box);
      setTimeout(function () {
        box.remove();
      }, 1600);
    }

    function metricHtml(val, isRate) {
      if (!isRate) return val;
      return val;
    }

    function setNodeStatus(key, level, text) {
      var el = document.querySelector('[data-node="' + key + '"]');
      if (!el) return;
      var dot = el.querySelector(".topo-dot");
      if (!dot) return;
      dot.className = "topo-dot topo-dot--" + level;
      var label = el.querySelector("span:last-child");
      if (label) label.textContent = text;
    }

    function drawSparkLine(canvas, data, color) {
      if (!canvas || !data || !data.length) return;
      var ctx = canvas.getContext("2d");
      var rect = canvas.getBoundingClientRect();
      var dpr = window.devicePixelRatio || 1;
      canvas.width = Math.max(1, Math.floor(rect.width * dpr));
      canvas.height = Math.max(1, Math.floor(rect.height * dpr));
      ctx.scale(dpr, dpr);
      var w = rect.width;
      var h = rect.height;
      var padTop = 12;
      var padBottom = 10;
      var padLeft = 4;
      var padRight = 4;
      var chartW = Math.max(1, w - padLeft - padRight);
      var chartH = Math.max(1, h - padTop - padBottom);
      var min = Math.min.apply(null, data);
      var max = Math.max.apply(null, data);
      // ensure visible amplitude even for flat data
      var range = Math.max(max - min, min * 0.12) || 1;
      var len = data.length;
      var points = data.map(function (v, i) {
        return {
          x: padLeft + (i / (len - 1)) * chartW,
          y: h - padBottom - ((v - min) / range) * chartH,
        };
      });
      ctx.clearRect(0, 0, w, h);

      function withAlpha(c, a) {
        return c.replace(/([\d.]+)\)$/, function (_, alpha) {
          return a + ")";
        });
      }

      // grid
      ctx.strokeStyle = "rgba(148, 163, 184, 0.08)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(padLeft, h / 2);
      ctx.lineTo(w - padRight, h / 2);
      ctx.stroke();

      // gradient area fill
      var grad = ctx.createLinearGradient(0, 0, 0, h);
      grad.addColorStop(0, withAlpha(color, "0.45"));
      grad.addColorStop(1, withAlpha(color, "0.04"));
      ctx.beginPath();
      ctx.moveTo(points[0].x, h - padBottom);
      points.forEach(function (p) {
        ctx.lineTo(p.x, p.y);
      });
      ctx.lineTo(points[points.length - 1].x, h - padBottom);
      ctx.closePath();
      ctx.fillStyle = grad;
      ctx.fill();

      // spark line
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      points.forEach(function (p) {
        ctx.lineTo(p.x, p.y);
      });
      ctx.strokeStyle = color;
      ctx.lineWidth = 2.5;
      ctx.lineJoin = "round";
      ctx.lineCap = "round";
      ctx.stroke();

      // highlight last point
      var last = points[points.length - 1];
      ctx.beginPath();
      ctx.arc(last.x, last.y, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = "#ffffff";
      ctx.fill();
      ctx.beginPath();
      ctx.arc(last.x, last.y, 6, 0, Math.PI * 2);
      ctx.strokeStyle = color;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    function applyServer(id) {
      var dataMap = global.WH_OPS_METRO_SERVER_DATA || {};
      var data = dataMap[id] || dataMap.metro;
      if (!data) return;

      ["cpu", "mem", "disk"].forEach(function (k) {
        var el = document.querySelector('[data-metric="' + k + '"]');
        if (el) el.textContent = data.metrics[k];
        var chartEl = document.querySelector('[data-chart="' + k + '"]');
        if (chartEl && data.trends && data.trends[k]) {
          var color = "rgba(34, 211, 238, 1)";
          if (k === "mem") color = "rgba(74, 222, 128, 1)";
          if (k === "disk") color = "rgba(251, 146, 60, 1)";
          drawSparkLine(chartEl, data.trends[k], color);
        }
      });
      ["cores", "memFree", "diskFree"].forEach(function (k) {
        var el = document.querySelector('[data-metric="' + k + '"]');
        if (el) el.textContent = data.metrics[k];
      });
      Object.keys(data.store).forEach(function (k) {
        var el = document.querySelector('[data-store="' + k + '"]');
        if (el) el.textContent = data.store[k];
      });
      var chart = data.chart;
      var totalEl = document.querySelector('[data-chart="total"]');
      if (totalEl) totalEl.textContent = chart.total;
      var usedEl = document.querySelector('[data-chart="used"]');
      if (usedEl) usedEl.textContent = chart.used;
      var freeEl = document.querySelector('[data-chart="free"]');
      if (freeEl) freeEl.textContent = chart.free;
      var pctBar = document.querySelector('[data-chart="pctBar"]');
      if (pctBar) pctBar.style.width = chart.pct + "%";
      var pctText = document.querySelector('[data-chart="pctText"]');
      if (pctText) pctText.textContent = "已用 " + chart.pct + "%";
      var pctDetail = document.querySelector('[data-chart="pctDetail"]');
      if (pctDetail) pctDetail.textContent = chart.pctDetail;
      ["photo", "project", "lib"].forEach(function (k) {
        var bar = document.querySelector('[data-bar="' + k + '"]');
        if (bar) bar.style.width = chart.bars[k];
        var labelEl = document.querySelector('[data-bar-label="' + k + '"]');
        if (labelEl && chart.labels) labelEl.textContent = chart.labels[k];
      });
      Object.keys(data.nodes).forEach(function (k) {
        setNodeStatus(k, data.nodes[k][0], data.nodes[k][1]);
      });
    }

    function initQuickLinks() {
      var mountEl = document.getElementById("ops-quick-links");
      if (mountEl && global.SystemMgmtQuickLinks) {
        SystemMgmtQuickLinks.mount(mountEl, "wb/am-ops-metro.html");
      }
    }

    initQuickLinks();
    applyServer(serverId);
  }

  global.WHOpsMetroPage = { boot: bootOpsMetroPage };
})(window);
