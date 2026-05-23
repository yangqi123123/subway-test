(function () {
  var GIS = (window.WuhanGIS = window.WuhanGIS || {});

  function haversineM(a, b) {
    var R = 6371000;
    var dLat = ((b[0] - a[0]) * Math.PI) / 180;
    var dLng = ((b[1] - a[1]) * Math.PI) / 180;
    var lat1 = (a[0] * Math.PI) / 180;
    var lat2 = (b[0] * Math.PI) / 180;
    var s =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLng / 2) * Math.sin(dLng / 2);
    return 2 * R * Math.asin(Math.min(1, Math.sqrt(s)));
  }

  function bearingDeg(a, b) {
    var dLng = ((b[1] - a[1]) * Math.PI) / 180;
    var lat1 = (a[0] * Math.PI) / 180;
    var lat2 = (b[0] * Math.PI) / 180;
    var y = Math.sin(dLng) * Math.cos(lat2);
    var x = Math.cos(lat1) * Math.sin(lat2) - Math.sin(lat1) * Math.cos(lat2) * Math.cos(dLng);
    return ((Math.atan2(y, x) * 180) / Math.PI + 360) % 360;
  }

  function destinationPoint(origin, bearing, distanceM) {
    var R = 6371000;
    var br = (bearing * Math.PI) / 180;
    var lat1 = (origin[0] * Math.PI) / 180;
    var lng1 = (origin[1] * Math.PI) / 180;
    var lat2 = Math.asin(
      Math.sin(lat1) * Math.cos(distanceM / R) + Math.cos(lat1) * Math.sin(distanceM / R) * Math.cos(br)
    );
    var lng2 =
      lng1 +
      Math.atan2(
        Math.sin(br) * Math.sin(distanceM / R) * Math.cos(lat1),
        Math.cos(distanceM / R) - Math.sin(lat1) * Math.sin(lat2)
      );
    return [(lat2 * 180) / Math.PI, (lng2 * 180) / Math.PI];
  }

  function polylineLengthM(points) {
    var sum = 0;
    for (var i = 1; i < points.length; i++) sum += haversineM(points[i - 1], points[i]);
    return sum;
  }

  function sliceLineByRatio(points, startRatio, endRatio) {
    if (!points || points.length < 2) return points ? points.slice() : [];
    startRatio = Math.max(0, Math.min(1, startRatio));
    endRatio = Math.max(startRatio, Math.min(1, endRatio));
    var samples = 28;
    var out = [];
    for (var i = 0; i <= samples; i++) {
      var r = startRatio + ((endRatio - startRatio) * i) / samples;
      out.push(pointOnLineAtRatio(points, r).point);
    }
    return out;
  }

  function lineBufferPolygon(points, halfWidthM) {
    if (!points || points.length < 2) return [];
    var left = [];
    var right = [];
    for (var i = 0; i < points.length; i++) {
      var prev = points[Math.max(0, i - 1)];
      var next = points[Math.min(points.length - 1, i + 1)];
      var br = bearingDeg(prev, next);
      left.push(destinationPoint(points[i], br - 90, halfWidthM));
      right.push(destinationPoint(points[i], br + 90, halfWidthM));
    }
    return left.concat(right.reverse());
  }

  function pointOnLineAtRatio(points, ratio) {
    if (!points || points.length < 2) return { point: points[0], bearing: 0 };
    ratio = Math.max(0, Math.min(1, ratio));
    var total = polylineLengthM(points);
    var target = total * ratio;
    var acc = 0;
    for (var i = 1; i < points.length; i++) {
      var seg = haversineM(points[i - 1], points[i]);
      if (acc + seg >= target) {
        var t = seg > 0 ? (target - acc) / seg : 0;
        var point = [
          points[i - 1][0] + (points[i][0] - points[i - 1][0]) * t,
          points[i - 1][1] + (points[i][1] - points[i - 1][1]) * t,
        ];
        return { point: point, bearing: bearingDeg(points[i - 1], points[i]) };
      }
      acc += seg;
    }
    var last = points.length - 1;
    return { point: points[last].slice(), bearing: bearingDeg(points[last - 1], points[last]) };
  }

  var PATROL_ZONE_DEFS = [
    {
      lineKey: "l2",
      start: 0.4,
      end: 0.58,
      kind: "done",
      popup: "已巡查区域",
      lineFilter: "l2",
    },
    {
      lineKey: "l8",
      start: 0.5,
      end: 0.7,
      kind: "todo",
      popup: "待巡查区域",
      lineFilter: "l8",
    },
  ];

  var PATROL_PHOTO_DROPS = [
    {
      lineKey: "l2",
      ratio: 0.44,
      name: "光谷广场站区间基坑工程",
      time: "2026/05/14 09:26",
      src: "assets/img/ref-dashboard-neon.png",
    },
    {
      lineKey: "l2",
      ratio: 0.5,
      name: "街道口站联络通道工程",
      time: "2026/05/14 10:42",
      src: "assets/img/map-gis-satellite.png",
    },
    {
      lineKey: "l2",
      ratio: 0.54,
      name: "中南路站附属结构施工",
      time: "2026/05/14 14:08",
      src: "assets/img/map-gis-road.png",
    },
  ];

  function buildPhotoTooltipHtml(drop) {
    return (
      '<div class="gis-photo-tooltip">' +
      '<div class="gis-photo-tooltip__head">' +
      '<span class="gis-photo-tooltip__title">工地最新照片</span>' +
      '<span class="gis-photo-tooltip__time">' +
      drop.time +
      "</span>" +
      "</div>" +
      '<div class="gis-photo-tooltip__name">' +
      drop.name +
      "</div>" +
      '<img class="gis-photo-tooltip__image" src="' +
      (typeof whAsset === "function" ? whAsset(drop.src) : drop.src) +
      '" alt="' +
      drop.name +
      ' 最新照片" />' +
      "</div>"
    );
  }

  function mountPatrolLayers(map, options) {
    if (!map || typeof L === "undefined") return null;
    var opts = options || {};
    var metroPaths = opts.metroPaths || GIS.METRO_PATHS;
    var smooth = GIS.smoothMetroCurve;
    if (!metroPaths || !smooth) return null;

    var layers = opts.layers || {};
    if (!layers.patrolDone) layers.patrolDone = L.layerGroup().addTo(map);
    if (!layers.patrolTodo) layers.patrolTodo = L.layerGroup().addTo(map);
    if (!layers.patrolPhotos) layers.patrolPhotos = L.layerGroup().addTo(map);

    var halfWidth = opts.halfWidthM == null ? 45 : opts.halfWidthM;
    var segmentsPerLeg = opts.segmentsPerLeg == null ? 16 : opts.segmentsPerLeg;
    var registerFeature = opts.registerFeature;
    var makeIcon = opts.makePhotoDropIcon || GIS.makePhotoDropIcon;

    PATROL_ZONE_DEFS.forEach(function (def) {
      var anchors = metroPaths[def.lineKey];
      if (!anchors) return;
      var fullCurve = smooth(anchors, { segmentsPerLeg: segmentsPerLeg });
      var segment = sliceLineByRatio(fullCurve, def.start, def.end);
      var ring = lineBufferPolygon(segment, halfWidth);
      if (ring.length < 3) return;

      var isDone = def.kind === "done";
      var layerGroup = isDone ? layers.patrolDone : layers.patrolTodo;
      var style = isDone
        ? { color: "#22c55e", weight: 2, fillColor: "#22c55e", fillOpacity: 0.18 }
        : { color: "#db2777", weight: 2, fillColor: "#db2777", fillOpacity: 0.2 };
      var category = isDone ? "patrolDone" : "patrolTodo";

      var poly = L.polygon(ring, style).bindPopup(def.popup).addTo(layerGroup);
      if (typeof registerFeature === "function") {
        registerFeature(poly, layerGroup, category, def.lineFilter);
      }
    });

    if (opts.showPhotos !== false && typeof makeIcon === "function") {
      PATROL_PHOTO_DROPS.forEach(function (drop) {
        var anchors = metroPaths[drop.lineKey];
        if (!anchors) return;
        var doneDef = PATROL_ZONE_DEFS.filter(function (d) {
          return d.lineKey === drop.lineKey && d.kind === "done";
        })[0];
        if (!doneDef) return;
        var fullCurve = smooth(anchors, { segmentsPerLeg: segmentsPerLeg });
        var segment = sliceLineByRatio(fullCurve, doneDef.start, doneDef.end);
        var pos = pointOnLineAtRatio(segment, drop.ratio);
        var marker = L.marker(pos.point, {
          icon: makeIcon(),
          zIndexOffset: 680,
        }).addTo(layers.patrolPhotos);
        if (typeof registerFeature === "function") {
          registerFeature(marker, layers.patrolPhotos, "patrolPhotos", drop.lineKey);
        }
        marker.bindTooltip(buildPhotoTooltipHtml(drop), {
          direction: "top",
          offset: [0, -20],
          opacity: 1,
          className: "gis-photo-tooltip-wrap",
          sticky: true,
        });
      });
    }

    return { layers: layers };
  }

  GIS.lineBufferPolygon = lineBufferPolygon;
  GIS.sliceLineByRatio = sliceLineByRatio;
  GIS.pointOnLineAtRatio = pointOnLineAtRatio;
  GIS.mountPatrolLayers = mountPatrolLayers;
  GIS.PATROL_ZONE_DEFS = PATROL_ZONE_DEFS;
  GIS.PATROL_PHOTO_DROPS = PATROL_PHOTO_DROPS;
})();
