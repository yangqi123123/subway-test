/**
 * 项目管理模块 — 右侧快捷操作面板组件
 * 用法：<div id="project-quick-links"></div>
 *       WHProjectQuickLinks.render("project-quick-links", "in-project");
 */
(function (global) {
  "use strict";

  var LINKS = [
    { key: "in-project", label: "项目管理", icon: "fa-solid fa-folder-tree", href: "in-project.html", quickHref: "wb/in-project.html" },
    { key: "in-project-done", label: "完工项目", icon: "fa-solid fa-circle-check", href: "in-project-done.html", quickHref: "wb/in-project-done.html" },
    { key: "in-task-frequency", label: "频率设置", icon: "fa-solid fa-calendar-week", href: "in-task-frequency.html", quickHref: "wb/in-task-frequency.html" },
  ];

  function render(hostId, activeKey) {
    var host = document.getElementById(hostId);
    if (!host) return;
    host.innerHTML =
      '<div class="disease-quick-panel">' +
      '<div class="disease-panel-title"><i class="fa-solid fa-bolt mr-2 text-cyan-400"></i>快捷操作</div>' +
      '<div class="disease-panel-body">' +
      LINKS.map(function (link) {
        return (
          '<a class="disease-quick-link' +
          (link.key === activeKey ? " is-active" : "") +
          '" data-quick-href="' +
          link.quickHref +
          '" href="' +
          link.href +
          '"><i class="' +
          link.icon +
          '"></i><span>' +
          link.label +
          "</span></a>"
        );
      }).join("") +
      "</div></div>";
  }

  global.WHProjectQuickLinks = { render: render, LINKS: LINKS };
})(typeof window !== "undefined" ? window : this);
