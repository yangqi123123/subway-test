/**
 * 项目管理页逻辑（Web / 移动端共用）
 */
(function (global) {
  "use strict";

  function bootInProjectPage(options) {
    options = options || {};
    var isMobile = !!options.mobile;
    var projectModule =
      options.module ||
      (document.body && document.body.getAttribute("data-project-module")) ||
      "active";
    var isDoneModule = projectModule === "done";
    var mobileListEl = isMobile ? document.getElementById("project-mobile-list") : null;
    var patrolPage = options.patrolPage || "in-project-patrol.html";
    var searchPage = options.searchPage || "project-search.html";
    var listPage = options.listPage || "project.html";
    var currentProjectIndex = -1;
    var mobilePageSize = 8;
    var mobileListPage = 1;
    var mobileFilterRows = null;

      var PROJECT_CATEGORY_OPTIONS = [
        "钻孔、地勘、打桩", "道路排水工程", "房建工程", "燃气热力、电力工程", "园林绿化景观工程",
        "建构筑物改造", "普通工程", "浅埋开挖", "基坑开挖", "桩基施工", "路面翻修", "其他"
      ];
      var PROJECT_STRUCT_TYPE_OPTIONS = ["盾构结构", "明挖结构", "高架结构", "车站结构", "附属结构", "联络通道"];
      var PROJECT_STRUCT_STATUS_OPTIONS = ["良好", "一般", "较差", "需加固", "施工中", "已停运"];
      var PROJECT_ADDR_TYPE_OPTIONS = ["区间", "车站", "出入口", "停车场", "风亭", "冷却塔", "变电所", "车辆段", "其他"];
      var projectFieldSelects = [];

      var projects = (
        isDoneModule ? global.WH_PROJECT_DONE_ROWS : global.WH_PROJECT_DEMO_ROWS || []
      ).map(function (row) {
        return row.slice();
      });
      if (!projects.length) {
        projects = [
          ["1318", "航空室内柜建设项目", "一般项目", "普通工程", "7号线", "松槐路~天阳大道", "下行", "2026-03-04 17:01", "114.270805", "30.782717", "", "", ""]
        ];
      }

      var tbody = document.getElementById("project-table-body");
      var toast = document.getElementById("project-toast");
      var modalMask = document.getElementById("project-modal-mask");
      var modalTitle = document.getElementById("modal-title");
      var modalBody = document.getElementById("modal-body");
      var viewTitle = document.getElementById("project-view-title");
      var viewSubtitle = document.getElementById("project-view-subtitle");
      var detailShell = document.getElementById("project-detail-shell");
      var backBtn = document.getElementById("project-back-btn");
      var modalType = "";
      var currentProjectMode = "detail";
      var projectUnits = ["建设单位", "第三方监测单位", "总承包单位", "设计单位", "代建单位", "勘察单位", "基坑单位", "基坑监测单位"];
      var activeUnit = projectUnits[0];
      var contactEditIndex = -1;
      var unitCompanies = {
        "建设单位": ["武汉城建集团", "武汉轨道交通建设有限公司", "武汉临空港建设发展有限公司"],
        "第三方监测单位": ["武汉市测绘研究院", "中铁大桥勘测设计院", "武汉岩土监测中心"],
        "总承包单位": ["中建三局集团有限公司", "中铁十一局集团有限公司", "中交二航局"],
        "设计单位": ["中南建筑设计院", "铁四院", "武汉市政设计研究院"],
        "代建单位": ["武汉地铁资源经营有限公司", "武汉城投项目管理公司"],
        "勘察单位": ["湖北省地质勘察院", "中南勘察设计院"],
        "基坑单位": ["武汉深基坑工程公司", "中建基础设施公司"],
        "基坑监测单位": ["武汉基坑监测中心", "湖北岩土监测院"]
      };
      var unitSelections = {
        "建设单位": "武汉轨道交通建设有限公司",
        "第三方监测单位": "武汉市测绘研究院",
        "总承包单位": "中建三局集团有限公司",
        "设计单位": "铁四院",
        "代建单位": "武汉地铁资源经营有限公司",
        "勘察单位": "湖北省地质勘察院",
        "基坑单位": "武汉深基坑工程公司",
        "基坑监测单位": "武汉基坑监测中心"
      };
      var unitContacts = {
        "建设单位": [
          { name: "张建国", phone: "13871560218", otherContact: "027-88886666" },
          { name: "刘晓岚", phone: "13986221106", otherContact: "liuxl@example.com" }
        ],
        "第三方监测单位": [
          { name: "陈志坤", phone: "13627190514", otherContact: "chenzk_wx" }
        ],
        "总承包单位": [],
        "设计单位": [],
        "代建单位": [],
        "勘察单位": [],
        "基坑单位": [],
        "基坑监测单位": []
      };
      var previewPayload = null;
      var currentDocCategory = "";
      var currentDocEditIndex = -1;
      var currentExchangeEditIndex = -1;
      var docModalSelects = [];
      var docLibrary = {
        "项目告知单": [
          {
            noticeName: "花山河口公园项目告知单",
            noticeNo: "GZD-2026-0318",
            issuer: "王工",
            issueDate: "2026-03-03",
            signUnit: "武汉轨道交通建设有限公司",
            signPerson: "张建国",
            signPhone: "13871560218",
            fileName: "告知函-花山河口公园项目.pdf",
            mimeType: "application/pdf"
          }
        ],
        "项目运营发函": [
          {
            letterName: "关于地勘施工窗口协调函",
            primaryUnit: "武汉轨道交通建设有限公司",
            primaryContact: "张建国",
            primaryPhone: "13871560218",
            ccUnit: "武汉市测绘研究院",
            letterDate: "2026-03-04",
            fileName: "运营发函-20260304.docx",
            mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
          }
        ],
        "项目外部来函": [
          {
            letterName: "建设单位现场协调回函",
            fromUnit: "武汉城建集团",
            fromContact: "李敏",
            fromPhone: "13986220088",
            letterDate: "2026-03-05",
            fileName: "外部来函-建设单位回函.pdf",
            mimeType: "application/pdf"
          }
        ],
        "技术中心回函": [
          {
            techReplyName: "花山河口公园地勘审查意见",
            techReplyType: "书面回函",
            techHandler: "李工",
            techReplyDate: "2026-03-06",
            fileName: "技术中心回函-审查意见.pdf",
            mimeType: "application/pdf"
          }
        ],
        "项目安全影响评估": [],
        "项目初始化状态报告": [],
        "项目专项施工方案及专家意见": [],
        "项目第三方监测方案及专家意见": [],
        "安全协议": [],
        "其他资料": []
      };
      var exchangeRecords = [
        {
          date: "2026-03-05",
          unit: "武汉轨道交通建设有限公司",
          content: "就地勘施工时间窗、保护区报审流程进行现场交底。",
          procedure: "是",
          photos: [{ name: "现场交底照片1.jpg" }],
          videos: [{ name: "交底现场视频1.mp4" }],
          attachment: "交底记录表.pdf",
          attachmentMimeType: "application/pdf"
        },
        {
          date: "2026-03-07",
          unit: "中建三局集团有限公司",
          content: "针对夜间施工围挡范围及临近结构保护措施进行交涉。",
          procedure: "是",
          photos: [{ name: "交涉现场照片2.jpg" }],
          videos: [],
          attachment: "交涉纪要.docx",
          attachmentMimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        }
      ];
      var exchangeUploaders = null;
      var monitorLedger = {
        base: {
          projectName: "花山河口公园湖心岛地勘施工项目",
          range: "花山车辆段出入段线 / 花山河站",
          benchmarkCount: "6",
          benchmarkLocation: "DK0+120、DK0+185 等",
          warningValue: "±8mm",
          control1: "±12mm",
          control2: "±10mm",
          builderContact: "武汉轨道交通建设有限公司 / 张工 13800001111",
          constructorContact: "中建三局 / 李工 13900002222",
          thirdContact: "湖北地矿监测 / 王工 13700003333",
          internalContact: "地铁集团监测中心 / 赵工 13600004444",
          typeLevel: "基坑开挖 / 二级",
          minDistance: "43m",
          follower: "杨俊杰",
          riskPeriod: "2026-03 ~ 2026-06",
          startTime: "2026-03-01",
          stopTime: ""
        },
        plan: {
          expertTime: "2026-02-20",
          equipment: "徕卡 TM50 + 自动化静力水准",
          pointSpacing: "15m",
          jointFrequency: "每周 1 次",
          stageMethod: "开挖期加密至每日 1 次，结构施工期每周 2 次",
          stageOne: "基坑开挖：每日人工巡查 + 自动化采集",
          stageTwo: "结构回筑：每周 2 次人工联测",
          benchmarkJointTime: "2026-03-01"
        },
        summary: {
          text: "项目位于 19 号线花山河站保护区，地勘施工共 6 个勘测点位，与车站主体结构最小水平净距约 43 米，已编制专项监测方案并通过专家评审。"
        }
      };
      var monitorLogs = [
        {
          date: "2026-03-05",
          reportPeriod: "第1期",
          monitorData: "基准点复测稳定，周边沉降累计 -1.2mm，未超预警。",
          overWarning: "否"
        },
        {
          date: "2026-03-12",
          reportPeriod: "第2期",
          monitorData: "开挖面附近测点沉降速率略增，已发预警短信。",
          overWarning: "是"
        }
      ];
      var currentMonitorLogEditIndex = -1;
      var projectOperationLogs = {
        "1318": [
          { action: "新增项目", time: "2026-05-18 17:36:56", user: "王志颖" },
          { action: "修改项目状态信息", time: "2026-05-18 17:36:42", user: "王志颖" },
          { action: "修改项目参建单位信息", time: "2026-05-18 17:36:28", user: "王志颖" },
          { action: "修改项目交涉信息", time: "2026-05-18 17:36:14", user: "王志颖" },
          { action: "修改项目告知单", time: "2026-05-18 17:36:00", user: "王志颖" }
        ],
        "1317": [
          { action: "新增项目", time: "2026-05-17 11:20:08", user: "刘晓岚" },
          { action: "修改项目状态信息", time: "2026-05-17 11:18:44", user: "刘晓岚" },
          { action: "修改项目相关资料", time: "2026-05-17 10:55:12", user: "杨俊杰" }
        ]
      };

      function setStatText(id, val) {
        var el = document.getElementById(id);
        if (el) el.textContent = String(val);
      }

      function updateProjectStats() {
        var total = projects.length;
        var key = 0;
        var general = 0;
        var month = 0;
        var now = new Date();
        var monthKey =
          now.getFullYear() + "-" + String(now.getMonth() + 1).padStart(2, "0");
        projects.forEach(function (row) {
          if (row[2] === "重点项目") key += 1;
          if (row[2] === "一般项目") general += 1;
          if (row[6] && String(row[6]).indexOf(monthKey) === 0) month += 1;
        });
        setStatText("stat-total", total);
        setStatText("stat-key", key);
        setStatText("stat-general", general);
        setStatText("stat-month", month);
        setStatText("table-total", total);
      }

      function initQuickLinks() {
        document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
          var target = anchor.getAttribute("data-quick-href");
          if (target && typeof whPageHref === "function") {
            anchor.setAttribute("href", whPageHref(target));
          }
        });
      }

      function formatNow() {
        var d = new Date();
        var p = function (n) {
          return String(n).padStart(2, "0");
        };
        return d.getFullYear() + "-" + p(d.getMonth() + 1) + "-" + p(d.getDate()) + " " + p(d.getHours()) + ":" + p(d.getMinutes());
      }

      function nextProjectId() {
        var max = 1300;
        projects.forEach(function (row) {
          var n = parseInt(row[0], 10);
          if (!Number.isNaN(n) && n > max) max = n;
        });
        return String(max + 1);
      }

      function getListSource() {
        return mobileFilterRows !== null ? mobileFilterRows : projects;
      }

      function projectIndexInMain(row) {
        for (var i = 0; i < projects.length; i++) {
          if (projects[i] === row || (projects[i][0] === row[0] && projects[i][1] === row[1])) return i;
        }
        return -1;
      }

      function projectActionHtml(index) {
        if (isDoneModule) {
          return (
            '<button type="button" class="mp-project-action" data-action="patrol-project" data-row="' +
            index +
            '"><i class="fa-regular fa-clipboard"></i>巡查记录</button>' +
            '<button type="button" class="mp-project-action" data-action="view-project-records" data-row="' +
            index +
            '"><i class="fa-regular fa-clock"></i>操作记录</button>'
          );
        }
        return (
          '<button type="button" class="mp-project-action" data-action="edit-project" data-row="' + index + '"><i class="fa-regular fa-pen-to-square"></i>编辑</button>' +
          '<button type="button" class="mp-project-action" data-action="patrol-project" data-row="' + index + '"><i class="fa-regular fa-clipboard"></i>巡查记录</button>' +
          '<button type="button" class="mp-project-action mp-project-action--danger" data-action="delete-project" data-row="' + index + '"><i class="fa-regular fa-trash-can"></i>删除</button>' +
          '<button type="button" class="mp-project-action" data-action="view-project-records" data-row="' + index + '"><i class="fa-regular fa-clock"></i>操作记录</button>'
        );
      }

      function persistProjectSearchIndex() {
        if (!isMobile || !global.sessionStorage) return;
        try {
          var index = projects.map(function (row, i) {
            return {
              id: row[0],
              name: row[1],
              type: row[2],
              line: row[4],
              rowIndex: i
            };
          });
          global.sessionStorage.setItem(
            isDoneModule ? "whProjectDoneSearchIndex" : "whProjectSearchIndex",
            JSON.stringify(index)
          );
        } catch (e) {
          /* ignore */
        }
      }

      function renderMobileCard(row, index) {
        var isKey = row[2] === "重点项目";
        var coord = row[8] && row[9] ? row[8] + ", " + row[9] : row[8] || row[9] || "—";
        return (
          '<article class="mp-project-card' + (isKey ? " mp-project-card--key" : "") + '" data-row="' + index + '">' +
          '<div class="mp-project-card__head"><span class="mp-project-card__id">#' + escapeHtml(row[0]) + '</span>' +
          '<span class="mp-tag' + (isKey ? " mp-tag--warn" : "") + '">' + escapeHtml(row[2] || "—") + "</span></div>" +
          '<h3 class="mp-project-card__title">' + escapeHtml(row[1]) + "</h3>" +
          '<dl class="mp-project-card__meta">' +
          "<div><dt>工程类别</dt><dd>" + escapeHtml(row[3] || "—") + "</dd></div>" +
          "<div><dt>所属线路</dt><dd>" + escapeHtml(row[4] || "—") + " · " + escapeHtml(row[6] || "—") + "</dd></div>" +
          "<div><dt>区间/站点</dt><dd>" + escapeHtml(row[5] || "—") + "</dd></div>" +
          "<div><dt>更新时间</dt><dd>" + escapeHtml(row[7] || "—") + "</dd></div>" +
          "<div><dt>经纬度</dt><dd>" + escapeHtml(coord) + "</dd></div>" +
          "</dl><div class=\"mp-project-card__actions\">" + projectActionHtml(index) + "</div></article>"
        );
      }

      function renderMobileList() {
        if (!mobileListEl) return;
        var source = getListSource();
        var end = mobileListPage * mobilePageSize;
        var slice = source.slice(0, end);
        var html = slice
          .map(function (row) {
            var index = projectIndexInMain(row);
            return renderMobileCard(row, index >= 0 ? index : 0);
          })
          .join("");
        if (end < source.length) {
          html +=
            '<div id="mp-load-more-sentinel" class="mp-load-more"><span>上滑加载更多</span><span class="mp-load-more__count">已显示 ' +
            slice.length +
            " / " +
            source.length +
            " 条</span></div>";
        } else if (source.length) {
          html += '<div class="mp-load-more mp-load-more--done">已全部加载（' + source.length + " 条）</div>";
        } else {
          html = '<div class="mp-project-empty"><i class="fa-regular fa-folder-open"></i><p>暂无项目数据</p></div>';
        }
        mobileListEl.innerHTML = html;
        setStatText("table-total", source.length);
        updateProjectStats();
      }

      function mobileHasMore() {
        return mobileListPage * mobilePageSize < getListSource().length;
      }

      function mobileLoadMore() {
        if (!mobileHasMore()) return;
        mobileListPage += 1;
        renderMobileList();
      }

      function normalizeSearchText(text) {
        return String(text || "")
          .replace(/\s+/g, "")
          .toLowerCase();
      }

      function matchSearchScore(query, target) {
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

      function rowMatchesSearch(row, query) {
        var q = (query || "").trim();
        if (!q) return true;
        return (
          Math.max(matchSearchScore(q, row[1]), matchSearchScore(q, row[0]), matchSearchScore(q, row[4])) > 0
        );
      }

      function applyMobileFilter(nameOverride) {
        var searchInput = document.getElementById("project-search-trigger");
        var sheetNameInput = document.querySelector("#project-filter-sheet [data-filter][placeholder*='项目']");
        var nameKw =
          typeof nameOverride === "string"
            ? nameOverride
            : searchInput && searchInput.value
              ? searchInput.value.trim()
              : sheetNameInput && sheetNameInput.value
                ? sheetNameInput.value.trim()
                : "";
        if (searchInput && typeof nameOverride === "string") searchInput.value = nameOverride;
        if (sheetNameInput) sheetNameInput.value = nameKw;
        var filters = document.querySelectorAll("#project-filter-sheet [data-filter]");
        var line = "";
        var ptype = "";
        filters.forEach(function (el) {
          var label = el.closest("label");
          var span = label ? label.querySelector("span") : null;
          var key = span ? span.textContent : "";
          if (el.tagName === "SELECT" && el.selectedIndex > 0) {
            var val = el.options[el.selectedIndex].text;
            if (val === "全部") return;
            if (key.indexOf("线路") >= 0) line = val;
            if (key.indexOf("项目类型") >= 0) ptype = val;
          }
        });
        mobileFilterRows = projects.filter(function (row) {
          if (nameKw && !rowMatchesSearch(row, nameKw)) return false;
          if (line && row[4].indexOf(line.replace("号线", "")) < 0 && row[4].indexOf(line) < 0) return false;
          if (ptype && row[2] !== ptype) return false;
          return true;
        });
        mobileListPage = 1;
        renderMobileList();
        if (isMobile && global.WHProjectMobile && global.WHProjectMobile.syncListSearchClear) {
          global.WHProjectMobile.syncListSearchClear();
        }
      }

      function clearListSearch() {
        var searchInput = document.getElementById("project-search-trigger");
        if (searchInput) searchInput.value = "";
        var sheetNameInput = document.querySelector("#project-filter-sheet [data-filter][placeholder*='项目']");
        if (sheetNameInput) sheetNameInput.value = "";
        mobileFilterRows = null;
        mobileListPage = 1;
        renderMobileList();
        if (global.WHProjectMobile && global.WHProjectMobile.syncListSearchClear) {
          global.WHProjectMobile.syncListSearchClear();
        }
      }

      function runWithConfirm(message, fn) {
        if (isMobile && global.WHProjectMobile && global.WHProjectMobile.confirm) {
          global.WHProjectMobile.confirm(message, fn);
          return;
        }
        if (global.confirm(message)) fn();
      }

      function refreshMobileSelectPickers(root) {
        if (isMobile && global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
          global.WHProjectMobile.enhanceSelectFields(root || document.getElementById("project-detail-view"));
        }
      }

      function fieldVal(id) {
        var el = document.getElementById(id);
        return el ? String(el.value || "").trim() : "";
      }

      function loadProjectToForm(row) {
        var map = row
          ? {
              "proj-id": row[0],
              "proj-name": row[1],
              "proj-type": row[2],
              "proj-line": row[4],
              "proj-section": row[5],
              "proj-direction": row[6],
              "proj-lng": row[8],
              "proj-lat": row[9],
              "proj-start": row[10],
              "proj-end": row[11],
              "proj-summary": row[12]
            }
          : {
              "proj-id": nextProjectId(),
              "proj-name": "",
              "proj-type": "一般项目",
              "proj-line": "",
              "proj-section": "",
              "proj-direction": "下行",
              "proj-lng": "",
              "proj-lat": "",
              "proj-start": "",
              "proj-end": "",
              "proj-summary": ""
            };
        Object.keys(map).forEach(function (id) {
          var el = document.getElementById(id);
          if (el) el.value = map[id];
        });
        var pickers = {
          "addr-type": row ? "区间" : "",
          category: row ? row[3] || "" : "",
          "struct-type": row ? "盾构结构" : "",
          "struct-status": row ? "良好" : ""
        };
        Object.keys(pickers).forEach(function (key) {
          var hidden = document.getElementById("proj-" + key);
          if (hidden) hidden.value = pickers[key];
        });
        if (global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
          global.WHProjectMobile.syncPickersFromForm();
        }
        if (isDoneModule) {
          var statusEl = document.getElementById("proj-status");
          if (statusEl) statusEl.value = "完工";
          var endEl = document.getElementById("proj-end");
          if (endEl && row && row[11] && !endEl.value) endEl.value = row[11];
          if (endEl && !row && !endEl.value) endEl.value = formatNow().slice(0, 10);
        }
      }

      function collectProjectFromForm() {
        return [
          fieldVal("proj-id") || nextProjectId(),
          fieldVal("proj-name") || "未命名项目",
          fieldVal("proj-type") || "一般项目",
          fieldVal("proj-category") || "",
          fieldVal("proj-line") || "",
          fieldVal("proj-section") || "",
          fieldVal("proj-direction") || "",
          formatNow(),
          fieldVal("proj-lng") || "",
          fieldVal("proj-lat") || "",
          fieldVal("proj-start") || "",
          fieldVal("proj-end") || "",
          fieldVal("proj-summary") || ""
        ];
      }

      function validateMobileProjectForm() {
        var rules = [
          { id: "proj-id", label: "项目编号" },
          { id: "proj-name", label: "项目名称" },
          { id: "proj-line", label: "所属线路", picker: true },
          { id: "proj-direction", label: "上下行", picker: true },
          { id: "proj-addr-type", label: "地址类型", picker: true },
          { id: "proj-type", label: "项目类型", picker: true },
          { id: "proj-category", label: "工程类别", picker: true },
          { id: "proj-station-connect", label: "是否与车站接驳", picker: true },
          { id: "proj-struct-type", label: "地铁结构类型", picker: true },
          { id: "proj-struct-status", label: "地铁结构状态", picker: true },
          { id: "proj-struct-depth", label: "地铁结构埋深" },
          { id: "proj-geology", label: "地质类型", picker: true },
          { id: "proj-status", label: "项目状态", picker: true },
          { id: "proj-send-letter", label: "是否发函", picker: true },
          { id: "proj-do-monitor", label: "是否实施监测", picker: true },
          { id: "proj-dewater", label: "是否降水", picker: true }
        ];
        for (var i = 0; i < rules.length; i++) {
          var rule = rules[i];
          if (!fieldVal(rule.id)) {
            showToast((rule.picker ? "请选择" : "请填写") + rule.label);
            return false;
          }
        }
        return true;
      }

      function saveProjectFromForm() {
        if (isMobile && !validateMobileProjectForm()) return false;
        var row = collectProjectFromForm();
        if (!row[1] || row[1] === "未命名项目") {
          showToast("请填写项目名称");
          return false;
        }
        if (currentProjectMode === "new" || currentProjectIndex < 0) {
          if (currentProjectMode === "new") row[0] = nextProjectId();
          projects.unshift(row);
          currentProjectIndex = 0;
        } else {
          row[0] = projects[currentProjectIndex][0];
          row[7] = formatNow();
          projects[currentProjectIndex] = row;
        }
        mobileListPage = 1;
        if (mobileFilterRows) applyMobileFilter();
        renderRows();
        return true;
      }

      function renderRows() {
        if (mobileListEl) {
          renderMobileList();
          persistProjectSearchIndex();
          return;
        }
        if (!tbody) {
          updateProjectStats();
          return;
        }
        tbody.innerHTML = projects.map(function (row, index) {
          return '<tr class="wh-row-open ' + (index % 2 ? "bg-slate-900/35" : "bg-slate-950/25") + '" data-row="' + index + '" data-row-index="' + index + '">' +
            row.slice(0, 12).map(function (cell, i) {
              var width = i === 1 ? "max-w-[190px]" : "";
              return '<td class="px-3 text-slate-100/95 ' + width + ' truncate" title="' + (cell || "") + '">' + (cell || "") + '</td>';
            }).join("") +
            '<td class="px-3 disease-col-actions">' +
              '<div class="disease-op-actions">' +
              '<span class="project-action" data-action="edit-project" data-row="' + index + '"><i class="fa-regular fa-pen-to-square"></i>编辑</span>' +
              '<span class="project-action" data-action="patrol-project" data-row="' + index + '"><i class="fa-regular fa-clipboard"></i>巡查</span>' +
              '<span class="project-action project-action--danger" data-action="delete-project" data-row="' + index + '"><i class="fa-regular fa-trash-can"></i>删除</span>' +
              '<span class="project-action" data-action="view-project-records" data-row="' + index + '"><i class="fa-regular fa-clock"></i>操作记录</span>' +
              '</div></td>' +
          '</tr>';
        }).join("");
        updateProjectStats();
      }

      function escapeHtml(value) {
        return String(value || "").replace(/[&<>"']/g, function (char) {
          return { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[char];
        });
      }

      function uploadField(idPrefix, currentName, acceptText) {
        return '<div class="project-upload">' +
          '<label class="project-upload__btn">' +
            '<i class="fa-solid fa-upload"></i>上传文件' +
            '<input id="' + idPrefix + '-input" type="file" class="hidden" data-upload-input="' + idPrefix + '">' +
          '</label>' +
          '<span class="project-upload__name" id="' + idPrefix + '-name">' + escapeHtml(currentName || acceptText || "未选择文件") + '</span>' +
        '</div>';
      }

      function getDocUnitOptions() {
        var opts = [];
        Object.keys(unitCompanies).forEach(function (key) {
          (unitCompanies[key] || []).forEach(function (name) {
            if (opts.indexOf(name) < 0) opts.push(name);
          });
        });
        return opts;
      }

      var projectDoc = ProjectDocShared.createHandlers({
        listId: "doc-list",
        openDocAction: "open-doc-modal",
        previewDocAction: "preview-doc",
        editDocAction: "edit-doc",
        deleteDocAction: "delete-doc",
        escapeHtml: escapeHtml,
        uploadField: uploadField,
        showToast: showToast,
        getDocUnitOptions: getDocUnitOptions,
        getDocLibrary: function () {
          return docLibrary;
        },
        getDocModalSelects: function () {
          return docModalSelects;
        },
        setDocModalSelects: function (v) {
          docModalSelects = v;
        }
      });

      function docRows() {
        projectDoc.docRows();
      }

      function buildDocFormHtml(category, docItem) {
        return projectDoc.buildDocFormHtml(category, docItem);
      }

      function mountDocModalSelects(category, docItem) {
        projectDoc.mountDocModalSelects(category, docItem);
      }

      function collectDocRecord(category, existingDoc) {
        return projectDoc.collectDocRecord(category, existingDoc);
      }

      function validateDocRecord(category, record) {
        return projectDoc.validateDocRecord(category, record);
      }

      var projectExchange = ProjectExchangeShared.createHandlers({
        listId: "exchange-list",
        editAction: "edit-exchange",
        deleteAction: "delete-exchange",
        previewPhotoAction: "preview-exchange-photo",
        previewVideoAction: "preview-exchange-video",
        previewFileAction: "preview-exchange-file",
        escapeHtml: escapeHtml,
        uploadField: uploadField,
        showToast: showToast,
        getRecords: function () {
          return exchangeRecords;
        },
        getUploaders: function () {
          return exchangeUploaders;
        },
        setUploaders: function (v) {
          exchangeUploaders = v;
        },
        clearUploaders: function () {
          if (exchangeUploaders) {
            if (exchangeUploaders.photo) exchangeUploaders.photo.clear();
            if (exchangeUploaders.video) exchangeUploaders.video.clear();
          }
          exchangeUploaders = null;
        }
      });

      function renderExchangeRows() {
        projectExchange.renderRows();
      }

      var projectMonitor = ProjectMonitorShared.createHandlers({
        panelRootId: "monitor-tab-root",
        listId: "monitor-log-list",
        openLogAction: "open-monitor-log-modal",
        editLogAction: "edit-monitor-log",
        deleteLogAction: "delete-monitor-log",
        isMobile: isMobile,
        escapeHtml: escapeHtml,
        showToast: showToast,
        getLogs: function () {
          return monitorLogs;
        }
      });

      function openPreview(payload) {
        payload = payload || {};
        var name = payload.name || "";
        var mime = payload.mimeType || "";
        var url = payload.url || "";
        if (url && global.ProjectPreviewMock && global.ProjectPreviewMock.isRemoteBlockedUrl(url)) {
          url = "";
        }
        if (!url && global.ProjectDocShared) {
          url = global.ProjectDocShared.resolveFilePreviewUrl(name, url, mime);
          mime = global.ProjectDocShared.resolveFilePreviewMime(name, mime);
          payload.kind = global.ProjectDocShared.inferPreviewKind(mime, name);
        }
        payload.url = url;
        payload.mimeType = mime;
        if (isMobile && global.WHProjectMobile && global.WHProjectMobile.openFilePreview) {
          global.WHProjectMobile.openFilePreview(payload);
          return;
        }
        if (!url) {
          showToast("暂无可预览文件");
          return;
        }
        try {
          global.open(url, "_blank", "noopener,noreferrer");
        } catch (err) {
          global.location.href = url;
        }
      }

      function previewMarkup() {
        var payload = previewPayload || {};
        var meta = [];
        if (payload.category) meta.push('类别：' + payload.category);
        if (payload.date) meta.push('日期：' + payload.date);
        if (payload.unit) meta.push('单位：' + payload.unit);
        var body = '';
        if (payload.kind === "image" && payload.url) {
          body = '<img class="project-preview-image" src="' + payload.url + '" alt="' + escapeHtml(payload.name || '图片预览') + '">';
        } else if (payload.kind === "video" && payload.url) {
          body = '<video class="project-preview-video" src="' + payload.url + '" controls style="max-width:100%;max-height:70vh;border-radius:6px"></video>';
        } else if (payload.url && payload.mimeType === "application/pdf") {
          body = '<iframe class="project-preview-frame" src="' + payload.url + '"></iframe>';
        } else {
          body = '<div class="project-preview-file">' +
            '<i class="fa-regular ' + (payload.kind === "image" ? 'fa-image' : 'fa-file-lines') + '"></i>' +
            '<div class="text-base text-white mb-2">' + escapeHtml(payload.name || "未命名文件") + '</div>' +
            '<div class="text-xs text-cyan-100/70">' + escapeHtml(payload.tip || "当前原型展示文件信息预览") + '</div>' +
          '</div>';
        }
        return '<div class="project-preview-shell">' +
          '<div class="project-preview-head"><div class="font-medium text-cyan-50">' + escapeHtml(payload.title || '预览') + '</div><div>' + escapeHtml(meta.join('  |  ')) + '</div></div>' +
          '<div class="project-preview-body">' + body + '</div>' +
        '</div>';
      }

      function showToast(text) {
        if (!toast) return;
        toast.textContent = text;
        toast.classList.add("show");
        setTimeout(function () {
          toast.classList.remove("show");
        }, 1600);
      }

      var patrolFrame = document.getElementById("project-patrol-frame");
      var currentPatrolProject = "";
      var patrolPage = "in-project-patrol.html";

      function buildPatrolEmbedUrl(page, projectName) {
        var params = new URLSearchParams({ embed: "1" });
        if (projectName) params.set("project", projectName);
        return page + "?" + params.toString();
      }

      function clearPatrolFrame() {
        if (!patrolFrame) return;
        patrolFrame.removeAttribute("src");
        patrolFrame.src = "about:blank";
      }

      function loadPatrolFrame() {
        if (!patrolFrame) return;
        clearPatrolFrame();
        var projectName = currentPatrolProject;
        requestAnimationFrame(function () {
          patrolFrame.src = buildPatrolEmbedUrl(patrolPage, projectName);
        });
      }

      function showProjectView(mode) {
        if (mode === "new") currentProjectIndex = -1;
        document.getElementById("project-list-view").classList.add("hidden");
        document.getElementById("project-detail-view").classList.remove("hidden");
        if (isMobile) {
          if (mode === "new") loadProjectToForm(null);
          else if (currentProjectIndex >= 0) loadProjectToForm(projects[currentProjectIndex]);
        }
        applyProjectMode(mode);
        switchTab("base");
        refreshMobileSelectPickers();
        if (isMobile) {
          global.dispatchEvent(new Event("wh-project-view-change"));
        }
      }

      function switchTab(tab) {
        var detailRoot = document.getElementById("project-detail-view");
        if (!detailRoot || !tab) return;
        detailRoot.querySelectorAll(".done-tab").forEach(function (btn) {
          btn.classList.toggle("active", btn.getAttribute("data-tab") === tab);
        });
        detailRoot.querySelectorAll(".done-tab-panel").forEach(function (panel) {
          panel.classList.toggle("hidden", panel.getAttribute("data-panel") !== tab);
        });
        if (tab === "monitor" && projectMonitor && projectMonitor.renderLogRows) {
          projectMonitor.renderLogRows();
        }
        var activeBtn = detailRoot.querySelector('.done-tab[data-tab="' + tab + '"]');
        if (activeBtn && activeBtn.scrollIntoView) {
          activeBtn.scrollIntoView({ inline: "nearest", block: "nearest", behavior: "smooth" });
        }
      }

      function showPatrolView(rowIndex) {
        var row = projects[rowIndex];
        var projectName = row ? row[1] : "";
        currentPatrolProject = projectName;
        if (isMobile) {
          var patrolUrl =
            "project-patrol.html?project=" + encodeURIComponent(projectName || "");
          global.location.href = patrolUrl;
          return;
        }
        document.getElementById("project-list-view").classList.add("hidden");
        document.getElementById("project-detail-view").classList.add("hidden");
        document.getElementById("project-patrol-view").classList.remove("hidden");
        var subtitle = document.getElementById("project-patrol-subtitle");
        if (subtitle) subtitle.textContent = projectName ? "关联项目：" + projectName : "";
        loadPatrolFrame();
      }

      function showList() {
        clearPatrolFrame();
        currentPatrolProject = "";
        document.getElementById("project-patrol-view").classList.add("hidden");
        document.getElementById("project-detail-view").classList.add("hidden");
        document.getElementById("project-list-view").classList.remove("hidden");
        if (isMobile) {
          global.dispatchEvent(new Event("wh-project-view-change"));
        }
      }

      function mountProjectFieldSelects() {
        if (isMobile) return;
        if (projectFieldSelects.length) return;
        if (typeof WHSearchSelect === "undefined") return;
        var riskEl = document.getElementById("proj-risk-level");
        projectFieldSelects = [
          WHSearchSelect.create(
            document.getElementById("proj-addr-type-select"),
            PROJECT_ADDR_TYPE_OPTIONS,
            "请搜索或选择地址类型"
          ),
          WHSearchSelect.createMulti(
            document.getElementById("proj-category-select"),
            PROJECT_CATEGORY_OPTIONS,
            "请搜索或选择工程类别"
          ),
          WHSearchSelect.createMulti(
            document.getElementById("proj-struct-type-select"),
            PROJECT_STRUCT_TYPE_OPTIONS,
            "请搜索或选择地铁结构类型"
          ),
          WHSearchSelect.createMulti(
            document.getElementById("proj-struct-status-select"),
            PROJECT_STRUCT_STATUS_OPTIONS,
            "请搜索或选择地铁结构状态"
          )
        ].filter(Boolean);
        if (projectFieldSelects[0] && projectFieldSelects[0].setValue) projectFieldSelects[0].setValue("区间");
        if (projectFieldSelects[1] && projectFieldSelects[1].setValues) projectFieldSelects[1].setValues(["钻孔、地勘、打桩"]);
        if (projectFieldSelects[2] && projectFieldSelects[2].setValues) projectFieldSelects[2].setValues(["盾构结构"]);
        if (projectFieldSelects[3] && projectFieldSelects[3].setValues) projectFieldSelects[3].setValues(["良好"]);
        if (riskEl) riskEl.value = "二级";
      }

      function applyProjectMode(mode) {
        if (isDoneModule && mode === "new") mode = "detail";
        var readonly = mode === "detail";
        currentProjectMode = mode;
        var detailView = document.getElementById("project-detail-view");
        if (detailView) detailView.setAttribute("data-project-mode", mode);
        if (detailShell) detailShell.classList.toggle("project-readonly", readonly);
        if (isDoneModule) {
          if (viewTitle) viewTitle.textContent = readonly ? "完工项目详情" : "编辑完工项目";
          if (viewSubtitle) viewSubtitle.textContent = readonly ? "完工项目信息" : "编辑完工项目";
        } else {
          if (viewTitle) viewTitle.textContent = readonly ? "项目详情" : mode === "new" ? "新增项目" : "编辑项目";
          if (viewSubtitle) viewSubtitle.textContent = readonly ? "项目相关信息" : "添加/编辑项目";
        }
        if (backBtn) backBtn.textContent = readonly ? "返回" : "取消";
        document.querySelectorAll('#project-detail-view input, #project-detail-view textarea, #project-detail-view select').forEach(function (el) {
          el.disabled = readonly;
        });
        projectFieldSelects.forEach(function (inst) {
          if (inst && inst.setDisabled) inst.setDisabled(readonly);
        });
        document.querySelectorAll('#project-detail-view [data-action="open-contact-modal"], #project-detail-view [data-action="open-doc-modal"], #project-detail-view [data-action="open-exchange-modal"], #project-detail-view [data-action="open-monitor-log-modal"]').forEach(function (el) {
          el.disabled = readonly;
          el.classList.toggle("opacity-40", readonly);
          el.classList.toggle("cursor-not-allowed", readonly);
        });
        if (isMobile) {
          document.querySelectorAll(".mp-picker-field").forEach(function (btn) {
            btn.disabled = readonly;
          });
          if (global.WHProjectMobile && global.WHProjectMobile.updateDetailFooter) {
            global.WHProjectMobile.updateDetailFooter(mode);
          }
        }
        unitRows();
        projectMonitor.renderLogRows();
      }

      function unitRows() {
        document.getElementById("unit-list").innerHTML = projectUnits.map(function (name) {
          return '<div class="unit-row">' +
            '<div class="unit-row__head">' +
              '<label class="w-32 text-right text-cyan-100/80 text-sm">' + name + '：</label>' +
              '<select class="wh-input h-8 w-[320px] px-2" data-unit-select="company" data-unit="' + name + '">' +
                (unitCompanies[name] || []).map(function (company) {
                  return '<option value="' + company + '"' + (unitSelections[name] === company ? ' selected' : '') + '>' + company + '</option>';
                }).join('') +
              '</select>' +
              '<button type="button" class="px-4 py-1.5 rounded text-xs wh-btn-ghost project-hidden-when-readonly mp-unit-add-contact" data-action="open-contact-modal" data-unit="' + name + '"><i class="fa-solid fa-plus mr-1"></i>添加联系人</button>' +
            '</div>' +
            renderUnitContactTable(name) +
          '</div>';
        }).join('');
        refreshMobileSelectPickers(document.getElementById("unit-list"));
      }

      function renderUnitContactTable(unitName) {
        var contacts = unitContacts[unitName] || [];
        if (!contacts.length) {
          return '<div class="unit-contact-panel"><div class="unit-contact-list"><div class="project-empty"><i class="fa-regular fa-address-book text-2xl mb-1"></i>暂未添加联系人</div></div></div>';
        }
        if (isMobile) {
          return (
            '<div class="unit-contact-panel">' +
            '<div class="unit-contact-panel__head">' +
              '<div><h3 class="text-sm font-semibold text-cyan-50">' + unitName + '联系人信息</h3>' +
              '<p class="text-[11px] text-cyan-100/55 mt-1">当前单位：' + (unitSelections[unitName] || '-') + '</p></div>' +
            '</div>' +
            '<div class="mp-unit-contact-table">' +
              '<div class="mp-unit-contact-thead">' +
                '<span>姓名</span><span>联系电话</span><span>其他联系方式</span><span class="mp-unit-contact-thead__ops">操作</span>' +
              '</div>' +
              '<div class="mp-unit-contact-tbody">' +
              contacts
                .map(function (contact, index) {
                  return (
                    '<div class="mp-unit-contact-row">' +
                      '<span class="mp-unit-contact-name">' + (contact.name || '-') + '</span>' +
                      '<span class="mp-unit-contact-phone">' + (contact.phone || '-') + '</span>' +
                      '<span class="mp-unit-contact-other">' + (contact.otherContact || '-') + '</span>' +
                      '<span class="mp-unit-contact-actions">' +
                        '<button type="button" class="mp-icon-action" data-action="edit-contact" data-unit="' + unitName + '" data-index="' + index + '" aria-label="编辑"><i class="fa-regular fa-pen-to-square"></i></button>' +
                        '<button type="button" class="mp-icon-action mp-icon-action--danger" data-action="delete-contact" data-unit="' + unitName + '" data-index="' + index + '" aria-label="删除"><i class="fa-regular fa-trash-can"></i></button>' +
                      '</span>' +
                    '</div>'
                  );
                })
                .join("") +
              '</div></div></div>'
          );
        }
        return '<div class="unit-contact-panel">' +
          '<div class="unit-contact-panel__head">' +
            '<div><h3 class="text-sm font-semibold text-cyan-50">' + unitName + '联系人信息</h3>' +
            '<p class="text-[11px] text-cyan-100/55 mt-1">当前单位：' + (unitSelections[unitName] || '-') + '</p></div>' +
          '</div>' +
          '<div class="unit-contact-list"><div class="overflow-x-auto">' +
          '<table class="unit-contact-table">' +
            '<thead><tr><th>姓名</th><th>联系电话</th><th>其他联系方式</th><th>操作</th></tr></thead>' +
            '<tbody>' +
              contacts.map(function (contact, index) {
                return '<tr>' +
                  '<td class="unit-contact-name">' + (contact.name || '-') + '</td>' +
                  '<td>' + (contact.phone || '-') + '</td>' +
                  '<td>' + (contact.otherContact || '-') + '</td>' +
                  '<td><div class="unit-contact-actions"><span class="unit-inline-action" data-action="edit-contact" data-unit="' + unitName + '" data-index="' + index + '">编辑</span><span class="unit-inline-action unit-inline-action--danger" data-action="delete-contact" data-unit="' + unitName + '" data-index="' + index + '">删除</span></div></td>' +
                '</tr>';
              }).join('') +
            '</tbody>' +
          '</table>' +
          '</div></div>' +
        '</div>';
      }

      function openModal(type, title) {
        modalType = type;
        modalTitle.textContent = title;
        if (type === "contact") {
          var editContact = contactEditIndex > -1 ? (unitContacts[activeUnit] || [])[contactEditIndex] || {} : {};
          if (isMobile && global.WHProjectMobile && global.WHProjectMobile.buildContactFormHtml) {
            modalBody.innerHTML = global.WHProjectMobile.buildContactFormHtml(activeUnit, editContact);
          } else {
            modalBody.innerHTML = '<div class="space-y-4 max-w-[520px] mx-auto">' +
              '<div class="text-xs text-cyan-200/75 bg-slate-950/35 border border-cyan-400/10 rounded px-3 py-2">当前单位：' + activeUnit + '</div>' +
              '<label class="flex items-center gap-3"><span class="project-form-label project-required">联系人姓名：</span><input id="contact-name" class="wh-input h-8 flex-1 px-2" placeholder="请输入联系人姓名" value="' + (editContact.name || '') + '" /></label>' +
              '<label class="flex items-center gap-3"><span class="project-form-label project-required">联系电话：</span><input id="contact-phone" class="wh-input h-8 flex-1 px-2" placeholder="请输入联系电话" value="' + (editContact.phone || '') + '" /></label>' +
              '<label class="flex items-center gap-3"><span class="project-form-label">其他联系方式：</span><input id="contact-other" class="wh-input h-8 flex-1 px-2" placeholder="如邮箱、微信号、办公电话等" value="' + (editContact.otherContact || '') + '" /></label>' +
            '</div>';
          }
        } else if (type === "doc") {
          var docItem = currentDocEditIndex > -1 ? ((docLibrary[currentDocCategory] || [])[currentDocEditIndex] || {}) : {};
          if (isMobile && global.WHProjectMobile && global.WHProjectMobile.buildDocFormHtml) {
            modalBody.innerHTML = global.WHProjectMobile.buildDocFormHtml(currentDocCategory, docItem, getDocUnitOptions());
            global.WHProjectMobile.mountDocForm(currentDocCategory, docItem);
          } else if (isMobile) {
            modalBody.innerHTML = '<div class="mp-modal-form">' + buildDocFormHtml(title, docItem) + "</div>";
            mountDocModalSelects(title, docItem);
          } else {
            modalBody.innerHTML = buildDocFormHtml(title, docItem);
            mountDocModalSelects(title, docItem);
          }
        } else if (type === "exchange") {
          var exchangeItem = currentExchangeEditIndex > -1 ? (exchangeRecords[currentExchangeEditIndex] || {}) : {};
          if (isMobile && global.WHProjectMobile && global.WHProjectMobile.buildExchangeFormHtml) {
            modalBody.innerHTML = global.WHProjectMobile.buildExchangeFormHtml(exchangeItem);
            if (global.WHProjectMobile.mountExchangeForm) global.WHProjectMobile.mountExchangeForm(exchangeItem);
          } else {
            modalBody.innerHTML = '<div class="mp-modal-form">' + projectExchange.buildFormHtml(exchangeItem) + "</div>";
          }
          projectExchange.mountUploaders(exchangeItem);
        } else if (type === "monitor-log") {
          var logItem = currentMonitorLogEditIndex > -1 ? (monitorLogs[currentMonitorLogEditIndex] || {}) : {};
          if (isMobile && global.WHProjectMobile && global.WHProjectMobile.buildMonitorLogFormHtml) {
            modalBody.innerHTML = global.WHProjectMobile.buildMonitorLogFormHtml(logItem);
            if (global.WHProjectMobile.mountMonitorLogForm) {
              global.WHProjectMobile.mountMonitorLogForm(logItem);
            }
          } else {
            modalBody.innerHTML = '<div class="mp-modal-form">' + projectMonitor.buildLogFormHtml(logItem) + "</div>";
          }
        }
        refreshMobileSelectPickers(modalBody);
        if (isMobile && global.WHProjectMobile && global.WHProjectMobile.enhanceSelectFields) {
          global.WHProjectMobile.enhanceSelectFields(modalBody);
        }
        modalMask.classList.add("show");
      }

      function closeModal() {
        modalMask.classList.remove("show");
        if (typeof WHSearchSelect !== "undefined") WHSearchSelect.closeAll(null);
        docModalSelects = [];
        projectExchange.clearUploaders();
        contactEditIndex = -1;
        currentDocEditIndex = -1;
        currentExchangeEditIndex = -1;
        currentMonitorLogEditIndex = -1;
        previewPayload = null;
      }

      initQuickLinks();
      function setupProjectRowClick() {
        if (!window.WHTableRowClick) return window.setTimeout(setupProjectRowClick, 40);
        WHTableRowClick.bindById("project-table-body", {
          onOpenByTr: function (tr) {
            var index = Number(tr.getAttribute("data-row"));
            if (!Number.isNaN(index) && index >= 0) {
              currentProjectIndex = index;
              showProjectView("detail");
            }
          }
        });
      }
      setupProjectRowClick();
      if (mobileListEl) {
        mobileListEl.addEventListener("click", function (event) {
          if (event.target.closest("[data-action]")) return;
          var card = event.target.closest(".mp-project-card");
          if (!card) return;
          var index = Number(card.getAttribute("data-row"));
          if (!Number.isNaN(index) && index >= 0) {
            currentProjectIndex = index;
            showProjectView("detail");
          }
        });
      }
      renderRows();
      persistProjectSearchIndex();
      (function handleSearchReturn() {
        if (!isMobile) return;
        try {
          var params = new URLSearchParams(global.location.search);
          var rowParam = params.get("row");
          if (rowParam !== null && rowParam !== "") {
            var idx = Number(rowParam);
            if (!Number.isNaN(idx) && idx >= 0 && idx < projects.length) {
              currentProjectIndex = idx;
              showProjectView("detail");
            }
            return;
          }
          var q = params.get("q");
          if (q) {
            applyMobileFilter(q);
            showList();
            try {
              global.history.replaceState({ fromProjectSearch: true }, "", listPage);
            } catch (e) {
              /* ignore */
            }
          }
        } catch (e) {
          /* ignore */
        }
      })();
      if (isDoneModule && isMobile) {
        var listFooter = document.getElementById("mp-list-footer");
        if (listFooter) {
          listFooter.hidden = true;
          listFooter.setAttribute("aria-hidden", "true");
        }
      }
      (function () {
        var params = new URLSearchParams(location.search);
        if (params.get("view") === "detail") {
          var projectName = params.get("project");
          if (projectName) {
            var pIdx = projects.findIndex(function (row) {
              return row[1] === projectName;
            });
            if (pIdx >= 0) currentProjectIndex = pIdx;
          }
          setTimeout(function () { showProjectView("detail"); }, 120);
        }
      })();
      unitRows();
      docRows();
      renderExchangeRows();
      projectMonitor.mountPanel(monitorLedger);
      ProjectOperationLog.bindClose("project-record-mask", "close-project-record");

      document.addEventListener("click", function (event) {
        var trigger = event.target.closest("[data-action]");
        if (!trigger) return;
        var action = trigger.getAttribute("data-action");
        if (action === "new-project") {
          if (isDoneModule) return;
          showProjectView("new");
        }
        if (action === "detail-project") showProjectView("detail");
        if (action === "edit-project") {
          if (isDoneModule) return;
          var editRow = Number(trigger.getAttribute("data-row"));
          if (!Number.isNaN(editRow) && editRow >= 0) currentProjectIndex = editRow;
          showProjectView("edit");
        }
        if (action === "back-list" || action === "cancel-project") showList();
        if (action === "save-project") {
          monitorLedger = projectMonitor.collectLedger();
          if (isMobile) {
            if (!saveProjectFromForm()) return;
          }
          showToast("项目已保存");
          showList();
        }
        if (action === "open-project-search") {
          persistProjectSearchIndex();
          global.location.href = searchPage;
        }
        if (action === "open-filter-sheet") {
          var sheet = document.getElementById("project-filter-sheet");
          if (sheet) {
            sheet.classList.add("is-open");
            refreshMobileSelectPickers(sheet);
          }
        }
        if (action === "close-filter-sheet") {
          var closeSheet = document.getElementById("project-filter-sheet");
          if (closeSheet) closeSheet.classList.remove("is-open");
        }
        if (action === "delete-project") {
          if (isDoneModule) return;
          var row = trigger.closest("tr") || trigger.closest(".mp-project-card");
          var rowIndex = row
            ? Number(row.getAttribute("data-row"))
            : Number(trigger.getAttribute("data-row"));
          runWithConfirm("确定删除该项目吗？删除后不可恢复。", function () {
            if (rowIndex > -1) {
              projects.splice(rowIndex, 1);
              renderRows();
            } else if (row) {
              row.remove();
              updateProjectStats();
            }
            showToast("项目已删除");
          });
        }
        if (action === "view-project-records") {
          ProjectOperationLog.open({
            rowIndex: Number(trigger.getAttribute("data-row")),
            projects: projects,
            logsById: projectOperationLogs,
            maskId: "project-record-mask",
            bodyId: "project-record-body"
          });
        }
        if (action === "patrol-project") showPatrolView(Number(trigger.getAttribute("data-row")));
        if (action === "search-project") {
          var filterSheet = document.getElementById("project-filter-sheet");
          if (filterSheet) filterSheet.classList.remove("is-open");
          if (isMobile) {
            applyMobileFilter();
            showToast("已按当前条件筛选");
          } else showToast("已按当前条件筛选");
        }
        if (action === "reset-filter") {
          document.querySelectorAll("[data-filter]").forEach(function (el) {
            if (el.tagName === "SELECT") el.selectedIndex = 0;
            else el.value = "";
          });
          var resetSheet = document.getElementById("project-filter-sheet");
          if (resetSheet) resetSheet.classList.remove("is-open");
          if (isMobile) {
            mobileFilterRows = null;
            mobileListPage = 1;
            if (global.WHProjectMobile && global.WHProjectMobile.syncPickersFromForm) {
              global.WHProjectMobile.syncPickersFromForm(document.getElementById("project-filter-sheet"));
            }
            renderRows();
          }
          showToast("筛选条件已重置");
        }
        if ((action === "open-contact-modal" || action === "open-doc-modal" || action === "open-exchange-modal" || action === "open-monitor-log-modal") && currentProjectMode === "detail") return;
        if (action === "open-contact-modal") {
          activeUnit = trigger.getAttribute("data-unit") || activeUnit;
          contactEditIndex = -1;
          unitRows();
          openModal("contact", "添加联系人 - " + activeUnit);
        }
        if (action === "open-doc-modal") {
          currentDocCategory = trigger.getAttribute("data-doc") || "资料";
          currentDocEditIndex = -1;
          openModal("doc", currentDocCategory);
        }
        if (action === "edit-doc") {
          if (currentProjectMode === "detail") return;
          currentDocCategory = trigger.getAttribute("data-doc") || "资料";
          currentDocEditIndex = Number(trigger.getAttribute("data-index"));
          openModal("doc", currentDocCategory);
        }
        if (action === "delete-doc") {
          if (currentProjectMode === "detail") return;
          var deleteDocCategory = trigger.getAttribute("data-doc") || "";
          var deleteDocIndex = Number(trigger.getAttribute("data-index"));
          runWithConfirm("确定删除该资料文件吗？", function () {
            if (docLibrary[deleteDocCategory]) docLibrary[deleteDocCategory].splice(deleteDocIndex, 1);
            docRows();
            showToast("文件已删除");
          });
        }
        if (action === "preview-doc") {
          var previewDocCategory = trigger.getAttribute("data-doc") || "";
          var previewDocIndex = Number(trigger.getAttribute("data-index"));
          var previewDoc = ((docLibrary[previewDocCategory] || [])[previewDocIndex] || {});
          var previewFileKey = trigger.getAttribute("data-file-key");
          openPreview(
            previewFileKey
              ? projectDoc.filePreviewPayload(previewDoc, previewFileKey)
              : projectDoc.buildPreviewPayload(previewDocCategory, previewDoc)
          );
        }
        if (action === "open-exchange-modal") {
          currentExchangeEditIndex = -1;
          openModal("exchange", "交涉记录");
        }
        if (action === "edit-exchange") {
          if (currentProjectMode === "detail") return;
          currentExchangeEditIndex = Number(trigger.getAttribute("data-index"));
          openModal("exchange", "编辑交涉记录");
        }
        if (action === "delete-exchange") {
          if (currentProjectMode === "detail") return;
          var deleteExchangeIndex = Number(trigger.getAttribute("data-index"));
          runWithConfirm("确定删除该交涉记录吗？", function () {
            exchangeRecords.splice(deleteExchangeIndex, 1);
            renderExchangeRows();
            showToast("交涉记录已删除");
          });
        }
        if (action === "preview-exchange-photo") {
          var previewPhotoIndex = Number(trigger.getAttribute("data-index"));
          var previewPhotoMediaIndex = Number(trigger.getAttribute("data-media-index"));
          openPreview(
            projectExchange.buildPhotoPreviewPayload(exchangeRecords[previewPhotoIndex] || {}, previewPhotoMediaIndex)
          );
        }
        if (action === "preview-exchange-video") {
          var previewVideoIndex = Number(trigger.getAttribute("data-index"));
          var previewVideoMediaIndex = Number(trigger.getAttribute("data-media-index"));
          openPreview(
            projectExchange.buildVideoPreviewPayload(exchangeRecords[previewVideoIndex] || {}, previewVideoMediaIndex)
          );
        }
        if (action === "preview-exchange-file") {
          var previewFileIndex = Number(trigger.getAttribute("data-index"));
          openPreview(projectExchange.buildFilePreviewPayload(exchangeRecords[previewFileIndex] || {}));
        }
        if (action === "open-monitor-log-modal") {
          currentMonitorLogEditIndex = -1;
          openModal("monitor-log", "新增监测日志");
        }
        if (action === "edit-monitor-log") {
          if (currentProjectMode === "detail") return;
          currentMonitorLogEditIndex = Number(trigger.getAttribute("data-index"));
          openModal("monitor-log", "编辑监测日志");
        }
        if (action === "delete-monitor-log") {
          if (currentProjectMode === "detail") return;
          var deleteMonitorIndex = Number(trigger.getAttribute("data-index"));
          runWithConfirm("确定删除该监测日志吗？", function () {
            monitorLogs.splice(deleteMonitorIndex, 1);
            projectMonitor.renderLogRows();
            showToast("监测日志已删除");
          });
        }
        if (action === "edit-contact") {
          if (currentProjectMode === "detail") return;
          activeUnit = trigger.getAttribute("data-unit") || activeUnit;
          contactEditIndex = Number(trigger.getAttribute("data-index"));
          openModal("contact", "编辑联系人 - " + activeUnit);
        }
        if (action === "delete-contact") {
          if (currentProjectMode === "detail") return;
          activeUnit = trigger.getAttribute("data-unit") || activeUnit;
          var deleteIndex = Number(trigger.getAttribute("data-index"));
          runWithConfirm("确定删除该联系人吗？", function () {
            if (!unitContacts[activeUnit]) unitContacts[activeUnit] = [];
            unitContacts[activeUnit].splice(deleteIndex, 1);
            unitRows();
            showToast("联系人已删除");
          });
        }
        if (action === "close-modal") closeModal();
        if (action === "modal-save") {
          if (modalType === "contact") {
            var nameInput = document.getElementById("contact-name");
            var phoneInput = document.getElementById("contact-phone");
            var otherInput = document.getElementById("contact-other");
            var contact = {
              name: nameInput ? nameInput.value.trim() : "",
              phone: phoneInput ? phoneInput.value.trim() : "",
              otherContact: otherInput ? otherInput.value.trim() : ""
            };
            if (!contact.name || !contact.phone) {
              showToast("请先填写联系人和电话");
              return;
            }
            if (!unitContacts[activeUnit]) unitContacts[activeUnit] = [];
            if (contactEditIndex > -1) unitContacts[activeUnit][contactEditIndex] = contact;
            else unitContacts[activeUnit].push(contact);
            unitRows();
          } else if (modalType === "doc") {
            var existingDoc = currentDocEditIndex > -1 ? ((docLibrary[currentDocCategory] || [])[currentDocEditIndex] || {}) : {};
            var docRecord = projectDoc.collectDocRecord(currentDocCategory, existingDoc);
            if (!projectDoc.validateDocRecord(currentDocCategory, docRecord)) return;
            if (!docLibrary[currentDocCategory]) docLibrary[currentDocCategory] = [];
            if (currentDocEditIndex > -1) docLibrary[currentDocCategory][currentDocEditIndex] = docRecord;
            else docLibrary[currentDocCategory].push(docRecord);
            docRows();
          } else if (modalType === "exchange") {
            var existingExchange = currentExchangeEditIndex > -1 ? (exchangeRecords[currentExchangeEditIndex] || {}) : {};
            var exchangeRecord = projectExchange.collectRecord(existingExchange);
            if (!projectExchange.validateRecord(exchangeRecord)) return;
            if (currentExchangeEditIndex > -1) exchangeRecords[currentExchangeEditIndex] = exchangeRecord;
            else exchangeRecords.push(exchangeRecord);
            renderExchangeRows();
          } else if (modalType === "monitor-log") {
            var logRecord = projectMonitor.collectLogRecord();
            if (!projectMonitor.validateLogRecord(logRecord)) return;
            if (currentMonitorLogEditIndex > -1) monitorLogs[currentMonitorLogEditIndex] = logRecord;
            else monitorLogs.push(logRecord);
            projectMonitor.renderLogRows();
          }
          closeModal();
          showToast("已保存");
        }
      });

      if (!isMobile) mountProjectFieldSelects();

      var projectTabsEl = document.getElementById("project-tabs");
      if (projectTabsEl) {
        projectTabsEl.addEventListener("click", function (event) {
          var btn = event.target.closest("[data-tab]");
          if (!btn) return;
          event.preventDefault();
          switchTab(btn.getAttribute("data-tab"));
        });
      }

      if (isMobile && global.WHProjectMobile && global.WHProjectMobile.init) {
        try {
          global.WHProjectMobile.init({
            getOptions: function (key) {
              if (key === "addr") return PROJECT_ADDR_TYPE_OPTIONS;
              if (key === "category") return PROJECT_CATEGORY_OPTIONS;
              if (key === "structType") return PROJECT_STRUCT_TYPE_OPTIONS;
              if (key === "structStatus") return PROJECT_STRUCT_STATUS_OPTIONS;
              if (key === "docUnits") return getDocUnitOptions();
              return [];
            },
            hasMore: mobileHasMore,
            loadMore: mobileLoadMore,
            applySearch: function (keyword) {
              applyMobileFilter(keyword);
            },
            clearListSearch: clearListSearch,
            showToast: showToast
          });
        } catch (initErr) {
          console.warn("[WHInProjectPage] mobile init", initErr);
        }
      }


      document.addEventListener("change", function (event) {
        var target = event.target;
        if (!target) return;
        if (target.getAttribute("data-unit-select") === "company") {
          if (currentProjectMode === "detail") return;
          var selectedUnit = target.getAttribute("data-unit");
          if (!selectedUnit) return;
          unitSelections[selectedUnit] = target.value || unitSelections[selectedUnit];
          unitRows();
        }
        if (target.getAttribute("data-upload-input")) {
          var uploadKey = target.getAttribute("data-upload-input");
          var picked = target.files && target.files[0] ? target.files[0] : null;
          if (picked) {
            var blobUrl = URL.createObjectURL(picked);
            if (isMobile && global.WHProjectMobile && global.WHProjectMobile.syncDocUpload) {
              global.WHProjectMobile.syncDocUpload(uploadKey, picked.name, blobUrl, picked.type);
            } else {
              var nameEl = document.getElementById(uploadKey + "-name");
              if (nameEl) nameEl.textContent = picked.name;
            }
          }
        }
      });


    return {
      showList: showList,
      showProjectView: showProjectView,
      renderRows: renderRows,
      projects: projects
    };
  }

  global.WHInProjectPage = { boot: bootInProjectPage };
})(typeof window !== "undefined" ? window : this);
