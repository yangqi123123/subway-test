/**
 * 角色管理：表单菜单权限、分配用户、数据权限弹窗
 */
(function (global) {
  var DATA_SCOPE_OPTIONS = [
    "全部数据权限",
    "自定义数据权限",
    "本部门数据权限",
    "本部门及以下数据权限",
    "仅本人数据权限",
    "部门及以下或本人数据权限",
  ];

  var MENU_PERM_TREE = [
    {
      id: "sys",
      menuName: "系统管理",
      icon: "fa-solid fa-screwdriver-wrench",
      menuType: "目录",
      children: [
        {
          id: "user",
          menuName: "用户管理",
          icon: "fa-regular fa-user",
          menuType: "菜单",
          perms: ["查询", "新增", "修改", "删除", "导出", "导入", "重置密码"],
        },
        {
          id: "role",
          menuName: "角色管理",
          icon: "fa-regular fa-id-badge",
          menuType: "菜单",
          perms: ["查询", "新增", "修改", "删除", "导出"],
        },
        {
          id: "menu",
          menuName: "菜单管理",
          icon: "fa-solid fa-bars",
          menuType: "菜单",
          perms: ["查询", "新增", "修改", "删除"],
        },
        {
          id: "dept",
          menuName: "部门管理",
          icon: "fa-solid fa-sitemap",
          menuType: "菜单",
          perms: ["查询", "新增", "修改", "删除"],
        },
        {
          id: "post",
          menuName: "岗位管理",
          icon: "fa-solid fa-briefcase",
          menuType: "菜单",
          perms: ["查询", "新增", "修改", "删除", "导出"],
        },
        {
          id: "dict",
          menuName: "字典管理",
          icon: "fa-solid fa-book",
          menuType: "菜单",
          perms: ["查询", "新增", "修改", "删除", "导出"],
        },
        {
          id: "param",
          menuName: "参数设置",
          icon: "fa-solid fa-sliders",
          menuType: "菜单",
          perms: ["查询", "新增", "修改", "删除"],
        },
      ],
    },
  ];

  var ROLE_ASSIGNED_USERS = {
    "1": [
      { account: "admin", nickName: "系统管理员", email: "admin@metro.com", phone: "13800001111" },
      { account: "zhangsan", nickName: "张三", email: "zhangsan@metro.com", phone: "13800002222" },
    ],
    "2": [{ account: "wangwu", nickName: "王五", email: "wangwu@metro.com", phone: "13800004444" }],
    "3": [
      { account: "123阿达的", nickName: "123", email: "513188@qq.com", phone: "13328392910" },
      { account: "111", nickName: "1111", email: "15351733991@139.com", phone: "15351733991" },
      { account: "cs1", nickName: "cs 计算机", email: "csl0195618564@163.com", phone: "18874222698" },
    ],
  };

  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function formLabel(label, required) {
    return (
      "<label>" +
      (required ? '<span class="text-rose-400">*</span> ' : "") +
      escapeHtml(label) +
      "</label>"
    );
  }

  function inputField(key, label, value, required) {
    return (
      '<div class="wb-form-item">' +
      formLabel(label, required) +
      '<input class="wh-input" data-form="' +
      key +
      '" value="' +
      escapeHtml(value) +
      '" />' +
      "</div>"
    );
  }

  function selectField(key, label, options, value, required) {
    var html = '<div class="wb-form-item">' + formLabel(label, required);
    html += '<select class="wh-input" data-form="' + key + '">';
    if (!required) html += '<option value="">请选择</option>';
    options.forEach(function (opt) {
      html +=
        '<option value="' +
        escapeHtml(opt) +
        '"' +
        (String(opt) === String(value) ? " selected" : "") +
        ">" +
        escapeHtml(opt) +
        "</option>";
    });
    html += "</select></div>";
    return html;
  }

  function typeBadge(menuType) {
    if (menuType === "目录") {
      return '<span class="wb-menu-perm-type wb-menu-perm-type--dir"><i class="fa-regular fa-folder text-amber-300/90"></i> 目录</span>';
    }
    return '<span class="wb-menu-perm-type wb-menu-perm-type--menu"><i class="fa-solid fa-list text-cyan-300/90"></i> 菜单</span>';
  }

  function renderMenuPermRows(nodes, level, parentId) {
    var html = "";
    (nodes || []).forEach(function (node) {
      var hasChildren = node.children && node.children.length;
      var indent = level * 18;
      html +=
        '<tr class="wb-menu-perm-row" data-menu-id="' +
        escapeHtml(node.id) +
        '" data-level="' +
        level +
        '" data-parent="' +
        escapeHtml(parentId || "") +
        '" data-has-children="' +
        (hasChildren ? "1" : "0") +
        '">';
      html += '<td class="wb-menu-perm-col-name">';
      html += '<div class="wb-menu-perm-name" style="padding-left:' + indent + 'px">';
      if (hasChildren) {
        html +=
          '<button type="button" class="wb-menu-perm-toggle" data-toggle aria-expanded="true"><i class="fa-solid fa-caret-down"></i></button>';
      } else {
        html += '<span class="wb-menu-perm-toggle-spacer"></span>';
      }
      html +=
        '<label class="wb-menu-perm-check"><input type="checkbox" data-menu-check data-id="' +
        escapeHtml(node.id) +
        '" />' +
        escapeHtml(node.menuName) +
        "</label></div></td>";
      html +=
        '<td class="wb-menu-perm-col-icon"><i class="' +
        escapeHtml(node.icon || "fa-regular fa-circle") +
        ' text-cyan-200/80"></i></td>';
      html += '<td class="wb-menu-perm-col-type">' + typeBadge(node.menuType) + "</td>";
      html += '<td class="wb-menu-perm-col-perms">';
      if (node.menuType === "菜单" && node.perms && node.perms.length) {
        html += '<div class="wb-menu-perm-perms-wrap">';
        node.perms.forEach(function (perm) {
          html +=
            '<label class="wb-menu-perm-perm"><input type="checkbox" data-perm-check data-menu="' +
            escapeHtml(node.id) +
            '" value="' +
            escapeHtml(perm) +
            '" />' +
            escapeHtml(perm) +
            "</label>";
        });
        html += "</div>";
      }
      html += "</td></tr>";
      if (hasChildren) {
        html += renderMenuPermRows(node.children, level + 1, node.id);
      }
    });
    return html;
  }

  function menuPermBlockHtml() {
    return (
      '<div class="wb-form-item wb-form-item--full wb-menu-perm-block">' +
      formLabel("菜单权限", false) +
      '<div class="wb-menu-perm-toolbar">' +
      '<div class="wb-menu-perm-modes">' +
      '<button type="button" class="wb-menu-perm-mode is-active" data-menu-mode="link">节点关联</button>' +
      '<button type="button" class="wb-menu-perm-mode" data-menu-mode="solo">节点独立</button>' +
      "</div>" +
      '<span class="wb-menu-perm-count" id="wb-menu-perm-count">已选中 0 个节点</span>' +
      '<div class="wb-menu-perm-tree-ops">' +
      '<button type="button" class="wh-btn-ghost px-2 py-1 text-xs" data-menu-collapse>收起</button>' +
      '<button type="button" class="wh-btn-ghost px-2 py-1 text-xs" data-menu-expand>展开</button>' +
      "</div></div>" +
      '<div class="wb-menu-perm-table-wrap">' +
      '<table class="w-full text-left">' +
      "<colgroup>" +
      '<col class="wb-menu-perm-col-name" /><col class="wb-menu-perm-col-icon" /><col class="wb-menu-perm-col-type" /><col class="wb-menu-perm-col-perms" />' +
      "</colgroup>" +
      "<thead><tr>" +
      '<th class="wb-menu-perm-col-name">菜单名称</th><th class="wb-menu-perm-col-icon">图标</th><th class="wb-menu-perm-col-type">类型</th><th class="wb-menu-perm-col-perms">权限标识</th>' +
      "</tr></thead>" +
      "<tbody id=\"wb-menu-perm-tbody\">" +
      renderMenuPermRows(MENU_PERM_TREE, 0, "") +
      "</tbody></table></div></div>"
    );
  }

  function buildRoleFormHtml(row) {
    row = row || {};
    return (
      '<div class="wb-form-grid wb-form-grid--role">' +
      inputField("roleName", "角色名称", row.roleName, true) +
      inputField("roleKey", "权限字符", row.roleKey, true) +
      inputField("roleSort", "角色顺序", row.roleSort, true) +
      selectField("statusText", "状态", ["启用", "停用"], row.status ? "启用" : "停用", true) +
      menuPermBlockHtml() +
      '<div class="wb-form-item wb-form-item--full">' +
      formLabel("备注", false) +
      '<textarea class="wh-input" data-form="remark">' +
      escapeHtml(row.remark) +
      "</textarea></div>" +
      "</div>"
    );
  }

  function getDescendantRows(parentId) {
    var rows = [];
    document.querySelectorAll("#wb-menu-perm-tbody tr.wb-menu-perm-row").forEach(function (tr) {
      if (tr.getAttribute("data-parent") === parentId) {
        rows.push(tr);
        if (tr.getAttribute("data-has-children") === "1") {
          rows = rows.concat(getDescendantRows(tr.getAttribute("data-menu-id")));
        }
      }
    });
    return rows;
  }

  function updateMenuPermCount() {
    var countEl = document.getElementById("wb-menu-perm-count");
    if (!countEl) return;
    var n = document.querySelectorAll("#wb-menu-perm-tbody [data-menu-check]:checked").length;
    countEl.textContent = "已选中 " + n + " 个节点";
  }

  function mountMenuPermTree() {
    var tbody = document.getElementById("wb-menu-perm-tbody");
    if (!tbody) return;

    var linkMode = true;

    function setRowVisible(tr, visible) {
      tr.style.display = visible ? "" : "none";
    }

    function setChecked(tr, checked) {
      var menuCb = tr.querySelector("[data-menu-check]");
      if (menuCb) menuCb.checked = checked;
      tr.querySelectorAll("[data-perm-check]").forEach(function (cb) {
        cb.checked = checked;
      });
    }

    function applyParentCheck(childTr) {
      if (!linkMode) return;
      var parentId = childTr.getAttribute("data-parent");
      if (!parentId) return;
      var parentTr = tbody.querySelector('[data-menu-id="' + parentId + '"]');
      if (!parentTr) return;
      var childRows = getDescendantRows(parentId).filter(function (r) {
        return r.getAttribute("data-parent") === parentId;
      });
      var anyChecked = childRows.some(function (r) {
        return r.querySelector("[data-menu-check]").checked;
      });
      parentTr.querySelector("[data-menu-check]").checked = anyChecked;
      applyParentCheck(parentTr);
    }

    tbody.querySelectorAll("[data-menu-check]").forEach(function (cb) {
      cb.onchange = function () {
        var tr = cb.closest("tr");
        var checked = cb.checked;
        if (linkMode) {
          getDescendantRows(tr.getAttribute("data-menu-id")).forEach(function (row) {
            setChecked(row, checked);
          });
        } else {
          tr.querySelectorAll("[data-perm-check]").forEach(function (p) {
            p.checked = checked;
          });
        }
        if (linkMode) applyParentCheck(tr);
        updateMenuPermCount();
      };
    });

    tbody.querySelectorAll("[data-perm-check]").forEach(function (cb) {
      cb.onchange = function () {
        var tr = cb.closest("tr");
        var anyPerm = tr.querySelectorAll("[data-perm-check]:checked").length > 0;
        tr.querySelector("[data-menu-check]").checked = anyPerm;
        if (linkMode) applyParentCheck(tr);
        updateMenuPermCount();
      };
    });

    document.querySelectorAll("[data-menu-mode]").forEach(function (btn) {
      btn.onclick = function () {
        document.querySelectorAll("[data-menu-mode]").forEach(function (b) {
          b.classList.toggle("is-active", b === btn);
        });
        linkMode = btn.getAttribute("data-menu-mode") === "link";
      };
    });

    tbody.querySelectorAll("[data-toggle]").forEach(function (btn) {
      btn.onclick = function () {
        var tr = btn.closest("tr");
        var expanded = btn.getAttribute("aria-expanded") !== "false";
        var nextExpanded = !expanded;
        btn.setAttribute("aria-expanded", nextExpanded ? "true" : "false");
        btn.innerHTML = nextExpanded
          ? '<i class="fa-solid fa-caret-down"></i>'
          : '<i class="fa-solid fa-caret-right"></i>';
        collapseDescendants(tr.getAttribute("data-menu-id"), !nextExpanded);
      };
    });

    function collapseDescendants(parentId, hide) {
      getDescendantRows(parentId).forEach(function (row) {
        setRowVisible(row, !hide);
        if (hide && row.getAttribute("data-has-children") === "1") {
          var toggle = row.querySelector("[data-toggle]");
          if (toggle) {
            toggle.setAttribute("aria-expanded", "false");
            toggle.innerHTML = '<i class="fa-solid fa-caret-right"></i>';
          }
        }
      });
    }

    var collapseAll = document.querySelector("[data-menu-collapse]");
    var expandAll = document.querySelector("[data-menu-expand]");
    if (collapseAll) {
      collapseAll.onclick = function () {
        tbody.querySelectorAll("[data-toggle]").forEach(function (btn) {
          btn.setAttribute("aria-expanded", "false");
          btn.innerHTML = '<i class="fa-solid fa-caret-right"></i>';
        });
        tbody.querySelectorAll("tr.wb-menu-perm-row[data-level]").forEach(function (tr) {
          if (tr.getAttribute("data-level") !== "0") setRowVisible(tr, false);
        });
      };
    }
    if (expandAll) {
      expandAll.onclick = function () {
        tbody.querySelectorAll("tr.wb-menu-perm-row").forEach(function (tr) {
          setRowVisible(tr, true);
        });
        tbody.querySelectorAll("[data-toggle]").forEach(function (btn) {
          btn.setAttribute("aria-expanded", "true");
          btn.innerHTML = '<i class="fa-solid fa-caret-down"></i>';
        });
      };
    }

    updateMenuPermCount();
  }

  function openDataScopeModal(row) {
    if (!global.WBSystem || !global.WBSystem.openModal) return;
    row = row || {};
    var current = row.dataScope || DATA_SCOPE_OPTIONS[0];
    if (DATA_SCOPE_OPTIONS.indexOf(current) === -1) {
      if (current === "本部门及以下") current = "本部门及以下数据权限";
      else if (current === "自定义权限") current = "自定义数据权限";
      else current = DATA_SCOPE_OPTIONS[0];
    }

    var html =
      '<div class="wb-data-scope-body">' +
      '<div class="wb-form-item wb-form-item--full">' +
      formLabel("角色名称", false) +
      '<input class="wh-input" readonly value="' +
      escapeHtml(row.roleName) +
      '" />' +
      "</div>" +
      '<div class="wb-form-item wb-form-item--full">' +
      formLabel("权限标识", false) +
      '<input class="wh-input" readonly value="' +
      escapeHtml(row.roleKey) +
      '" />' +
      "</div>" +
      '<div class="wb-form-item wb-form-item--full">' +
      '<label class="wb-data-scope-label">权限范围 <i class="fa-regular fa-circle-question text-slate-400" title="控制该角色可访问的数据范围"></i></label>' +
      '<select class="wh-input" id="wb-data-scope-select">';
    DATA_SCOPE_OPTIONS.forEach(function (opt) {
      html +=
        '<option value="' +
        escapeHtml(opt) +
        '"' +
        (opt === current ? " selected" : "") +
        ">" +
        escapeHtml(opt) +
        "</option>";
    });
    html += "</select></div></div>";

    global.WBSystem.openModal(
      "分配权限",
      html,
      function () {
        var sel = document.getElementById("wb-data-scope-select");
        row.dataScope = sel ? sel.value : current;
        global.WBSystem.toast("已为「" + row.roleName + "」保存数据权限");
        if (typeof global.__wbRender === "function") global.__wbRender();
      },
      null,
      { size: "md", saveLabel: "确认" }
    );
  }

  function renderAssignUserRows(users, selected) {
    selected = selected || {};
    if (!users.length) {
      return '<tr><td colspan="6" class="wb-empty">暂无已分配用户</td></tr>';
    }
    return users
      .map(function (u, idx) {
        var key = u.account + "|" + idx;
        return (
          "<tr>" +
          '<td class="wb-assign-col-check"><input type="checkbox" class="wb-assign-user-cb" data-key="' +
          escapeHtml(key) +
          '"' +
          (selected[key] ? " checked" : "") +
          " /></td>" +
          '<td class="wb-assign-col-account">' +
          escapeHtml(u.account) +
          "</td>" +
          '<td class="wb-assign-col-nick">' +
          escapeHtml(u.nickName) +
          "</td>" +
          '<td class="wb-assign-col-email">' +
          escapeHtml(u.email) +
          "</td>" +
          '<td class="wb-assign-col-phone">' +
          escapeHtml(u.phone) +
          "</td>" +
          '<td class="wb-assign-col-op"><button type="button" class="wb-action-btn warn wb-assign-revoke-one" data-key="' +
          escapeHtml(key) +
          '">取消授权</button></td>' +
          "</tr>"
        );
      })
      .join("");
  }

  function openAssignUsersModal(row) {
    if (!global.WBSystem || !global.WBSystem.openModal) return;
    row = row || {};
    var users = (ROLE_ASSIGNED_USERS[row.roleId] || []).slice();

    function buildBody(list) {
      return (
        '<div class="wb-assign-users">' +
        '<div class="wb-assign-users-search">' +
        '<div class="wb-search-item"><label>用户账号</label><input class="wh-input" id="wb-assign-filter-account" placeholder="请输入用户账号" /></div>' +
        '<div class="wb-search-item"><label>手机号码</label><input class="wh-input" id="wb-assign-filter-phone" placeholder="请输入手机号码" /></div>' +
        '<div class="wb-assign-users-search-actions">' +
        '<button type="button" class="wh-btn-ghost px-4 py-2 text-sm" id="wb-assign-reset">重置</button>' +
        '<button type="button" class="wh-btn-primary px-4 py-2 text-sm" id="wb-assign-search">搜索</button>' +
        "</div></div>" +
        '<div class="wb-assign-users-toolbar">' +
        '<button type="button" class="wh-btn-ghost px-3 py-1.5 text-sm" id="wb-assign-revoke-batch">取消授权</button>' +
        '<button type="button" class="wh-btn-primary px-3 py-1.5 text-sm" id="wb-assign-add">新增</button>' +
        "</div>" +
        '<div class="wb-assign-users-table-wrap wh-table-shell">' +
        '<div class="wb-assign-table-scroll">' +
        '<table class="w-full text-left"><thead><tr>' +
        '<th class="wb-assign-col-check"><input type="checkbox" id="wb-assign-check-all" /></th>' +
        '<th class="wb-assign-col-account">用户账号</th><th class="wb-assign-col-nick">用户昵称</th><th class="wb-assign-col-email">邮箱</th><th class="wb-assign-col-phone">手机号</th><th class="wb-assign-col-op">操作</th>' +
        "</tr></thead>" +
        '<tbody id="wb-assign-users-tbody">' +
        renderAssignUserRows(list) +
        "</tbody></table></div></div></div>"
      );
    }

    function bindAssignUsers(list) {
      var tbody = document.getElementById("wb-assign-users-tbody");
      var checkAll = document.getElementById("wb-assign-check-all");
      if (!tbody) return;

      function refreshTable(nextList) {
        list = nextList;
        tbody.innerHTML = renderAssignUserRows(list);
        bindRowEvents();
      }

      function bindRowEvents() {
        tbody.querySelectorAll(".wb-assign-revoke-one").forEach(function (btn) {
          btn.onclick = function () {
            var key = btn.getAttribute("data-key");
            var idx = parseInt(String(key).split("|")[1], 10);
            if (!isNaN(idx)) {
              list.splice(idx, 1);
              ROLE_ASSIGNED_USERS[row.roleId] = list.slice();
              refreshTable(list);
              global.WBSystem.toast("已取消授权");
            }
          };
        });
        tbody.querySelectorAll(".wb-assign-user-cb").forEach(function (cb) {
          cb.onchange = syncCheckAll;
        });
      }

      function syncCheckAll() {
        var boxes = tbody.querySelectorAll(".wb-assign-user-cb");
        var checked = tbody.querySelectorAll(".wb-assign-user-cb:checked");
        if (checkAll) checkAll.checked = boxes.length > 0 && checked.length === boxes.length;
      }

      if (checkAll) {
        checkAll.onchange = function () {
          tbody.querySelectorAll(".wb-assign-user-cb").forEach(function (cb) {
            cb.checked = checkAll.checked;
          });
        };
      }

      var revokeBatch = document.getElementById("wb-assign-revoke-batch");
      if (revokeBatch) {
        revokeBatch.onclick = function () {
          var keys = [];
          tbody.querySelectorAll(".wb-assign-user-cb:checked").forEach(function (cb) {
            keys.push(cb.getAttribute("data-key"));
          });
          if (!keys.length) {
            global.WBSystem.toast("请先勾选要取消授权的用户");
            return;
          }
          var removeIdx = keys
            .map(function (k) {
              return parseInt(String(k).split("|")[1], 10);
            })
            .filter(function (n) {
              return !isNaN(n);
            })
            .sort(function (a, b) {
              return b - a;
            });
          removeIdx.forEach(function (i) {
            list.splice(i, 1);
          });
          ROLE_ASSIGNED_USERS[row.roleId] = list.slice();
          refreshTable(list);
          global.WBSystem.toast("已批量取消授权");
        };
      }

      var addBtn = document.getElementById("wb-assign-add");
      if (addBtn) {
        addBtn.onclick = function () {
          global.WBSystem.toast("请选择要分配的用户（原型演示）");
        };
      }

      var searchBtn = document.getElementById("wb-assign-search");
      var resetBtn = document.getElementById("wb-assign-reset");
      var accInput = document.getElementById("wb-assign-filter-account");
      var phoneInput = document.getElementById("wb-assign-filter-phone");
      var all = ROLE_ASSIGNED_USERS[row.roleId] || [];

      if (searchBtn) {
        searchBtn.onclick = function () {
          var acc = (accInput && accInput.value) || "";
          var phone = (phoneInput && phoneInput.value) || "";
          var filtered = all.filter(function (u) {
            var okAcc = !acc || String(u.account).indexOf(acc) >= 0;
            var okPhone = !phone || String(u.phone).indexOf(phone) >= 0;
            return okAcc && okPhone;
          });
          refreshTable(filtered);
        };
      }
      if (resetBtn) {
        resetBtn.onclick = function () {
          if (accInput) accInput.value = "";
          if (phoneInput) phoneInput.value = "";
          refreshTable(all.slice());
        };
      }

      bindRowEvents();
    }

    global.WBSystem.openModal(
      "已分配的用户列表",
      buildBody(users),
      function () {},
      function () {
        bindAssignUsers(users);
      },
      { size: "xl", hideSave: true }
    );
  }

  global.WBRoleForm = {
    buildRoleFormHtml: buildRoleFormHtml,
    mountMenuPermTree: mountMenuPermTree,
    openDataScopeModal: openDataScopeModal,
    openAssignUsersModal: openAssignUsersModal,
    DATA_SCOPE_OPTIONS: DATA_SCOPE_OPTIONS,
  };
})(window);
