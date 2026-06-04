/**
 * 移动端设置 — 全景地图巡查色块清空
 */
(function (global) {
  "use strict";

  function $(id) {
    return document.getElementById(id);
  }

  function toast(msg) {
    var el = $("ops-settings-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("show");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.remove("show");
    }, 2200);
  }

  function bootOpsSettingsPage() {
    var S = global.MapPatrolClearSettings;
    if (!S) return;

    function refreshUi() {
      var summary = S.getSummary();
      var interval = $("ops-clear-interval");
      if (interval) interval.value = String(summary.intervalDays);
      var seeded = $("ops-meta-seeded");
      if (seeded) seeded.textContent = summary.zonesSeededText;
      var next = $("ops-meta-next");
      if (next) next.textContent = summary.nextClearText;
      var wrap = $("ops-clear-status-wrap");
      var status = $("ops-clear-status");
      if (wrap && status) {
        if (summary.zonesSuppressed && summary.statusText) {
          wrap.hidden = false;
          status.textContent = summary.statusText;
          status.classList.add("is-cleared");
        } else {
          wrap.hidden = true;
          status.textContent = "";
          status.classList.remove("is-cleared");
        }
      }
    }

    var saveBtn = $("ops-save-interval");
    if (saveBtn) {
      saveBtn.addEventListener("click", function () {
        S.setIntervalDays($("ops-clear-interval").value);
        refreshUi();
        toast("清空间隔已保存");
      });
    }

    var clearBtn = $("ops-clear-now");
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        S.performClear();
        refreshUi();
        toast("已清空巡查色块，打开地图后生效");
      });
    }

    refreshUi();
  }

  global.WHOpsSettingsPage = { boot: bootOpsSettingsPage };
})(window);
