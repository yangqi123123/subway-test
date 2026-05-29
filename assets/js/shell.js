/**
 * 公共布局：顶部一级菜单（含下拉）+ 左侧菜单 / 工作台超级卡片（与 menu-config 同步）。
 * 页面声明：body[data-shell] data-top data-sidebar-key
 */
(function () {
  var STORAGE_SIDEBAR = "whmetro-sidebar-collapsed";

  function pageHref(href) {
    if (typeof whPageHref === "function") return whPageHref(href);
    if (typeof WHMetroMenu !== "undefined" && WHMetroMenu.pageHref) return WHMetroMenu.pageHref(href);
    return href;
  }

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

  function injectShellStyles() {
    var s = document.getElementById("wh-shell-style");
    if (!s) {
      s = document.createElement("style");
      s.id = "wh-shell-style";
      document.head.appendChild(s);
    }
    s.textContent =
      "#app-layout>.wh-header{overflow:visible!important;z-index:1200!important;}" +
      "#app-layout>.wh-header>nav.wh-top-nav-strip{overflow:visible!important;max-width:100%;flex-wrap:wrap;justify-content:center;}" +
      ".wh-shell-row{display:flex;min-height:calc(100vh - 64px);min-height:calc(100dvh - 64px);width:100%;}" +
      ".wh-top-drop{position:relative;display:flex;align-items:stretch;align-self:stretch;}" +
      ".wh-top-drop:hover,.wh-top-drop.wh-top-drop--open{z-index:1210;}" +
      ".wh-top-drop__btn{position:relative;display:flex;align-items:center;height:100%;min-height:48px;padding:0 12px;border:none;background:transparent;cursor:pointer;color:rgba(226,245,255,.78);font-size:13px;white-space:nowrap;border-radius:6px;transition:color .15s,background .15s;}" +
      ".wh-top-drop__btn:hover{color:#fff;background:rgba(34,211,238,.08);}" +
      ".wh-top-drop__btn.wh-top-nav--active{color:#fff;background:rgba(34,211,238,.14);box-shadow:inset 0 -2px 0 #22d3ee;}" +
      ".wh-top-drop__panel{position:absolute;left:0;top:100%;z-index:1211;display:none;box-sizing:border-box;min-width:100%;padding-top:6px;}" +
      ".wh-top-drop:hover .wh-top-drop__panel,.wh-top-drop.wh-top-drop--open .wh-top-drop__panel{display:block;}" +
      ".wh-top-drop__panel-inner{padding:6px;border-radius:8px;background:rgba(7,27,51,.96);border:1px solid rgba(34,211,238,.22);box-shadow:0 16px 48px rgba(0,0,0,.5);}" +
      ".wh-top-drop__panel a{display:block;padding:8px 12px;border-radius:6px;font-size:12px;color:rgba(226,245,255,.88);text-decoration:none;white-space:nowrap;}" +
      ".wh-top-drop__panel a:hover{background:rgba(34,211,238,.1);color:#fff;}" +
      ".wh-shell-user-drop{position:relative;z-index:1205;}" +
      ".wh-shell-user-drop.wh-shell-user-drop--open{z-index:1220;}" +
      ".wh-shell-user-panel{position:absolute;right:0;top:calc(100% + 6px);z-index:1221;display:none;min-width:140px;padding:6px;border-radius:8px;background:rgba(7,27,51,.96);border:1px solid rgba(34,211,238,.22);box-shadow:0 16px 48px rgba(0,0,0,.5);}" +
      ".wh-shell-user-drop.wh-shell-user-drop--open .wh-shell-user-panel{display:block;}" +
      ".wh-shell-user-panel button{display:block;width:100%;padding:8px 12px;border:none;border-radius:6px;background:transparent;color:rgba(226,245,255,.9);font-size:12px;text-align:left;cursor:pointer;}" +
      ".wh-shell-user-panel button:hover{background:rgba(251,113,133,.12);color:#fecdd3;}" +
      ".wh-shell-user-panel button.wh-shell-user-panel__profile:hover{background:rgba(34,211,238,.1)!important;color:#fff!important;}" +
      ".wh-shell-user-panel__divider{height:1px;margin:4px 6px;background:rgba(255,255,255,.08);}" +
      ".wh-shell-search-mask{position:fixed;inset:0;z-index:300;display:none;align-items:flex-start;justify-content:center;padding:88px 16px 16px;background:rgba(2,8,23,.72);}" +
      ".wh-shell-search-mask.show{display:flex;}" +
      ".wh-shell-search-box{width:min(560px,100%);border:1px solid rgba(34,211,238,.25);border-radius:10px;background:#071b33;box-shadow:0 24px 64px rgba(0,0,0,.55);overflow:hidden;}" +
      ".wh-shell-search-head{display:flex;align-items:center;gap:10px;padding:12px 14px;border-bottom:1px solid rgba(255,255,255,.08);}" +
      ".wh-shell-search-head input{flex:1;height:36px;padding:0 12px;border:1px solid rgba(34,211,238,.2);border-radius:6px;background:rgba(15,23,42,.8);color:#ecfeff;font-size:13px;outline:none;}" +
      ".wh-shell-search-head input:focus{border-color:rgba(34,211,238,.55);box-shadow:0 0 0 2px rgba(34,211,238,.15);}" +
      ".wh-shell-search-list{max-height:min(420px,60vh);overflow-y:auto;padding:6px;}" +
      ".wh-shell-search-item{display:block;width:100%;padding:10px 12px;border:none;border-radius:6px;background:transparent;text-align:left;cursor:pointer;}" +
      ".wh-shell-search-item:hover{background:rgba(34,211,238,.1);}" +
      ".wh-shell-search-item__label{display:block;font-size:13px;color:#ecfeff;font-weight:600;}" +
      ".wh-shell-search-item__group{display:block;margin-top:3px;font-size:11px;color:#94a3b8;}" +
      ".wh-shell-search-empty{padding:24px 12px;text-align:center;font-size:12px;color:#94a3b8;}" +
      ".wh-shell-tool-btn{position:relative;display:inline-flex;align-items:center;justify-content:center;}" +
      ".wh-shell-badge-wrap{position:absolute;top:-2px;right:-2px;pointer-events:none;}" +
      ".wh-shell-badge-wrap.wh-shell-badge-wrap--hidden{display:none;}" +
      ".wh-shell-badge{min-width:18px;height:18px;padding:0 5px;display:inline-flex;align-items:center;justify-content:center;border-radius:999px;font-size:10px;font-weight:700;line-height:1;color:#fff;background:linear-gradient(135deg,#fb7185,#ef4444);box-shadow:0 0 10px rgba(251,113,133,.6);}" +
      ".map-breadcrumb,nav.cockpit-crumb,#page-root>nav.neon-panel--tight:first-child,#page-root>nav[data-embed-hide].neon-panel--tight{display:none!important;}";
  }

  function headerBadges() {
    if (typeof WHHeaderBadges === "undefined") {
      return { todo: "", notify: "" };
    }
    return {
      todo: WHHeaderBadges.badgeHtml(WHHeaderBadges.todoPendingCount()),
      notify: WHHeaderBadges.badgeHtml(WHHeaderBadges.notifyUnreadCount()),
    };
  }

  function navHighlightId(bodyTopId) {
    var file = WHMetroMenu.pageFile();
    return WHMetroMenu.topNavMatchId(file, bodyTopId);
  }

  function hiddenTopNavIds() {
    var raw = document.body.getAttribute("data-hide-top-nav");
    if (!raw) return [];
    return raw.split(",").map(function (s) {
      return s.trim();
    }).filter(Boolean);
  }

  function buildHeader(bodyTopId) {
    var highlight = navHighlightId(bodyTopId);
    var badges = headerBadges();
    var header = el("header", {
      className:
        "wh-header fixed top-0 left-0 right-0 z-[1200] flex items-center justify-between px-4 md:px-6 border-b border-cyan-400/20",
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
      '<nav class="wh-top-nav-strip flex flex-1 justify-center items-stretch gap-0.5 md:gap-1 mx-2 min-w-0">' +
      "</nav>" +
      '<div class="flex items-center gap-2 md:gap-3 text-cyan-50 shrink-0">' +
      '<button type="button" data-shell-action="search" class="p-2 rounded-lg transition-ui border border-transparent hover:border-cyan-400/30 hover:bg-cyan-500/10 hover:shadow-[0_0_16px_rgba(34,211,238,0.2)]" title="搜索菜单"><i class="fa-solid fa-magnifying-glass text-lg text-cyan-200"></i></button>' +
      '<a href="' +
      pageHref("wb-todo.html") +
      '" data-shell-action="todo" class="wh-shell-tool-btn p-2 rounded-lg transition-ui border border-transparent hover:border-cyan-400/30 hover:bg-cyan-500/10" title="待办"><i class="fa-solid fa-list-check text-lg text-cyan-200"></i><span data-shell-badge="todo" class="wh-shell-badge-wrap' +
      (badges.todo ? "" : " wh-shell-badge-wrap--hidden") +
      '">' +
      badges.todo +
      "</span></a>" +
      '<a href="' +
      pageHref("wb-sys-notify.html") +
      '" data-shell-action="notify" class="wh-shell-tool-btn p-2 rounded-lg transition-ui border border-transparent hover:border-cyan-400/30 hover:bg-cyan-500/10" title="系统通知">' +
      '<i class="fa-regular fa-bell text-lg text-cyan-200"></i>' +
      '<span data-shell-badge="notify" class="wh-shell-badge-wrap' +
      (badges.notify ? "" : " wh-shell-badge-wrap--hidden") +
      '">' +
      badges.notify +
      "</span></a>" +
      '<div class="wh-shell-user-drop">' +
      '<button type="button" data-shell-action="user-menu" class="flex items-center gap-2 rounded-lg transition-ui border border-cyan-400/20 hover:bg-cyan-500/10 pl-1 pr-2 py-1" aria-haspopup="true" aria-expanded="false">' +
      '<img id="wh-shell-user-avatar" data-wh-user-avatar src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=80&h=80&fit=crop&q=80" class="w-8 h-8 rounded-full object-cover ring-2 ring-cyan-400/40" alt=""/>' +
      '<span class="text-xs hidden lg:inline text-cyan-50/90" data-wh-user-nickname>管理员</span></button>' +
      '<div class="wh-shell-user-panel" role="menu">' +
      '<button type="button" data-shell-action="profile-center" class="wh-shell-user-panel__profile" role="menuitem"><i class="fa-regular fa-user mr-2 opacity-80"></i>个人中心</button>' +
      '<div class="wh-shell-user-panel__divider" role="separator"></div>' +
      '<button type="button" data-shell-action="logout" role="menuitem">退出登录</button></div></div>' +
      "</div>";

    var nav = header.querySelector("nav");
    var hideNav = hiddenTopNavIds();
    WHMetroMenu.TOP_NAV.forEach(function (item) {
      if (hideNav.indexOf(item.id) >= 0) return;
      if (item.kind === "dropdown") {
        var wrap = el("div", { className: "wh-top-drop" });
        var active = item.id === highlight;
        var btn = el("button", {
          type: "button",
          className:
            "wh-top-drop__btn wh-top-nav " +
            (active ? "wh-top-nav--active" : ""),
          "aria-haspopup": "true",
        });
        btn.textContent = item.label;
        var panel = el("div", { className: "wh-top-drop__panel", role: "menu" });
        var inner = el("div", { className: "wh-top-drop__panel-inner" });
        item.items.forEach(function (sub) {
          var a = el("a", { href: pageHref(sub.href), role: "menuitem" });
          a.textContent = sub.label;
          inner.appendChild(a);
        });
        panel.appendChild(inner);
        wrap.appendChild(btn);
        wrap.appendChild(panel);
        wrap.addEventListener("mouseenter", function () {
          wrap.classList.add("wh-top-drop--open");
        });
        wrap.addEventListener("mouseleave", function () {
          wrap.classList.remove("wh-top-drop--open");
        });
        nav.appendChild(wrap);
      } else {
        var a = el("a", {
          href: pageHref(item.href || "#"),
        className:
          "wh-top-nav relative whitespace-nowrap transition-ui flex items-center px-3 " +
            (item.id === highlight ? "wh-top-nav--active" : ""),
        });
        a.textContent = item.label;
        nav.appendChild(a);
      }
    });

    bindHeaderActions(header);
    if (typeof WHHeaderBadges !== "undefined") WHHeaderBadges.refresh();
    return header;
  }

  function escHtml(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function ensureSearchOverlay() {
    var mask = document.getElementById("wh-shell-search-mask");
    if (mask) return mask;
    mask = el("div", { id: "wh-shell-search-mask", className: "wh-shell-search-mask" });
    mask.innerHTML =
      '<div class="wh-shell-search-box" role="dialog" aria-modal="true" aria-label="搜索菜单">' +
      '<div class="wh-shell-search-head">' +
      '<i class="fa-solid fa-magnifying-glass text-cyan-300"></i>' +
      '<input type="search" id="wh-shell-search-input" placeholder="输入菜单名称搜索…" autocomplete="off" />' +
      '<button type="button" id="wh-shell-search-close" class="px-3 h-8 rounded text-xs wh-btn-ghost">关闭</button>' +
      "</div>" +
      '<div id="wh-shell-search-list" class="wh-shell-search-list"></div></div>';
    document.body.appendChild(mask);
    return mask;
  }

  function renderSearchResults(keyword) {
    var listEl = document.getElementById("wh-shell-search-list");
    if (!listEl || typeof WHMetroMenu === "undefined") return;
    var q = (keyword || "").trim().toLowerCase();
    var menus = WHMetroMenu.collectAllMenuItems();
    var hits = menus.filter(function (item) {
      return !q || item.label.toLowerCase().indexOf(q) > -1;
    });
    if (!hits.length) {
      listEl.innerHTML = '<div class="wh-shell-search-empty">未找到匹配的菜单</div>';
      return;
    }
    listEl.innerHTML = hits
      .map(function (item) {
        return (
          '<button type="button" class="wh-shell-search-item" data-href="' +
          escHtml(item.href) +
          '"><span class="wh-shell-search-item__label">' +
          escHtml(item.label) +
          '</span><span class="wh-shell-search-item__group">' +
          escHtml(item.group) +
          "</span></button>"
        );
      })
      .join("");
  }

  function openMenuSearch() {
    var mask = ensureSearchOverlay();
    var input = document.getElementById("wh-shell-search-input");
    mask.classList.add("show");
    renderSearchResults("");
    if (input) {
      input.value = "";
      setTimeout(function () {
        input.focus();
      }, 30);
    }
  }

  function closeMenuSearch() {
    var mask = document.getElementById("wh-shell-search-mask");
    if (mask) mask.classList.remove("show");
  }

  function bindHeaderActions(header) {
    if (!header) return;

    header.addEventListener("click", function (event) {
      var actionBtn = event.target.closest("[data-shell-action]");
      if (!actionBtn) return;
      var action = actionBtn.getAttribute("data-shell-action");

      if (action === "search") {
        event.preventDefault();
        openMenuSearch();
        return;
      }
      if (action === "user-menu") {
        event.preventDefault();
        event.stopPropagation();
        var drop = actionBtn.closest(".wh-shell-user-drop");
        if (!drop) return;
        var open = drop.classList.toggle("wh-shell-user-drop--open");
        actionBtn.setAttribute("aria-expanded", open ? "true" : "false");
        return;
      }
      if (action === "profile-center") {
        event.preventDefault();
        var dropPc = actionBtn.closest(".wh-shell-user-drop");
        if (dropPc) {
          dropPc.classList.remove("wh-shell-user-drop--open");
          var menuBtn = dropPc.querySelector("[data-shell-action='user-menu']");
          if (menuBtn) menuBtn.setAttribute("aria-expanded", "false");
        }
        if (typeof WHUserProfileCenter !== "undefined") {
          WHUserProfileCenter.open();
        }
        return;
      }
      if (action === "logout") {
        event.preventDefault();
        var prefix = typeof whAssetPrefix === "function" ? whAssetPrefix() : "";
        window.location.href = prefix
          ? typeof whPageHref === "function"
            ? whPageHref("web-login.html")
            : "web-login.html"
          : "index.html";
        return;
      }
    });

    document.addEventListener("click", function (event) {
      if (!event.target.closest(".wh-shell-user-drop")) {
        document.querySelectorAll(".wh-shell-user-drop--open").forEach(function (drop) {
          drop.classList.remove("wh-shell-user-drop--open");
          var btn = drop.querySelector("[data-shell-action='user-menu']");
          if (btn) btn.setAttribute("aria-expanded", "false");
        });
      }
    });

    var searchMask = ensureSearchOverlay();
    var searchInput = document.getElementById("wh-shell-search-input");
    var searchClose = document.getElementById("wh-shell-search-close");
    var searchList = document.getElementById("wh-shell-search-list");

    if (searchInput) {
      searchInput.addEventListener("input", function () {
        renderSearchResults(searchInput.value);
      });
      searchInput.addEventListener("keydown", function (event) {
        if (event.key === "Escape") closeMenuSearch();
      });
    }
    if (searchClose) {
      searchClose.addEventListener("click", function () {
        closeMenuSearch();
      });
    }
    searchMask.addEventListener("click", function (event) {
      if (event.target === searchMask) closeMenuSearch();
    });
    if (searchList) {
      searchList.addEventListener("click", function (event) {
        var item = event.target.closest(".wh-shell-search-item");
        if (!item) return;
        var href = item.getAttribute("data-href");
        if (href) window.location.href = href;
      });
    }

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenuSearch();
    });
  }

  function leafIcon(key) {
    var icon = "fa-regular fa-file-lines";
    if (key.indexOf("am-") === 0) icon = "fa-solid fa-train-subway";
    if (key.indexOf("dc-") === 0) icon = "fa-solid fa-database";
    if (key.indexOf("in-") === 0) icon = "fa-solid fa-route";
    if (key.indexOf("wb-") === 0) icon = "fa-solid fa-briefcase";
    return icon;
  }

  function sidebarLeaf(item, activeKey, collapsed, indent) {
    var isActive = item.key === activeKey;
    var a = el("a", {
      href: pageHref(item.href),
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
    var icon = leafIcon(item.key);
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

  function attachSidebarChrome(aside, scroll, collapsed) {
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
        scroll.querySelectorAll(".wh-wb-mega-sub").forEach(function (s) {
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
        scroll.querySelectorAll(".wh-wb-mega-sub").forEach(function (s) {
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

    return { applyCollapsed: applyCollapsed, toggle: toggle };
  }

  function buildSidebar(topId, activeKey, collapsed) {
    var aside = el("aside", {
      className: "wh-sidebar fixed left-0 z-40 flex flex-col transition-ui",
      style: "top:64px;width:" + (collapsed ? "80px" : "260px") + ";",
    });
    var scroll = el("div", { className: "flex-1 overflow-y-auto py-3" });
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
            var ch = gh.querySelector(".fa-chevron-down");
            if (ch) ch.style.transform = expanded ? "rotate(0deg)" : "rotate(-90deg)";
          });
          groupWrap.appendChild(gh);
          groupWrap.appendChild(body);
          scroll.appendChild(groupWrap);
        }
      });
    }
    attachSidebarChrome(aside, scroll, collapsed);
    return aside;
  }

  function init() {
    if (typeof WHMetroMenu === "undefined") return;
    injectShellStyles();
    var body = document.body;
    var shell = body.getAttribute("data-shell") || "default";
    var topId = body.getAttribute("data-top") || "wb";
    var activeKey = body.getAttribute("data-sidebar-key") || "";
    var pageRoot = document.getElementById("page-root");
    if (!pageRoot) return;

    if (shell === "embed") {
      body.classList.add("wh-layout-embed");
      pageRoot.classList.add("wh-embed-page-root");
      return;
    }

    var collapsed = localStorage.getItem(STORAGE_SIDEBAR) === "1";

    var layout = el("div", { id: "app-layout" });
    var header = buildHeader(topId);
    layout.appendChild(header);

    var row = el("div", {
      className: "wh-shell-row",
    });

    if (shell === "fullscreen") {
      var mainFs = el("main", {
        id: "shell-main",
        className: "wh-main-canvas wh-main-canvas--fullscreen",
        style: "margin-left:0;",
      });
      mainFs.appendChild(pageRoot);
      row.appendChild(mainFs);
    } else if (topId === "patrol" || topId === "st") {
      body.classList.add("wh-layout-no-sidebar");
      var mainNoSide = el("main", {
        id: "shell-main",
        className: "wh-main-canvas p-4 md:p-6",
        style: "margin-left:0;transition:margin-left .2s;",
      });
      mainNoSide.appendChild(pageRoot);
      row.appendChild(mainNoSide);
    } else if (topId === "wb") {
      if (typeof WHWorkbenchMega !== "undefined") WHWorkbenchMega.ensureCss();
      body.classList.add("wh-layout-wb");
      var wbView = body.getAttribute("data-wb-view") || "page";
      var isHub = wbView === "hub" || activeKey === "wb-hub";
      if (isHub) body.classList.add("wh-wb-hub");
      var mainWb = el("main", {
        id: "shell-main",
        className: "wh-main-canvas" + (isHub ? " wh-main-canvas--wb-hub" : " p-4 md:p-6"),
        style: "margin-left:0;transition:margin-left .2s;",
      });
      if (isHub && typeof WHWorkbenchMega !== "undefined") {
        var mega = WHWorkbenchMega.build(activeKey);
        if (mega) {
          mega.classList.add("wh-wb-mega-wrap--fullscreen");
          mainWb.appendChild(mega);
        }
        pageRoot.setAttribute("aria-hidden", "true");
        pageRoot.classList.add("hidden");
        mainWb.appendChild(pageRoot);
      } else {
        pageRoot.classList.remove("hidden");
        pageRoot.removeAttribute("aria-hidden");
        mainWb.appendChild(pageRoot);
      }
      row.appendChild(mainWb);
    } else {
      var aside = buildSidebar(topId, activeKey, collapsed);
      var main = el("main", {
        id: "shell-main",
        className: "wh-main-canvas p-4 md:p-6",
        style: "margin-left:" + (collapsed ? "80px" : "260px") + ";transition:margin-left .2s;",
      });
      main.appendChild(pageRoot);
      row.appendChild(aside);
      row.appendChild(main);
    }

    layout.appendChild(row);
    body.insertBefore(layout, body.firstChild);

    try {
      document.dispatchEvent(
        new CustomEvent("wh-shell-ready", {
          detail: { topId: topId, activeKey: activeKey, wbView: body.getAttribute("data-wb-view") || "page" },
        })
      );
    } catch (e) {
      /* IE 等环境忽略 */
    }
    window.__whShellReady = true;
    if (typeof window.__wbBootPage === "function") {
      window.__wbBootPage();
    }
    ensureTableRowOpen();
    ensureUserProfileCenter();
  }

  function ensureTableRowOpen() {
    if (typeof WHTableRowClick !== "undefined") return;
    if (document.getElementById("wh-table-row-open-js")) return;
    var script = document.createElement("script");
    script.id = "wh-table-row-open-js";
    script.async = false;
    script.src =
      typeof whAsset === "function"
        ? whAsset("assets/js/table-row-open.js")
        : "assets/js/table-row-open.js";
    document.head.appendChild(script);
  }

  function ensureUserProfileCenter() {
    if (typeof WHUserProfileCenter !== "undefined") {
      WHUserProfileCenter.init();
      return;
    }
    if (document.getElementById("wh-user-profile-js")) return;
    var script = document.createElement("script");
    script.id = "wh-user-profile-js";
    script.src =
      typeof whAsset === "function"
        ? whAsset("assets/js/user-profile-center.js")
        : "assets/js/user-profile-center.js";
    script.onload = function () {
      if (typeof WHUserProfileCenter !== "undefined") WHUserProfileCenter.init();
    };
    document.body.appendChild(script);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
