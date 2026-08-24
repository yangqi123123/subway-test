/**
 * 移动端个人资料 / 忘记密码
 */
(function (global) {
  "use strict";

  var STORAGE_KEY = "wh-mobile-user-profile";

  function $(id) {
    return document.getElementById(id);
  }

  function toast(msg) {
    var el = $("profile-toast") || $("forgot-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function defaultProfile() {
    var mod = (global.MiniAppConfig && global.MiniAppConfig.MODULES.mine) || {};
    var p = mod.profile || {};
    return {
      avatar: p.avatar || "",
      account: p.account || "zhangsan",
      nickname: p.nickname || p.name || "张三",
      email: p.email || "zhangsan@whmetro.com",
      phone: p.phone || "13800138000",
      gender: p.gender || "男",
      dept: p.dept || "保护区运管部",
      pilotCert: p.pilotCert || "",
      wechatBound: false,
      wechatName: "",
      wechatBoundAt: "",
    };
  }

  function loadProfile() {
    try {
      var raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return Object.assign(defaultProfile(), JSON.parse(raw));
    } catch (e) {}
    return defaultProfile();
  }

  function saveProfile(data) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  }

  function bindImagePick(inputId, previewId, onPick) {
    var input = $(inputId);
    if (!input) return;
    input.addEventListener("change", function () {
      var file = input.files && input.files[0];
      if (!file) return;
      var reader = new FileReader();
      reader.onload = function () {
        var preview = $(previewId);
        if (preview) preview.src = reader.result;
        if (onPick) onPick(reader.result);
      };
      reader.readAsDataURL(file);
    });
  }

  function formatNow() {
    var now = new Date();
    function pad(value) {
      return String(value).padStart(2, "0");
    }
    return now.getFullYear() + "-" + pad(now.getMonth() + 1) + "-" + pad(now.getDate()) + " " + pad(now.getHours()) + ":" + pad(now.getMinutes());
  }

  function renderWechatBinding(profile) {
    var root = $("profile-wechat-binding");
    var status = $("profile-wechat-status");
    var desc = $("profile-wechat-desc");
    var button = root && root.querySelector('[data-action="toggle-wechat-binding"]');
    if (!root || !status || !desc || !button) return;

    root.classList.toggle("is-bound", Boolean(profile.wechatBound));
    status.textContent = profile.wechatBound ? "微信用户（已绑定）" : "未绑定";
    desc.textContent = profile.wechatBound
      ? "绑定时间：" + (profile.wechatBoundAt || "刚刚")
      : "完成微信授权，并关注指定服务号可接收服务号通知";
    button.textContent = profile.wechatBound ? "解除绑定" : "绑定当前微信";
  }

  function showWechatConfirm(profile) {
    var mask = $("profile-wechat-confirm");
    var title = $("profile-wechat-confirm-title");
    var message = $("profile-wechat-confirm-message");
    var button = $("profile-wechat-confirm-ok");
    if (!mask || !title || !message || !button) return;

    var isUnbind = Boolean(profile.wechatBound);
    mask.dataset.mode = isUnbind ? "unbind" : "bind";
    title.textContent = isUnbind ? "解除绑定" : "绑定微信";
    message.textContent = isUnbind
      ? "解除绑定后将无法通过微信接收服务号通知，确认解除吗？"
      : "确认绑定当前微信账号？一个微信只能绑定一个系统账号。";
    button.textContent = isUnbind ? "确认解除" : "确认绑定";
    button.classList.toggle("miniapp-btn--primary", !isUnbind);
    button.classList.toggle("miniapp-btn--danger", isUnbind);
    mask.classList.add("is-show");
    mask.setAttribute("aria-hidden", "false");
  }

  function hideWechatConfirm() {
    var mask = $("profile-wechat-confirm");
    if (!mask) return;
    mask.classList.remove("is-show");
    mask.setAttribute("aria-hidden", "true");
  }

  function bootProfilePage() {
    var profile = loadProfile();
    var avatarPreview = $("profile-avatar-preview");
    if (avatarPreview && profile.avatar) avatarPreview.src = profile.avatar;
    var pilotPreview = $("profile-pilot-preview");
    if (pilotPreview && profile.pilotCert) {
      pilotPreview.src = profile.pilotCert;
      pilotPreview.hidden = false;
    }
    renderWechatBinding(profile);

    var form = $("profile-form");
    if (form) {
      $("profile-account").value = profile.account;
      $("profile-nickname").value = profile.nickname;
      $("profile-email").value = profile.email;
      $("profile-phone").value = profile.phone;
      $("profile-gender").value = profile.gender;
    }

    bindImagePick("profile-avatar-input", "profile-avatar-preview", function (url) {
      profile.avatar = url;
    });
    bindImagePick("profile-pilot-input", "profile-pilot-preview", function (url) {
      profile.pilotCert = url;
      if (pilotPreview) pilotPreview.hidden = false;
    });

    document.addEventListener("click", function (e) {
      if (e.target.closest('[data-action="pick-avatar"]')) {
        var input = $("profile-avatar-input");
        if (input) input.click();
      }
      if (e.target.closest('[data-action="pick-pilot"]')) {
        var pilotInput = $("profile-pilot-input");
        if (pilotInput) pilotInput.click();
      }
      if (e.target.closest('[data-action="toggle-wechat-binding"]')) {
        showWechatConfirm(profile);
      }
      if (e.target.closest('[data-action="cancel-wechat-binding"]') || e.target.id === "profile-wechat-confirm") {
        hideWechatConfirm();
      }
      if (e.target.closest('[data-action="confirm-wechat-binding"]')) {
        var confirmMask = $("profile-wechat-confirm");
        if (confirmMask && confirmMask.dataset.mode === "unbind") {
          profile.wechatBound = false;
          profile.wechatName = "";
          profile.wechatBoundAt = "";
          saveProfile(profile);
          renderWechatBinding(profile);
          hideWechatConfirm();
          toast("微信已解除绑定");
          return;
        }

        profile.wechatBound = true;
        profile.wechatName = "微信用户";
        profile.wechatBoundAt = formatNow();
        saveProfile(profile);
        renderWechatBinding(profile);
        hideWechatConfirm();
        toast("微信绑定成功");
      }
    });

    if (form) {
      form.addEventListener("submit", function (e) {
        e.preventDefault();
        profile.nickname = $("profile-nickname").value.trim();
        profile.email = $("profile-email").value.trim();
        profile.phone = $("profile-phone").value.trim();
        profile.gender = $("profile-gender").value;
        saveProfile(profile);
        toast("资料已保存");
        setTimeout(function () {
          global.location.href = "../home.html";
        }, 600);
      });
    }
  }

  function bootForgotPasswordPage() {
    if (global.WHPasswordMobile && global.WHPasswordMobile.bootForgotPassword) {
      global.WHPasswordMobile.bootForgotPassword();
    }
  }

  global.WHProfilePage = {
    bootProfile: bootProfilePage,
    bootForgotPassword: bootForgotPasswordPage,
    loadProfile: loadProfile,
  };
})(window);
