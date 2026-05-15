/**
 * Expert tools mini GIS map: real satellite tiles with focused metro overlays.
 */
(function () {
  function initExpertMap() {
    var container = document.getElementById("expert-gis-map");
    if (!container || typeof L === "undefined") return;

    var map = L.map(container, {
      center: [30.575, 114.335],
      zoom: 14,
      zoomControl: true,
      attributionControl: true,
      scrollWheelZoom: true,
    });

    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}", {
      attribution: "Tiles &copy; Esri",
      maxZoom: 19,
    }).addTo(map);

    var blueLine = [
      [30.587, 114.265],
      [30.583, 114.292],
      [30.579, 114.318],
      [30.574, 114.343],
      [30.568, 114.365],
      [30.556, 114.386],
    ];

    var branchLine = [
      [30.574, 114.343],
      [30.586, 114.356],
      [30.603, 114.368],
    ];

    L.polyline(blueLine, {
      color: "#2b90ff",
      weight: 5,
      opacity: 0.95,
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    L.polyline(branchLine, {
      color: "#2b90ff",
      weight: 4,
      opacity: 0.86,
      dashArray: "8 6",
      lineCap: "round",
      lineJoin: "round",
    }).addTo(map);

    var stations = [
      { name: "\u4e2d\u5357\u533b\u9662", point: [30.579, 114.318] },
      { name: "\u7701\u535a\u6e56\u5317\u65e5\u62a5", point: [30.574, 114.343] },
      { name: "\u68a8\u56ed", point: [30.568, 114.365] },
      { name: "\u8857\u9053\u53e3", point: [30.587, 114.265] },
    ];

    stations.forEach(function (station) {
      L.circleMarker(station.point, {
        radius: 6,
        color: "#ffffff",
        fillColor: "#1976ff",
        fillOpacity: 0.95,
        weight: 1.5,
      })
        .bindTooltip(station.name, {
          direction: "top",
          offset: [0, -8],
          className: "expert-map-label",
          permanent: false,
        })
        .addTo(map);
    });

    var alarmIcon = L.divIcon({
      className: "",
      html: '<div class="expert-alarm-marker"><i class="fa-solid fa-location-dot"></i></div>',
      iconSize: [30, 30],
      iconAnchor: [15, 30],
    });

    L.marker([30.576, 114.338], { icon: alarmIcon })
      .bindTooltip("\u91cd\u70b9\u544a\u8b66\u70b9", {
        direction: "bottom",
        offset: [0, 4],
        className: "expert-map-label",
        permanent: true,
      })
      .addTo(map);

    L.circle([30.576, 114.338], {
      radius: 260,
      color: "#ff664d",
      weight: 1.5,
      fillColor: "#ff664d",
      fillOpacity: 0.12,
    }).addTo(map);

    setTimeout(function () {
      map.invalidateSize();
      map.fitBounds(L.latLngBounds(blueLine.concat(branchLine)), {
        paddingTopLeft: [24, 48],
        paddingBottomRight: [28, 52],
        maxZoom: 14,
      });
    }, 80);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", initExpertMap);
  } else {
    initExpertMap();
  }
})();
