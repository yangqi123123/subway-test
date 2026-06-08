/**
 * 系统管理模块 — 行点击详情 HTML（与用户管理详情样式一致）
 */
(function (global) {
  function escapeHtml(value) {
    return String(value || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function detailValueHtml(value, multiline) {
    var text = value === undefined || value === null || value === "" ? "—" : String(value);
    var cls =
      "wb-detail-value" +
      (text === "—" ? " wb-detail-value--empty" : "") +
      (multiline ? " wb-detail-value--multiline" : "");
    return '<div class="' + cls + '">' + escapeHtml(text) + "</div>";
  }

  function detailRowHtml(label, value, full, multiline) {
    return (
      '<label class="wb-detail-form-item' +
      (full ? " wb-detail-form-item--full" : "") +
      '"><span class="wb-detail-form-label">' +
      escapeHtml(label) +
      "：</span>" +
      detailValueHtml(value, multiline) +
      "</label>"
    );
  }

  function detailStatusRow(label, enabled) {
    return (
      '<label class="wb-detail-form-item"><span class="wb-detail-form-label">' +
      escapeHtml(label) +
      "：</span>" +
      detailValueHtml(enabled ? "启用" : "停用") +
      "</label>"
    );
  }

  function buildRoleDetailHtml(row) {
    row = row || {};
    var html = '<div class="wb-detail-form-grid">';
    html += detailRowHtml("角色编号", row.roleId);
    html += detailRowHtml("角色名称", row.roleName);
    html += detailRowHtml("权限字符", row.roleKey);
    html += detailRowHtml("显示顺序", row.roleSort);
    html += detailRowHtml("数据权限", row.dataScope, true);
    html += detailStatusRow("状态", row.status);
    html += detailRowHtml("创建时间", row.createTime);
    html += detailRowHtml("备注", row.remark, true, true);
    html += "</div>";
    return html;
  }

  function findDeptName(deptRows, deptId) {
    if (!deptId) return "—";
    var found = (deptRows || []).find(function (r) {
      return r.deptId === deptId;
    });
    return found ? found.deptName : deptId;
  }

  function buildDeptDetailHtml(row, deptRows) {
    row = row || {};
    var html = '<div class="wb-detail-form-grid">';
    html += detailRowHtml("部门编号", row.deptId);
    html += detailRowHtml("上级部门", findDeptName(deptRows, row.parentId));
    html += detailRowHtml("部门名称", row.deptName);
    html += detailRowHtml("显示排序", row.orderNum);
    html += detailRowHtml("负责人", row.leader);
    html += detailRowHtml("联系电话", row.phone);
    html += detailRowHtml("邮箱", row.email);
    html += detailStatusRow("状态", row.status);
    html += detailRowHtml("创建时间", row.createTime);
    html += "</div>";
    return html;
  }

  function findMenuParentName(menuRows, row) {
    var parentName = "根节点";
    var targetId = row && row.id;
    if (!targetId) return parentName;

    function walk(nodes, parent) {
      for (var i = 0; i < nodes.length; i++) {
        var node = nodes[i];
        if (node.id === targetId) {
          parentName = parent ? parent.menuName : "根节点";
          return true;
        }
        if (node.children && node.children.length && walk(node.children, node)) return true;
      }
      return false;
    }

    walk(menuRows || [], null);
    return parentName;
  }

  function menuIconDetailHtml(icon) {
    if (!icon) return detailValueHtml("");
    return (
      '<div class="wb-detail-value"><span class="inline-flex items-center gap-2">' +
      '<i class="' +
      escapeHtml(icon) +
      ' text-cyan-200/90"></i>' +
      '<span class="text-slate-300/80">' +
      escapeHtml(icon) +
      "</span></span></div>"
    );
  }

  function buildMenuDetailHtml(row, menuRows) {
    row = row || {};
    var html = '<div class="wb-detail-form-grid">';
    html += detailRowHtml("菜单名称", row.menuName);
    html +=
      '<label class="wb-detail-form-item"><span class="wb-detail-form-label">图标：</span>' +
      menuIconDetailHtml(row.icon) +
      "</label>";
    html += detailRowHtml("上级菜单", findMenuParentName(menuRows, row));
    html += detailRowHtml("显示排序", row.orderNum);
    html += detailRowHtml("菜单类型", row.menuType);
    html += detailRowHtml("路由地址", row.routePath);
    html += detailRowHtml("权限标识", row.perms);
    html += detailRowHtml("是否外链", row.isExternal);
    html += detailRowHtml("显示状态", row.visible);
    html += detailStatusRow("菜单状态", row.status);
    html += detailRowHtml("创建时间", row.createTime);
    html += "</div>";
    return html;
  }

  function buildPostDetailHtml(row) {
    row = row || {};
    var html = '<div class="wb-detail-form-grid">';
    html += detailRowHtml("岗位编号", row.postId);
    html += detailRowHtml("所属部门", row.deptName);
    html += detailRowHtml("岗位编码", row.postCode);
    html += detailRowHtml("岗位名称", row.postName);
    html += detailRowHtml("显示顺序", row.postSort);
    html += detailStatusRow("状态", row.status);
    html += detailRowHtml("创建时间", row.createTime);
    html += detailRowHtml("备注", row.remark, true, true);
    html += "</div>";
    return html;
  }

  function buildParamDetailHtml(row) {
    row = row || {};
    var html = '<div class="wb-detail-form-grid">';
    html += detailRowHtml("参数编号", row.configId);
    html += detailRowHtml("参数名称", row.configName, true);
    html += detailRowHtml("参数键名", row.configKey);
    html += detailRowHtml("参数键值", row.configValue);
    html += detailRowHtml("系统内置", row.configType);
    html += detailRowHtml("创建时间", row.createTime);
    html += detailRowHtml("备注", row.remark, true, true);
    html += "</div>";
    return html;
  }

  function buildLoginLogDetailHtml(row) {
    row = row || {};
    var html = '<div class="wb-detail-form-grid">';
    html += detailRowHtml("用户名称", row.userName);
    html += detailRowHtml("IP地址", row.ipaddr);
    html += detailRowHtml("登录地点", row.loginLocation);
    html += detailRowHtml("浏览器", row.browser);
    html += detailRowHtml("操作系统", row.os);
    html += detailRowHtml("状态", row.statusText);
    html += detailRowHtml("信息", row.msg, true, true);
    html += detailRowHtml("登录时间", row.loginTime);
    html += "</div>";
    return html;
  }

  function buildOperateLogDetailHtml(row) {
    row = row || {};
    var html = '<div class="wb-detail-form-grid">';
    html += detailRowHtml("系统模块", row.title);
    html += detailRowHtml("操作类型", row.businessType);
    html += detailRowHtml("请求方式", row.method);
    html += detailRowHtml("操作人员", row.operName);
    html += detailRowHtml("主机", row.operIp);
    html += detailRowHtml("操作地点", row.operLocation);
    html += detailRowHtml("状态", row.statusText);
    html += detailRowHtml("操作时间", row.operTime);
    html += "</div>";
    return html;
  }

  global.WBPageDetails = {
    buildRoleDetailHtml: buildRoleDetailHtml,
    buildDeptDetailHtml: buildDeptDetailHtml,
    buildMenuDetailHtml: buildMenuDetailHtml,
    buildPostDetailHtml: buildPostDetailHtml,
    buildParamDetailHtml: buildParamDetailHtml,
    buildLoginLogDetailHtml: buildLoginLogDetailHtml,
    buildOperateLogDetailHtml: buildOperateLogDetailHtml,
  };
})(window);
