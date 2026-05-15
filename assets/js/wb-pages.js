(function () {
  function clone(value) {
    return JSON.parse(JSON.stringify(value));
  }

  var deptTree = [
    {
      id: "100",
      name: "武汉地铁保护区管理平台",
      count: 35,
      children: [
        {
          id: "101",
          name: "系统管理部",
          count: 8,
          children: [
            { id: "1011", name: "平台运维组", count: 4 },
            { id: "1012", name: "权限配置组", count: 4 },
          ],
        },
        {
          id: "102",
          name: "巡检业务部",
          count: 14,
          children: [
            { id: "1021", name: "人工巡检组", count: 7 },
            { id: "1022", name: "无人机巡检组", count: 7 },
          ],
        },
        {
          id: "103",
          name: "数据中心",
          count: 13,
          children: [
            { id: "1031", name: "资料管理组", count: 6 },
            { id: "1032", name: "分析研判组", count: 7 },
          ],
        },
      ],
    },
  ];

  var userRows = [
    { userId: "1", userName: "admin", nickName: "系统管理员", deptName: "系统管理部", phone: "13800001111", email: "admin@metro.com", sex: "男", status: true, createTime: "2026-05-01 09:12", deptId: "101", remark: "平台超级管理员" },
    { userId: "2", userName: "zhangsan", nickName: "张三", deptName: "平台运维组", phone: "13800002222", email: "zhangsan@metro.com", sex: "男", status: true, createTime: "2026-05-03 10:18", deptId: "1011", remark: "负责日常运维" },
    { userId: "3", userName: "lisi", nickName: "李四", deptName: "人工巡检组", phone: "13800003333", email: "lisi@metro.com", sex: "女", status: false, createTime: "2026-05-04 13:02", deptId: "1021", remark: "待启用" },
    { userId: "4", userName: "wangwu", nickName: "王五", deptName: "无人机巡检组", phone: "13800004444", email: "wangwu@metro.com", sex: "男", status: true, createTime: "2026-05-05 16:26", deptId: "1022", remark: "无人机审批员" },
    { userId: "5", userName: "zhaoliu", nickName: "赵六", deptName: "资料管理组", phone: "13800005555", email: "zhaoliu@metro.com", sex: "女", status: true, createTime: "2026-05-06 08:41", deptId: "1031", remark: "资料库维护" },
  ];

  var deptRows = [
    { deptId: "100", parentId: "", deptName: "武汉地铁保护区管理平台", orderNum: "0", leader: "平台管理员", phone: "027-87650000", email: "root@metro.com", status: true, createTime: "2026-04-01 09:00" },
    { deptId: "101", parentId: "100", deptName: "系统管理部", orderNum: "1", leader: "周工", phone: "027-87650001", email: "sys@metro.com", status: true, createTime: "2026-04-01 09:10" },
    { deptId: "1011", parentId: "101", deptName: "平台运维组", orderNum: "1", leader: "张杰", phone: "027-87650011", email: "ops@metro.com", status: true, createTime: "2026-04-02 09:00" },
    { deptId: "1012", parentId: "101", deptName: "权限配置组", orderNum: "2", leader: "刘洋", phone: "027-87650012", email: "auth@metro.com", status: true, createTime: "2026-04-02 09:10" },
    { deptId: "102", parentId: "100", deptName: "巡检业务部", orderNum: "2", leader: "陈晨", phone: "027-87650021", email: "inspect@metro.com", status: true, createTime: "2026-04-03 10:00" },
    { deptId: "103", parentId: "100", deptName: "数据中心", orderNum: "3", leader: "吴敏", phone: "027-87650031", email: "data@metro.com", status: false, createTime: "2026-04-03 11:00" },
  ];

  var roleRows = [
    { roleId: "1", roleName: "超级管理员", roleKey: "super_admin", roleSort: "1", dataScope: "全部数据权限", status: true, createTime: "2026-04-01 10:00", remark: "拥有全部权限" },
    { roleId: "2", roleName: "系统管理员", roleKey: "system_admin", roleSort: "2", dataScope: "本部门及以下", status: true, createTime: "2026-04-02 10:00", remark: "负责系统维护" },
    { roleId: "3", roleName: "业务审核员", roleKey: "reviewer", roleSort: "3", dataScope: "自定义权限", status: false, createTime: "2026-04-03 10:00", remark: "负责流程审核" },
  ];

  var menuRows = [
    {
      id: "m1",
      menuName: "系统管理",
      icon: "fa-solid fa-screwdriver-wrench",
      orderNum: "1",
      perms: "system:*",
      component: "/system",
      menuType: "目录",
      visible: "显示",
      status: true,
      createTime: "2026-04-01 10:00",
      children: [
        { id: "m11", menuName: "用户管理", icon: "fa-regular fa-user", orderNum: "1", perms: "system:user:list", component: "/system/user", menuType: "菜单", visible: "显示", status: true, createTime: "2026-04-01 10:10" },
        { id: "m12", menuName: "角色管理", icon: "fa-regular fa-id-badge", orderNum: "2", perms: "system:role:list", component: "/system/role", menuType: "菜单", visible: "显示", status: true, createTime: "2026-04-01 10:12" },
        { id: "m13", menuName: "菜单管理", icon: "fa-solid fa-bars", orderNum: "3", perms: "system:menu:list", component: "/system/menu", menuType: "菜单", visible: "显示", status: true, createTime: "2026-04-01 10:15" },
      ],
    },
    {
      id: "m2",
      menuName: "工作流",
      icon: "fa-solid fa-diagram-project",
      orderNum: "2",
      perms: "workflow:*",
      component: "/workflow",
      menuType: "目录",
      visible: "显示",
      status: true,
      createTime: "2026-04-02 11:00",
      children: [
        { id: "m21", menuName: "流程分类", icon: "fa-regular fa-folder-open", orderNum: "1", perms: "workflow:category:list", component: "/workflow/category", menuType: "菜单", visible: "显示", status: true, createTime: "2026-04-02 11:05" },
      ],
    },
  ];

  var postRows = [
    { postId: "1", postCode: "SYS_ADMIN", postName: "系统管理员", postSort: "1", status: true, createTime: "2026-04-01 08:00", remark: "负责用户与权限配置" },
    { postId: "2", postCode: "OPS_ENGINEER", postName: "运维工程师", postSort: "2", status: true, createTime: "2026-04-05 08:30", remark: "负责平台运行维护" },
    { postId: "3", postCode: "PATROL_MANAGER", postName: "巡检主管", postSort: "3", status: false, createTime: "2026-04-08 09:00", remark: "负责巡检任务分派" },
  ];

  var dictTree = [
    {
      id: "d1",
      name: "字典类型",
      count: 6,
      children: [
        { id: "line_status", name: "线路状态", count: 2 },
        { id: "user_sex", name: "用户性别", count: 2 },
        { id: "notice_type", name: "公告类型", count: 2 },
      ],
    },
  ];

  var dictRows = [
    { dictType: "line_status", dictLabel: "可用", dictValue: "0", dictSort: "1", status: true, cssClass: "success", listClass: "primary", createTime: "2026-04-01 10:00", remark: "线路启用状态" },
    { dictType: "line_status", dictLabel: "禁用", dictValue: "1", dictSort: "2", status: true, cssClass: "danger", listClass: "danger", createTime: "2026-04-01 10:10", remark: "线路停用状态" },
    { dictType: "user_sex", dictLabel: "男", dictValue: "0", dictSort: "1", status: true, cssClass: "", listClass: "default", createTime: "2026-04-02 10:00", remark: "" },
    { dictType: "user_sex", dictLabel: "女", dictValue: "1", dictSort: "2", status: true, cssClass: "", listClass: "warning", createTime: "2026-04-02 10:10", remark: "" },
    { dictType: "notice_type", dictLabel: "通知", dictValue: "notice", dictSort: "1", status: true, cssClass: "", listClass: "primary", createTime: "2026-04-03 09:00", remark: "平台通知" },
    { dictType: "notice_type", dictLabel: "公告", dictValue: "announce", dictSort: "2", status: true, cssClass: "", listClass: "warning", createTime: "2026-04-03 09:10", remark: "系统公告" },
  ];

  var paramRows = [
    { configId: "1", configName: "空域许可到期预警天数", configKey: "airspace.warn.days", configValue: "7", configType: "是", remark: "到期前自动预警", createTime: "2026-04-08 09:00" },
    { configId: "2", configName: "默认分页条数", configKey: "system.page.size", configValue: "10", configType: "是", remark: "系统表格默认分页", createTime: "2026-04-08 09:10" },
    { configId: "3", configName: "日志保留天数", configKey: "system.log.keepDays", configValue: "180", configType: "否", remark: "操作日志保留周期", createTime: "2026-04-08 09:20" },
  ];

  var noticeRows = [
    { noticeId: "1", noticeTitle: "五一期间巡检值班安排", noticeType: "通知", statusText: "已发布", createBy: "admin", createTime: "2026-04-28 09:00", noticeContent: "请各业务组按照排班执行。" },
    { noticeId: "2", noticeTitle: "系统升级维护公告", noticeType: "公告", statusText: "草稿", createBy: "system", createTime: "2026-05-02 14:20", noticeContent: "计划于周末进行升级维护。" },
    { noticeId: "3", noticeTitle: "无人机设备巡检规范更新", noticeType: "公告", statusText: "已发布", createBy: "wangwu", createTime: "2026-05-06 11:30", noticeContent: "更新飞行前校验与回传要求。" },
  ];

  var loginLogRows = [
    { userName: "admin", ipaddr: "10.20.1.11", loginLocation: "武汉", browser: "Chrome", os: "Windows 11", statusText: "成功", msg: "登录成功", loginTime: "2026-05-14 08:32:15" },
    { userName: "zhangsan", ipaddr: "10.20.1.35", loginLocation: "武汉", browser: "Edge", os: "Windows 11", statusText: "成功", msg: "登录成功", loginTime: "2026-05-14 09:03:42" },
    { userName: "lisi", ipaddr: "10.20.1.56", loginLocation: "武汉", browser: "Chrome", os: "Windows 10", statusText: "失败", msg: "密码错误", loginTime: "2026-05-14 09:18:09" },
  ];

  var operateLogRows = [
    { title: "用户管理", businessType: "新增", method: "POST", operName: "admin", operIp: "10.20.1.11", operLocation: "武汉", statusText: "成功", operTime: "2026-05-14 10:02:15", operParam: "新增用户 zhangsan" },
    { title: "角色管理", businessType: "修改", method: "PUT", operName: "zhangsan", operIp: "10.20.1.35", operLocation: "武汉", statusText: "成功", operTime: "2026-05-14 10:16:40", operParam: "修改角色 reviewer" },
    { title: "菜单管理", businessType: "删除", method: "DELETE", operName: "admin", operIp: "10.20.1.11", operLocation: "武汉", statusText: "成功", operTime: "2026-05-14 11:05:27", operParam: "删除旧测试菜单" },
  ];

  function baseExpanded() {
    return { "100": true, "101": true, "102": true, "103": true, m1: true, m2: true };
  }

  function treeSelectOptions() {
    return ["武汉地铁保护区管理平台", "系统管理部", "平台运维组", "权限配置组", "巡检业务部", "数据中心"];
  }

  function userActions() {
    return [
      { label: "编辑", cls: "gold", type: "edit" },
      { label: "删除", cls: "warn", type: "delete" },
      {
        label: "重置密码",
        handler: function (row) {
          WBSystem.toast("已重置 " + row.userName + " 的密码");
        },
      },
      {
        label: "分配角色",
        handler: function (row) {
          WBSystem.openModal(
            "分配角色",
            '<div class="px-5 py-6 text-sm leading-7 text-slate-200">已为 <b class="text-cyan-300">' +
              row.userName +
              "</b> 打开角色分配面板。</div>"
          );
        },
      },
    ];
  }

  function roleActions() {
    return [
      { label: "编辑", cls: "gold", type: "edit" },
      { label: "删除", cls: "warn", type: "delete" },
      {
        label: "分配菜单",
        handler: function (row) {
          WBSystem.toast("已打开 " + row.roleName + " 的菜单分配");
        },
      },
      {
        label: "数据权限",
        handler: function (row) {
          WBSystem.toast("已打开 " + row.roleName + " 的数据权限");
        },
      },
    ];
  }

  function deptActions() {
    return [
      { label: "新增", handler: function (row) { WBSystem.toast("已准备在 " + row.deptName + " 下新增部门"); } },
      { label: "编辑", cls: "gold", type: "edit" },
      { label: "删除", cls: "warn", type: "delete" },
    ];
  }

  function menuActions() {
    return [
      {
        label: "新增下级",
        handler: function (row) {
          WBSystem.openModal(
            "新增下级菜单",
            '<div class="px-5 py-6 text-sm leading-7 text-slate-200">将在 <b class="text-cyan-300">' +
              row.menuName +
              "</b> 下新增菜单。</div>"
          );
        },
      },
      { label: "编辑", cls: "gold", type: "edit" },
      { label: "删除", cls: "warn", type: "delete" },
    ];
  }

  function pageConfig(key) {
    if (key === "wb-user") {
      return {
        pageType: "tree-table",
        title: "用户管理",
        filters: [
          { key: "userName", label: "用户名称" },
          { key: "phone", label: "手机号码" },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"] },
          { key: "createTime", label: "创建时间" },
        ],
        filterState: {},
        primaryButtons: [
          { label: "新增", action: "add", modalTitle: "新增用户" },
          { label: "导出", variant: "ghost", tip: "用户数据已导出" },
        ],
        treeData: clone(deptTree),
        selectedTreeId: "100",
        expandedMap: baseExpanded(),
        columns: [
          { key: "userId", label: "用户编号" },
          { key: "userName", label: "用户名称" },
          { key: "nickName", label: "用户昵称" },
          { key: "deptName", label: "部门" },
          { key: "phone", label: "手机号码" },
          { key: "status", label: "状态", type: "switch" },
          { key: "createTime", label: "创建时间" },
        ],
        getRows: function () {
          if (this.selectedTreeId === "100") return userRows;
          return userRows.filter(function (row) {
            return row.deptId === this.selectedTreeId || String(row.deptId).indexOf(this.selectedTreeId) === 0;
          }, this);
        },
        pageState: { page: 1, pageSize: 10 },
        formFields: [
          { key: "deptName", label: "归属部门", type: "select", options: treeSelectOptions(), required: true },
          { key: "userName", label: "用户名称", required: true },
          { key: "nickName", label: "用户昵称", required: true },
          { key: "phone", label: "手机号码", required: true },
          { key: "email", label: "邮箱" },
          { key: "sex", label: "性别", type: "select", options: ["男", "女"], required: true },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"], required: true },
          { key: "remark", label: "备注", type: "textarea", full: true },
        ],
        actions: userActions(),
      };
    }

    if (key === "wb-role") {
      return {
        pageType: "table",
        title: "角色管理",
        filters: [
          { key: "roleName", label: "角色名称" },
          { key: "roleKey", label: "权限字符" },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"] },
          { key: "createTime", label: "创建时间" },
        ],
        filterState: {},
        primaryButtons: [
          { label: "新增", action: "add", modalTitle: "新增角色" },
          { label: "导出", variant: "ghost", tip: "角色数据已导出" },
        ],
        columns: [
          { key: "roleId", label: "角色编号" },
          { key: "roleName", label: "角色名称" },
          { key: "roleKey", label: "权限字符" },
          { key: "roleSort", label: "显示顺序" },
          { key: "dataScope", label: "数据权限" },
          { key: "status", label: "状态", type: "switch" },
          { key: "createTime", label: "创建时间" },
        ],
        rows: roleRows,
        pageState: { page: 1, pageSize: 10 },
        formFields: [
          { key: "roleName", label: "角色名称", required: true },
          { key: "roleKey", label: "权限字符", required: true },
          { key: "roleSort", label: "角色顺序", required: true },
          { key: "dataScope", label: "数据权限", type: "select", options: ["全部数据权限", "本部门及以下", "本部门", "仅本人", "自定义权限"], required: true },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"], required: true },
          { key: "remark", label: "备注", type: "textarea", full: true },
        ],
        actions: roleActions(),
      };
    }

    if (key === "wb-dept") {
      return {
        pageType: "tree-table",
        title: "部门管理",
        filters: [
          { key: "deptName", label: "部门名称" },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"] },
        ],
        filterState: {},
        primaryButtons: [
          { label: "新增", action: "add", modalTitle: "新增部门" },
          { label: "导出", variant: "ghost", tip: "部门数据已导出" },
        ],
        treeData: clone(deptTree),
        selectedTreeId: "100",
        expandedMap: baseExpanded(),
        columns: [
          { key: "deptName", label: "部门名称" },
          { key: "orderNum", label: "排序" },
          { key: "leader", label: "负责人" },
          { key: "phone", label: "联系电话" },
          { key: "email", label: "邮箱" },
          { key: "status", label: "状态", type: "switch" },
          { key: "createTime", label: "创建时间" },
        ],
        getRows: function () {
          if (this.selectedTreeId === "100") return deptRows;
          return deptRows.filter(function (row) {
            return row.deptId === this.selectedTreeId || row.parentId === this.selectedTreeId;
          }, this);
        },
        pageState: { page: 1, pageSize: 10 },
        formFields: [
          { key: "parentId", label: "上级部门", type: "select", options: treeSelectOptions(), required: true },
          { key: "deptName", label: "部门名称", required: true },
          { key: "orderNum", label: "显示排序", required: true },
          { key: "leader", label: "负责人" },
          { key: "phone", label: "联系电话" },
          { key: "email", label: "邮箱" },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"], required: true },
        ],
        actions: deptActions(),
      };
    }

    if (key === "wb-menu") {
      return {
        pageType: "menu",
        title: "菜单管理",
        filters: [
          { key: "menuName", label: "菜单名称" },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"] },
        ],
        filterState: {},
        primaryButtons: [
          { label: "新增", action: "add", modalTitle: "新增菜单" },
          { label: "导出", variant: "ghost", tip: "菜单数据已导出" },
        ],
        columns: [
          { key: "menuName", label: "菜单名称" },
          { key: "icon", label: "图标" },
          { key: "orderNum", label: "排序" },
          { key: "perms", label: "权限标识" },
          { key: "component", label: "组件路径" },
          { key: "menuType", label: "类型" },
          { key: "visible", label: "可见" },
          { key: "status", label: "状态", type: "switch" },
          { key: "createTime", label: "创建时间" },
        ],
        rows: clone(menuRows),
        expandedMap: baseExpanded(),
        menuExpanded: true,
        formFields: [
          { key: "menuName", label: "菜单名称", required: true },
          { key: "menuType", label: "菜单类型", type: "select", options: ["目录", "菜单", "按钮"], required: true },
          { key: "parentId", label: "上级菜单", type: "select", options: ["根节点", "系统管理", "工作流"] },
          { key: "icon", label: "图标" },
          { key: "orderNum", label: "显示排序", required: true },
          { key: "component", label: "组件路径" },
          { key: "perms", label: "权限标识" },
          { key: "visible", label: "显示状态", type: "select", options: ["显示", "隐藏"], required: true },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"], required: true },
        ],
        actions: menuActions(),
      };
    }

    if (key === "wb-post") {
      return {
        pageType: "table",
        title: "岗位管理",
        filters: [
          { key: "postCode", label: "岗位编码" },
          { key: "postName", label: "岗位名称" },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"] },
        ],
        filterState: {},
        primaryButtons: [
          { label: "新增", action: "add", modalTitle: "新增岗位" },
          { label: "导出", variant: "ghost", tip: "岗位数据已导出" },
        ],
        columns: [
          { key: "postId", label: "岗位编号" },
          { key: "postCode", label: "岗位编码" },
          { key: "postName", label: "岗位名称" },
          { key: "postSort", label: "排序" },
          { key: "status", label: "状态", type: "switch" },
          { key: "createTime", label: "创建时间" },
          { key: "remark", label: "备注" },
        ],
        rows: postRows,
        pageState: { page: 1, pageSize: 10 },
        formFields: [
          { key: "postCode", label: "岗位编码", required: true },
          { key: "postName", label: "岗位名称", required: true },
          { key: "postSort", label: "显示顺序", required: true },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"], required: true },
          { key: "remark", label: "备注", type: "textarea", full: true },
        ],
        actions: [
          { label: "编辑", cls: "gold", type: "edit" },
          { label: "删除", cls: "warn", type: "delete" },
        ],
      };
    }

    if (key === "wb-dict") {
      return {
        pageType: "tree-table",
        title: "字典管理",
        filters: [
          { key: "dictLabel", label: "字典标签" },
          { key: "dictValue", label: "字典键值" },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"] },
        ],
        filterState: {},
        primaryButtons: [
          { label: "新增", action: "add", modalTitle: "新增字典数据" },
          { label: "导出", variant: "ghost", tip: "字典数据已导出" },
        ],
        treeData: clone(dictTree),
        selectedTreeId: "d1",
        expandedMap: { d1: true },
        columns: [
          { key: "dictLabel", label: "字典标签" },
          { key: "dictValue", label: "字典键值" },
          { key: "dictSort", label: "字典排序" },
          { key: "status", label: "状态", type: "switch" },
          { key: "cssClass", label: "CSS类名" },
          { key: "listClass", label: "列表样式" },
          { key: "createTime", label: "创建时间" },
          { key: "remark", label: "备注" },
        ],
        getRows: function () {
          if (this.selectedTreeId === "d1") return dictRows;
          return dictRows.filter(function (row) {
            return row.dictType === this.selectedTreeId;
          }, this);
        },
        pageState: { page: 1, pageSize: 10 },
        formFields: [
          { key: "dictType", label: "字典类型", type: "select", options: ["line_status", "user_sex", "notice_type"], required: true },
          { key: "dictLabel", label: "字典标签", required: true },
          { key: "dictValue", label: "字典键值", required: true },
          { key: "dictSort", label: "排序", required: true },
          { key: "statusText", label: "状态", type: "select", options: ["启用", "停用"], required: true },
          { key: "remark", label: "备注", type: "textarea", full: true },
        ],
        actions: [
          { label: "编辑", cls: "gold", type: "edit" },
          { label: "删除", cls: "warn", type: "delete" },
        ],
      };
    }

    if (key === "wb-param") {
      return {
        pageType: "table",
        title: "参数配置",
        filters: [
          { key: "configName", label: "参数名称" },
          { key: "configKey", label: "参数键名" },
          { key: "configType", label: "系统内置", type: "select", options: ["是", "否"] },
        ],
        filterState: {},
        primaryButtons: [
          { label: "新增", action: "add", modalTitle: "新增参数" },
          { label: "导出", variant: "ghost", tip: "参数数据已导出" },
        ],
        columns: [
          { key: "configId", label: "参数编号" },
          { key: "configName", label: "参数名称" },
          { key: "configKey", label: "参数键名" },
          { key: "configValue", label: "参数键值" },
          { key: "configType", label: "系统内置" },
          { key: "remark", label: "备注" },
          { key: "createTime", label: "创建时间" },
        ],
        rows: paramRows,
        pageState: { page: 1, pageSize: 10 },
        formFields: [
          { key: "configName", label: "参数名称", required: true },
          { key: "configKey", label: "参数键名", required: true },
          { key: "configValue", label: "参数键值", required: true },
          { key: "configType", label: "系统内置", type: "select", options: ["是", "否"], required: true },
          { key: "remark", label: "备注", type: "textarea", full: true },
        ],
        actions: [
          { label: "编辑", cls: "gold", type: "edit" },
          { label: "删除", cls: "warn", type: "delete" },
        ],
      };
    }

    if (key === "wb-notice") {
      return {
        pageType: "table",
        title: "通知公告",
        filters: [
          { key: "noticeTitle", label: "公告标题" },
          { key: "noticeType", label: "公告类型", type: "select", options: ["通知", "公告"] },
          { key: "createBy", label: "创建者" },
        ],
        filterState: {},
        primaryButtons: [
          { label: "新增", action: "add", modalTitle: "新增公告" },
          { label: "导出", variant: "ghost", tip: "公告数据已导出" },
        ],
        columns: [
          { key: "noticeId", label: "公告编号" },
          { key: "noticeTitle", label: "公告标题" },
          { key: "noticeType", label: "公告类型" },
          { key: "statusText", label: "发布状态" },
          { key: "createBy", label: "创建者" },
          { key: "createTime", label: "创建时间" },
        ],
        rows: noticeRows,
        pageState: { page: 1, pageSize: 10 },
        formFields: [
          { key: "noticeTitle", label: "公告标题", required: true, full: true },
          { key: "noticeType", label: "公告类型", type: "select", options: ["通知", "公告"], required: true },
          { key: "statusText", label: "发布状态", type: "select", options: ["草稿", "已发布"], required: true },
          { key: "noticeContent", label: "公告内容", type: "textarea", full: true, required: true },
        ],
        actions: [
          {
            label: "查看",
            handler: function (row) {
              WBSystem.openModal(
                "公告详情",
                '<div class="px-5 py-6 text-sm leading-7 text-slate-200"><div class="mb-3 text-base font-semibold text-white">' +
                  row.noticeTitle +
                  '</div><div>' +
                  row.noticeContent +
                  "</div></div>"
              );
            },
          },
          { label: "编辑", cls: "gold", type: "edit" },
          { label: "删除", cls: "warn", type: "delete" },
        ],
      };
    }

    if (key === "wb-log") {
      return {
        pageType: "log",
        title: "日志管理",
        filters: [
          { key: "userName", label: "用户名称" },
          { key: "statusText", label: "状态", type: "select", options: ["成功", "失败"] },
          { key: "loginTime", label: "时间" },
        ],
        filterState: {},
        primaryButtons: [
          { label: "导出", variant: "ghost", tip: "日志数据已导出" },
        ],
        activeLogTab: "login",
        pageState: { page: 1, pageSize: 10 },
        logTabs: [
          { key: "login", label: "登录日志" },
          { key: "operate", label: "操作日志" },
        ],
        getCurrentTab: function () {
          if (this.activeLogTab === "operate") {
            return {
              rows: operateLogRows,
              columns: [
                { key: "title", label: "系统模块" },
                { key: "businessType", label: "操作类型" },
                { key: "method", label: "请求方式" },
                { key: "operName", label: "操作人员" },
                { key: "operIp", label: "主机" },
                { key: "operLocation", label: "操作地点" },
                { key: "statusText", label: "状态" },
                { key: "operTime", label: "操作时间" },
              ],
              actions: [
                {
                  label: "查看",
                  handler: function (row) {
                    WBSystem.openModal("操作日志详情", '<div class="px-5 py-6 text-sm leading-7 text-slate-200">' + row.operParam + "</div>");
                  },
                },
              ],
            };
          }
          return {
            rows: loginLogRows,
            columns: [
              { key: "userName", label: "用户名称" },
              { key: "ipaddr", label: "IP地址" },
              { key: "loginLocation", label: "登录地点" },
              { key: "browser", label: "浏览器" },
              { key: "os", label: "操作系统" },
              { key: "statusText", label: "状态" },
              { key: "msg", label: "信息" },
              { key: "loginTime", label: "登录时间" },
            ],
            actions: [
              {
                label: "查看",
                handler: function (row) {
                  WBSystem.openModal("登录日志详情", '<div class="px-5 py-6 text-sm leading-7 text-slate-200">' + row.msg + "</div>");
                },
              },
            ],
          };
        },
      };
    }

    return null;
  }

  function boot() {
    var key = document.body.getAttribute("data-sidebar-key");
    var config = pageConfig(key);
    if (!config || !window.WBSystem) return;
    WBSystem.createPage(config);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", boot);
  } else {
    boot();
  }
})();
