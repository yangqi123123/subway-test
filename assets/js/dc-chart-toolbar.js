/**
 * 数据统计图表右上角工具栏：堆叠/分组、折线、表格、下载
 */
(function (global) {
  function DCChartToolbar(options) {
    this.canvas = options.canvas;
    this.ctx = this.canvas.getContext("2d");
    this.toolsEl = options.toolsEl;
    this.tableWrap = options.tableWrap;
    this.getConfig = options.getConfig;
    this.fileName = options.fileName || "chart-export";
    this.state = {
      viewMode: "chart",
      barLayout: "stacked",
      chartType: "bar",
    };
    this._downloadMenu = null;
    this._bindTools();
    this.render();
  }

  DCChartToolbar.prototype._bindTools = function () {
    var self = this;
    this.toolsEl.addEventListener("click", function (e) {
      var btn = e.target.closest("[data-tool]");
      if (!btn || btn.disabled) return;
      var tool = btn.getAttribute("data-tool");
      if (tool === "stack-group") {
        if (self.state.viewMode !== "chart" || self.state.chartType !== "bar") return;
        self.state.barLayout = self.state.barLayout === "stacked" ? "grouped" : "stacked";
        self.render();
        return;
      }
      if (tool === "line") {
        if (self.state.viewMode === "table") self.state.viewMode = "chart";
        self.state.chartType = self.state.chartType === "line" ? "bar" : "line";
        self.render();
        return;
      }
      if (tool === "table") {
        self.state.viewMode = self.state.viewMode === "table" ? "chart" : "table";
        self.render();
        return;
      }
      if (tool === "download") {
        self._toggleDownloadMenu(btn);
      }
    });

    document.addEventListener("click", function (e) {
      if (!self._downloadMenu) return;
      if (e.target.closest(".dc-chart-tool-wrap")) return;
      self._downloadMenu.classList.remove("show");
    });
  };

  DCChartToolbar.prototype._toggleDownloadMenu = function (anchor) {
    var wrap = anchor.closest(".dc-chart-tool-wrap");
    if (!wrap) return;
    if (!this._downloadMenu) {
      var menu = document.createElement("div");
      menu.className = "dc-chart-download-menu";
      menu.innerHTML =
        '<button type="button" data-download="png">下载图片 (PNG)</button>' +
        '<button type="button" data-download="csv">下载数据 (CSV)</button>';
      var self = this;
      menu.addEventListener("click", function (ev) {
        var item = ev.target.closest("[data-download]");
        if (!item) return;
        if (item.getAttribute("data-download") === "png") self.downloadPng();
        else self.downloadCsv();
        menu.classList.remove("show");
      });
      wrap.appendChild(menu);
      this._downloadMenu = menu;
    }
    this._downloadMenu.classList.toggle("show");
  };

  DCChartToolbar.prototype.render = function () {
    var config = this.getConfig();
    if (!config || !config.labels || !config.series) {
      return;
    }
    this._updateToolStates(config);
    if (this.state.viewMode === "table") {
      this._showTable(config);
      return;
    }
    this._showCanvas();
    if (this.state.chartType === "line") this._drawLine(config);
    else if (this.state.barLayout === "grouped") this._drawGrouped(config);
    else this._drawStacked(config);
  };

  DCChartToolbar.prototype._updateToolStates = function (config) {
    var multi = (config.series || []).length > 1;
    this.toolsEl.querySelectorAll("[data-tool]").forEach(function (btn) {
      var tool = btn.getAttribute("data-tool");
      btn.classList.remove("is-active");
      if (tool === "stack-group") {
        btn.disabled = !multi;
        btn.title = multi
          ? this.state.barLayout === "stacked"
            ? "切换为分组双排柱状图"
            : "切换为堆叠柱状图"
          : "当前数据仅单系列，无需堆叠/分组";
        if (multi && this.state.viewMode === "chart" && this.state.chartType === "bar") {
          btn.classList.add("is-active");
        }
      } else if (tool === "line") {
        btn.disabled = false;
        if (this.state.viewMode === "chart" && this.state.chartType === "line") {
          btn.classList.add("is-active");
        }
        btn.title = this.state.chartType === "line" ? "切换为柱状图" : "切换为折线图";
      } else if (tool === "table") {
        if (this.state.viewMode === "table") btn.classList.add("is-active");
        btn.title = this.state.viewMode === "table" ? "返回图表" : "表格展示";
      } else if (tool === "download") {
        btn.title = "下载图片或数据文件";
      }
    }, this);
    var stackBtn = this.toolsEl.querySelector('[data-tool="stack-group"] i');
    if (stackBtn) {
      stackBtn.className =
        this.state.barLayout === "grouped"
          ? "fa-solid fa-chart-column"
          : "fa-solid fa-layer-group";
    }
  };

  DCChartToolbar.prototype._measureText = function (text, font) {
    this.ctx.font = font || "12px sans-serif";
    return this.ctx.measureText(text || "").width;
  };

  DCChartToolbar.prototype._layout = function (config) {
    var w = this.canvas.width;
    var h = this.canvas.height;
    var labels = config.labels || [];
    var axisLabel = config.axisLabel || "";
    var axisLabelW = this._measureText(axisLabel);
    var maxLabelW = 0;
    labels.forEach(function (label) {
      maxLabelW = Math.max(maxLabelW, this._measureText(label));
    }, this);
    var right = Math.max(48, Math.ceil(axisLabelW) + 24, Math.ceil(maxLabelW * 0.35));
    var bottom = labels.length > 8 ? 88 : labels.length > 4 ? 72 : 64;
    return {
      w: w,
      h: h,
      left: 78,
      right: right,
      top: 40,
      bottom: bottom,
      max: config.max || 100,
      labels: labels,
      series: config.series || [],
      axisLabel: axisLabel,
    };
  };

  DCChartToolbar.prototype._drawGrid = function (layout, yLabel, axisLabel) {
    var ctx = this.ctx;
    var w = layout.w;
    var h = layout.h;
    var left = layout.left;
    var right = layout.right;
    var top = layout.top;
    var bottom = layout.bottom;
    var categoryLabel = axisLabel || layout.axisLabel || "";
    ctx.clearRect(0, 0, w, h);
    ctx.font = "12px sans-serif";
    ctx.fillStyle = "#94a3b8";
    ctx.strokeStyle = "rgba(148,163,184,.18)";
    var gridCount = 6;
    for (var i = 0; i <= gridCount; i++) {
      var value = Math.round((layout.max / gridCount) * i);
      var y = h - bottom - ((h - top - bottom) / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(w - right, y);
      ctx.stroke();
      ctx.fillText(String(value), 34, y + 4);
    }
    ctx.textAlign = "left";
    ctx.fillText(yLabel || "数量", 22, top - 10);
    if (categoryLabel) {
      ctx.textAlign = "right";
      ctx.fillText(categoryLabel, w - 14, h - 14);
      ctx.textAlign = "left";
    }
    return layout;
  };

  DCChartToolbar.prototype._barColor = function (series, index) {
    if (series.colors && series.colors[index]) return series.colors[index];
    if (series.color) return series.color;
    return "#5a72c8";
  };

  DCChartToolbar.prototype._drawStacked = function (config) {
    var layout = this._layout(config);
    this._drawGrid(layout, config.yLabel, config.axisLabel);
    var ctx = this.ctx;
    var h = layout.h;
    var left = layout.left;
    var right = layout.right;
    var top = layout.top;
    var bottom = layout.bottom;
    var slot = (layout.w - left - right) / layout.labels.length;
    var barW = Math.min(52, slot * 0.62);

    layout.labels.forEach(function (label, i) {
      var x = left + slot * i + (slot - barW) / 2;
      var stackBase = h - bottom;
      layout.series.forEach(function (series, si) {
        var value = (series.values || [])[i] || 0;
        var barH = (value / layout.max) * (h - top - bottom);
        var y = stackBase - barH;
        if (series.colorStart && series.colorEnd) {
          var grad = ctx.createLinearGradient(0, y, 0, stackBase);
          grad.addColorStop(0, series.colorStart);
          grad.addColorStop(1, series.colorEnd);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = this._barColor(series, i);
        }
        ctx.fillRect(x, y, barW, barH);
        if (value > 0 && barH > 14) {
          ctx.fillStyle = "#fff";
          ctx.font = "bold 11px sans-serif";
          ctx.fillText(String(value), x + Math.max(6, barW / 2 - 10), y + barH / 2 + 4);
        }
        stackBase = y;
      }, this);
      this._drawXLabel(label, x + barW / 2, h, bottom, layout.labels.length);
    }, this);
  };

  DCChartToolbar.prototype._drawXLabel = function (label, centerX, h, bottom, labelCount) {
    var ctx = this.ctx;
    var rotate = labelCount > 8;
    var y = h - (rotate ? 36 : 22);
    ctx.fillStyle = "#94a3b8";
    ctx.font = "12px sans-serif";
    ctx.save();
    ctx.translate(centerX, y);
    if (rotate) {
      ctx.rotate(-Math.PI / 4);
      ctx.textAlign = "right";
      ctx.fillText(label, 0, 0);
    } else {
      ctx.textAlign = "center";
      ctx.fillText(label, 0, 0);
    }
    ctx.restore();
    ctx.textAlign = "left";
  };

  DCChartToolbar.prototype._drawGrouped = function (config) {
    var layout = this._layout(config);
    this._drawGrid(layout, config.yLabel, config.axisLabel);
    var ctx = this.ctx;
    var h = layout.h;
    var left = layout.left;
    var right = layout.right;
    var top = layout.top;
    var bottom = layout.bottom;
    var seriesCount = Math.max(layout.series.length, 1);
    var slot = (layout.w - left - right) / layout.labels.length;
    var groupW = Math.min(56, slot * 0.72);
    var barW = Math.max(14, (groupW - 6) / seriesCount);

    layout.labels.forEach(function (label, i) {
      var gx = left + slot * i + (slot - groupW) / 2;
      layout.series.forEach(function (series, si) {
        var value = (series.values || [])[i] || 0;
        var barH = (value / layout.max) * (h - top - bottom);
        var x = gx + si * (barW + 3);
        var y = h - bottom - barH;
        if (series.colorStart && series.colorEnd) {
          var grad = ctx.createLinearGradient(0, y, 0, h - bottom);
          grad.addColorStop(0, series.colorStart);
          grad.addColorStop(1, series.colorEnd);
          ctx.fillStyle = grad;
        } else {
          ctx.fillStyle = this._barColor(series, i);
        }
        ctx.fillRect(x, y, barW, barH);
        if (value > 0 && barH > 12) {
          ctx.fillStyle = "#fff";
          ctx.font = "bold 10px sans-serif";
          ctx.fillText(String(value), x + 2, y - 4);
        }
      }, this);
      this._drawXLabel(label, gx + groupW / 2, h, bottom, layout.labels.length);
    }, this);
  };

  DCChartToolbar.prototype._drawLine = function (config) {
    var layout = this._layout(config);
    this._drawGrid(layout, config.yLabel, config.axisLabel);
    var ctx = this.ctx;
    var h = layout.h;
    var left = layout.left;
    var right = layout.right;
    var top = layout.top;
    var bottom = layout.bottom;
    var slot = (layout.w - left - right) / Math.max(layout.labels.length - 1, 1);

    layout.series.forEach(function (series) {
      var color = series.color || series.colorStart || "#38bdf8";
      ctx.strokeStyle = color;
      ctx.fillStyle = color;
      ctx.lineWidth = 2;
      ctx.beginPath();
      layout.labels.forEach(function (label, i) {
        var value = (series.values || [])[i] || 0;
        var x = left + slot * i;
        var y = h - bottom - (value / layout.max) * (h - top - bottom);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      });
      ctx.stroke();
      layout.labels.forEach(function (label, i) {
        var value = (series.values || [])[i] || 0;
        var x = left + slot * i;
        var y = h - bottom - (value / layout.max) * (h - top - bottom);
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = "#e2f5ff";
        ctx.font = "bold 11px sans-serif";
        ctx.fillText(String(value), x + 6, y - 6);
        ctx.fillStyle = color;
      });
    });
  };

  DCChartToolbar.prototype._showCanvas = function () {
    this.canvas.classList.remove("is-hidden");
    if (this.tableWrap) this.tableWrap.classList.remove("is-visible");
  };

  DCChartToolbar.prototype._showTable = function (config) {
    this.canvas.classList.add("is-hidden");
    if (!this.tableWrap) return;
    this.tableWrap.classList.add("is-visible");
    var series = config.series || [];
    var head =
      "<tr><th>" +
      (config.axisLabel || "分类") +
      "</th>" +
      series
        .map(function (s) {
          return "<th>" + (s.name || "数值") + "</th>";
        })
        .join("") +
      "<th>合计</th></tr>";
    var rows = config.labels
      .map(function (label, i) {
        var sum = 0;
        var cells = series
          .map(function (s) {
            var v = (s.values || [])[i] || 0;
            sum += v;
            return "<td>" + v + "</td>";
          })
          .join("");
        return "<tr><td>" + label + "</td>" + cells + "<td>" + sum + "</td></tr>";
      })
      .join("");
    this.tableWrap.innerHTML =
      '<table class="dc-chart-table"><thead>' + head + "</thead><tbody>" + rows + "</tbody></table>";
  };

  DCChartToolbar.prototype.downloadPng = function () {
    var config = this.getConfig();
    var link = document.createElement("a");
    link.download = (config.title || this.fileName) + ".png";
    link.href = this.canvas.toDataURL("image/png");
    link.click();
  };

  DCChartToolbar.prototype.downloadCsv = function () {
    var config = this.getConfig();
    var series = config.series || [];
    var lines = [];
    var header = [config.axisLabel || "分类"].concat(
      series.map(function (s) {
        return s.name || "数值";
      }),
      ["合计"]
    );
    lines.push(header.join(","));
    config.labels.forEach(function (label, i) {
      var sum = 0;
      var row = [label];
      series.forEach(function (s) {
        var v = (s.values || [])[i] || 0;
        sum += v;
        row.push(String(v));
      });
      row.push(String(sum));
      lines.push(row.map(function (c) {
        return '"' + String(c).replace(/"/g, '""') + '"';
      }).join(","));
    });
    var blob = new Blob(["\ufeff" + lines.join("\n")], { type: "text/csv;charset=utf-8" });
    var link = document.createElement("a");
    link.download = (config.title || this.fileName) + ".csv";
    link.href = URL.createObjectURL(blob);
    link.click();
    URL.revokeObjectURL(link.href);
  };

  DCChartToolbar.createToolsHtml = function () {
    return (
      '<div class="dc-chart-tools">' +
      '<button type="button" class="dc-chart-tool" data-tool="stack-group" title="堆叠/分组切换"><i class="fa-solid fa-layer-group"></i></button>' +
      '<button type="button" class="dc-chart-tool" data-tool="line" title="折线图"><i class="fa-solid fa-chart-line"></i></button>' +
      '<button type="button" class="dc-chart-tool" data-tool="table" title="表格展示"><i class="fa-solid fa-table"></i></button>' +
      '<div class="dc-chart-tool-wrap">' +
      '<button type="button" class="dc-chart-tool" data-tool="download" title="下载"><i class="fa-solid fa-download"></i></button>' +
      "</div></div>"
    );
  };

  global.DCChartToolbar = DCChartToolbar;
})(window);
