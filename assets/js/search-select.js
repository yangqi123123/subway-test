/**
 * 可搜索单选下拉（原型）
 */
(function (global) {
  var instances = [];

  /** 与部门管理树一致的部门名称列表 */
  var DEPT_OPTIONS = [
    "武汉地铁保护区管理平台",
    "系统管理部",
    "平台运维组",
    "权限配置组",
    "巡检业务部",
    "人工巡检组",
    "无人机巡检组",
    "数据中心",
    "资料管理组",
    "分析研判组",
    "应急中心",
    "巡检部",
    "调度部",
    "物资部",
  ];

  function closeAll(except) {
    instances.forEach(function (inst) {
      if (inst !== except) inst.close();
    });
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, "&quot;");
  }

  function mountDropdownToBody(dropdown) {
    if (dropdown && dropdown.parentNode !== document.body) {
      document.body.appendChild(dropdown);
    }
  }

  function restoreDropdown(dropdown, wrapEl) {
    if (dropdown && wrapEl && dropdown.parentNode === document.body) {
      wrapEl.appendChild(dropdown);
    }
  }

  function bindDropdownReposition(inst, wrapEl, positionDropdown) {
    if (inst._repositionBound) return;
    inst._repositionBound = true;
    var onReposition = function () {
      if (!wrapEl.classList.contains("is-open")) return;
      positionDropdown();
    };
    inst._repositionHandler = onReposition;
    window.addEventListener("scroll", onReposition, true);
    window.addEventListener("resize", onReposition);
  }

  /**
   * @param {HTMLElement} wrapEl 容器，需带 data-input-id
   * @param {string[]} options
   * @param {string} placeholder
   */
  function create(wrapEl, options, placeholder) {
    if (!wrapEl) return null;
    var inputId = wrapEl.getAttribute("data-input-id");
    var list = options || DEPT_OPTIONS;
    var hint = placeholder || "请搜索或选择";

    wrapEl.classList.add("wh-search-select");
    wrapEl.innerHTML = "";

    var hidden = document.createElement("input");
    hidden.type = "hidden";
    if (inputId) hidden.id = inputId;
    wrapEl.appendChild(hidden);

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "wh-search-select__trigger";
    trigger.innerHTML =
      '<span class="wh-search-select__value is-placeholder">' +
      escapeAttr(hint) +
      '</span><i class="fa-solid fa-chevron-down wh-search-select__arrow"></i>';
    wrapEl.appendChild(trigger);

    var dropdown = document.createElement("div");
    dropdown.className = "wh-search-select__dropdown";
    dropdown.innerHTML =
      '<input type="text" class="wh-search-select__search wh-input" placeholder="输入关键词搜索" autocomplete="off" />' +
      '<ul class="wh-search-select__list"></ul>';
    wrapEl.appendChild(dropdown);

    dropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    var valueEl = trigger.querySelector(".wh-search-select__value");
    var searchInput = dropdown.querySelector(".wh-search-select__search");
    var listEl = dropdown.querySelector(".wh-search-select__list");

    function renderList(keyword) {
      var q = (keyword || "").trim().toLowerCase();
      var matched = list.filter(function (opt) {
        return !q || opt.toLowerCase().indexOf(q) >= 0;
      });
      if (!matched.length) {
        listEl.innerHTML = '<li class="wh-search-select__empty">无匹配项</li>';
        return;
      }
      listEl.innerHTML = matched
        .map(function (opt) {
          return (
            '<li class="wh-search-select__option" data-value="' +
            escapeAttr(opt) +
            '">' +
            opt +
            "</li>"
          );
        })
        .join("");
    }

    function setValue(val) {
      var next = val || "";
      if (hidden.value !== next) {
        hidden.value = next;
        hidden.dispatchEvent(new Event("change", { bubbles: true }));
      } else {
        hidden.value = next;
      }
      if (val) {
        valueEl.textContent = val;
        valueEl.classList.remove("is-placeholder");
      } else {
        valueEl.textContent = hint;
        valueEl.classList.add("is-placeholder");
      }
    }

    function positionDropdown() {
      var rect = trigger.getBoundingClientRect();
      dropdown.style.position = "fixed";
      dropdown.style.left = rect.left + "px";
      dropdown.style.top = rect.bottom + 4 + "px";
      dropdown.style.width = rect.width + "px";
      dropdown.style.right = "auto";
      dropdown.style.zIndex = "10000";
    }

    function resetDropdownPosition() {
      dropdown.style.position = "";
      dropdown.style.left = "";
      dropdown.style.top = "";
      dropdown.style.width = "";
      dropdown.style.right = "";
      dropdown.style.zIndex = "";
    }

    function open() {
      closeAll(inst);
      wrapEl.classList.add("is-open");
      mountDropdownToBody(dropdown);
      searchInput.value = "";
      renderList("");
      positionDropdown();
      dropdown.style.display = "flex";
      bindDropdownReposition(inst, wrapEl, positionDropdown);
      searchInput.focus();
    }

    function close() {
      wrapEl.classList.remove("is-open");
      dropdown.style.display = "";
      resetDropdownPosition();
      restoreDropdown(dropdown, wrapEl);
    }

    function setDisabled(disabled) {
      trigger.disabled = !!disabled;
      wrapEl.classList.toggle("is-disabled", !!disabled);
      if (disabled) close();
    }

    var inst = {
      wrap: wrapEl,
      setValue: setValue,
      setDisabled: setDisabled,
      open: open,
      close: close,
      getValue: function () {
        return hidden.value;
      },
    };
    instances.push(inst);

    trigger.addEventListener("click", function (e) {
      e.stopPropagation();
      if (wrapEl.classList.contains("is-open")) close();
      else open();
    });
    searchInput.addEventListener("input", function () {
      renderList(searchInput.value);
    });
    searchInput.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    listEl.addEventListener("click", function (e) {
      var item = e.target.closest(".wh-search-select__option");
      if (!item) return;
      setValue(item.getAttribute("data-value"));
      close();
    });
    wrapEl.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    renderList("");
    return inst;
  }

  function mountById(wrapId, placeholder, options) {
    return create(document.getElementById(wrapId), options, placeholder);
  }

  /**
   * 可搜索多选下拉（原型）
   * @param {HTMLElement} wrapEl
   * @param {string[]} options
   * @param {string} placeholder
   */
  function createMulti(wrapEl, options, placeholder) {
    if (!wrapEl) return null;
    var inputId = wrapEl.getAttribute("data-input-id");
    var list = options || [];
    var hint = placeholder || "请搜索或选择";
    var selected = [];

    wrapEl.classList.add("wh-search-select", "wh-search-select--multi");
    wrapEl.innerHTML = "";

    var hidden = document.createElement("input");
    hidden.type = "hidden";
    if (inputId) hidden.id = inputId;
    wrapEl.appendChild(hidden);

    var trigger = document.createElement("button");
    trigger.type = "button";
    trigger.className = "wh-search-select__trigger";
    trigger.innerHTML =
      '<span class="wh-search-select__tags"></span>' +
      '<span class="wh-search-select__value is-placeholder">' +
      escapeAttr(hint) +
      '</span><i class="fa-solid fa-chevron-down wh-search-select__arrow"></i>';
    wrapEl.appendChild(trigger);

    var dropdown = document.createElement("div");
    dropdown.className = "wh-search-select__dropdown";
    dropdown.innerHTML =
      '<input type="text" class="wh-search-select__search wh-input" placeholder="输入关键词搜索" autocomplete="off" />' +
      '<ul class="wh-search-select__list"></ul>' +
      '<div class="wh-search-select__foot"><button type="button" class="wh-search-select__done">确定</button></div>';
    wrapEl.appendChild(dropdown);

    dropdown.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    var tagsEl = trigger.querySelector(".wh-search-select__tags");
    var valueEl = trigger.querySelector(".wh-search-select__value");
    var searchInput = dropdown.querySelector(".wh-search-select__search");
    var listEl = dropdown.querySelector(".wh-search-select__list");
    var doneBtn = dropdown.querySelector(".wh-search-select__done");

    function syncHidden() {
      hidden.value = selected.join("、");
    }

    function renderTrigger() {
      tagsEl.innerHTML = "";
      if (!selected.length) {
        valueEl.textContent = hint;
        valueEl.classList.remove("is-hidden");
        valueEl.classList.add("is-placeholder");
        return;
      }
      valueEl.classList.add("is-hidden");
      valueEl.classList.remove("is-placeholder");
      selected.forEach(function (val) {
        var tag = document.createElement("span");
        tag.className = "wh-search-select__tag";
        tag.innerHTML =
          '<span class="wh-search-select__tag-text">' +
          val +
          '</span><button type="button" class="wh-search-select__tag-remove" data-value="' +
          escapeAttr(val) +
          '" aria-label="移除">&times;</button>';
        tagsEl.appendChild(tag);
      });
    }

    function renderList(keyword) {
      var q = (keyword || "").trim().toLowerCase();
      var matched = list.filter(function (opt) {
        return !q || opt.toLowerCase().indexOf(q) >= 0;
      });
      if (!matched.length) {
        listEl.innerHTML = '<li class="wh-search-select__empty">无匹配项</li>';
        return;
      }
      listEl.innerHTML = matched
        .map(function (opt) {
          var on = selected.indexOf(opt) >= 0;
          return (
            '<li class="wh-search-select__option' +
            (on ? " is-selected" : "") +
            '" data-value="' +
            escapeAttr(opt) +
            '"><i class="fa-solid fa-check wh-search-select__check"></i><span>' +
            opt +
            "</span></li>"
          );
        })
        .join("");
    }

    function toggleValue(val) {
      var idx = selected.indexOf(val);
      if (idx >= 0) selected.splice(idx, 1);
      else selected.push(val);
      syncHidden();
      renderTrigger();
      renderList(searchInput.value);
    }

    function setValues(vals) {
      selected = (vals || []).filter(function (v) {
        return v && list.indexOf(v) >= 0;
      });
      syncHidden();
      renderTrigger();
      renderList(searchInput.value);
    }

    function positionDropdown() {
      var rect = trigger.getBoundingClientRect();
      dropdown.style.position = "fixed";
      dropdown.style.left = rect.left + "px";
      dropdown.style.top = rect.bottom + 4 + "px";
      dropdown.style.width = rect.width + "px";
      dropdown.style.right = "auto";
      dropdown.style.zIndex = "10000";
    }

    function resetDropdownPosition() {
      dropdown.style.position = "";
      dropdown.style.left = "";
      dropdown.style.top = "";
      dropdown.style.width = "";
      dropdown.style.right = "";
      dropdown.style.zIndex = "";
    }

    function open() {
      closeAll(inst);
      wrapEl.classList.add("is-open");
      mountDropdownToBody(dropdown);
      searchInput.value = "";
      renderList("");
      positionDropdown();
      dropdown.style.display = "flex";
      bindDropdownReposition(inst, wrapEl, positionDropdown);
      searchInput.focus();
    }

    function close() {
      wrapEl.classList.remove("is-open");
      dropdown.style.display = "";
      resetDropdownPosition();
      restoreDropdown(dropdown, wrapEl);
    }

    function setDisabled(disabled) {
      trigger.disabled = !!disabled;
      wrapEl.classList.toggle("is-disabled", !!disabled);
      if (disabled) close();
    }

    var inst = {
      wrap: wrapEl,
      setValues: setValues,
      setDisabled: setDisabled,
      open: open,
      close: close,
      getValues: function () {
        return selected.slice();
      },
    };
    instances.push(inst);

    trigger.addEventListener("click", function (e) {
      if (e.target.closest(".wh-search-select__tag-remove")) return;
      e.stopPropagation();
      if (wrapEl.classList.contains("is-open")) close();
      else open();
    });
    tagsEl.addEventListener("click", function (e) {
      var btn = e.target.closest(".wh-search-select__tag-remove");
      if (!btn) return;
      e.stopPropagation();
      toggleValue(btn.getAttribute("data-value"));
    });
    searchInput.addEventListener("input", function () {
      renderList(searchInput.value);
    });
    searchInput.addEventListener("click", function (e) {
      e.stopPropagation();
    });
    listEl.addEventListener("click", function (e) {
      var item = e.target.closest(".wh-search-select__option");
      if (!item) return;
      toggleValue(item.getAttribute("data-value"));
    });
    doneBtn.addEventListener("click", function (e) {
      e.stopPropagation();
      close();
    });
    wrapEl.addEventListener("click", function (e) {
      e.stopPropagation();
    });

    renderList("");
    renderTrigger();
    return inst;
  }

  function mountMultiById(wrapId, placeholder, options) {
    return createMulti(document.getElementById(wrapId), options, placeholder);
  }

  if (!global._whSearchSelectDocBound) {
    global._whSearchSelectDocBound = true;
    document.addEventListener("click", function (e) {
      if (e.target.closest(".wh-search-select__dropdown") || e.target.closest(".wh-search-select")) return;
      closeAll(null);
    });
  }

  global.WHSearchSelect = {
    create: create,
    createMulti: createMulti,
    mountById: mountById,
    mountMultiById: mountMultiById,
    closeAll: closeAll,
    DEPT_OPTIONS: DEPT_OPTIONS,
  };
  global.WHSearchMultiSelect = {
    create: createMulti,
    mountById: mountMultiById,
    closeAll: closeAll,
  };
})(typeof window !== "undefined" ? window : global);
