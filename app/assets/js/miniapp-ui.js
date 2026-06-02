/**
 * 小程序原型 — 页面框架与基础交互
 */
(function (global) {
  "use strict";

  var cfg = global.MiniAppConfig || { MODULES: {}, TAB_ITEMS: [] };

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function toast(msg) {
    var el = document.getElementById("miniapp-toast");
    if (!el) {
      el = document.createElement("div");
      el.id = "miniapp-toast";
      el.className = "miniapp-toast";
      el.setAttribute("role", "status");
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("is-show");
    }, 2200);
  }

  function resolveHref(href) {
    if (!href || /^https?:/i.test(href)) return href;
    var base = document.body.getAttribute("data-base") || "";
    return base + href;
  }

  /** 退出登录：统一跳到 app 根目录下的 app-login.html */
  function getAppLoginHref() {
    var mineMod = cfg.MODULES.mine || {};
    var rel = mineMod.logoutHref || "app-login.html";
    if (/^https?:/i.test(rel)) return rel;
    if (rel.charAt(0) === "/") return rel;
    try {
      var path = window.location.pathname || "";
      var marker = "/app/";
      var idx = path.indexOf(marker);
      if (idx >= 0) {
        return path.slice(0, idx + marker.length) + "app-login.html";
      }
    } catch (e) {}
    if (rel.indexOf("app-login") >= 0) {
      var parts = (window.location.pathname || "").split("/");
      parts.pop();
      if (parts[parts.length - 1] === "mine" || parts[parts.length - 1] === "pages") {
        parts.pop();
      }
      return parts.join("/") + "/app-login.html";
    }
    return resolveHref(rel);
  }

  function navigateToAppLogin() {
    var href = getAppLoginHref();
    try {
      if (window.top && window.top !== window) {
        window.top.location.href = href;
        return;
      }
    } catch (e) {}
    window.location.href = href;
  }

  function goBack() {
    if (window.history.length > 1) {
      window.history.back();
      return;
    }
    var mod = document.body.getAttribute("data-module");
    if (mod) window.location.href = resolveHref("home.html");
  }

  function buildNavbar(options) {
    options = options || {};
    var showBack = !!options.showBack;
    var isRoot = !showBack;
    var html =
      '<header class="miniapp-navbar' +
      (isRoot ? " miniapp-navbar--root" : " miniapp-navbar--inner") +
      '">';
    if (showBack) {
      html +=
        '<button type="button" class="miniapp-navbar__back" aria-label="返回" data-action="back"><i class="fa-solid fa-chevron-left"></i></button>';
    } else {
      html += '<span class="miniapp-navbar__side" aria-hidden="true"></span>';
    }
    html += "<h1 class=\"miniapp-navbar__title\">" + esc(options.title || "") + "</h1>";
    if (isRoot) {
      html += '<span class="miniapp-navbar__side" aria-hidden="true"></span>';
    }
    html += "</header>";
    return html;
  }

  var userProfile = null;

  function getUserProfile(mod) {
    if (userProfile) return userProfile;
    var p = (mod && mod.profile) || {};
    userProfile = {
      avatar: p.avatar || "",
      name: p.name || "用户",
      account: p.account || "",
      phone: p.phone || "",
      dept: p.dept || "",
    };
    return userProfile;
  }

  function renderMineHub(mod) {
    document.body.className = "miniapp-page";
    document.body.setAttribute("data-module", "mine");
    var profile = getUserProfile(mod);
    var cells = mod.cells || [];

    var cellHtml = cells
      .map(function (item) {
        return (
          '<a class="miniapp-cell" href="' +
          esc(resolveHref(item.href)) +
          '"><i class="fa-solid ' +
          esc(item.icon) +
          '"></i><span>' +
          esc(item.label) +
          '</span><i class="fa-solid fa-chevron-right miniapp-cell__arrow"></i></a>'
        );
      })
      .join("");

    document.body.innerHTML =
      buildNavbar({ title: mod.label, showBack: false }) +
      '<main class="miniapp-content miniapp-content--mine">' +
      '<a class="miniapp-profile-card" href="' +
      esc(resolveHref("pages/profile.html")) +
      '">' +
      '<img class="miniapp-profile-card__avatar" src="' +
      esc(profile.avatar) +
      '" alt="" />' +
      '<div class="miniapp-profile-card__body">' +
      '<p class="miniapp-profile-card__name">' +
      esc(profile.name) +
      "</p>" +
      '<p class="miniapp-profile-card__row"><span>账号</span><b>' +
      esc(profile.account) +
      "</b></p>" +
      '<p class="miniapp-profile-card__row"><span>手机</span><b>' +
      esc(profile.phone) +
      "</b></p>" +
      '<p class="miniapp-profile-card__row"><span>部门</span><b>' +
      esc(profile.dept) +
      "</b></p>" +
      "</div>" +
      '<span class="miniapp-profile-card__meta"><i class="fa-solid fa-pen-to-square"></i> 编辑资料</span></a>' +
      '<div class="miniapp-cell-group">' +
      cellHtml +
      "</div>" +
      '<button type="button" class="miniapp-btn miniapp-btn--ghost miniapp-btn--logout w-full mt-4" data-action="logout">退出登录</button>' +
      "</main>";

    bindActions();
  }

  function renderProfileEdit(mod) {
    document.body.className = "miniapp-page";
    document.body.setAttribute("data-module", "mine");
    var profile = getUserProfile(mod);

    document.body.innerHTML =
      buildNavbar({ title: "个人资料", showBack: true }) +
      '<main class="miniapp-content">' +
      '<form id="profile-form" class="miniapp-form">' +
      '<div class="miniapp-form-avatar">' +
      '<img id="profile-avatar-preview" src="' +
      esc(profile.avatar) +
      '" alt="" />' +
      '<button type="button" class="miniapp-form-avatar__btn" data-action="change-avatar">更换头像</button>' +
      "</div>" +
      '<label class="miniapp-form-field"><span>姓名</span><input name="name" type="text" value="' +
      esc(profile.name) +
      '" /></label>' +
      '<label class="miniapp-form-field"><span>账号</span><input name="account" type="text" value="' +
      esc(profile.account) +
      '" readonly class="is-readonly" /></label>' +
      '<label class="miniapp-form-field"><span>手机号码</span><input name="phone" type="tel" value="' +
      esc(profile.phone) +
      '" /></label>' +
      '<label class="miniapp-form-field"><span>部门</span><input name="dept" type="text" value="' +
      esc(profile.dept) +
      '" /></label>' +
      '<button type="submit" class="miniapp-btn miniapp-btn--primary w-full mt-4">保存</button>' +
      "</form></main>";

    var form = document.getElementById("profile-form");
    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        var fd = new FormData(form);
        userProfile = {
          avatar: profile.avatar,
          name: fd.get("name") || profile.name,
          account: fd.get("account") || profile.account,
          phone: fd.get("phone") || profile.phone,
          dept: fd.get("dept") || profile.dept,
        };
        toast("资料已保存（原型演示）");
        setTimeout(function () {
          window.location.href = resolveHref("../home.html");
        }, 600);
      });
    }
    bindActions();
  }

  function renderHub(moduleId) {
    var mod = cfg.MODULES[moduleId];
    if (!mod) return;
    document.body.className = "miniapp-page";
    document.body.setAttribute("data-module", moduleId);

    if (mod.hubType === "mine") {
      renderMineHub(mod);
      return;
    }

    var hero = mod.hero || {};

    function menuItemHtml(item) {
      return (
        '<a class="miniapp-menu__item" href="' +
        esc(resolveHref(item.href)) +
        '">' +
        '<span class="miniapp-menu__icon miniapp-menu__icon--' +
        esc(item.tone || "blue") +
        '"><i class="fa-solid ' +
        esc(item.icon) +
        '"></i></span>' +
        "<span>" +
        esc(item.label) +
        "</span></a>"
      );
    }

    var menuHtml = "";
    if (mod.menuGroups && mod.menuGroups.length) {
      menuHtml = mod.menuGroups
        .map(function (group) {
          return (
            '<section class="miniapp-menu-block">' +
            '<p class="miniapp-section-title">' +
            esc(group.title) +
            "</p>" +
            '<div class="miniapp-menu">' +
            (group.items || []).map(menuItemHtml).join("") +
            "</div></section>"
          );
        })
        .join("");
    } else {
      menuHtml =
        '<p class="miniapp-section-title">功能菜单</p>' +
        '<div class="miniapp-menu">' +
        (mod.menus || []).map(menuItemHtml).join("") +
        "</div>";
    }

    var extraHtml = "";
    if (mod.extras && mod.extras.length) {
      extraHtml =
        '<div class="miniapp-menu-block miniapp-menu-block--extras">' +
        mod.extras
          .map(function (item) {
            return (
              '<a class="miniapp-cell miniapp-cell--solo" href="' +
              esc(resolveHref(item.href)) +
              '"><i class="fa-solid ' +
              esc(item.icon) +
              '"></i><span>' +
              esc(item.label) +
              '</span><i class="fa-solid fa-chevron-right miniapp-cell__arrow"></i></a>'
            );
          })
          .join("") +
        "</div>";
    }

    document.body.innerHTML =
      buildNavbar({ title: mod.label, showBack: false }) +
      '<main class="miniapp-content miniapp-content--hub">' +
      '<div class="miniapp-hero">' +
      '<img src="' +
      esc(hero.image) +
      '" alt="" loading="lazy" />' +
      '<div class="miniapp-hero__mask">' +
      "<h2 class=\"miniapp-hero__title\">" +
      esc(hero.title) +
      "</h2>" +
      '<p class="miniapp-hero__desc">' +
      esc(hero.desc) +
      "</p></div></div>" +
      menuHtml +
      extraHtml +
      "</main>";

    bindActions();
  }

  function renderPlaceholder(options) {
    document.body.className = "miniapp-page";
    var moduleId = options.module || document.body.getAttribute("data-module") || "";
    if (moduleId) document.body.setAttribute("data-module", moduleId);

    document.body.innerHTML =
      buildNavbar({ title: options.title || "页面", showBack: true }) +
      '<main class="miniapp-content">' +
      '<div class="miniapp-placeholder">' +
      '<i class="fa-solid fa-cube"></i>' +
      "<h2>" +
      esc(options.title) +
      "</h2>" +
      "<p>" +
      esc(options.desc || "功能框架已就绪，业务逻辑待接入。") +
      '</p><p class="mt-4"><span class="miniapp-tag">原型占位</span></p>' +
      '<button type="button" class="miniapp-btn miniapp-btn--primary mt-6 w-full max-w-[200px]" data-action="demo-toast">体验交互</button>' +
      "</main>";

    bindActions();
  }

  function renderList(options) {
    document.body.className = "miniapp-page";
    var items = options.items || [];
    var rows = items
      .map(function (row, i) {
        return (
          '<button type="button" class="miniapp-cell" data-action="list-item" data-index="' +
          i +
          '"><span>' +
          esc(row.title) +
          '</span><span class="miniapp-tag ml-2">' +
          esc(row.status || "") +
          '</span><i class="fa-solid fa-chevron-right miniapp-cell__arrow"></i></button>'
        );
      })
      .join("");

    document.body.innerHTML =
      buildNavbar({ title: options.title, showBack: true }) +
      '<main class="miniapp-content">' +
      '<div class="miniapp-cell-group">' +
      rows +
      "</div>" +
      '<button type="button" class="miniapp-btn miniapp-btn--primary w-full mt-4" data-action="demo-add"><i class="fa-solid fa-plus mr-1"></i>新增</button>' +
      "</main>" +
      '<div id="miniapp-modal" class="miniapp-modal-mask"><div class="miniapp-modal" role="dialog">' +
      "<h3>确认操作</h3><p>此为原型演示，不提交真实数据。</p>" +
      '<div class="miniapp-modal__actions">' +
      '<button type="button" class="miniapp-btn miniapp-btn--ghost" data-action="modal-cancel">取消</button>' +
      '<button type="button" class="miniapp-btn miniapp-btn--primary" data-action="modal-ok">确定</button>' +
      "</div></div></div>";

    document.body._listItems = items;
    bindActions();
  }

  function bindActions() {
    document.body.addEventListener("click", function (e) {
      var t = e.target.closest("[data-action]");
      if (!t) return;
      var act = t.getAttribute("data-action");
      if (act === "back") goBack();
      if (act === "demo-toast") toast("交互正常（原型演示）");
      if (act === "demo-add") {
        var mask = document.getElementById("miniapp-modal");
        if (mask) mask.classList.add("is-show");
      }
      if (act === "modal-cancel") {
        var m = document.getElementById("miniapp-modal");
        if (m) m.classList.remove("is-show");
      }
      if (act === "modal-ok") {
        var m2 = document.getElementById("miniapp-modal");
        if (m2) m2.classList.remove("is-show");
        toast("已保存（原型演示）");
      }
      if (act === "list-item") {
        var idx = Number(t.getAttribute("data-index"));
        var row = (document.body._listItems || [])[idx];
        toast(row ? "查看：" + row.title : "查看详情");
      }
      if (act === "logout") {
        if (confirm("确定退出登录？")) {
          navigateToAppLogin();
        }
      }
      if (act === "change-avatar") {
        toast("更换头像（原型演示）");
      }
    });
  }

  function boot() {
    var body = document.body;
    var mode = body.getAttribute("data-miniapp");
    if (!mode) return;

    var moduleId = body.getAttribute("data-module");
    var title = body.getAttribute("data-title");
    var desc = body.getAttribute("data-desc");

    if (mode === "hub" && moduleId) {
      renderHub(moduleId);
      return;
    }
    if (mode === "profile") {
      renderProfileEdit(cfg.MODULES.mine || {});
      return;
    }
    if (mode === "placeholder") {
      renderPlaceholder({ title: title, desc: desc, module: moduleId });
      return;
    }
    if (mode === "list") {
      var key = body.getAttribute("data-list");
      var lists = {
        todo: [
          { title: "病害巡查工班确认", status: "待办" },
          { title: "8号线告警复核", status: "紧急" },
          { title: "飞行计划审批", status: "待办" },
        ],
        notify: [
          { title: "系统维护通知", status: "未读" },
          { title: "巡检任务提醒", status: "未读" },
        ],
      };
      renderList({ title: title || "列表", items: lists[key] || lists.todo });
    }
  }

  function initShell() {
    var frame = document.getElementById("app-frame");
    var tabs = document.querySelectorAll("[data-tab-id]");
    if (!frame || !tabs.length) return;

    function setTab(id) {
      var item = (cfg.TAB_ITEMS || []).find(function (t) {
        return t.id === id;
      });
      if (!item) return;
      frame.src = item.home;
      tabs.forEach(function (btn) {
        btn.classList.toggle("is-active", btn.getAttribute("data-tab-id") === id);
      });
    }

    tabs.forEach(function (btn) {
      btn.addEventListener("click", function () {
        setTab(btn.getAttribute("data-tab-id"));
      });
    });

    setTab("map");
  }

  global.MiniApp = {
    toast: toast,
    goBack: goBack,
    renderHub: renderHub,
    renderMineHub: renderMineHub,
    renderProfileEdit: renderProfileEdit,
    renderPlaceholder: renderPlaceholder,
    renderList: renderList,
    getUserProfile: getUserProfile,
    boot: boot,
    initShell: initShell,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", function () {
      boot();
      initShell();
    });
  } else {
    boot();
    initShell();
  }
})(window);
