/**
 * 轨迹地图回放（人员 / 无人机共用，仅图标与配色不同）
 */
(function (global) {
  var STYLE_ID = "wh-track-playback-style";

  var PRESETS = {
    person: {
      playIconClass: "fa-solid fa-person-walking",
      playIconFontSize: "9px",
      playDotColor: "#38bdf8",
      pulseBorder: "rgba(56, 189, 248, 0.4)",
      lineColor: "#38bdf8",
    },
    drone: {
      playIconClass: "fa-solid fa-helicopter",
      playIconFontSize: "8px",
      playDotColor: "#fbbf24",
      pulseBorder: "rgba(251, 191, 36, 0.45)",
      lineColor: "#38bdf8",
    },
  };

  function injectStyles() {
    if (document.getElementById(STYLE_ID)) return;
    document.head.insertAdjacentHTML(
      "beforeend",
      '<style id="' +
        STYLE_ID +
        '">' +
        ".track-map-shell{position:relative;overflow:hidden}" +
        ".track-map-toolbar{position:absolute;left:14px;top:14px;z-index:420;display:flex;gap:10px;flex-wrap:wrap}" +
        ".track-map-panel{position:absolute;right:14px;bottom:14px;z-index:420;min-width:210px;padding:12px 14px;border-radius:10px;border:1px solid rgba(34,211,238,.18);background:rgba(6,12,28,.88);box-shadow:0 12px 30px rgba(0,0,0,.38);backdrop-filter:blur(12px);-webkit-backdrop-filter:blur(12px)}" +
        ".track-map-panel__row{display:flex;justify-content:space-between;gap:12px;font-size:12px;color:#cdeeff;margin-bottom:8px}" +
        ".track-map-panel__row:last-child{margin-bottom:0}" +
        ".track-map-panel__label{color:rgba(148,226,255,.72)}" +
        ".track-play-dot{width:18px;height:18px;border-radius:999px;border:2px solid #fff;box-shadow:0 0 0 3px rgba(56,189,248,.28),0 0 16px rgba(56,189,248,.48);position:relative}" +
        ".track-play-dot::after{content:\"\";position:absolute;inset:-7px;border-radius:999px;border:1px solid var(--track-pulse-border,rgba(56,189,248,.4));animation:whTrackPulse 1.8s infinite ease-out}" +
        "@keyframes whTrackPulse{0%{transform:scale(.7);opacity:.95}100%{transform:scale(1.35);opacity:0}}" +
        "</style>"
    );
  }

  function normalizeTrack(track) {
    if (!track || !track.length) return [];
    return track.map(function (p, index) {
      if (Array.isArray(p)) {
        var label = index === 0 ? "起点" : index === track.length - 1 ? "终点" : "航点 " + index;
        return { lat: p[0], lng: p[1], name: label, time: "" };
      }
      return {
        lat: p.lat,
        lng: p.lng,
        name: p.name || (index === 0 ? "起点" : "航点 " + index),
        time: p.time || "",
      };
    });
  }

  function create(options) {
    injectStyles();
    options = options || {};
    var presetKey = options.preset || "person";
    var preset = Object.assign({}, PRESETS[presetKey] || PRESETS.person, options);
    var mapContainerId = options.mapContainerId;
    var map = null;
    var trackLine = null;
    var startMarker = null;
    var endMarker = null;
    var playMarker = null;
    var waypointLayers = [];
    var points = [];
    var currentIndex = 0;
    var playbackTimer = null;
    var intervalMs = options.intervalMs == null ? 1200 : options.intervalMs;

    function getEl() {
      return typeof mapContainerId === "string" ? document.getElementById(mapContainerId) : mapContainerId;
    }

    function makeTrackIcon(color, iconClass) {
      return L.divIcon({
        className: "",
        html:
          '<div style="width:28px;height:28px;border-radius:999px;background:' +
          color +
          ';border:2px solid rgba(255,255,255,.95);display:flex;align-items:center;justify-content:center;color:#fff;box-shadow:0 0 0 2px rgba(34,211,238,.18),0 0 18px ' +
          color +
          ';"><i class="' +
          iconClass +
          '"></i></div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14],
      });
    }

    function makePlayIcon() {
      return L.divIcon({
        className: "",
        html:
          '<div class="track-play-dot" style="background:' +
          preset.playDotColor +
          ";--track-pulse-border:" +
          preset.pulseBorder +
          '"><i class="' +
          preset.playIconClass +
          '" style="position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);font-size:' +
          preset.playIconFontSize +
          ';color:#fff;"></i></div>',
        iconSize: [18, 18],
        iconAnchor: [9, 9],
      });
    }

    function setStatus(text) {
      if (options.statusEl) options.statusEl.textContent = text;
      if (typeof options.onStatusChange === "function") options.onStatusChange(text);
    }

    function initMap() {
      var el = getEl();
      if (!el || map) return map;
      if (global.WuhanGIS && global.WuhanGIS.createSharedMap) {
        map = global.WuhanGIS.createSharedMap(el, {
          center: options.center || [30.5928, 114.3055],
          zoom: options.zoom || 12,
          zoomControl: true,
        });
      } else if (typeof L !== "undefined") {
        map = L.map(el, {
          center: options.center || [30.5928, 114.3055],
          zoom: options.zoom || 15,
          zoomControl: true,
        });
        L.tileLayer("https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png", {
          subdomains: "abcd",
          maxZoom: 20,
          attribution:
            '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
        }).addTo(map);
      }
      setTimeout(function () {
        if (map) map.invalidateSize();
      }, 80);
      return map;
    }

    function clearLayers() {
      if (!map) return;
      waypointLayers.forEach(function (layer) {
        map.removeLayer(layer);
      });
      waypointLayers = [];
      if (trackLine) map.removeLayer(trackLine);
      if (startMarker) map.removeLayer(startMarker);
      if (endMarker) map.removeLayer(endMarker);
      if (playMarker) map.removeLayer(playMarker);
      trackLine = startMarker = endMarker = playMarker = null;
    }

    function focusPoint(index, panMap) {
      if (!points[index]) return;
      currentIndex = index;
      var point = points[index];
      if (playMarker) playMarker.setLatLng([point.lat, point.lng]);
      if (options.nameEl) options.nameEl.textContent = point.name;
      if (options.timeEl) options.timeEl.textContent = point.time || "--";
      if (panMap && map) {
        map.flyTo([point.lat, point.lng], Math.max(map.getZoom(), 15), { duration: 0.8 });
      }
    }

    function draw(track) {
      stop(false);
      initMap();
      if (!map) return;
      clearLayers();
      points = normalizeTrack(track);
      if (!points.length) return;

      var latlngs = points.map(function (p) {
        return [p.lat, p.lng];
      });
      trackLine = L.polyline(latlngs, {
        color: preset.lineColor,
        weight: 5,
        opacity: 0.95,
        lineCap: "round",
        lineJoin: "round",
      }).addTo(map);

      startMarker = L.marker(latlngs[0], { icon: makeTrackIcon("#22c55e", "fa-solid fa-play") })
        .bindTooltip("起点" + (points[0].time ? "<br>" + points[0].time : ""), { direction: "top" })
        .addTo(map);
      endMarker = L.marker(latlngs[latlngs.length - 1], {
        icon: makeTrackIcon("#ef4444", "fa-solid fa-flag-checkered"),
      })
        .bindTooltip("终点" + (points[points.length - 1].time ? "<br>" + points[points.length - 1].time : ""), {
          direction: "top",
        })
        .addTo(map);
      playMarker = L.marker(latlngs[0], { icon: makePlayIcon() }).addTo(map);

      points.forEach(function (point, idx) {
        if (idx === 0 || idx === points.length - 1) return;
        var layer = L.circleMarker([point.lat, point.lng], {
          radius: 5,
          color: "#7dd3fc",
          weight: 2,
          fillColor: "#0ea5e9",
          fillOpacity: 0.9,
        })
          .bindTooltip(point.name + (point.time ? "<br>" + point.time : ""), { direction: "top" })
          .addTo(map);
        waypointLayers.push(layer);
      });

      map.fitBounds(trackLine.getBounds(), { padding: options.fitPadding || [30, 30] });
      focusPoint(0, false);
      setStatus("待播放");
    }

    function play() {
      if (!points.length) return;
      stop(false);
      setStatus("播放中");
      currentIndex = 0;
      focusPoint(0, true);
      playbackTimer = setInterval(function () {
        currentIndex += 1;
        if (currentIndex >= points.length) {
          stop(false);
          setStatus("播放完成");
          currentIndex = points.length - 1;
          focusPoint(currentIndex, true);
          return;
        }
        focusPoint(currentIndex, true);
      }, intervalMs);
    }

    function stop(resetStatus) {
      if (playbackTimer) {
        clearInterval(playbackTimer);
        playbackTimer = null;
      }
      if (resetStatus !== false) setStatus("待播放");
    }

    function destroy() {
      stop();
      clearLayers();
      if (map) {
        map.remove();
        map = null;
      }
      var el = getEl();
      if (el) el.innerHTML = "";
      points = [];
    }

    function fitBounds() {
      if (trackLine && map) {
        map.fitBounds(trackLine.getBounds(), { padding: options.fitPadding || [30, 30] });
      }
    }

    return {
      initMap: initMap,
      draw: draw,
      play: play,
      stop: stop,
      destroy: destroy,
      fitBounds: fitBounds,
      getMap: function () {
        return map;
      },
    };
  }

  global.WHTrackPlayback = {
    injectStyles: injectStyles,
    create: create,
    normalizeTrack: normalizeTrack,
    PRESETS: PRESETS,
  };
})(typeof window !== "undefined" ? window : global);
