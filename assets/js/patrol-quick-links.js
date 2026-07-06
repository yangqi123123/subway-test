/**
 * 巡查模块右下角快捷操作公共组件
 */
(function () {
  var links = [
    { key: "in-disease", icon: "fa-stethoscope", text: "病害巡查", href: "in-disease.html" },
    { key: "in-night", icon: "fa-moon", text: "夜班作业", href: "in-night.html" },
    { key: "in-uav-report", icon: "fa-helicopter", text: "无人机巡查记录", href: "in-uav-report.html" },
    { key: "in-manual", icon: "fa-person-walking", text: "人工巡查记录", href: "in-manual.html" },
    { key: "in-patrol-results", icon: "fa-images", text: "巡查成果", href: "in-patrol-results.html" }
  ];

  function renderPatrolQuickLinks(containerId, activeKey) {
    var container = document.getElementById(containerId);
    if (!container) return;
    var html =
      '<div class="disease-quick-panel">' +
      '<div class="disease-panel-title"><i class="fa-solid fa-bolt mr-2 text-cyan-400"></i>快捷操作</div>' +
      '<div class="disease-panel-body">' +
      links
        .map(function (l) {
          var isActive = l.key === activeKey ? " is-active" : "";
          return (
            '<a class="disease-quick-link' +
            isActive +
            '" data-quick-href="patrol/' +
            l.href +
            '" href="' +
            l.href +
            '"><i class="fa-solid ' +
            l.icon +
            '"></i><span>' +
            l.text +
            "</span></a>"
          );
        })
        .join("") +
      "</div></div>";
    container.innerHTML = html;
  }

  window.renderPatrolQuickLinks = renderPatrolQuickLinks;
})();
