/**
 * 顶栏头像 — 个人中心弹窗（基本设置 / 安全设置）
 */
(function (global) {
  var STORAGE_KEY = "whmetro-user-profile";
  var DEFAULT_AVATAR =
    "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&q=80";

  var DEFAULT_PROFILE = {
    account: "admin",
    nickname: "管理员",
    phone: "13800138000",
    email: "admin@whmetro.local",
    department: "运管中心",
    lastLogin: "",
    gender: "unknown",
    pilotCertName: "",
    pilotCertData: "",
    avatar: DEFAULT_AVATAR,
  };

  function loadProfile() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return Object.assign({}, DEFAULT_PROFILE, { lastLogin: formatNow() });
      var data = JSON.parse(raw);
      return Object.assign({}, DEFAULT_PROFILE, data);
    } catch (e) {
      return Object.assign({}, DEFAULT_PROFILE, { lastLogin: formatNow() });
    }
  }

  function saveProfile(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function formatNow() {
    var d = new Date();
    var p = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    return (
      d.getFullYear() +
      "-" +
      p(d.getMonth() + 1) +
      "-" +
      p(d.getDate()) +
      " " +
      p(d.getHours()) +
      ":" +
      p(d.getMinutes()) +
      ":" +
      p(d.getSeconds())
    );
  }

  function toast(text) {
    var node = document.getElementById("wh-profile-toast");
    if (!node) {
      node = document.createElement("div");
      node.id = "wh-profile-toast";
      node.style.cssText =
        "position:fixed;z-index:500;left:50%;bottom:32px;transform:translateX(-50%);padding:10px 18px;border-radius:8px;font-size:13px;color:#ecfeff;background:rgba(7,27,51,.96);border:1px solid rgba(34,211,238,.35);box-shadow:0 12px 32px rgba(0,0,0,.45);opacity:0;transition:opacity .2s;pointer-events:none;";
      document.body.appendChild(node);
    }
    node.textContent = text;
    node.style.opacity = "1";
    clearTimeout(node._t);
    node._t = setTimeout(function () {
      node.style.opacity = "0";
    }, 2200);
  }

  function syncShellAvatar(url) {
    document.querySelectorAll("#wh-shell-user-avatar, [data-wh-user-avatar]").forEach(function (img) {
      img.src = url;
    });
  }

  function syncShellNickname(name) {
    document.querySelectorAll("[data-wh-user-nickname]").forEach(function (el) {
      el.textContent = name;
    });
  }

  var maskEl = null;
  var profile = null;

  function renderAside() {
    if (!maskEl) return;
    maskEl.querySelector("#wh-profile-aside-avatar").src = profile.avatar || DEFAULT_AVATAR;
    maskEl.querySelector("[data-meta='account']").textContent = profile.account || "—";
    maskEl.querySelector("[data-meta='nickname']").textContent = profile.nickname || "—";
    maskEl.querySelector("[data-meta='phone']").textContent = profile.phone || "—";
    maskEl.querySelector("[data-meta='email']").textContent = profile.email || "—";
    maskEl.querySelector("[data-meta='department']").textContent = profile.department || "—";
    maskEl.querySelector("[data-meta='lastLogin']").textContent = profile.lastLogin || "—";
  }

  function fillBasicForm() {
    if (!maskEl) return;
    maskEl.querySelector("#wh-profile-account").value = profile.account || "";
    maskEl.querySelector("#wh-profile-nickname").value = profile.nickname || "";
    maskEl.querySelector("#wh-profile-email").value = profile.email || "";
    maskEl.querySelector("#wh-profile-phone").value = profile.phone || "";
    var gender = profile.gender || "unknown";
    maskEl.querySelectorAll('input[name="wh-profile-gender"]').forEach(function (radio) {
      radio.checked = radio.value === gender;
    });
    var certName = maskEl.querySelector("#wh-profile-pilot-cert-name");
    if (certName) {
      certName.textContent = profile.pilotCertName || "未上传";
    }
  }

  function buildModal() {
    if (document.getElementById("wh-profile-mask")) {
      maskEl = document.getElementById("wh-profile-mask");
      return;
    }

    maskEl = document.createElement("div");
    maskEl.id = "wh-profile-mask";
    maskEl.className = "wh-profile-mask";
    maskEl.setAttribute("role", "dialog");
    maskEl.setAttribute("aria-modal", "true");
    maskEl.setAttribute("aria-label", "个人中心");
    maskEl.innerHTML =
      '<div class="wh-profile-dialog">' +
      '<div class="wh-profile-head">' +
      "<h2>个人中心</h2>" +
      '<button type="button" class="wh-profile-close" data-profile-action="close" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>' +
      "</div>" +
      '<div class="wh-profile-body">' +
      '<aside class="wh-profile-aside">' +
      '<div class="wh-profile-avatar-wrap">' +
      '<img id="wh-profile-aside-avatar" src="" alt="头像" />' +
      '<button type="button" class="wh-profile-avatar-edit" data-profile-action="avatar-pick" title="修改头像"><i class="fa-solid fa-camera"></i></button>' +
      '<input type="file" id="wh-profile-avatar-input" accept="image/*" />' +
      "</div>" +
      '<dl class="wh-profile-meta">' +
      "<div><dt>账号</dt><dd data-meta=\"account\">—</dd></div>" +
      "<div><dt>昵称</dt><dd data-meta=\"nickname\">—</dd></div>" +
      "<div><dt>手机号码</dt><dd data-meta=\"phone\">—</dd></div>" +
      "<div><dt>邮箱</dt><dd data-meta=\"email\">—</dd></div>" +
      "<div><dt>部门</dt><dd data-meta=\"department\">—</dd></div>" +
      "<div><dt>上次登录时间</dt><dd data-meta=\"lastLogin\">—</dd></div>" +
      "</dl>" +
      "</aside>" +
      '<div class="wh-profile-main">' +
      '<div class="wh-profile-tabs" role="tablist">' +
      '<button type="button" class="wh-profile-tab is-active" data-profile-tab="basic" role="tab">基本设置</button>' +
      '<button type="button" class="wh-profile-tab" data-profile-tab="security" role="tab">安全设置</button>' +
      "</div>" +
      '<div class="wh-profile-panels">' +
      '<div class="wh-profile-panel is-active" data-profile-panel="basic" role="tabpanel">' +
      '<form id="wh-profile-basic-form" class="wh-profile-form-grid">' +
      '<div class="wh-profile-field"><label>账号</label><input id="wh-profile-account" class="wh-input w-full px-3 py-2" type="text" readonly /></div>' +
      '<div class="wh-profile-field"><label><span class="req">*</span>昵称</label><input id="wh-profile-nickname" class="wh-input w-full px-3 py-2" type="text" required /></div>' +
      '<div class="wh-profile-field"><label>邮箱</label><input id="wh-profile-email" class="wh-input w-full px-3 py-2" type="email" /></div>' +
      '<div class="wh-profile-field"><label>手机号码</label><input id="wh-profile-phone" class="wh-input w-full px-3 py-2" type="tel" /></div>' +
      '<div class="wh-profile-field wh-profile-field--full"><label>性别</label><div class="wh-profile-gender">' +
      '<label><input type="radio" name="wh-profile-gender" value="male" /> 男</label>' +
      '<label><input type="radio" name="wh-profile-gender" value="female" /> 女</label>' +
      '<label><input type="radio" name="wh-profile-gender" value="unknown" checked /> 未知</label>' +
      "</div></div>" +
      '<div class="wh-profile-field wh-profile-field--full"><label>飞手证</label><div class="wh-profile-upload">' +
      '<button type="button" class="wh-btn-ghost px-3 py-2 text-sm" data-profile-action="pilot-pick"><i class="fa-solid fa-upload mr-1"></i>上传飞手证</button>' +
      '<span class="wh-profile-upload-name" id="wh-profile-pilot-cert-name">未上传</span>' +
      '<input type="file" id="wh-profile-pilot-input" accept="image/*,.pdf" hidden />' +
      "</div></div>" +
      '<div class="wh-profile-actions wh-profile-field--full">' +
      '<button type="submit" class="wh-btn-primary px-5 py-2 text-sm">更新信息</button>' +
      "</div>" +
      "</form>" +
      "</div>" +
      '<div class="wh-profile-panel" data-profile-panel="security" role="tabpanel">' +
      '<form id="wh-profile-security-form" class="wh-profile-form-grid" style="max-width:420px">' +
      '<div class="wh-profile-field wh-profile-field--full"><label><span class="req">*</span>旧密码</label><input id="wh-profile-old-pwd" class="wh-input w-full px-3 py-2" type="password" autocomplete="current-password" required /></div>' +
      '<div class="wh-profile-field wh-profile-field--full"><label><span class="req">*</span>新密码</label><input id="wh-profile-new-pwd" class="wh-input w-full px-3 py-2" type="password" autocomplete="new-password" required minlength="6" /></div>' +
      '<div class="wh-profile-field wh-profile-field--full"><label><span class="req">*</span>确认密码</label><input id="wh-profile-confirm-pwd" class="wh-input w-full px-3 py-2" type="password" autocomplete="new-password" required minlength="6" /></div>' +
      '<div class="wh-profile-actions wh-profile-field--full">' +
      '<button type="submit" class="wh-btn-primary px-5 py-2 text-sm">修改密码</button>' +
      "</div>" +
      "</form>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>" +
      "</div>";

    document.body.appendChild(maskEl);
    bindModalEvents();
  }

  function switchTab(tab) {
    if (!maskEl) return;
    maskEl.querySelectorAll(".wh-profile-tab").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-profile-tab") === tab);
    });
    maskEl.querySelectorAll(".wh-profile-panel").forEach(function (panel) {
      panel.classList.toggle("is-active", panel.getAttribute("data-profile-panel") === tab);
    });
  }

  function bindModalEvents() {
    maskEl.addEventListener("click", function (event) {
      if (event.target === maskEl) close();
      var action = event.target.closest("[data-profile-action]");
      if (!action) return;
      var type = action.getAttribute("data-profile-action");
      if (type === "close") close();
      if (type === "avatar-pick") maskEl.querySelector("#wh-profile-avatar-input").click();
      if (type === "pilot-pick") maskEl.querySelector("#wh-profile-pilot-input").click();
    });

    maskEl.querySelectorAll("[data-profile-tab]").forEach(function (btn) {
      btn.addEventListener("click", function () {
        switchTab(btn.getAttribute("data-profile-tab"));
      });
    });

    maskEl.querySelector("#wh-profile-avatar-input").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file || !/^image\//i.test(file.type)) {
        toast("请选择图片文件");
        return;
      }
      var reader = new FileReader();
      reader.onload = function () {
        profile.avatar = reader.result;
        saveProfile(profile);
        renderAside();
        syncShellAvatar(profile.avatar);
        toast("头像已更新");
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    });

    maskEl.querySelector("#wh-profile-pilot-input").addEventListener("change", function (event) {
      var file = event.target.files && event.target.files[0];
      if (!file) return;
      profile.pilotCertName = file.name;
      var reader = new FileReader();
      reader.onload = function () {
        profile.pilotCertData = reader.result;
        saveProfile(profile);
        fillBasicForm();
        toast("飞手证已上传");
      };
      reader.readAsDataURL(file);
      event.target.value = "";
    });

    maskEl.querySelector("#wh-profile-basic-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var nickname = maskEl.querySelector("#wh-profile-nickname").value.trim();
      if (!nickname) {
        toast("请填写昵称");
        return;
      }
      profile.nickname = nickname;
      profile.email = maskEl.querySelector("#wh-profile-email").value.trim();
      profile.phone = maskEl.querySelector("#wh-profile-phone").value.trim();
      var genderInput = maskEl.querySelector('input[name="wh-profile-gender"]:checked');
      profile.gender = genderInput ? genderInput.value : "unknown";
      saveProfile(profile);
      renderAside();
      syncShellNickname(profile.nickname);
      toast("个人信息已更新");
    });

    maskEl.querySelector("#wh-profile-security-form").addEventListener("submit", function (event) {
      event.preventDefault();
      var oldPwd = maskEl.querySelector("#wh-profile-old-pwd").value;
      var newPwd = maskEl.querySelector("#wh-profile-new-pwd").value;
      var confirmPwd = maskEl.querySelector("#wh-profile-confirm-pwd").value;
      if (!oldPwd) {
        toast("请输入旧密码");
        return;
      }
      if (newPwd.length < 6) {
        toast("新密码至少 6 位");
        return;
      }
      if (newPwd !== confirmPwd) {
        toast("两次输入的新密码不一致");
        return;
      }
      maskEl.querySelector("#wh-profile-old-pwd").value = "";
      maskEl.querySelector("#wh-profile-new-pwd").value = "";
      maskEl.querySelector("#wh-profile-confirm-pwd").value = "";
      toast("密码修改成功（演示）");
    });

    document.addEventListener("keydown", onKeydown);
  }

  function onKeydown(event) {
    if (event.key === "Escape" && maskEl && maskEl.classList.contains("show")) close();
  }

  function open() {
    profile = loadProfile();
    if (!profile.lastLogin) profile.lastLogin = formatNow();
    buildModal();
    renderAside();
    fillBasicForm();
    switchTab("basic");
    maskEl.classList.add("show");
    document.body.style.overflow = "hidden";
  }

  function close() {
    if (!maskEl) return;
    maskEl.classList.remove("show");
    document.body.style.overflow = "";
  }

  function ensureAssets(cb) {
    var cssHref =
      typeof global.whAsset === "function"
        ? global.whAsset("assets/css/user-profile-center.css")
        : "assets/css/user-profile-center.css";
    if (!document.getElementById("wh-user-profile-css")) {
      var link = document.createElement("link");
      link.id = "wh-user-profile-css";
      link.rel = "stylesheet";
      link.href = cssHref;
      document.head.appendChild(link);
    }
    if (typeof cb === "function") cb();
  }

  function applyStoredProfileToShell() {
    profile = loadProfile();
    if (profile.avatar) syncShellAvatar(profile.avatar);
    if (profile.nickname) syncShellNickname(profile.nickname);
  }

  function init() {
    ensureAssets(function () {
      applyStoredProfileToShell();
    });
  }

  global.WHUserProfileCenter = {
    init: init,
    open: open,
    close: close,
    loadProfile: loadProfile,
  };

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})(typeof window !== "undefined" ? window : this);
