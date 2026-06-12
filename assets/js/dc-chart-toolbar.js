/**
 * 数据统计图表右上角工具栏：堆叠/分组、折线、表格、下载
 */
(function (global) {
  function DCChartToolbar(options) {
    this.options = options || {};
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
    this._hitRegions = [];
    this._lastConfig = null;
    this._lastLayout = null;
    this._bindTools();
    this._bindPointerEvents();
    this.render();
  }

  DCChartToolbar.prototype._isCompact = function () {
    if (this.options.compact) return true;
    return !!(this.canvas && this.canvas.closest && (this.canvas.closest(".mp-line-stats-page") || this.canvas.closest(".mp-system-stats-page")));
  };

  DCChartToolbar.prototype._theme = function () {
    var compact = this._isCompact();
    return {
      axisFont: compact ? "14px sans-serif" : "12px sans-serif",
      axisColor: compact ? "#64748b" : "#94a3b8",
      gridColor: compact ? "rgba(100,116,139,.22)" : "rgba(148,163,184,.18)",
    };
  };

  DCChartToolbar.prototype._ensureTooltip = function () {
    var stage = this.canvas && this.canvas.parentElement;
    if (!stage) return null;
    if (!this._tooltip) {
      var tip = stage.querySelector(".dc-chart-tooltip");
      if (!tip) {
        tip = document.createElement("div");
        tip.className = "dc-chart-tooltip";
        tip.setAttribute("role", "tooltip");
        stage.appendChild(tip);
      }
      this._tooltip = tip;
    }
    return this._tooltip;
  };

  DCChartToolbar.prototype._hideTooltip = function () {
    if (this._tooltip) this._tooltip.classList.remove("is-visible");
  };

  DCChartToolbar.prototype._showTooltip = function (region, clientX, clientY) {
    var tip = this._ensureTooltip();
    if (!tip || !region) return;
    var lines = ['<div class="dc-chart-tooltip__title">' + region.label + "</div>"];
    (region.series || []).forEach(function (item) {
      lines.push(
        '<div class="dc-chart-tooltip__row"><span>' +
          item.name +
          '</span><b>' +
          item.value +
          "</b></div>"
      );
    });
    tip.innerHTML = lines.join("");
    tip.classList.add("is-visible");
    var stage = this.canvas.parentElement;
    var stageRect = stage.getBoundingClientRect();
    var tipRect = tip.getBoundingClientRect();
    var left = clientX - stageRect.left + 12;
    var top = clientY - stageRect.top - tipRect.height - 12;
    if (left + tipRect.width > stageRect.width - 8) {
      left = clientX - stageRect.left - tipRect.width - 12;
    }
    if (left < 8) left = 8;
    if (top < 8) top = clientY - stageRect.top + 12;
    tip.style.left = left + "px";
    tip.style.top = top + "px";
  };

  DCChartToolbar.prototype._canvasPoint = function (event) {
    var rect = this.canvas.getBoundingClientRect();
    var clientX = event.clientX;
    var clientY = event.clientY;
    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    }
    var scaleX = this.canvas.width / rect.width;
    var scaleY = this.canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
      clientX: clientX,
      clientY: clientY,
    };
  };

  DCChartToolbar.prototype._bindPointerEvents = function () {
    var self = this;
    if (!this.canvas || this.canvas._dcPointerBound) return;
    this.canvas._dcPointerBound = true;
    this.canvas.style.touchAction = "pan-y";

    function handlePointer(event) {
      if (self.state.viewMode === "table") return;
      var point = self._canvasPoint(event);
      var hit = self._hitRegions.find(function (region) {
        return (
          point.x >= region.x &&
          point.x <= region.x + region.w &&
          point.y >= region.y &&
          point.y <= region.y + region.h
        );
      });
      if (hit) self._showTooltip(hit, point.clientX, point.clientY);
      else self._hideTooltip();
    }

    this.canvas.addEventListener("mousemove", handlePointer);
    this.canvas.addEventListener("mouseleave", function () {
      self._hideTooltip();
    });
    this.canvas.addEventListener("touchstart", handlePointer, { passive: true });
    this.canvas.addEventListener("touchmove", handlePointer, { passive: true });
    this.canvas.addEventListener("touchend", function () {
      self._hideTooltip();
    });
  };

  DCChartToolbar.prototype._registerHit = function (region) {
    this._hitRegions.push(region);
  };

  DCChartToolbar.prototype._seriesValuesAt = function (layout, index) {
    return (layout.series || []).map(function (series) {
      return {
        name: series.name || "数值",
        value: (series.values || [])[index] || 0,
      };
    });
  };

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
        return;
      }
      if (tool === "fullscreen") {
        if (typeof self.options.onFullscreenClick === "function") {
          self.options.onFullscreenClick();
        }
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
    if (!config || !config.series) {
      return;
    }
    this._lastConfig = config;
    this._hitRegions = [];
    this._hideTooltip();
    this._updateToolStates(config);
    if (this.state.viewMode === "table") {
      if (!config.labels || !config.labels.length) {
        if (this.tableWrap) {
          this.tableWrap.innerHTML = '<div class="dc-chart-empty">暂无数据</div>';
          this.tableWrap.classList.add("is-visible");
        }
        this.canvas.style.display = "none";
        return;
      }
      this._showTable(config);
      return;
    }
    this._showCanvas();
    if (!config.labels || !config.labels.length) {
      var ctx = this.ctx;
      ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
      ctx.font = this._theme().axisFont;
      ctx.fillStyle = this._theme().axisColor;
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText("暂无数据", this.canvas.width / 2, this.canvas.height / 2);
      return;
    }
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
    var theme = this._theme();
    this.ctx.font = font || theme.axisFont;
    return this.ctx.measureText(text || "").width;
  };

  DCChartToolbar.prototype._layout = function (config) {
    var compact = this._isCompact();
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
    var bottom =
      labels.length > 8 ? (compact ? 96 : 88) : labels.length > 4 ? (compact ? 80 : 72) : compact ? 72 : 64;
    return {
      w: w,
      h: h,
      left: compact ? 90 : 78,
      right: right,
      top: compact ? 44 : 40,
      bottom: bottom,
      max: config.max || 100,
      labels: labels,
      series: config.series || [],
      axisLabel: axisLabel,
    };
  };

  DCChartToolbar.prototype._drawGrid = function (layout, yLabel, axisLabel) {
    var ctx = this.ctx;
    var theme = this._theme();
    var compact = this._isCompact();
    var w = layout.w;
    var h = layout.h;
    var left = layout.left;
    var right = layout.right;
    var top = layout.top;
    var bottom = layout.bottom;
    var categoryLabel = axisLabel || layout.axisLabel || "";
    ctx.clearRect(0, 0, w, h);
    ctx.font = theme.axisFont;
    ctx.fillStyle = theme.axisColor;
    ctx.strokeStyle = theme.gridColor;
    var gridCount = 6;
    for (var i = 0; i <= gridCount; i++) {
      var value = Math.round((layout.max / gridCount) * i);
      var y = h - bottom - ((h - top - bottom) / gridCount) * i;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(w - right, y);
      ctx.stroke();
      ctx.fillText(String(value), compact ? 38 : 34, y + 4);
    }
    ctx.textAlign = "left";
    ctx.fillText(yLabel || "数量", compact ? 24 : 22, top - 10);
    if (categoryLabel) {
      ctx.textAlign = "right";
      ctx.fillText(categoryLabel, w - 14, h - 14);
      ctx.textAlign = "left";
    }
    this._lastLayout = layout;
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
        stackBase = y;
      }, this);
      this._registerHit({
        x: left + slot * i,
        y: top,
        w: slot,
        h: h - top - bottom,
        label: label,
        series: this._seriesValuesAt(layout, i),
      });
      this._drawXLabel(label, x + barW / 2, h, bottom, layout.labels.length);
    }, this);
  };

  DCChartToolbar.prototype._drawXLabel = function (label, centerX, h, bottom, labelCount) {
    var ctx = this.ctx;
    var theme = this._theme();
    var rotate = labelCount > 8;
    var y = h - (rotate ? 36 : 22);
    ctx.fillStyle = theme.axisColor;
    ctx.font = theme.axisFont;
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
      }, this);
      this._registerHit({
        x: left + slot * i,
        y: top,
        w: slot,
        h: h - top - bottom,
        label: label,
        series: this._seriesValuesAt(layout, i),
      });
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
        ctx.fillStyle = color;
      });
    });

    layout.labels.forEach(
      function (label, i) {
        var x = left + slot * i;
        this._registerHit({
          x: x - Math.max(14, slot / 2),
          y: top,
          w: Math.max(28, slot),
          h: h - top - bottom,
          label: label,
          series: this._seriesValuesAt(layout, i),
        });
        this._drawXLabel(label, x, h, bottom, layout.labels.length);
      }.bind(this)
    );
  };

  DCChartToolbar.prototype._showCanvas = function () {
    this.canvas.classList.remove("is-hidden");
    this.canvas.style.display = "block";
    if (this.tableWrap) {
      this.tableWrap.classList.remove("is-visible");
      this.tableWrap.classList.remove("dc-chart-table-wrap--split");
    }
  };

  DCChartToolbar.prototype._applyTableColgroup = function (table, widths, tableWidth) {
    var existing = table.querySelector("colgroup");
    if (existing) existing.remove();
    var cg = document.createElement("colgroup");
    widths.forEach(function (w) {
      var col = document.createElement("col");
      col.style.width = w + "px";
      cg.appendChild(col);
    });
    table.insertBefore(cg, table.firstChild);
    table.style.tableLayout = "fixed";
    table.style.width = tableWidth + "px";
    table.style.minWidth = "100%";
  };

  DCChartToolbar.prototype._fitSplitTableColumns = function () {
    if (!this.tableWrap) return;
    var split = this.tableWrap.querySelector(".dc-chart-table-split");
    if (!split) return;
    var headTable = split.querySelector(".dc-chart-table--head");
    var bodyTable = split.querySelector(".dc-chart-table--body");
    if (!headTable || !bodyTable) return;

    var headRow = headTable.querySelector("thead tr");
    var bodyRows = bodyTable.querySelectorAll("tbody tr");
    if (!headRow) return;

    headTable.querySelectorAll("colgroup").forEach(function (node) {
      node.remove();
    });
    bodyTable.querySelectorAll("colgroup").forEach(function (node) {
      node.remove();
    });
    headTable.style.width = "auto";
    bodyTable.style.width = "auto";
    headTable.style.tableLayout = "auto";
    bodyTable.style.tableLayout = "auto";

    var colCount = headRow.cells.length;
    var widths = [];

    for (var c = 0; c < colCount; c++) {
      var maxW = headRow.cells[c].scrollWidth;
      for (var r = 0; r < bodyRows.length; r++) {
        var cell = bodyRows[r].cells[c];
        if (cell) maxW = Math.max(maxW, cell.scrollWidth);
      }
      widths.push(Math.max(maxW, c === 0 ? 80 : 64));
    }

    var tableW = widths.reduce(function (sum, w) {
      return sum + w;
    }, 0);
    var wrapW = this.tableWrap.clientWidth || tableW;
    var finalW = Math.max(tableW, wrapW);

    this._applyTableColgroup(headTable, widths, finalW);
    this._applyTableColgroup(bodyTable, widths, finalW);
  };

  DCChartToolbar.prototype._buildTableHeadRow = function (config, series) {
    return (
      "<tr><th>" +
      (config.axisLabel || "分类") +
      "</th>" +
      series
        .map(function (s) {
          return "<th>" + (s.name || "数值") + "</th>";
        })
        .join("") +
      "<th>合计</th></tr>"
    );
  };

  DCChartToolbar.prototype._buildTableBodyRows = function (config, series) {
    return (config.labels || [])
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
  };

  DCChartToolbar.prototype._syncSplitTableScroll = function () {
    if (!this.tableWrap) return;
    var split = this.tableWrap.querySelector(".dc-chart-table-split");
    if (!split) return;
    var head = split.querySelector(".dc-chart-table-head");
    var body = split.querySelector(".dc-chart-table-body");
    if (!head || !body) return;
    body.addEventListener(
      "scroll",
      function () {
        head.scrollLeft = body.scrollLeft;
      },
      { passive: true }
    );
  };

  DCChartToolbar.prototype._showTable = function (config) {
    this.canvas.classList.add("is-hidden");
    this.canvas.style.display = "none";
    if (!this.tableWrap) return;
    this.tableWrap.classList.add("is-visible");
    var series = config.series || [];
    var head = this._buildTableHeadRow(config, series);
    var rows = this._buildTableBodyRows(config, series);

    if (this._isCompact()) {
      var self = this;
      this.tableWrap.classList.add("dc-chart-table-wrap--split");
      this.tableWrap.innerHTML =
        '<div class="dc-chart-table-split">' +
        '<div class="dc-chart-table-head" aria-hidden="false">' +
        '<table class="dc-chart-table dc-chart-table--head"><thead>' +
        head +
        "</thead></table></div>" +
        '<div class="dc-chart-table-body">' +
        '<table class="dc-chart-table dc-chart-table--body"><tbody>' +
        rows +
        "</tbody></table></div></div>";
      this._syncSplitTableScroll();
      requestAnimationFrame(function () {
        requestAnimationFrame(function () {
          self._fitSplitTableColumns();
        });
      });
      return;
    }

    this.tableWrap.classList.remove("dc-chart-table-wrap--split");
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

  DCChartToolbar.createToolsHtml = function (options) {
    options = options || {};
    var fullscreenBtn = options.fullscreen
      ? '<button type="button" class="dc-chart-tool" data-tool="fullscreen" title="全屏"><i class="fa-solid fa-expand"></i></button>'
      : "";
    return (
      '<div class="dc-chart-tools">' +
      '<button type="button" class="dc-chart-tool" data-tool="stack-group" title="堆叠/分组切换"><i class="fa-solid fa-layer-group"></i></button>' +
      '<button type="button" class="dc-chart-tool" data-tool="line" title="折线图"><i class="fa-solid fa-chart-line"></i></button>' +
      '<button type="button" class="dc-chart-tool" data-tool="table" title="表格展示"><i class="fa-solid fa-table"></i></button>' +
      '<div class="dc-chart-tool-wrap">' +
      '<button type="button" class="dc-chart-tool" data-tool="download" title="下载"><i class="fa-solid fa-download"></i></button>' +
      "</div>" +
      fullscreenBtn +
      "</div>"
    );
  };

  global.DCChartToolbar = DCChartToolbar;
})(window);
