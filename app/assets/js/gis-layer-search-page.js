/**
 * 移动端图层搜索页 — 读取地图页缓存的标注索引，模糊匹配后回跳定位
 */
(function () {
  "use strict";

  var STORAGE_KEY = "whGisLayerSearchIndex";

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (c) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c];
    });
  }

  function normalizeSearchText(text) {
    return String(text || "")
      .replace(/\s+/g, "")
      .toLowerCase();
  }

  function searchMatchScore(query, target) {
    var q = normalizeSearchText(query);
    var n = normalizeSearchText(target);
    if (!q) return 0;
    if (!n) return -1;
    if (n.indexOf(q) >= 0) return 100 + (q.length / Math.max(n.length, 1)) * 40;
    var qi = 0;
    for (var i = 0; i < n.length && qi < q.length; i++) {
      if (n.charAt(i) === q.charAt(qi)) qi++;
    }
    if (qi === q.length) return 50 + (qi / Math.max(n.length, 1)) * 30;
    return -1;
  }

  function entrySearchScore(entry, query) {
    var best = searchMatchScore(query, entry.name);
    if (entry.aliases) {
      entry.aliases.forEach(function (alias) {
        var s = searchMatchScore(query, alias);
        if (s > best) best = s;
      });
    }
    return best;
  }

  function readIndex() {
    if (window.WuhanGIS && typeof window.WuhanGIS.readLayerSearchIndex === "function") {
      return window.WuhanGIS.readLayerSearchIndex();
    }
    try {
      var raw = sessionStorage.getItem(STORAGE_KEY);
      return raw ? JSON.parse(raw) : [];
    } catch (e) {
      return [];
    }
  }

  function filterIndex(index, query) {
    if (window.WuhanGIS && typeof window.WuhanGIS.filterLayerSearchIndex === "function") {
      return window.WuhanGIS.filterLayerSearchIndex(index, query, 50).map(function (row) {
        return row.entry;
      });
    }
    var q = (query || "").trim();
    if (!q) return [];
    return index
      .map(function (entry) {
        return { entry: entry, score: entrySearchScore(entry, q) };
      })
      .filter(function (row) {
        return row.score > 0;
      })
      .sort(function (a, b) {
        return b.score - a.score;
      })
      .slice(0, 50)
      .map(function (row) {
        return row.entry;
      });
  }

  function ready(fn) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", fn);
    } else {
      fn();
    }
  }

  ready(function () {
    var input = document.getElementById("gis-search-input");
    var listEl = document.getElementById("gis-search-list");
    var hintEl = document.getElementById("gis-search-hint");
    var clearBtn = document.getElementById("gis-search-clear");
    var backBtn = document.getElementById("gis-search-back");
    if (!input || !listEl) return;

    var index = readIndex();

    function goBack() {
      if (window.history.length > 1) {
        window.history.back();
        return;
      }
      window.location.href = "gis.html";
    }

    if (backBtn) {
      backBtn.addEventListener("click", goBack);
    }

    function pickEntry(entry) {
      if (!entry || !entry.id) return;
      window.location.href = "gis.html?gisPick=" + encodeURIComponent(entry.id);
    }

    function renderList(query) {
      var q = (query || "").trim();
      if (!index.length) {
        listEl.innerHTML =
          '<div class="gis-search-page__empty">暂无搜索数据，请先打开<a href="gis.html">全景地图</a>加载标注后再试。</div>';
        if (hintEl) hintEl.hidden = true;
        return;
      }

      if (hintEl) hintEl.hidden = false;

      if (!q) {
        listEl.innerHTML =
          '<div class="gis-search-page__empty">输入关键词，将显示匹配的站点、项目、告警点等标注</div>';
        return;
      }

      var hits = filterIndex(index, q);
      if (!hits.length) {
        listEl.innerHTML = '<div class="gis-search-page__empty">未找到匹配的标注，请更换关键词</div>';
        return;
      }

      listEl.innerHTML = hits
        .map(function (entry) {
          return (
            '<button type="button" class="gis-search-page__item" role="option" data-pick-id="' +
            esc(entry.id) +
            '">' +
            '<span class="gis-search-page__item-name">' +
            esc(entry.name) +
            "</span>" +
            '<span class="gis-search-page__item-type">' +
            esc(entry.typeLabel || "标注") +
            "</span>" +
            "</button>"
          );
        })
        .join("");

      listEl.querySelectorAll(".gis-search-page__item").forEach(function (btn) {
        btn.addEventListener("click", function () {
          var id = btn.getAttribute("data-pick-id");
          var entry = hits.find(function (e) {
            return e.id === id;
          });
          if (entry) pickEntry(entry);
        });
      });
    }

    function syncClear() {
      if (!clearBtn) return;
      clearBtn.hidden = !(input.value || "").length;
    }

    input.addEventListener("input", function () {
      syncClear();
      renderList(input.value);
    });

    input.addEventListener("keydown", function (e) {
      if (e.key === "Enter") {
        e.preventDefault();
        var first = listEl.querySelector(".gis-search-page__item");
        if (first) first.click();
      }
    });

    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        syncClear();
        renderList("");
        input.focus();
      });
    }

    try {
      var params = new URLSearchParams(window.location.search);
      var initialQ = params.get("q") || "";
      if (initialQ) {
        input.value = initialQ;
      }
    } catch (e) {}

    syncClear();
    renderList(input.value);
    input.focus();
    if (input.value) {
      var len = input.value.length;
      if (input.setSelectionRange) input.setSelectionRange(len, len);
    }
  });
})();
