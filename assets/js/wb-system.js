(function () {
  (function loadSystemMgmtQuickLinks() {
    if (window.SystemMgmtQuickLinks) return;
    var cur = document.currentScript;
    if (!cur || !cur.src) return;
    var url = cur.src.replace(/wb-system\.js(?:\?.*)?$/, "system-mgmt-quick-links.js");
    var s = document.createElement("script");
    s.id = "wh-system-mgmt-quick-links";
    s.src = url;
    s.async = false;
    cur.parentNode.insertBefore(s, cur.nextSibling);
  })();

  function $(id) {
    return document.getElementById(id);
  }

  function el(tag, cls, html) {
    var node = document.createElement(tag);
    if (cls) node.className = cls;
    if (html != null) node.innerHTML = html;
    return node;
  }

  function getValue(row, key) {
    return row && row[key] != null ? row[key] : "";
  }

  function toast(message) {
    var box = $("wb-toast");
    if (!box) return;
    box.textContent = message;
    box.classList.remove("hidden");
    clearTimeout(toast._timer);
    toast._timer = setTimeout(function () {
      box.classList.add("hidden");
    }, 1600);
  }

  function createModal() {
    var mask = el("div", "wb-modal-mask");
    mask.id = "wb-modal-mask";
    mask.innerHTML =
      '<div class="wb-modal-card">' +
      '  <div class="wb-modal-head">' +
      '    <div class="wb-modal-title" id="wb-modal-title">编辑</div>' +
      '    <button type="button" class="wh-modal-close wb-modal-close" id="wb-modal-close" aria-label="关闭">×</button>' +
      "  </div>" +
      '  <div id="wb-modal-body"></div>' +
      '  <div class="wb-modal-foot">' +
      '    <button type="button" class="wh-btn-ghost px-4 py-2 text-sm" id="wb-modal-cancel">取消</button>' +
      '    <button type="button" class="wh-btn-primary px-4 py-2 text-sm" id="wb-modal-save">确定</button>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(mask);
    $("wb-modal-close").onclick = closeModal;
    $("wb-modal-cancel").onclick = closeModal;
    mask.addEventListener("click", function (event) {
      if (event.target === mask) closeModal();
    });
  }

  function openModal(title, bodyHtml, onSave, onOpen, options) {
    options = options || {};
    if (!$("wb-modal-mask")) createModal();
    var card = $("wb-modal-mask").querySelector(".wb-modal-card");
    if (card) card.className = "wb-modal-card" + (options.size ? " wb-modal-card--" + options.size : "");
    $("wb-modal-title").textContent = title;
    $("wb-modal-body").innerHTML = bodyHtml;
    $("wb-modal-mask").classList.add("show");
    var saveBtn = $("wb-modal-save");
    saveBtn.textContent = options.saveLabel || "确定";
    saveBtn.style.display = options.hideSave ? "none" : "";
    saveBtn.onclick = function () {
      var result;
      if (typeof onSave === "function") result = onSave();
      if (result === false) return;
      if (!options.keepOpen) closeModal();
    };
    if (typeof onOpen === "function") onOpen();
  }

  function resolveFormHtml(page, row) {
    if (typeof page.buildFormHtml === "function") return page.buildFormHtml(row);
    return createFormHtml(page.formFields, row);
  }

  function readModalFormData() {
    var data = {};
    document.querySelectorAll("#wb-modal-body [data-form]").forEach(function (el) {
      data[el.getAttribute("data-form")] = el.value;
    });
    return data;
  }

  function openRecordModal(page, title, row, successText) {
    openModal(
      title,
      resolveFormHtml(page, row),
      function () {
        if (typeof page.onModalSave === "function") {
          var data =
            typeof WBMsgTemplateForm !== "undefined" && WBMsgTemplateForm.collectMsgTemplateFormData
              ? WBMsgTemplateForm.collectMsgTemplateFormData()
              : readModalFormData();
          if (page.onModalSave(row, data) === false) return;
        }
        toast(successText || "已保存");
        if (typeof window.__wbRender === "function") window.__wbRender();
      },
      function () {
        if (typeof page.onFormOpen === "function") page.onFormOpen(row);
      },
      { size: page.modalSize }
    );
  }

  function closeModal() {
    var mask = $("wb-modal-mask");
    if (mask) {
      mask.classList.remove("show");
      var card = mask.querySelector(".wb-modal-card");
      if (card) card.className = "wb-modal-card";
      var saveBtn = $("wb-modal-save");
      if (saveBtn) {
        saveBtn.style.display = "";
        saveBtn.textContent = "确定";
      }
    }
  }

  function escapeDetailHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (char) {
      return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
    });
  }

  function createDetailModal() {
    if ($("wb-detail-mask")) return;
    var mask = el("div", "wb-detail-mask");
    mask.id = "wb-detail-mask";
    mask.setAttribute("aria-hidden", "true");
    mask.innerHTML =
      '<div class="wb-detail-dialog" role="dialog" aria-labelledby="wb-detail-title">' +
      '  <div class="wb-detail-dialog__head">' +
      '    <div>' +
      '      <h3 id="wb-detail-title" class="text-white font-semibold text-sm m-0">查看详情</h3>' +
      '      <div id="wb-detail-subtitle" class="text-[11px] text-slate-400 mt-0.5"></div>' +
      "    </div>" +
      '    <button type="button" class="wh-modal-close text-slate-400 hover:text-white text-xl leading-none" id="wb-detail-close" aria-label="关闭">×</button>' +
      "  </div>" +
      '  <div id="wb-detail-body" class="wb-detail-dialog__body"></div>' +
      '  <div class="wb-detail-dialog__foot">' +
      '    <button type="button" class="px-6 h-8 rounded text-xs wh-btn-ghost" id="wb-detail-foot-close">关闭</button>' +
      "  </div>" +
      "</div>";
    document.body.appendChild(mask);
    function closeDetailModal() {
      mask.classList.remove("show");
      mask.setAttribute("aria-hidden", "true");
    }
    $("wb-detail-close").onclick = closeDetailModal;
    $("wb-detail-foot-close").onclick = closeDetailModal;
    mask.addEventListener("click", function (event) {
      if (event.target === mask) closeDetailModal();
    });
  }

  function openDetailModal(page, row) {
    if (!page || typeof page.buildDetailHtml !== "function" || !row) return;
    createDetailModal();
    var mask = $("wb-detail-mask");
    var subtitleEl = $("wb-detail-subtitle");
    var bodyEl = $("wb-detail-body");
    var subtitle =
      typeof page.detailSubtitle === "function"
        ? page.detailSubtitle(row)
        : row.templateName || row.name || row.roleName || "";
    if (subtitleEl) subtitleEl.textContent = subtitle || page.detailPanelLabel || page.title || "详情";
    if (bodyEl) bodyEl.innerHTML = page.buildDetailHtml(row, page);
    mask.classList.add("show");
    mask.setAttribute("aria-hidden", "false");
  }

  function closeDetailModal() {
    var mask = $("wb-detail-mask");
    if (!mask) return;
    mask.classList.remove("show");
    mask.setAttribute("aria-hidden", "true");
  }

  function confirmAction(message, onConfirm) {
    openModal(
      "操作确认",
      '<div class="px-5 py-8 text-sm leading-7 text-slate-200">' + message + "</div>",
      function () {
        if (typeof onConfirm === "function") onConfirm();
      }
    );
  }

  function statusSwitch(on, onToggle) {
    var btn = el("button", "wb-status-switch" + (on ? " on" : ""));
    btn.type = "button";
    btn.onclick = function () {
      if (typeof onToggle === "function") onToggle();
    };
    return btn;
  }

  function actionBtn(label, cls, fn) {
    var btn = el("button", "wb-action-btn" + (cls ? " " + cls : ""), label);
    btn.type = "button";
    btn.onclick = fn;
    return btn;
  }

  function normalizeOptions(options) {
    return (options || []).map(function (item) {
      return typeof item === "string" ? { label: item, value: item } : item;
    });
  }

  function simplePageShell(root, page) {
    var badge = page.panelBadge || "深色系统原型 · Mock 交互";
    root.innerHTML =
      '<div class="wb-page">' +
      '  <div class="wb-head">' +
      "    <h1>" +
      page.title +
      "</h1>" +
      '    <span class="text-[10px] rounded-md border border-cyan-400/25 bg-cyan-500/5 px-2 py-1 text-cyan-100/80">' +
      badge +
      "</span>" +
      "  </div>" +
      "</div>";
  }

  function getTreeScopedRows(page) {
    return page.getRows ? page.getRows.call(page) : page.rows || [];
  }

  function flattenTreeDataRows(rows, bucket) {
    bucket = bucket || [];
    (rows || []).forEach(function (row) {
      bucket.push(row);
      if (row.children && row.children.length) flattenTreeDataRows(row.children, bucket);
    });
    return bucket;
  }

  function getDiseaseScopeRows(page) {
    if (page.pageType === "menu") return flattenTreeDataRows(page.rows || []);
    if (page.pageType === "log" && typeof page.getCurrentTab === "function") {
      return page.getCurrentTab().rows || [];
    }
    return getTreeScopedRows(page);
  }

  function countDiseaseStatPair(page, rows) {
    if (typeof page.diseaseStatCount === "function") return page.diseaseStatCount(rows);
    var enabled = 0;
    var disabled = 0;
    (rows || []).forEach(function (row) {
      if (row.status === true) enabled++;
      else if (row.status === false) disabled++;
    });
    return { enabled: enabled, disabled: disabled };
  }

  function getFilteredRows(page) {
    return filterRows(page, getTreeScopedRows(page));
  }

  function userStatusLabel(row) {
    if (row.status === true) return "启用";
    if (row.status === false) return "停用";
    return "";
  }

  function matchStatusFilter(row, value) {
    if (!value) return true;
    return userStatusLabel(row) === value;
  }

  function filterRowsForPage(page, rows) {
    return (rows || []).filter(function (row) {
      return (page.filters || []).every(function (filter) {
        if (filter.type === "daterange") return true;
        var value = page.filterState[filter.key];
        if (!value) return true;
        if (filter.key === "statusText") return matchStatusFilter(row, value);
        return String(getValue(row, filter.key)).indexOf(String(value)) > -1;
      });
    });
  }

  function updateDiseaseStats(page, filteredRows) {
    var scoped = getDiseaseScopeRows(page);
    var filtered = filteredRows || filterRowsForPage(page, scoped);
    var pair = countDiseaseStatPair(page, filtered);
    var enabled = pair.enabled;
    var disabled = pair.disabled;
    var map = {
      "wb-stat-total": String(scoped.length),
      "wb-stat-filtered": String(filtered.length),
      "wb-stat-enabled": String(enabled),
      "wb-stat-disabled": String(disabled),
    };
    Object.keys(map).forEach(function (id) {
      var node = $(id);
      if (node) node.textContent = map[id];
    });
  }

  function bindFilterInputs(panel, page) {
    panel.querySelectorAll("[data-filter]").forEach(function (input) {
      var key = input.getAttribute("data-filter");
      var value = page.filterState[key] || "";
      if (input.tagName === "SELECT") input.value = value;
      else input.value = value;
    });
  }

  function collectFilterState(panel, page) {
    panel.querySelectorAll("[data-filter]").forEach(function (input) {
      page.filterState[input.getAttribute("data-filter")] = input.value.trim();
    });
  }

  function buildFilterFieldHtml(filter, page) {
    var value = page.filterState[filter.key] || "";
    var html = "<label><span>" + filter.label + "</span>";
    if (filter.type === "select") {
      html += '<select class="wh-input w-full px-2" data-filter="' + filter.key + '">';
      html += '<option value="">全部</option>';
      normalizeOptions(filter.options).forEach(function (opt) {
        html +=
          '<option value="' +
          opt.value +
          '"' +
          (String(opt.value) === String(value) ? " selected" : "") +
          ">" +
          opt.label +
          "</option>";
      });
      html += "</select>";
    } else {
      html +=
        '<input class="wh-input w-full" data-filter="' +
        filter.key +
        '" value="' +
        value +
        '" placeholder="请输入' +
        filter.label +
        '" />';
    }
    html += "</label>";
    return html;
  }

  function buildDiseaseFilterPanel(page) {
    var panel = el("div", "disease-filter-panel");
    panel.innerHTML =
      '<div class="disease-panel-title"><i class="fa-solid fa-filter mr-2 text-cyan-400"></i>快捷筛选</div>';
    var body = el("div", "disease-panel-body");
    (page.filters || []).forEach(function (filter) {
      var wrap = el("div");
      wrap.innerHTML = buildFilterFieldHtml(filter, page);
      body.appendChild(wrap.firstChild);
    });
    var actions = el("div", "disease-filter-actions");
    var search = el("button", "wh-btn-primary", "搜索");
    var reset = el("button", "wh-btn-ghost", "重置");
    search.type = "button";
    reset.type = "button";
    search.onclick = function () {
      collectFilterState(body, page);
      page.pageState.page = 1;
      window.__wbRender();
    };
    reset.onclick = function () {
      page.filterState = {};
      page.pageState.page = 1;
      window.__wbRender();
    };
    actions.appendChild(search);
    actions.appendChild(reset);
    body.appendChild(actions);
    panel.appendChild(body);
    return panel;
  }

  function buildDiseaseQuickPanel(page) {
    var panel = el("div", "disease-quick-panel");
    panel.innerHTML =
      '<div class="disease-panel-title"><i class="fa-solid fa-bolt mr-2 text-cyan-400"></i>快捷操作</div>';
    var body = el("div", "disease-panel-body");
    (page.quickLinks || []).forEach(function (link) {
      var anchor = el(
        "a",
        "disease-quick-link" + (link.active ? " is-active" : ""),
        '<i class="fa-solid ' +
          link.icon +
          '"></i><span>' +
          link.label +
          "</span>"
      );
      anchor.href = link.href;
      anchor.setAttribute("data-quick-href", link.path || link.href);
      body.appendChild(anchor);
    });
    panel.appendChild(body);
    body.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
      var target = anchor.getAttribute("data-quick-href");
      if (target && typeof whPageHref === "function") anchor.setAttribute("href", whPageHref(target));
    });
    return panel;
  }

  function buildDiseaseStats(page) {
    var scoped = getDiseaseScopeRows(page);
    var filtered = filterRowsForPage(page, scoped);
    var pair = countDiseaseStatPair(page, filtered);
    var enabled = pair.enabled;
    var disabled = pair.disabled;
    var labels = page.diseaseStatLabels || {};
    var totalLabel = labels.total || "部门用户";
    var totalTrend = labels.totalTrend || "当前组织";
    var totalIcon = labels.totalIcon || "fa-users";
    var filteredLabel = labels.filtered || "当前列表";
    var filteredTrend = labels.filteredTrend || "筛选结果";
    var enabledLabel = labels.enabled || "启用";
    var disabledLabel = labels.disabled || "停用";
    var enabledTrend = labels.enabledTrend || "账号状态";
    var disabledTrend = labels.disabledTrend || "账号状态";
    var wrap = el("div", "disease-stats");
    wrap.setAttribute("aria-label", page.title + "统计");
    wrap.innerHTML =
      '<div class="disease-stat-card disease-stat-card--blue"><div class="disease-stat-card__icon"><i class="fa-solid ' +
      totalIcon +
      '"></i></div><div><div id="wb-stat-total" class="disease-stat-card__value">' +
      scoped.length +
      '</div><div class="disease-stat-card__label">' +
      totalLabel +
      '</div><div class="disease-stat-card__trend">' +
      totalTrend +
      '</div></div></div>' +
      '<div class="disease-stat-card disease-stat-card--cyan"><div class="disease-stat-card__icon"><i class="fa-solid fa-list"></i></div><div><div id="wb-stat-filtered" class="disease-stat-card__value">' +
      filtered.length +
      '</div><div class="disease-stat-card__label">' +
      filteredLabel +
      '</div><div class="disease-stat-card__trend">' +
      filteredTrend +
      '</div></div></div>' +
      '<div class="disease-stat-card disease-stat-card--green"><div class="disease-stat-card__icon"><i class="fa-solid fa-circle-check"></i></div><div><div id="wb-stat-enabled" class="disease-stat-card__value">' +
      enabled +
      '</div><div class="disease-stat-card__label">' +
      enabledLabel +
      '</div><div class="disease-stat-card__trend">' +
      enabledTrend +
      '</div></div></div>' +
      '<div class="disease-stat-card disease-stat-card--amber"><div class="disease-stat-card__icon"><i class="fa-solid fa-ban"></i></div><div><div id="wb-stat-disabled" class="disease-stat-card__value">' +
      disabled +
      '</div><div class="disease-stat-card__label">' +
      disabledLabel +
      '</div><div class="disease-stat-card__trend">' +
      disabledTrend +
      "</div></div></div>";
    return wrap;
  }

  function appendDiseaseRightColumn(layout, page) {
    var right = el("aside", "disease-layout__right");
    right.setAttribute("aria-label", "筛选与快捷操作");
    right.appendChild(buildDiseaseFilterPanel(page));
    if (page.quickLinks && page.quickLinks.length) right.appendChild(buildDiseaseQuickPanel(page));
    layout.appendChild(right);
  }

  function buildDiseaseToolbar(page) {
    var toolbar = el("div", "disease-list-toolbar");
    (page.primaryButtons || []).forEach(function (btn) {
      var button = el(
        "button",
        "px-4 py-1.5 rounded text-xs " + (btn.variant === "ghost" ? "wh-btn-ghost" : "wh-btn-primary"),
        btn.label
      );
      button.type = "button";
      button.onclick = function () {
        if (btn.action === "add") {
          openRecordModal(page, btn.modalTitle || page.addTitle || "新增", null, (btn.modalTitle || "新增") + "成功");
          return;
        }
        if (btn.action === "import") {
          if (typeof page.openImport === "function") page.openImport();
          else toast("导入功能已打开");
          return;
        }
        toast(btn.tip || btn.label + "已执行");
      };
      toolbar.appendChild(button);
    });
    return toolbar;
  }

  function renderDiseaseTreeTablePage(root, page) {
    simplePageShell(root, page);
    var wrap = root.firstElementChild;

    var section = el("section");
    var layout = el("div", "disease-layout");
    var left = el("div", "disease-layout__left");

    left.appendChild(buildDiseaseStats(page));
    left.appendChild(buildDiseaseToolbar(page));

    var innerLayout = el("div", "wb-layout");
    var treePanel = el("section", "neon-panel neon-panel--tight p-3 wb-tree-panel");
    treePanel.innerHTML =
      '<div class="wb-tree-search"><i class="fa-solid fa-magnifying-glass"></i><input class="wh-input" placeholder="搜索节点" /></div>';
    treePanel.appendChild(
      buildTree(
        page.treeData,
        page.selectedTreeId,
        function (node) {
          page.selectedTreeId = node.id;
          page.pageState.page = 1;
          window.__wbRender();
        },
        page.expandedMap
      )
    );
    innerLayout.appendChild(treePanel);

    var mainPanel = el("div", "wb-main-panel");
    var scoped = getDiseaseScopeRows(page);
    updateDiseaseStats(page, filterRowsForPage(page, scoped));
    renderTableOnly(mainPanel, page, scoped);
    innerLayout.appendChild(mainPanel);
    left.appendChild(innerLayout);

    layout.appendChild(left);
    appendDiseaseRightColumn(layout, page);

    section.appendChild(layout);
    wrap.appendChild(section);
  }

  function renderDiseaseTablePage(root, page) {
    simplePageShell(root, page);
    var wrap = root.firstElementChild;

    var section = el("section");
    var layout = el("div", "disease-layout");
    var left = el("div", "disease-layout__left");

    left.appendChild(buildDiseaseStats(page));
    left.appendChild(buildDiseaseToolbar(page));

    var mainPanel = el("div", "wb-main-panel");
    var scoped = getDiseaseScopeRows(page);
    updateDiseaseStats(page, filterRowsForPage(page, scoped));
    renderTableOnly(mainPanel, page, scoped);
    left.appendChild(mainPanel);

    layout.appendChild(left);
    appendDiseaseRightColumn(layout, page);

    section.appendChild(layout);
    wrap.appendChild(section);
  }

  function renderSearch(container, page) {
    if (!page.filters || !page.filters.length) return;
    var panel = el("section", "neon-panel neon-panel--tight p-4");
    var grid = el("div", "wb-search-grid");
    (page.filters || []).forEach(function (filter) {
      var item = el("div", "wb-search-item");
      var value = page.filterState[filter.key] || "";
      var content = "<label>" + filter.label + "</label>";
      if (filter.type === "select") {
        content += '<select class="wh-input" data-filter="' + filter.key + '">';
        content += '<option value="">全部</option>';
        normalizeOptions(filter.options).forEach(function (opt) {
          content +=
            '<option value="' +
            opt.value +
            '"' +
            (String(opt.value) === String(value) ? " selected" : "") +
            ">" +
            opt.label +
            "</option>";
        });
        content += "</select>";
      } else if (filter.type === "daterange") {
        var start = page.filterState[filter.startKey] || "";
        var end = page.filterState[filter.endKey] || "";
        content +=
          '<div class="grid grid-cols-2 gap-2">' +
          '<input class="wh-input" type="date" data-filter="' +
          filter.startKey +
          '" value="' +
          start +
          '" />' +
          '<input class="wh-input" type="date" data-filter="' +
          filter.endKey +
          '" value="' +
          end +
          '" />' +
          "</div>";
      } else {
        content +=
          '<input class="wh-input" data-filter="' +
          filter.key +
          '" value="' +
          value +
          '" placeholder="请输入' +
          filter.label +
          '" />';
      }
      item.innerHTML = content;
      grid.appendChild(item);
    });
    panel.appendChild(grid);

    var foot = el("div", "wb-toolbar mt-4");
    var left = el("div", "flex flex-wrap items-center gap-2");
    var right = el("div", "wb-toolbar-right");
    var search = el("button", "wh-btn-primary px-4 py-2 text-sm", "搜索");
    var reset = el("button", "wh-btn-ghost px-4 py-2 text-sm", "重置");

    search.onclick = function () {
      panel.querySelectorAll("[data-filter]").forEach(function (input) {
        page.filterState[input.getAttribute("data-filter")] = input.value.trim();
      });
      page.pageState.page = 1;
      window.__wbRender();
    };

    reset.onclick = function () {
      page.filterState = {};
      page.pageState.page = 1;
      window.__wbRender();
    };

    left.appendChild(search);
    left.appendChild(reset);

    (page.primaryButtons || []).forEach(function (btn) {
      var button = el(
        "button",
        "wh-btn-primary px-4 py-2 rounded-md text-xs font-semibold transition-ui",
        btn.label
      );
      button.onclick = function () {
        if (btn.action === "add") {
          openRecordModal(page, btn.modalTitle || page.addTitle || "新增", null, (btn.modalTitle || "新增") + "成功");
          return;
        }
        if (btn.action === "import") {
          if (typeof page.openImport === "function") page.openImport();
          else toast("导入功能已打开");
          return;
        }
        toast(btn.tip || btn.label + "已执行");
      };
      right.appendChild(button);
    });

    foot.appendChild(left);
    foot.appendChild(right);
    panel.appendChild(foot);
    container.appendChild(panel);
  }

  function paginate(list, state) {
    var pageSize = state.pageSize || 10;
    var page = state.page || 1;
    var total = list.length;
    var start = (page - 1) * pageSize;
    return {
      total: total,
      page: page,
      pageSize: pageSize,
      pages: Math.max(1, Math.ceil(total / pageSize)),
      rows: list.slice(start, start + pageSize),
    };
  }

  function buildPager(meta, state) {
    var pager = el("div", "wb-pagination");
    pager.innerHTML = '<span>共 <b class="text-cyan-200">' + meta.total + "</b> 条记录</span>";
    var right = el("div", "wb-pagination-right");
    var prev = el("button", "wh-btn-ghost px-3 py-1.5 text-xs", "上一页");
    var next = el("button", "wh-btn-ghost px-3 py-1.5 text-xs", "下一页");
    var pageBtn = el("button", "wh-btn-primary px-3 py-1.5 text-xs", String(meta.page));
    var size = el(
      "select",
      "wh-input px-2 py-1 text-[11px]",
      '<option value="10"' +
        (meta.pageSize === 10 ? " selected" : "") +
        ">10 条/页</option>" +
        '<option value="20"' +
        (meta.pageSize === 20 ? " selected" : "") +
        ">20 条/页</option>" +
        '<option value="50"' +
        (meta.pageSize === 50 ? " selected" : "") +
        ">50 条/页</option>"
    );

    prev.onclick = function () {
      state.page = Math.max(1, meta.page - 1);
      window.__wbRender();
    };
    next.onclick = function () {
      state.page = Math.min(meta.pages, meta.page + 1);
      window.__wbRender();
    };
    size.onchange = function () {
      state.pageSize = parseInt(this.value, 10);
      state.page = 1;
      window.__wbRender();
    };

    right.appendChild(prev);
    right.appendChild(pageBtn);
    right.appendChild(next);
    right.appendChild(size);
    pager.appendChild(right);
    return pager;
  }

  function createFormHtml(fields, row) {
    return (
      '<div class="wb-form-grid">' +
      (fields || [])
        .map(function (field) {
          var value = getValue(row, field.key);
          var html =
            '<div class="wb-form-item' +
            (field.full ? " wb-form-item--full" : "") +
            '">' +
            "<label>" +
            (field.required ? '<span class="text-rose-400">*</span> ' : "") +
            field.label +
            "</label>";

          if (field.type === "textarea") {
            html += '<textarea class="wh-input" data-form="' + field.key + '">' + value + "</textarea>";
          } else if (field.type === "select") {
            html += '<select class="wh-input" data-form="' + field.key + '">';
            normalizeOptions(field.options).forEach(function (opt) {
              html +=
                '<option value="' +
                opt.value +
                '"' +
                (String(opt.value) === String(value) ? " selected" : "") +
                ">" +
                opt.label +
                "</option>";
            });
            html += "</select>";
          } else if (field.type === "date") {
            html += '<input class="wh-input" type="date" data-form="' + field.key + '" value="' + value + '" />';
          } else {
            html += '<input class="wh-input" data-form="' + field.key + '" value="' + value + '" />';
          }

          html += "</div>";
          return html;
        })
        .join("") +
      "</div>"
    );
  }

  function filterRows(page, rows) {
    return filterRowsForPage(page, rows);
  }

  function buildTree(nodes, selectedId, onSelect, expanded) {
    var wrap = el("div", "wb-tree");
    (nodes || []).forEach(function (node) {
      wrap.appendChild(buildTreeNode(node, 0, selectedId, onSelect, expanded));
    });
    return wrap;
  }

  function buildTreeNode(node, level, selectedId, onSelect, expanded) {
    var hasChildren = node.children && node.children.length;
    var item = el("div", "wb-tree-node");
    var row = el("div", "wb-tree-row" + (node.id === selectedId ? " active" : ""));
    row.style.paddingLeft = 10 + level * 16 + "px";
    var toggle = el("span", "wb-tree-toggle", hasChildren ? (expanded[node.id] ? "▼" : "▶") : "");
    var title = el("span", "wb-tree-title", node.name || node.label || "");
    var count = el("span", "wb-tree-count", node.count != null ? String(node.count) : "");
    row.appendChild(toggle);
    row.appendChild(title);
    row.appendChild(count);

    row.addEventListener("click", function (event) {
      if (hasChildren && event.target === toggle) {
        expanded[node.id] = !expanded[node.id];
        if (typeof window.__wbRender === "function") window.__wbRender();
        return;
      }
      onSelect(node);
    });

    item.appendChild(row);
    if (hasChildren && expanded[node.id]) {
      var children = el("div", "wb-tree-children");
      node.children.forEach(function (child) {
        children.appendChild(buildTreeNode(child, level + 1, selectedId, onSelect, expanded));
      });
      item.appendChild(children);
    }
    return item;
  }

  function defaultActionHandler(action, row, page) {
    if (action.handler) {
      action.handler(row, page);
      return;
    }
    if (action.type === "delete") {
      confirmAction(action.confirmText || "确认删除当前记录吗？", function () {
        toast(action.successText || "已删除");
      });
      return;
    }
    if (action.type === "edit" || action.type === "view" || action.modal) {
      openRecordModal(page, action.modalTitle || action.label, row, action.successText || "已保存");
      return;
    }
    toast((action.label || "操作") + "已打开");
  }

  function renderCell(col, row, page) {
    var td = el("td", "px-3 py-3 text-slate-100/95");
    if (col.type === "switch") {
      td.appendChild(
        statusSwitch(!!row[col.key], function () {
          var next = !row[col.key];
          if (typeof page.onStatusToggle === "function") {
            if (page.onStatusToggle(row, next) === false) {
              if (typeof window.__wbRender === "function") window.__wbRender();
              return;
            }
          } else {
            row[col.key] = next;
          }
          var tipName = row.templateName || row.roleName || row.menuName || row.postName || page.title;
          toast(tipName + (row[col.key] ? " 已启用" : " 已禁用"));
          window.__wbRender();
        })
      );
      return td;
    }

    if (col.type === "tag") {
      td.innerHTML = row[col.key] ? '<span class="wh-status wh-status--done">' + row[col.key] + "</span>" : "-";
      return td;
    }

    if (col.render) {
      var result = col.render(getValue(row, col.key), row, page);
      if (typeof result === "string") td.innerHTML = result;
      else if (result) td.appendChild(result);
      return td;
    }

    td.textContent = getValue(row, col.key) || "-";
    return td;
  }

  function renderActions(actions, row, page) {
    var sticky = !!page.stickyActionColumn;
    var actionTd = el("td", sticky ? "px-3 py-3 disease-col-actions" : "px-3 py-3 whitespace-nowrap");
    var bar = el("div", sticky ? "disease-op-actions" : "flex flex-wrap items-center gap-3");
    (actions || []).forEach(function (action) {
      bar.appendChild(
        actionBtn(action.label, action.cls, function () {
          defaultActionHandler(action, row, page);
        })
      );
    });
    actionTd.appendChild(bar);
    return actionTd;
  }

  function attachRowOpen(tr, row, page) {
    if (!tr || !row) return;
    tr.classList.add("wh-row-open");
    tr.style.cursor = "pointer";
    if (window.WHTableRowClick) WHTableRowClick.injectStyles();
    tr.addEventListener("click", function (e) {
      if (window.WHTableRowClick && WHTableRowClick.shouldIgnore(e)) return;
      if (e.target.closest("input,button,a,label,select,textarea,.disease-col-actions,.flight-plan-col-actions,.wb-action")) return;
      if (typeof page.buildDetailHtml === "function") {
        openDetailModal(page, row);
        return;
      }
      var action = window.WHTableRowClick && WHTableRowClick.pickOpenAction(page.actions);
      if (!action && page.actions && page.actions.length) {
        action =
          page.actions.find(function (a) {
            return a.label === "查看" || a.label === "编辑" || a.type === "edit" || a.type === "view";
          }) || page.actions[0];
      }
      if (action) defaultActionHandler(action, row, page);
    });
  }

  function renderTableOnly(container, page, rows) {
    var sticky = !!page.stickyActionColumn;
    var tableWrap = el("section", "wh-table-shell bg-slate-950/35");
    var tableBox = el(
      "div",
      (sticky ? "am-table-wrap " : "") + "overflow-x-auto max-h-[min(560px,calc(100vh-310px))]"
    );
    var table = el("table", sticky ? "w-full text-left min-w-[1180px]" : "w-full text-left");
    var actionThClass = sticky
      ? "px-3 py-3 text-left uppercase tracking-wide text-cyan-50/95 disease-col-actions"
      : "px-3 py-3 text-left uppercase tracking-wide text-cyan-50/95";
    table.innerHTML =
      "<thead><tr>" +
      page.columns
        .map(function (col) {
          return '<th class="px-3 py-3 text-left uppercase tracking-wide text-cyan-50/95">' + col.label + "</th>";
        })
        .join("") +
      '<th class="' + actionThClass + '">操作</th></tr></thead>';

    var body = el("tbody");
    var result = paginate(filterRows(page, rows), page.pageState);
    result.rows.forEach(function (row, idx) {
      var tr = el("tr");
      tr.style.background = idx % 2 ? "rgba(15,32,58,0.72)" : "rgba(12,24,48,0.45)";
      page.columns.forEach(function (col) {
        tr.appendChild(renderCell(col, row, page));
      });
      tr.appendChild(renderActions(page.actions, row, page));
      attachRowOpen(tr, row, page);
      body.appendChild(tr);
    });

    if (!result.rows.length) {
      var emptyTr = el("tr");
      emptyTr.innerHTML = '<td colspan="' + (page.columns.length + 1) + '" class="wb-empty">暂无数据</td>';
      body.appendChild(emptyTr);
    }

    table.appendChild(body);
    tableBox.appendChild(table);
    tableWrap.appendChild(tableBox);
    tableWrap.appendChild(buildPager(result, page.pageState));
    container.appendChild(tableWrap);
  }

  function renderTablePage(root, page) {
    if (page.diseaseLayout) {
      renderDiseaseTablePage(root, page);
      return;
    }
    simplePageShell(root, page);
    var wrap = root.firstElementChild;
    renderSearch(wrap, page);
    renderTableOnly(wrap, page, page.rows || []);
  }

  function renderTreeTablePage(root, page) {
    if (page.diseaseLayout) {
      renderDiseaseTreeTablePage(root, page);
      return;
    }
    simplePageShell(root, page);
    var wrap = root.firstElementChild;
    renderSearch(wrap, page);

    var layout = el("div", "wb-layout");
    var treePanel = el("section", "neon-panel neon-panel--tight p-3 wb-tree-panel");
    treePanel.innerHTML =
      '<div class="wb-tree-search"><i class="fa-solid fa-magnifying-glass"></i><input class="wh-input" placeholder="搜索节点" /></div>';
    treePanel.appendChild(
      buildTree(
        page.treeData,
        page.selectedTreeId,
        function (node) {
          page.selectedTreeId = node.id;
          page.pageState.page = 1;
          window.__wbRender();
        },
        page.expandedMap
      )
    );
    layout.appendChild(treePanel);

    var mainPanel = el("div", "wb-main-panel");
    renderTableOnly(mainPanel, page, page.getRows ? page.getRows() : page.rows || []);
    layout.appendChild(mainPanel);
    wrap.appendChild(layout);
  }

  function renderMenuTableOnly(container, page) {
    var tableWrap = el("section", "wh-table-shell bg-slate-950/35");
    var tableBox = el("div", "overflow-x-auto max-h-[min(620px,calc(100vh-300px))]");
    var table = el("table", "w-full text-left");
    table.innerHTML =
      "<thead><tr>" +
      page.columns
        .map(function (col) {
          return '<th class="px-3 py-3 text-left uppercase tracking-wide text-cyan-50/95">' + col.label + "</th>";
        })
        .join("") +
      '<th class="px-3 py-3 text-left uppercase tracking-wide text-cyan-50/95">操作</th></tr></thead>';

    var body = el("tbody");

    function appendRow(row, level) {
      var tr = el("tr");
      tr.style.background = "rgba(12,24,48,0.45)";
      page.columns.forEach(function (col, index) {
        var td = el("td", "px-3 py-3 text-slate-100/95");
        if (index === 0) {
          var line = el("div", "wb-tree-table-indent");
          line.style.paddingLeft = level * 18 + "px";
          if (row.children && row.children.length) {
            var toggle = el("button", "text-cyan-300 text-xs", page.expandedMap[row.id] ? "▼" : "▶");
            toggle.type = "button";
            toggle.onclick = function () {
              page.expandedMap[row.id] = !page.expandedMap[row.id];
              window.__wbRender();
            };
            line.appendChild(toggle);
          } else {
            line.appendChild(el("span", "inline-block w-4"));
          }
          line.appendChild(el("span", "", getValue(row, col.key)));
          td.appendChild(line);
        } else if (col.type === "switch") {
          td.appendChild(
            statusSwitch(!!row[col.key], function () {
              row[col.key] = !row[col.key];
              toast(getValue(row, "menuName") + (row[col.key] ? "已启用" : "已停用"));
              window.__wbRender();
            })
          );
        } else {
          td.textContent = getValue(row, col.key) || "-";
        }
        tr.appendChild(td);
      });

      tr.appendChild(renderActions(page.actions, row, page));
      attachRowOpen(tr, row, page);
      body.appendChild(tr);

      if (row.children && row.children.length && page.expandedMap[row.id]) {
        row.children.forEach(function (child) {
          appendRow(child, level + 1);
        });
      }
    }

    (page.rows || []).forEach(function (row) {
      appendRow(row, 0);
    });

    table.appendChild(body);
    tableBox.appendChild(table);
    tableWrap.appendChild(tableBox);
    container.appendChild(tableWrap);
  }

  function renderDiseaseMenuPage(root, page) {
    simplePageShell(root, page);
    var wrap = root.firstElementChild;

    var section = el("section");
    var layout = el("div", "disease-layout");
    var left = el("div", "disease-layout__left");

    left.appendChild(buildDiseaseStats(page));
    left.appendChild(buildDiseaseToolbar(page));

    var mainPanel = el("div", "wb-main-panel");
    var scoped = getDiseaseScopeRows(page);
    updateDiseaseStats(page, filterRowsForPage(page, scoped));
    renderMenuTableOnly(mainPanel, page);
    left.appendChild(mainPanel);

    layout.appendChild(left);
    appendDiseaseRightColumn(layout, page);

    section.appendChild(layout);
    wrap.appendChild(section);
  }

  function renderDiseaseLogPage(root, page) {
    simplePageShell(root, page);
    var wrap = root.firstElementChild;

    var section = el("section");
    var layout = el("div", "disease-layout");
    var left = el("div", "disease-layout__left");

    left.appendChild(buildDiseaseStats(page));
    left.appendChild(buildDiseaseToolbar(page));

    var tabs = el("div", "wb-tabbar");
    (page.logTabs || []).forEach(function (tab) {
      var btn = el("button", "wb-tab" + (page.activeLogTab === tab.key ? " active" : ""), tab.label);
      btn.type = "button";
      btn.onclick = function () {
        page.activeLogTab = tab.key;
        page.pageState.page = 1;
        window.__wbRender();
      };
      tabs.appendChild(btn);
    });
    left.appendChild(tabs);

    var current = page.getCurrentTab ? page.getCurrentTab() : { rows: [], columns: [] };
    var scoped = current.rows || [];
    var mainPanel = el("div", "wb-main-panel");
    updateDiseaseStats(page, filterRowsForPage(page, scoped));
    renderTableOnly(
      mainPanel,
      {
        title: page.title,
        columns: current.columns,
        rows: scoped,
        pageState: page.pageState,
        filters: page.filters,
        filterState: page.filterState,
        actions: current.actions || page.actions || [],
        formFields: current.formFields || page.formFields || [],
      },
      scoped
    );
    left.appendChild(mainPanel);

    layout.appendChild(left);
    appendDiseaseRightColumn(layout, page);

    section.appendChild(layout);
    wrap.appendChild(section);
  }

  function renderMenuPage(root, page) {
    if (page.diseaseLayout) {
      renderDiseaseMenuPage(root, page);
      return;
    }
    simplePageShell(root, page);
    var wrap = root.firstElementChild;
    renderSearch(wrap, page);
    renderMenuTableOnly(wrap, page);
  }

  function renderLogPage(root, page) {
    if (page.diseaseLayout) {
      renderDiseaseLogPage(root, page);
      return;
    }
    simplePageShell(root, page);
    var wrap = root.firstElementChild;
    var tabs = el("div", "wb-tabbar");
    (page.logTabs || []).forEach(function (tab) {
      var btn = el("button", "wb-tab" + (page.activeLogTab === tab.key ? " active" : ""), tab.label);
      btn.type = "button";
      btn.onclick = function () {
        page.activeLogTab = tab.key;
        page.pageState.page = 1;
        window.__wbRender();
      };
      tabs.appendChild(btn);
    });
    wrap.appendChild(tabs);
    renderSearch(wrap, page);

    var current = page.getCurrentTab ? page.getCurrentTab() : null;
    renderTableOnly(wrap, {
      title: page.title,
      columns: current.columns,
      rows: current.rows,
      pageState: page.pageState,
      filters: page.filters,
      filterState: page.filterState,
      actions: current.actions || page.actions || [],
      formFields: current.formFields || page.formFields || [],
    }, current.rows || []);
  }

  function createPage(config) {
    var root = $("page-root");
    if (!root) return;
    window.__wbRender = function () {
      root.innerHTML = "";
      if (!$("wb-toast")) {
        var toastBox = el(
          "div",
          "fixed bottom-5 right-5 z-[1300] hidden rounded bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 shadow-lg"
        );
        toastBox.id = "wb-toast";
        document.body.appendChild(toastBox);
      }

      if (config.pageType === "tree-table") renderTreeTablePage(root, config);
      else if (config.pageType === "menu") renderMenuPage(root, config);
      else if (config.pageType === "log") renderLogPage(root, config);
      else renderTablePage(root, config);
    };
    window.__wbRender();
  }

  window.WBSystem = {
    createPage: createPage,
    toast: toast,
    openModal: openModal,
    openDetailModal: openDetailModal,
    closeDetailModal: closeDetailModal,
    confirmAction: confirmAction,
    escapeDetailHtml: escapeDetailHtml,
  };
})();
