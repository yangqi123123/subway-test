/**
 * 我的工作台 — 横向超级卡片菜单（与 menu-config.WB_MEGA 同步）
 */
(function (global) {
  function leafIcon(key) {
    var icon = "fa-regular fa-file-lines";
    if (key.indexOf("am-") === 0) icon = "fa-solid fa-train-subway";
    if (key.indexOf("dc-") === 0) icon = "fa-solid fa-database";
    if (key.indexOf("in-") === 0) icon = "fa-solid fa-route";
    if (key.indexOf("wb-") === 0) icon = "fa-solid fa-briefcase";
    return icon;
  }

  function ensureCss() {
    if (document.getElementById("wb-mega-css")) return;
    var link = document.createElement("link");
    link.id = "wb-mega-css";
    link.rel = "stylesheet";
    link.href = typeof whAsset === "function" ? whAsset("assets/css/wb-mega.css") : "assets/css/wb-mega.css";
    document.head.appendChild(link);
  }

  function wbPageHref(href) {
    if (typeof whPageHref === "function") return whPageHref(href);
    return href;
  }

  function wbLeafHtml(item, activeKey, sub) {
    var isActive = item.key === activeKey;
    var cls =
      "wh-wb-leaf" +
      (sub ? " wh-wb-leaf--sub" : "") +
      (isActive ? " wh-wb-leaf--active" : "");
    return (
      '<a class="' +
      cls +
      '" href="' +
      wbPageHref(item.href) +
      '" data-wb-key="' +
      item.key +
      '" data-wb-label="' +
      item.label +
      '" title="' +
      item.label +
      '">' +
      '<i class="' +
      leafIcon(item.key) +
      ' wh-wb-leaf__ico"></i>' +
      '<span class="wh-wb-leaf__label">' +
      item.label +
      "</span></a>"
    );
  }

  function bindSearch(wrap) {
    var input = wrap.querySelector("#wh-wb-mega-search-input");
    var clearBtn = wrap.querySelector("#wh-wb-mega-search-clear");
    if (!input) return;
    function runFilter() {
      var q = (input.value || "").trim().toLowerCase();
      var anyVisible = false;
      wrap.querySelectorAll(".wh-wb-mega-col").forEach(function (col) {
        var colVisible = false;
        col.querySelectorAll(".wh-wb-leaf").forEach(function (leaf) {
          var label = (leaf.getAttribute("data-wb-label") || "").toLowerCase();
          var match = !q || label.indexOf(q) > -1;
          leaf.style.display = match ? "" : "none";
          if (match) colVisible = true;
        });
        col.querySelectorAll(".wh-wb-group").forEach(function (group) {
          var hasVisible = false;
          group.querySelectorAll(".wh-wb-leaf").forEach(function (leaf) {
            if (leaf.style.display !== "none") hasVisible = true;
          });
          if (q && hasVisible) group.classList.remove("is-collapsed");
          group.style.display = !q || hasVisible ? "" : "none";
        });
        col.classList.toggle("is-hidden", !!q && !colVisible);
        if (!q || colVisible) anyVisible = true;
      });
      wrap.classList.toggle("is-filter-empty", !!q && !anyVisible);
    }
    input.addEventListener("input", runFilter);
    if (clearBtn) {
      clearBtn.addEventListener("click", function () {
        input.value = "";
        runFilter();
        input.focus();
      });
    }
  }

  function build(activeKey) {
    if (typeof WHMetroMenu === "undefined" || !WHMetroMenu.WB_MEGA) return null;
    ensureCss();
    var wrap = document.createElement("div");
    wrap.className = "wh-wb-mega-wrap";
    wrap.id = "wh-wb-mega";

    var searchRow = document.createElement("div");
    searchRow.className = "wh-wb-mega-search";
    searchRow.innerHTML =
      '<i class="fa-solid fa-magnifying-glass" aria-hidden="true"></i>' +
      '<input type="search" id="wh-wb-mega-search-input" placeholder="搜索菜单或功能" autocomplete="off" />' +
      '<button type="button" class="wh-wb-mega-search__clear" id="wh-wb-mega-search-clear" title="清空" aria-label="清空搜索">×</button>';
    wrap.appendChild(searchRow);

    var grid = document.createElement("div");
    grid.className = "wh-wb-mega-grid";
    grid.id = "wh-wb-mega-grid";

    WHMetroMenu.WB_MEGA.forEach(function (card) {
      var col = document.createElement("div");
      col.className = "wh-wb-mega-col wh-wb-mega-col--" + (card.tone || "cyan");
      col.setAttribute("data-wb-card", card.key);

      var head = document.createElement("div");
      head.className = "wh-wb-mega-col__head";
      head.innerHTML =
        '<div class="wh-wb-mega-col__icon"><i class="' +
        (card.icon || "fa-solid fa-layer-group") +
        '"></i></div>' +
        '<span class="wh-wb-mega-col__title">' +
        card.title +
        "</span>";

      var body = document.createElement("div");
      body.className = "wh-wb-mega-col__body";

      card.blocks.forEach(function (block) {
        if (block.subtitle) {
          var group = document.createElement("div");
          group.className = "wh-wb-group";
          group.setAttribute("data-wb-group", block.subtitle);

          var gh = document.createElement("button");
          gh.type = "button";
          gh.className = "wh-wb-group__head";
          gh.innerHTML =
            '<i class="fa-regular fa-folder wh-wb-group__folder"></i><span>' +
            block.subtitle +
            "</span>";

          var gb = document.createElement("div");
          gb.className = "wh-wb-group__body";
          (block.items || []).forEach(function (it) {
            if (it.hidden) return;
            gb.insertAdjacentHTML("beforeend", wbLeafHtml(it, activeKey, true));
          });

          gh.addEventListener("click", function () {
            group.classList.toggle("is-collapsed");
          });

          group.appendChild(gh);
          group.appendChild(gb);
          body.appendChild(group);
        } else {
          (block.items || []).forEach(function (it) {
            if (it.hidden) return;
            body.insertAdjacentHTML("beforeend", wbLeafHtml(it, activeKey, false));
          });
        }
      });

      col.appendChild(head);
      col.appendChild(body);
      grid.appendChild(col);
    });

    wrap.appendChild(grid);

    var empty = document.createElement("div");
    empty.className = "wh-wb-mega-empty";
    empty.id = "wh-wb-mega-empty";
    empty.textContent = "未找到匹配的菜单项";
    wrap.appendChild(empty);

    bindSearch(wrap);
    var activeLeaf = wrap.querySelector(".wh-wb-leaf--active");
    if (activeLeaf) {
      requestAnimationFrame(function () {
        activeLeaf.scrollIntoView({ block: "nearest", behavior: "smooth" });
      });
    }
    return wrap;
  }

  global.WHWorkbenchMega = { build: build, ensureCss: ensureCss };
})(typeof window !== "undefined" ? window : this);
