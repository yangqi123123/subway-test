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

  function bootProfilePage() {
    var profile = loadProfile();
    var avatarPreview = $("profile-avatar-preview");
    if (avatarPreview && profile.avatar) avatarPreview.src = profile.avatar;
    var pilotPreview = $("profile-pilot-preview");
    if (pilotPreview && profile.pilotCert) {
      pilotPreview.src = profile.pilotCert;
      pilotPreview.hidden = false;
    }

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
