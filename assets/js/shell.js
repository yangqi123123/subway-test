/**
 * 公共布局：顶部一级菜单 + 左侧二三级菜单（与 menu-config 同步注入）。
 * 页面声明：body[data-shell] data-top data-sidebar-key
 */
(function () {
  var STORAGE_SIDEBAR = "whmetro-sidebar-collapsed";

  function el(tag, attrs, inner) {
    var e = document.createElement(tag);
    if (attrs) {
      Object.keys(attrs).forEach(function (k) {
        if (k === "className") e.className = attrs[k];
        else if (k === "html") e.innerHTML = attrs[k];
        else e.setAttribute(k, attrs[k]);
      });
    }
    if (inner) e.textContent = inner;
    return e;
  }

  function buildHeader(topId, shellMode) {
    var header = el("header", {
      className:
        "wh-header fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 md:px-6 border-b border-cyan-400/20",
      style: "height:64px;background:rgba(3,7,18,0.88);",
    });
    header.innerHTML =
      '<div class="flex items-center gap-3 min-w-0">' +
      '<div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan-400/35 bg-cyan-500/10 shadow-[0_0_20px_rgba(34,211,238,0.35)]">' +
      '<i class="fa-solid fa-train-subway text-cyan-300 text-lg"></i></div>' +
      '<div class="flex flex-col min-w-0">' +
      '<span class="text-white text-sm md:text-[15px] font-semibold tracking-wide truncate">武汉地铁保护区管理平台</span>' +
      '<span class="text-[10px] text-cyan-200/50 uppercase tracking-[0.2em] hidden sm:block">O&M Command</span>' +
      "</div></div>" +
      '<nav class="flex flex-1 justify-center items-stretch gap-0.5 md:gap-1 mx-2 overflow-x-auto no-scrollbar min-w-0">' +
      "</nav>" +
      '<div class="flex items-center gap-2 md:gap-3 text-cyan-50 shrink-0">' +
      '<button type="button" class="p-2 rounded-lg transition-ui border border-transparent hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:shadow-[0_0_16px_rgba(34,211,238,0.2)]" title="搜索"><i class="fa-solid fa-magnifying-glass text-lg text-cyan-200"></i></button>' +
      '<button type="button" class="relative p-2 rounded-lg transition-ui border border-transparent hover:border-cyan-400/30 hover:bg-cyan-500/10" title="通知">' +
      '<i class="fa-regular fa-bell text-lg text-cyan-200"></i>' +
      '<span class="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full text-[10px] font-bold text-white" style="background:linear-gradient(135deg,#fb7185,#ef4444);box-shadow:0 0 10px rgba(251,113,133,0.6)">12</span></button>' +
      '<button type="button" class="flex items-center gap-2 rounded-lg transition-ui border border-cyan-400/20 hover:bg-cyan-500/10 pl-1 pr-2 py-1">' +
      '<img src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80" class="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400/40" alt=""/>' +
      '<span class="text-xs hidden lg:inline text-cyan-50/90">管理员</span><i class="fa-solid fa-chevron-down text-[10px] text-cyan-300/60"></i></button>' +
      "</div>";

    var nav = header.querySelector("nav");
    WHMetroMenu.TOP_NAV.forEach(function (item) {
      var a = el("a", {
        href: item.href,
        className:
          "wh-top-nav whitespace-nowrap transition-ui " +
          (item.id === topId ? "wh-top-nav--active" : ""),
      });
      a.textContent = item.label;
      nav.appendChild(a);
    });

    return header;
  }

  function buildSidebar(topId, activeKey, collapsed) {
    var aside = el("aside", {
      className: "wh-sidebar fixed left-0 z-40 flex flex-col transition-ui",
      style:
        "top:64px;width:" +
        (collapsed ? "80px" : "260px") +
        ";height:calc(100vh - 64px);",
    });

    var scroll = el("div", {
      className: "flex-1 overflow-y-auto py-3",
    });
    var tree = WHMetroMenu.SIDEBAR[topId];
    if (!tree) {
      scroll.innerHTML =
        '<p class="px-4 text-sm text-[#88A0C2]">当前模块无侧栏菜单</p>';
    } else {
      tree.forEach(function (node) {
        if (node.type === "item") {
          scroll.appendChild(sidebarLeaf(node, activeKey, collapsed));
        } else if (node.type === "group") {
          var groupWrap = el("div", { className: "mb-1" });
          var gh = el("button", {
            type: "button",
            title: node.label,
            className:
              "wh-group-head w-full flex items-center gap-2 px-4 py-2 text-left text-sm transition-ui text-slate-300/90 hover:bg-cyan-500/5",
          });
          gh.innerHTML =
            '<i class="fa-solid fa-folder-tree w-5 text-center text-[15px] shrink-0"></i>' +
            '<span class="wh-side-text truncate ' +
            (collapsed ? "hidden" : "") +
            '">' +
            node.label +
            "</span>" +
            '<i class="fa-solid fa-chevron-down wh-side-chev ml-auto text-xs opacity-60 ' +
            (collapsed ? "hidden" : "") +
            '"></i>';
          var body = el("div", {
            className: "wh-group-body " + (collapsed ? "hidden" : ""),
          });
          node.children.forEach(function (c) {
            body.appendChild(sidebarLeaf(c, activeKey, collapsed, true));
          });
          var expanded = true;
          gh.addEventListener("click", function () {
            if (collapsed) return;
            expanded = !expanded;
            body.classList.toggle("hidden", !expanded);
            gh.querySelector(".fa-chevron-down").style.transform = expanded
              ? "rotate(0deg)"
              : "rotate(-90deg)";
          });
          groupWrap.appendChild(gh);
          groupWrap.appendChild(body);
          scroll.appendChild(groupWrap);
        }
      });
    }

    var foot = el("div", {
      className: "p-2 border-t border-cyan-400/15 bg-black/20",
    });
    var toggle = el("button", {
      type: "button",
      className:
        "w-full flex items-center justify-center gap-2 py-2 rounded text-slate-400 text-sm transition-ui hover:bg-cyan-500/10 hover:text-cyan-100",
    });
    toggle.innerHTML =
      '<i class="fa-solid wh-toggle-ico ' +
      (collapsed ? "fa-chevron-right" : "fa-chevron-left") +
      '"></i><span class="wh-toggle-label ' +
      (collapsed ? "hidden" : "") +
      '">收起菜单</span>';
    function applyCollapsed(c) {
      var mainEl = document.getElementById("shell-main");
      if (c) {
        aside.style.width = "80px";
        aside.classList.add("wh-collapsed");
        localStorage.setItem(STORAGE_SIDEBAR, "1");
        if (mainEl) mainEl.style.marginLeft = "80px";
        scroll.querySelectorAll(".wh-group-body").forEach(function (b) {
          b.classList.add("hidden");
        });
        scroll.querySelectorAll(".wh-side-text, .wh-side-chev").forEach(function (s) {
          s.classList.add("hidden");
        });
        var tl = toggle.querySelector(".wh-toggle-label");
        if (tl) tl.classList.add("hidden");
        var ico = toggle.querySelector(".wh-toggle-ico");
        if (ico) ico.className = "fa-solid wh-toggle-ico fa-chevron-right";
      } else {
        aside.style.width = "260px";
        aside.classList.remove("wh-collapsed");
        localStorage.setItem(STORAGE_SIDEBAR, "0");
        if (mainEl) mainEl.style.marginLeft = "260px";
        scroll.querySelectorAll(".wh-group-body").forEach(function (b) {
          b.classList.remove("hidden");
        });
        scroll.querySelectorAll(".wh-side-text, .wh-side-chev").forEach(function (s) {
          s.classList.remove("hidden");
        });
        var tl2 = toggle.querySelector(".wh-toggle-label");
        if (tl2) tl2.classList.remove("hidden");
        var ico2 = toggle.querySelector(".wh-toggle-ico");
        if (ico2) ico2.className = "fa-solid wh-toggle-ico fa-chevron-left";
      }
    }
    toggle.addEventListener("click", function () {
      applyCollapsed(!aside.classList.contains("wh-collapsed"));
    });
    foot.appendChild(toggle);
    aside.appendChild(scroll);
    aside.appendChild(foot);
    if (collapsed) aside.classList.add("wh-collapsed");

    var activeLink = scroll.querySelector("a[data-active='1']");
    if (activeLink) {
      var groupBody = activeLink.closest(".wh-group-body");
      if (groupBody) {
        groupBody.classList.remove("hidden");
        var head = groupBody.previousElementSibling;
        if (head && head.classList.contains("wh-group-head")) {
          var chev = head.querySelector(".fa-chevron-down");
          if (chev) chev.style.transform = "rotate(0deg)";
        }
      }
    }

    return aside;
  }

  function sidebarLeaf(item, activeKey, collapsed, indent) {
    var isActive = item.key === activeKey;
    var a = el("a", {
      href: item.href,
      title: item.label,
      className:
        "flex items-center gap-2 py-2.5 pr-3 rounded-r-full mr-2 text-sm transition-ui " +
        (indent ? "pl-8" : "pl-4") +
        " " +
        (collapsed ? "justify-center pl-2" : ""),
    });
    if (isActive) {
      a.setAttribute("data-active", "1");
      a.classList.add("wh-side-link--active");
    } else {
      a.style.color = indent ? "rgba(148, 163, 184, 0.95)" : "rgba(226, 245, 255, 0.78)";
    }
    a.addEventListener("mouseenter", function () {
      if (!isActive) a.style.background = "rgba(34, 211, 238, 0.08)";
    });
    a.addEventListener("mouseleave", function () {
      if (!isActive) a.style.background = "transparent";
    });
    var icon = "fa-regular fa-file-lines";
    if (item.key.indexOf("am-") === 0) icon = "fa-solid fa-train-subway";
    if (item.key.indexOf("dc-") === 0) icon = "fa-solid fa-chart-column";
    if (item.key.indexOf("in-") === 0) icon = "fa-solid fa-route";
    if (item.key.indexOf("wb-") === 0) icon = "fa-solid fa-briefcase";
    a.innerHTML =
      '<i class="' +
      icon +
      ' w-5 text-center shrink-0 text-[15px]"></i><span class="wh-side-text truncate ' +
      (collapsed ? "hidden" : "") +
      '">' +
      item.label +
      "</span>";
    return a;
  }

  function init() {
    if (typeof WHMetroMenu === "undefined") return;
    var body = document.body;
    var shell = body.getAttribute("data-shell") || "default";
    var topId = body.getAttribute("data-top") || "dc";
    var activeKey = body.getAttribute("data-sidebar-key") || "";
    var pageRoot = document.getElementById("page-root");
    if (!pageRoot) return;

    var collapsed = localStorage.getItem(STORAGE_SIDEBAR) === "1";

    var layout = el("div", { id: "app-layout", className: "min-h-screen" });
    var header = buildHeader(topId, shell);
    layout.appendChild(header);

    var row = el("div", {
      className: "flex",
      style: "padding-top:64px;min-height:100vh;",
    });

    if (shell === "fullscreen") {
      var mainFs = el("main", {
        id: "shell-main",
        className: "wh-main-canvas wh-main-canvas--fullscreen flex-1 min-h-[calc(100vh-64px)]",
        style: "margin-left:0;",
      });
      mainFs.appendChild(pageRoot);
      row.appendChild(mainFs);
    } else {
      var aside = buildSidebar(topId, activeKey, collapsed);
      var main = el("main", {
        id: "shell-main",
        className: "wh-main-canvas flex-1 min-h-[calc(100vh-64px)] p-4 md:p-6",
        style: "margin-left:" + (collapsed ? "80px" : "260px") + ";transition:margin-left .2s;",
      });
      main.appendChild(pageRoot);
      row.appendChild(aside);
      row.appendChild(main);
    }

    layout.appendChild(row);
    body.insertBefore(layout, body.firstChild);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
