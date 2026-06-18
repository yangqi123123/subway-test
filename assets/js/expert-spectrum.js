/**
 * 专家工具频谱图 — 共用 canvas 渲染（典型事件标注页调用，与 map-expert.js 算法一致）
 */
(function (global) {
  "use strict";

  var DEFAULT_TIME_LABELS = ["14.1", "14.0", "13.9", "13.8", "13.7", "13.6", "13.5", "13.4", "13.3", "13.2"];
  var DEFAULT_FREQ_HZ = [0, 10, 20, 30, 40, 50];

  function specSeeded(n) {
    var x = Math.sin(n * 12.9898) * 43758.5453;
    return x - Math.floor(x);
  }

  function specIntensity(col, row, cols, rows, seed) {
    seed = seed || 0;
    var fx = col / Math.max(cols - 1, 1);
    var ty = row / Math.max(rows - 1, 1);
    var bandCenter = 0.54 + ((seed % 11) - 5) * 0.018;
    var burstCenter = 0.46 + ((seed % 7) - 3) * 0.04;
    var base = specSeeded(col * 17 + row * 31 + seed * 997) * 0.38;
    var band = Math.exp(-Math.pow((fx - bandCenter) / 0.11, 2)) * 0.52;
    var burst = Math.exp(-Math.pow((ty - burstCenter) / 0.16, 2)) * band * 0.9;
    var edge = specSeeded(col * 3 + row + seed * 13) * 0.12 * band;
    return Math.min(1, base + band * 0.28 + burst + edge);
  }

  function specColor(t) {
    var blue = [71, 166, 255];
    var orange = [255, 191, 51];
    var red = [255, 77, 79];
    var dark = [8, 14, 28];
    var a;
    var b;
    var u;
    if (t < 0.38) {
      u = t / 0.38;
      a = dark;
      b = blue;
    } else if (t < 0.72) {
      u = (t - 0.38) / 0.34;
      a = blue;
      b = orange;
    } else {
      u = (t - 0.72) / 0.28;
      a = orange;
      b = red;
    }
    return (
      "rgb(" +
      Math.round(a[0] + (b[0] - a[0]) * u) +
      "," +
      Math.round(a[1] + (b[1] - a[1]) * u) +
      "," +
      Math.round(a[2] + (b[2] - a[2]) * u) +
      ")"
    );
  }

  function hashSeed(text) {
    var s = 0;
    var str = String(text || "");
    for (var i = 0; i < str.length; i++) s = (s * 31 + str.charCodeAt(i)) >>> 0;
    return s || 1;
  }

  function drawSpectrum(canvas, options) {
    if (!canvas) return;
    options = options || {};
    var wrap = canvas.parentElement;
    if (!wrap) return;
    var w = wrap.clientWidth;
    var h = wrap.clientHeight;
    if (w < 4 || h < 4) return;
    var dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(w * dpr);
    canvas.height = Math.floor(h * dpr);
    canvas.style.width = w + "px";
    canvas.style.height = h + "px";
    var ctx = canvas.getContext("2d");
    if (!ctx) return;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    var seed = options.seed != null ? options.seed : 0;
    var cols = Math.max(48, Math.floor(w / 2));
    var rows = Math.max(40, Math.floor(h / 2));
    var cellW = w / cols;
    var cellH = h / rows;
    for (var row = 0; row < rows; row++) {
      for (var col = 0; col < cols; col++) {
        var v = specIntensity(col, row, cols, rows, seed);
        ctx.fillStyle = specColor(v);
        ctx.fillRect(col * cellW, row * cellH, cellW + 0.5, cellH + 0.5);
      }
    }
  }

  function renderAxes(axisY, axisX, options) {
    options = options || {};
    var timeLabels = options.timeLabels || DEFAULT_TIME_LABELS;
    var freqHz = options.freqHz || DEFAULT_FREQ_HZ;
    if (axisY) {
      axisY.innerHTML = timeLabels
        .map(function (t) {
          return "<span>" + t + "</span>";
        })
        .join("");
    }
    if (axisX) {
      axisX.innerHTML = freqHz
        .map(function (hz) {
          return "<span>" + hz + "</span>";
        })
        .join("");
    }
  }

  function mountSpectrum(host, options) {
    if (!host) return null;
    options = options || {};
    var compact = !!options.compact;
    var showLegend = options.showLegend !== false && !compact;
    var showAxes = options.showAxes !== false;
    var seed = options.seed || 0;
    var timeLabels = options.timeLabels || DEFAULT_TIME_LABELS;
    var freqHz = options.freqHz || DEFAULT_FREQ_HZ;

    host.classList.add("wh-spec-host");
    if (compact) host.classList.add("wh-spec-host--compact");
    host.innerHTML =
      (showLegend
        ? '<div class="wh-spec-legend">' +
          "<span><i class=\"is-normal\"></i>正常</span>" +
          "<span><i class=\"is-warn\"></i>预警</span>" +
          "<span><i class=\"is-danger\"></i>告警</span>" +
          "</div>"
        : "") +
      '<div class="wh-spec-chart-area">' +
      '<canvas class="wh-spec-canvas" aria-label="频谱图"></canvas>' +
      "</div>" +
      (showAxes
        ? '<div class="wh-spec-axis-y"></div>' +
          '<div class="wh-spec-axis-x"></div>' +
          '<div class="wh-spec-axis-unit wh-spec-axis-unit--x">Frequency [Hz]</div>' +
          '<div class="wh-spec-axis-unit wh-spec-axis-unit--y">Time [h]</div>'
        : "");

    var canvas = host.querySelector(".wh-spec-canvas");
    var axisY = host.querySelector(".wh-spec-axis-y");
    var axisX = host.querySelector(".wh-spec-axis-x");
    if (showAxes) renderAxes(axisY, axisX, { timeLabels: timeLabels, freqHz: freqHz });

    var state = { seed: seed, timeLabels: timeLabels, freqHz: freqHz };

    function redraw() {
      drawSpectrum(canvas, { seed: state.seed });
    }

    function onResize() {
      redraw();
    }

    redraw();
    if (typeof ResizeObserver !== "undefined") {
      var ro = new ResizeObserver(onResize);
      ro.observe(host.querySelector(".wh-spec-chart-area") || host);
      state.ro = ro;
    } else {
      global.addEventListener("resize", onResize);
      state.resizeHandler = onResize;
    }

    return {
      redraw: redraw,
      setSeed: function (nextSeed) {
        state.seed = nextSeed || 0;
        redraw();
      },
      setSeedFromText: function (text) {
        state.seed = hashSeed(text);
        redraw();
      },
      destroy: function () {
        if (state.ro) state.ro.disconnect();
        if (state.resizeHandler) global.removeEventListener("resize", state.resizeHandler);
      },
    };
  }

  global.WuhanExpertSpectrum = {
    drawSpectrum: drawSpectrum,
    renderAxes: renderAxes,
    mountSpectrum: mountSpectrum,
    hashSeed: hashSeed,
    DEFAULT_TIME_LABELS: DEFAULT_TIME_LABELS,
    DEFAULT_FREQ_HZ: DEFAULT_FREQ_HZ,
  };
})(typeof window !== "undefined" ? window : this);
