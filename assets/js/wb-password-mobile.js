/**
 * 移动端修改密码 / 忘记密码 / 重置密码
 */
(function (global) {
  "use strict";

  var PASSWORD_HINT = "密码必须是8-16位英文字母、数字组合，不能是纯数字";
  var DEMO_CODE = "123456";
  var RESET_KEY = "wh-mobile-pwd-reset-verified";
  var REMEMBER_KEY = "wh-mobile-login-remember";

  function getAppLoginHref() {
    try {
      var path = global.location.pathname || "";
      var marker = "/app/";
      var idx = path.indexOf(marker);
      if (idx >= 0) {
        return path.slice(0, idx + marker.length) + "app-login.html";
      }
    } catch (e) {
      /* ignore */
    }
    return "../../app-login.html";
  }

  function navigateToLogin() {
    var href = getAppLoginHref();
    try {
      if (global.top && global.top !== global) {
        global.top.location.href = href;
        return;
      }
    } catch (e) {
      /* ignore */
    }
    global.location.href = href;
  }

  function $(id) {
    return document.getElementById(id);
  }

  function toast(msg, elId) {
    var el =
      $(elId || "change-pwd-toast") ||
      $("forgot-toast") ||
      $("reset-toast") ||
      $("wb-mobile-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function validatePassword(pwd) {
    if (!pwd || pwd.length < 8 || pwd.length > 16) return false;
    if (/^\d+$/.test(pwd)) return false;
    if (!/[a-zA-Z]/.test(pwd)) return false;
    if (!/\d/.test(pwd)) return false;
    return true;
  }

  function passwordHintHtml() {
    return '<p class="mp-password-hint">' + PASSWORD_HINT + "</p>";
  }

  function finishPasswordSuccess(message, toastId) {
    toast(message, toastId);
    setTimeout(navigateToLogin, 600);
  }

  function startCountdown(btn, seconds) {
    if (!btn) return;
    var remain = seconds || 60;
    btn.disabled = true;
    btn.classList.add("is-counting");
    btn.textContent = remain + "秒后重发";
    clearInterval(startCountdown._timer);
    startCountdown._timer = setInterval(function () {
      remain -= 1;
      if (remain <= 0) {
        clearInterval(startCountdown._timer);
        btn.disabled = false;
        btn.classList.remove("is-counting");
        btn.textContent = "获取验证码";
        return;
      }
      btn.textContent = remain + "秒后重发";
    }, 1000);
  }

  function bindSendCode(sendBtn, phoneInput, toastId) {
    if (!sendBtn) return;
    sendBtn.addEventListener("click", function () {
      if (sendBtn.disabled) return;
      var phone = (phoneInput && phoneInput.value.trim()) || "";
      if (!/^1\d{10}$/.test(phone.replace(/\s/g, ""))) {
        toast("请输入有效手机号", toastId);
        return;
      }
      toast("验证码已发送", toastId);
      startCountdown(sendBtn, 60);
    });
  }

  function markResetVerified(phone) {
    try {
      sessionStorage.setItem(
        RESET_KEY,
        JSON.stringify({ phone: phone, at: Date.now() })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function readResetVerified() {
    try {
      var raw = sessionStorage.getItem(RESET_KEY);
      if (!raw) return null;
      var data = JSON.parse(raw);
      if (!data || !data.phone) return null;
      if (Date.now() - (data.at || 0) > 30 * 60 * 1000) {
        sessionStorage.removeItem(RESET_KEY);
        return null;
      }
      return data;
    } catch (e) {
      return null;
    }
  }

  function clearResetVerified() {
    try {
      sessionStorage.removeItem(RESET_KEY);
    } catch (e) {
      /* ignore */
    }
  }

  function bindPasswordToggles(root) {
    var scope = root || global.document;
    scope.querySelectorAll('[data-action="toggle-password"]').forEach(function (btn) {
      if (btn._pwdToggleBound) return;
      btn._pwdToggleBound = true;
      btn.addEventListener("click", function () {
        var wrap = btn.closest(".mp-password-field");
        var input = wrap && wrap.querySelector("input");
        if (!input) return;
        var show = input.type === "password";
        input.type = show ? "text" : "password";
        var icon = btn.querySelector("i");
        if (icon) {
          icon.className = show ? "fa-regular fa-eye-slash" : "fa-regular fa-eye";
        }
        btn.setAttribute("aria-label", show ? "隐藏密码" : "显示密码");
      });
    });
  }

  function readRememberLogin() {
    try {
      var raw = localStorage.getItem(REMEMBER_KEY);
      if (!raw) return null;
      return JSON.parse(raw);
    } catch (e) {
      return null;
    }
  }

  function saveRememberLogin(username, password, remember) {
    try {
      if (!remember) {
        localStorage.removeItem(REMEMBER_KEY);
        return;
      }
      localStorage.setItem(
        REMEMBER_KEY,
        JSON.stringify({
          username: username,
          password: password,
          remember: true,
        })
      );
    } catch (e) {
      /* ignore */
    }
  }

  function isFromLoginPage() {
    try {
      return new URLSearchParams(global.location.search).get("from") === "login";
    } catch (e) {
      return false;
    }
  }

  function bootChangePasswordPage() {
    var form = $("change-password-form");
    if (!form) return;
    bindPasswordToggles(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var oldP = ($("pwd-old") && $("pwd-old").value) || "";
      var newP = ($("pwd-new") && $("pwd-new").value) || "";
      var confirmP = ($("pwd-confirm") && $("pwd-confirm").value) || "";
      if (!oldP || !newP || !confirmP) {
        toast("请填写完整密码信息", "change-pwd-toast");
        return;
      }
      if (newP !== confirmP) {
        toast("两次新密码不一致", "change-pwd-toast");
        return;
      }
      if (!validatePassword(newP)) {
        toast(PASSWORD_HINT, "change-pwd-toast");
        return;
      }
      if (oldP === newP) {
        toast("新密码不能与旧密码相同", "change-pwd-toast");
        return;
      }
      finishPasswordSuccess("修改成功", "change-pwd-toast");
    });
  }

  function bootForgotPassword() {
    var form = $("forgot-form");
    if (!form) return;
    var sendBtn = $("forgot-send-code");
    var phoneInput = $("forgot-phone");
    bindSendCode(sendBtn, phoneInput, "forgot-toast");

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var phone = (phoneInput && phoneInput.value.trim()) || "";
      var code = ($("forgot-code") && $("forgot-code").value.trim()) || "";
      if (!/^1\d{10}$/.test(phone.replace(/\s/g, ""))) {
        toast("请输入有效手机号", "forgot-toast");
        return;
      }
      if (!code) {
        toast("请输入验证码", "forgot-toast");
        return;
      }
      if (code !== DEMO_CODE) {
        toast("验证码错误", "forgot-toast");
        return;
      }
      markResetVerified(phone);
      toast("验证成功", "forgot-toast");
      setTimeout(function () {
        var suffix = isFromLoginPage() ? "?from=login" : "";
        global.location.href = "reset-password.html" + suffix;
      }, 500);
    });
  }

  function bootResetPassword() {
    if (!readResetVerified()) {
      global.location.replace("forgot-password.html");
      return;
    }
    var form = $("reset-password-form");
    if (!form) return;
    bindPasswordToggles(form);

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var newP = ($("reset-pwd-new") && $("reset-pwd-new").value) || "";
      var confirmP = ($("reset-pwd-confirm") && $("reset-pwd-confirm").value) || "";
      if (!newP || !confirmP) {
        toast("请填写完整密码信息", "reset-toast");
        return;
      }
      if (newP !== confirmP) {
        toast("两次新密码不一致", "reset-toast");
        return;
      }
      if (!validatePassword(newP)) {
        toast(PASSWORD_HINT, "reset-toast");
        return;
      }
      clearResetVerified();
      finishPasswordSuccess("修改成功", "reset-toast");
    });
  }

  function bootLoginPage() {
    var form = $("login-form");
    if (!form) return;
    bindPasswordToggles(form);

    var userInput = $("login-user");
    var pwdInput = $("login-pwd");
    var rememberInput = $("login-remember");
    var saved = readRememberLogin();

    if (saved && saved.remember) {
      if (userInput && saved.username) userInput.value = saved.username;
      if (pwdInput && saved.password) pwdInput.value = saved.password;
      if (rememberInput) rememberInput.checked = true;
    }

    form.addEventListener("submit", function (e) {
      e.preventDefault();
      var username = (userInput && userInput.value.trim()) || "";
      var password = (pwdInput && pwdInput.value) || "";
      var remember = !!(rememberInput && rememberInput.checked);
      if (!username || !password) return;
      saveRememberLogin(username, password, remember);
      try {
        if (global.top && global.top !== global) {
          global.top.location.href = "../index.html";
          return;
        }
      } catch (err) {
        /* ignore */
      }
      global.location.href = "../index.html";
    });
  }

  global.WHPasswordMobile = {
    PASSWORD_HINT: PASSWORD_HINT,
    getAppLoginHref: getAppLoginHref,
    navigateToLogin: navigateToLogin,
    validatePassword: validatePassword,
    passwordHintHtml: passwordHintHtml,
    bindPasswordToggles: bindPasswordToggles,
    bootChangePasswordPage: bootChangePasswordPage,
    bootForgotPassword: bootForgotPassword,
    bootResetPassword: bootResetPassword,
    bootLoginPage: bootLoginPage,
    isFromLoginPage: isFromLoginPage,
  };
})(window);
