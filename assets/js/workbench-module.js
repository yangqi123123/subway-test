(function (global) {
  var configs = {
    "wb-todo": {
      title: "待办",
      badge: "当前用户待处理任务",
      tabs: [
        { key: "approval", label: "审批" },
        { key: "alert", label: "告警" },
      ],
      activeTab: "approval",
      toolbar: ["批量审批"],
      filters: [
        { id: "title", label: "标题", type: "text", placeholder: "请输入标题关键词" },
        { id: "start", label: "开始时间", type: "date" },
        { id: "end", label: "结束时间", type: "date" },
      ],
      columns: ["标题", "来源模块", "发起人", "创建时间", "当前状态", "操作"],
      rows: [
        {
          tab: "approval",
          title: "飞行计划审批 FP-20260515003",
          source: "飞行计划",
          user: "张文杰",
          time: "2026-05-15 09:18",
          status: "待审批",
          planId: 5,
          note: "审批通过/驳回后流转至申请人通知及已处理事项。",
        },
        {
          tab: "approval",
          title: "飞行计划审批 FP-20260514011",
          source: "飞行计划",
          user: "李明",
          time: "2026-05-14 17:30",
          status: "待审批",
          planId: 2,
          note: "审批人处理后，申请人将收到审批消息。",
        },
        {
          tab: "alert",
          title: "重点保护区越界告警处置",
          source: "地图驾驶舱",
          user: "系统",
          time: "2026-05-15 08:42",
          status: "未复核",
          workflowStatus: "未复核",
          alertId: 201,
          note: "报警点附近机场及关联无人机已完成推荐。",
        },
      ],
    },
    "wb-sys-notify": {
      title: "系统通知",
      badge: "审批结果与到期提醒",
      filters: [
        { id: "title", label: "标题", type: "text", placeholder: "请输入标题关键词" },
        { id: "type", label: "通知类型", options: ["全部", "项目巡查", "审批消息", "空域许可提醒", "区间调配"] },
        { id: "start", label: "发布开始", type: "date" },
        { id: "end", label: "发布结束", type: "date" }
      ],
      columns: ["标题", "通知类型", "发布时间", "是否已读", "操作"],
      rows: [
        {
          id: "n1",
          title: "飞行计划 FP-20260514011 已审批通过",
          type: "审批消息",
          time: "2026-05-15 10:02",
          read: "未读",
          planName: "梨园站周期巡检计划",
          route: "梨园-中南医院演示航线",
          airport: "梨园机场",
          auditResult: "审批通过",
        },
        {
          id: "n2",
          title: "飞行计划 FP-20260513006 已驳回",
          type: "审批消息",
          time: "2026-05-14 18:20",
          read: "已读",
          planName: "车辆段结构巡检",
          route: "车辆段日常巡查航线",
          airport: "车辆段机场",
          auditResult: "已驳回",
        },
        {
          id: "n3",
          title: "青山站外业巡检航线空域许可即将到期",
          type: "空域许可提醒",
          time: "2026-05-14 09:00",
          read: "未读",
          approvalNo: "KY-2026-0412-086",
          routeName: "青山站外业巡检航线",
          approvedAt: "2026-04-12 09:00",
          permitEnd: "2026-05-21 18:00",
          remark: "到期前请及时办理续期，避免影响计划执行。",
        },
        {
          id: "n4",
          title: "车辆段日常巡查航线空域许可剩余 7 天",
          type: "空域许可提醒",
          time: "2026-05-13 09:00",
          read: "未读",
          approvalNo: "KY-2026-0328-015",
          routeName: "车辆段日常巡查航线",
          approvedAt: "2026-03-28 14:20",
          permitEnd: "2026-05-20 18:00",
          remark: "请负责人完成续期材料准备。",
        },
        {
          id: "n6",
          source: "今日巡线",
          type: "项目巡查",
          title: "洪山路-小洪山已完成巡查",
          time: "2026-07-03 20:27",
          read: "未读",
          projects: [
            {
              recordId: "122801",
              projectName: "东亭停车场附属配套工程",
              projectType: "重点项目",
              line: "7号线",
              direction: "下行",
              section: "洪山路~小洪山",
              station: "小洪山",
              user: "李明",
              patrolDate: "2026-07-03 18:20",
              progress: "基坑支护监测中，现场围挡完整。",
              remark: "",
              updatedAt: "2026-07-03 18:20",
            },
            {
              recordId: "122802",
              projectName: "新建商业文化设施项目",
              projectType: "一般项目",
              line: "8号线",
              direction: "上行",
              section: "水果湖-洪山路",
              station: "洪山路",
              user: "李明",
              patrolDate: "2026-07-03 18:35",
              progress: "负二层消防泵房施工，负一层通风安装作业同步推进，现场文明施工情况正常。",
              remark: "",
              updatedAt: "2026-07-03 18:35",
            },
            {
              recordId: "122803",
              projectName: "洪山路至小洪山商业公寓项目",
              projectType: "重点项目",
              line: "8号线",
              direction: "下行",
              section: "洪山路-小洪山",
              station: "小洪山",
              user: "李明",
              patrolDate: "2026-07-03 19:02",
              progress: "现场混凝土养护",
              remark: "",
              updatedAt: "2026-07-03 19:02",
            },
            {
              recordId: "122804",
              projectName: "中北路地下商业连通道项目",
              projectType: "一般项目",
              line: "8号线",
              direction: "上行",
              section: "水果湖-洪山路",
              station: "洪山路",
              user: "李明",
              patrolDate: "2026-07-03 19:18",
              progress: "围护结构施工准备",
              remark: "",
              updatedAt: "2026-07-03 19:18",
            },
            {
              recordId: "122805",
              projectName: "楚河汉街区间市政接驳改造项目",
              projectType: "一般项目",
              line: "8号线",
              direction: "上行",
              section: "水果湖-洪山路",
              station: "洪山路",
              user: "李明",
              patrolDate: "2026-07-03 19:40",
              progress: "临边围挡加固施工",
              remark: "",
              updatedAt: "2026-07-03 19:40",
            },
            {
              recordId: "122806",
              projectName: "三金潭车辆段上盖物业综合开发项目",
              projectType: "临时项目",
              line: "2号线",
              direction: "上行",
              section: "金潭路-宏图大道",
              station: "宏图大道",
              user: "李明",
              patrolDate: "2026-07-03 19:55",
              progress: "现场钢筋绑扎施工",
              remark: "",
              updatedAt: "2026-07-03 19:55",
            },
          ],
          pendingProjects: [
            {
              recordId: "122901",
              projectName: "武昌滨江总部基地项目",
              projectType: "重点项目",
              line: "7号线",
              direction: "上行",
              section: "徐家棚-湖北大学",
              station: "徐家棚",
              user: "李明",
              patrolDate: "",
              progress: "桩基施工与泥浆外运",
              remark: "",
              updatedAt: "",
            },
            {
              recordId: "122902",
              projectName: "金融街六中北项目",
              projectType: "一般项目",
              line: "2号线",
              direction: "上行",
              section: "中南路-宝通寺",
              station: "中南路",
              user: "李明",
              patrolDate: "",
              progress: "基坑降水与支护施工",
              remark: "",
              updatedAt: "",
            },
            {
              recordId: "122903",
              projectName: "光谷广场综合体基坑项目",
              projectType: "临时项目",
              line: "2号线",
              direction: "下行",
              section: "光谷广场-杨家湾",
              station: "光谷广场",
              user: "李明",
              patrolDate: "",
              progress: "土方开挖与栈桥搭设",
              remark: "",
              updatedAt: "",
            },
          ],
        },
        {
          id: "n7",
          source: "今日巡线",
          type: "项目巡查",
          title: "新建商业文化设施项目已完成巡查",
          time: "2026-07-04 09:30",
          read: "未读",
          recordId: "123001",
          projectName: "新建商业文化设施项目",
          projectType: "一般项目",
          line: "8号线",
          direction: "上行",
          section: "水果湖-洪山路",
          station: "洪山路",
          user: "李明",
          patrolDate: "2026-07-04 09:15",
          progress: "负二层消防泵房施工完成，现场文明施工情况正常。",
          remark: "",
          updatedAt: "2026-07-04 09:30",
        },
        {
          id: "n8",
          type: "区间调配",
          title: "您已被临时调配至【洪山路-徐家棚】",
          time: "2026-07-16 09:53",
          read: "未读",
          source: "区间临时调配",
          personName: "王强",
          line: "8号线",
          fromSection: "水果湖-洪山路",
          toSection: "洪山路-徐家棚",
          startTime: "2026-07-16 09:53",
          endTime: "2026-07-16 17:53",
          reason: "本工班李明调休，临时补位",
          operator: "工班长-李明",
        },
        {
          id: "n9",
          type: "区间调配",
          title: "王强已被临时调配至【洪山路-徐家棚】",
          time: "2026-07-16 09:53",
          read: "未读",
          source: "区间临时调配",
          personName: "王强",
          line: "8号线",
          fromSection: "水果湖-洪山路",
          toSection: "洪山路-徐家棚",
          startTime: "2026-07-16 09:53",
          endTime: "2026-07-16 17:53",
          reason: "本工班李明调休，临时补位",
          operator: "工班长-李明",
        },
        {
          id: "n10",
          type: "区间调配",
          subType: "user-change",
          title: "您的责任区间已变更为【水果湖-洪山路】",
          time: "2026-07-16 10:20",
          read: "未读",
          source: "用户管理",
          userName: "张三",
          oldLine: "8号线",
          oldStartSection: "洪山路",
          oldEndSection: "徐家棚",
          newLine: "8号线",
          newStartSection: "水果湖",
          newEndSection: "洪山路",
          operator: "管理员-admin",
        },
        {
          id: "n11",
          type: "区间调配",
          subType: "user-change",
          title: "王强的责任区间已变更为【水果湖-洪山路】",
          time: "2026-07-16 10:25",
          read: "未读",
          source: "用户管理",
          userName: "王强",
          oldLine: "8号线",
          oldStartSection: "洪山路",
          oldEndSection: "徐家棚",
          newLine: "8号线",
          newStartSection: "水果湖",
          newEndSection: "洪山路",
          operator: "管理员-admin",
        },
      ],
      actions: ["查看", "删除"],
      toolbar: ["全部已读"],
    },
    "wb-done": {
      title: "已处理事项",
      badge: "历史记录追溯查询",
      filters: [
        { id: "title", label: "标题", type: "text", placeholder: "请输入标题关键词" },
        { id: "type", label: "事项类型", options: ["全部", "审批", "告警", "空域许可续期"] },
        { id: "start", label: "处理开始", type: "date" },
        { id: "end", label: "处理结束", type: "date" },
        { id: "result", label: "处理结果", options: ["全部", "审核中", "通过", "驳回", "已复核", "已续期"] }
      ],
      columns: ["标题", "类型", "来源模块", "处理人", "处理时间", "处理结果", "操作"],
      rows: [
        {
          doneKind: "flight-plan",
          planId: 106,
          title: "飞行计划审批 FP-20260513006",
          type: "审批",
          source: "飞行计划",
          user: "王主任",
          time: "2026-05-14 18:20",
          result: "驳回",
          opinion: "航线空域许可缺失，需补充材料后重新提交。",
        },
        {
          doneKind: "flight-plan",
          planId: 109,
          title: "飞行计划审批 FP-20260512009",
          type: "审批",
          source: "飞行计划",
          user: "王主任",
          time: "2026-05-13 11:16",
          result: "通过",
          opinion: "同意按计划执行，起飞前再次校验机场状态。",
        },
        {
          doneKind: "alarm",
          alertId: 201,
          title: "重点保护区越界告警",
          type: "告警",
          source: "地图驾驶舱",
          user: "鲍雄澎",
          time: "2026-05-12 16:42",
          result: "已复核",
          workflowStatus: "已复核",
          opinion: "已派发人工复核，现场确认无新增施工。",
        },
        {
          doneKind: "alarm",
          alertId: 202,
          title: "夜间巡查异常复核",
          type: "告警",
          source: "智慧巡检",
          user: "鲍雄澎",
          time: "2026-05-14 14:06",
          result: "已复核",
          workflowStatus: "已复核",
          opinion: "现场有破拆机械挖掘施工，动静比较大",
        },
        {
          doneKind: "airspace",
          title: "车辆段日常巡查航线许可续期",
          type: "空域许可续期",
          source: "空域许可",
          user: "李玲",
          time: "2026-05-11 10:30",
          result: "已续期",
          approvalNo: "KY-2026-0315-006",
          routeName: "车辆段日常巡查航线",
          approvedAt: "2026-03-28 14:20",
          permitEnd: "2026-06-20 18:00",
          remark: "新许可有效期已同步至航线库。",
          notifyTime: "2026-05-11 10:30",
        },
      ],
      actions: ["查看"]
    }
  };

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function style() {
    if (document.getElementById("wb-module-style")) return;
    document.head.insertAdjacentHTML("beforeend", '<style id="wb-module-style">' +
      '.wb-hero{border:1px solid rgba(34,211,238,.16);background:linear-gradient(135deg,rgba(2,8,23,.92),rgba(8,47,73,.28));box-shadow:0 22px 60px rgba(0,0,0,.28);border-radius:8px}.wb-stat{border-left:1px solid rgba(34,211,238,.18);padding-left:18px}.wb-table th,.wb-table td{height:52px;border-bottom:1px solid rgba(34,211,238,.09);border-right:1px solid rgba(34,211,238,.06);vertical-align:middle}.wb-table th:last-child,.wb-table td:last-child{border-right:0}.wb-table thead th{background:rgba(2,8,23,.72);font-size:12px;font-weight:600;white-space:nowrap}.wb-table tbody td{font-size:12px;color:rgba(226,245,255,.9)}.wb-tag{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;border:1px solid rgba(34,211,238,.22);background:rgba(34,211,238,.08);color:#bae6fd;font-size:11px}.wb-tag--warn{border-color:rgba(251,191,36,.3);background:rgba(251,191,36,.08);color:#fde68a}.wb-tag--danger{border-color:rgba(251,113,133,.32);background:rgba(251,113,133,.08);color:#fecdd3}.wb-tag--ok{border-color:rgba(52,211,153,.3);background:rgba(52,211,153,.08);color:#bbf7d0}.wb-action{display:inline-flex;align-items:center;gap:5px;margin-right:10px;white-space:nowrap;cursor:pointer;color:#67e8f9}.wb-action:hover{color:#fff}.wb-action--hot{color:#fbbf24}.wb-action--danger{color:#fb7185}.wb-modal-mask{position:fixed;inset:0;z-index:1250;display:none;align-items:flex-start;justify-content:center;background:rgba(2,8,23,.68);padding:72px 20px 20px}.wb-modal-mask.show{display:flex}.wb-modal{width:min(760px,94vw);max-height:calc(100dvh - 96px);overflow:auto;border:1px solid rgba(34,211,238,.2);border-radius:8px;background:#071426;box-shadow:0 30px 90px rgba(0,0,0,.5)}' +
      '.wb-approval-mask{position:fixed;inset:0;z-index:1250;display:none;align-items:flex-start;justify-content:center;background:rgba(2,8,23,.72);padding:72px 22px 22px}.wb-approval-mask.show{display:flex}.wb-approval-modal{width:min(1080px,96vw);max-height:calc(100dvh - 96px);overflow:auto;border:1px solid rgba(34,211,238,.25);border-radius:10px;background:#071b33;box-shadow:0 20px 60px rgba(0,0,0,.55)}' +
      '.wb-notify-detail-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px 24px}.wb-notify-detail-item--full{grid-column:1/-1}.wb-notify-detail-key{display:block;font-size:11px;color:#9cc6df;margin-bottom:6px}.wb-notify-detail-val{display:block;font-size:13px;color:#ecfeff;line-height:1.5;word-break:break-word}.wb-notify-detail-val--pass{color:#34d399;font-weight:600}.wb-notify-detail-val--reject{color:#fb7185;font-weight:600}' +
      '.wb-notify-title-cell__main{font-size:12px;color:rgba(226,245,255,.92);line-height:1.45}.wb-notify-title-cell__sub{margin-top:4px;font-size:11px;color:#94a3b8;line-height:1.4}.wb-modal--patrol-detail{width:min(920px,96vw)}.wb-modal--patrol-split{width:min(1400px,98vw)}.wb-notify-patrol-split{grid-template-columns:minmax(260px,300px) minmax(0,1fr)}.wb-notify-patrol-head{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(34,211,238,.12)}.wb-notify-patrol-head__title{margin:0;font-size:16px;font-weight:600;color:#ecfeff}.wb-notify-patrol-head__sub{margin:4px 0 0;font-size:12px;color:#94a3b8}.wb-notify-patrol-split{display:grid;grid-template-columns:minmax(280px,340px) minmax(0,1fr);gap:18px;min-height:420px}.wb-notify-patrol-left{padding:14px;border:1px solid rgba(34,211,238,.14);border-radius:8px;background:rgba(2,8,23,.35)}.wb-notify-patrol-right{padding:14px;border:1px solid rgba(34,211,238,.14);border-radius:8px;background:rgba(2,8,23,.22);min-height:360px}.wb-notify-patrol-meta{display:grid;gap:10px;margin-bottom:14px}.wb-notify-patrol-projects__label{font-size:11px;color:#9cc6df;margin-bottom:8px}.wb-notify-project-links{display:flex;flex-direction:column;gap:8px}.wb-notify-project-link{display:flex;align-items:center;justify-content:space-between;gap:10px;width:100%;padding:8px 10px;border:1px solid rgba(34,211,238,.14);border-radius:6px;background:rgba(15,23,42,.45);color:#67e8f9;font-size:12px;text-align:left;cursor:pointer}.wb-notify-project-link:hover,.wb-notify-project-link.is-active{border-color:rgba(34,211,238,.45);background:rgba(34,211,238,.08);color:#ecfeff}.wb-notify-project-link__name{flex:1;min-width:0;word-break:break-word}.wb-notify-patrol-section{margin-bottom:16px}.wb-notify-patrol-section:last-child{margin-bottom:0}.wb-notify-project-link.is-pending{border-color:transparent;background:transparent;color:#67e8f9}.wb-notify-project-link.is-pending:hover{border-color:rgba(34,211,238,.35);background:rgba(34,211,238,.08);color:#ecfeff}.wb-notify-project-link.is-pending.is-active{border-color:rgba(34,211,238,.45);background:rgba(34,211,238,.12);color:#ecfeff}.wb-notify-project-link.is-disabled{cursor:default;opacity:.7;border-color:rgba(34,211,238,.08);background:rgba(15,23,42,.25);color:#94a3b8}.wb-notify-project-link.is-disabled .wb-notify-project-link__name{color:#94a3b8}.wb-notify-project-tag{flex-shrink:0;display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:4px;font-size:11px;font-weight:500;border:1px solid}.wb-notify-project-tag.is-key{color:#ec4899;background:rgba(236,72,153,.1);border-color:rgba(236,72,153,.35)}.wb-notify-project-tag.is-normal{color:#f97316;background:rgba(249,115,22,.1);border-color:rgba(249,115,22,.35)}.wb-notify-project-tag.is-temp{color:#f59e0b;background:rgba(245,158,11,.1);border-color:rgba(245,158,11,.35)}.wb-notify-patrol-record-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px 20px}.wb-notify-patrol-record-item--full{grid-column:1/-1}.wb-notify-patrol-record-key{display:block;font-size:11px;color:#9cc6df;margin-bottom:4px}.wb-notify-patrol-record-val{display:block;font-size:13px;color:#ecfeff;line-height:1.55;word-break:break-word}.wb-notify-patrol-record-empty{display:flex;align-items:center;justify-content:center;min-height:320px;color:#94a3b8;font-size:13px;text-align:center;padding:24px}@media (max-width:960px){.wb-notify-patrol-split{grid-template-columns:1fr}.wb-notify-patrol-record-grid{grid-template-columns:1fr}}' +
      '.wb-approval-modal .field-label{color:#9cc6df;font-size:12px;margin-bottom:6px;display:block}.status-dot{width:7px;height:7px;border-radius:999px;display:inline-block;margin-right:6px}.wb-project-patrol-pane{min-height:360px}.wb-project-patrol-pane__head{margin-bottom:14px;padding-bottom:12px;border-bottom:1px solid rgba(34,211,238,.12)}.wb-project-patrol-pane__head h4{margin:0;font-size:16px;font-weight:600;color:#ecfeff}.wb-project-patrol-pane__head p{margin:4px 0 0;font-size:12px;color:#94a3b8}.wb-project-patrol-filters{display:flex;flex-wrap:wrap;align-items:flex-end;gap:12px;margin-bottom:14px;padding:12px;border:1px solid rgba(34,211,238,.12);border-radius:8px;background:rgba(2,8,23,.35)}.wb-project-patrol-filters label{display:flex;flex-direction:column;gap:6px;font-size:11px;color:#9cc6df;min-width:140px}.wb-project-patrol-filters label:nth-child(3){flex:1;min-width:260px}.wb-project-patrol-filters .wh-input{height:32px;padding:0 8px;font-size:12px;border-radius:6px;border:1px solid rgba(34,211,238,.22);background:rgba(2,8,23,.55);color:#ecfeff}.wb-project-patrol-dates{display:flex;align-items:center;gap:8px}.wb-project-patrol-filters__actions{display:flex;gap:8px;margin-left:auto}.wb-project-patrol-filters__actions button{height:32px;padding:0 16px;font-size:12px;border-radius:6px}.wb-project-patrol-table-wrap{overflow-x:auto;border:1px solid rgba(34,211,238,.12);border-radius:8px;background:rgba(2,8,23,.25)}.wb-project-patrol-table{width:100%;min-width:1100px;border-collapse:collapse;font-size:12px}.wb-project-patrol-table th{padding:10px 8px;text-align:left;background:rgba(2,8,23,.72);color:#cffafe;font-weight:600;border-bottom:1px solid rgba(34,211,238,.12)}.wb-project-patrol-table td{padding:10px 8px;border-bottom:1px solid rgba(34,211,238,.08);color:rgba(226,245,255,.9);vertical-align:middle}.wb-project-patrol-foot{display:flex;align-items:center;justify-content:space-between;gap:12px;margin-top:12px;font-size:12px;color:#94a3b8}.wb-project-patrol-pages{display:flex;gap:6px}.patrol-type-tag{display:inline-flex;align-items:center;padding:2px 8px;border-radius:4px;font-size:10px;border:1px solid rgba(34,211,238,.28);color:#a5f3fc;background:rgba(34,211,238,.08)}.patrol-type-tag--uav{border-color:rgba(96,165,250,.35);color:#93c5fd;background:rgba(59,130,246,.1)}.patrol-type-tag--alert{border-color:rgba(251,191,36,.35);color:#fcd34d;background:rgba(245,158,11,.1)}' +
      '.approval-records-scroll{max-height:min(520px,58vh);overflow-y:auto;padding:2px 8px 2px 2px}.approval-item{display:flex;gap:12px;align-items:stretch;padding:0 0 18px;border:none}.approval-item--last{padding-bottom:0}.approval-item__rail{display:flex;flex-direction:column;align-items:center;width:20px;flex-shrink:0}.approval-item__dot{width:12px;height:12px;min-width:12px;min-height:12px;border-radius:50%;background:#64748b;flex-shrink:0}.approval-item__line{flex:1;width:2px;min-height:14px;margin-top:4px;background:rgba(148,163,184,.22)}.approval-item.pass .approval-item__dot{background:#22c55e}.approval-item.wait .approval-item__dot{background:#f59e0b}.approval-item.reject .approval-item__dot{background:#ef4444}.approval-item__content{flex:1;min-width:0}' +
      '.disease-layout{display:grid;grid-template-columns:minmax(0,1fr) 300px;gap:16px;align-items:start}.disease-layout__right{position:sticky;top:72px;align-self:start;width:300px;max-height:calc(100dvh - 88px);display:flex;flex-direction:column;gap:10px}.disease-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;margin-bottom:16px}.disease-stat-card{display:flex;align-items:center;gap:12px;padding:14px 16px;border-radius:10px;border:1px solid rgba(34,211,238,.22);background:linear-gradient(135deg,rgba(8,15,35,.92),rgba(6,12,28,.88))}.disease-stat-card__icon{width:44px;height:44px;border-radius:10px;display:flex;align-items:center;justify-content:center;font-size:18px;flex-shrink:0}.disease-stat-card--blue .disease-stat-card__icon{background:rgba(59,130,246,.18);color:#93c5fd;border:1px solid rgba(59,130,246,.35)}.disease-stat-card--cyan .disease-stat-card__icon{background:rgba(34,211,238,.12);color:#67e8f9;border:1px solid rgba(34,211,238,.35)}.disease-stat-card--green .disease-stat-card__icon{background:rgba(74,222,128,.12);color:#86efac;border:1px solid rgba(74,222,128,.35)}.disease-stat-card--amber .disease-stat-card__icon{background:rgba(251,191,36,.12);color:#fcd34d;border:1px solid rgba(251,191,36,.35)}.disease-stat-card--rose .disease-stat-card__icon{background:rgba(251,113,133,.12);color:#fda4af;border:1px solid rgba(251,113,133,.35)}.disease-stat-card__value{font-size:22px;font-weight:700;color:#f0f9ff;line-height:1.2}.disease-stat-card__unit{font-size:12px;font-weight:400;margin-left:2px;color:#94a3b8}.disease-stat-card__label{font-size:11px;color:#94a3b8;margin-top:2px}.disease-stat-card__trend{font-size:10px;margin-top:4px;color:#94a3b8}.disease-filter-panel,.disease-quick-panel{display:flex;flex-direction:column;border-radius:10px;border:1px solid rgba(34,211,238,.2);background:rgba(8,15,35,.78)}.disease-panel-title{font-size:12px;font-weight:600;color:#e2f5ff;margin:0;padding:8px 10px 7px;border-bottom:1px solid rgba(34,211,238,.12);background:rgba(8,15,35,.92)}.disease-panel-body{padding:8px 10px 10px}.disease-filter-panel .disease-panel-body{display:flex;flex-direction:column;gap:6px}.disease-filter-panel label{display:flex;flex-direction:column;gap:3px;margin:0;font-size:10px}.disease-filter-panel label>span:first-child{color:#94a3b8}.disease-filter-panel .wh-input{height:26px!important;min-height:26px;font-size:11px;padding:0 6px}.disease-filter-actions{display:flex;gap:6px;margin-top:4px;padding-top:6px;border-top:1px solid rgba(34,211,238,.1)}.disease-filter-actions button{flex:1;padding-top:4px;padding-bottom:4px;font-size:11px}.disease-list-toolbar{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:12px}.disease-quick-panel .disease-panel-body{padding:6px 10px 8px}.disease-quick-link{display:flex;align-items:center;gap:8px;width:100%;padding:7px 10px;margin-bottom:5px;border-radius:6px;border:1px solid rgba(34,211,238,.14);background:rgba(15,23,42,.45);color:#e2f5ff;font-size:11px;text-decoration:none}.disease-quick-link:last-child{margin-bottom:0}.disease-quick-link:hover{border-color:rgba(34,211,238,.4);background:rgba(34,211,238,.08);color:#fff}.disease-quick-link.is-active{border-color:rgba(34,211,238,.55);background:rgba(34,211,238,.12);color:#a5f3fc}.disease-quick-link i{width:16px;text-align:center;color:#67e8f9;font-size:12px}@media (max-width:1400px){.disease-layout{grid-template-columns:1fr}.disease-stats{grid-template-columns:repeat(2,minmax(0,1fr))}.disease-layout__right{position:static;width:100%;max-height:none;display:grid;grid-template-columns:1fr 1fr;gap:10px}}@media (max-width:768px){.disease-stats{grid-template-columns:1fr}.disease-layout__right{grid-template-columns:1fr}}' +
    '</style>');
  }

  function panelBadgeLabel(key) {
    if (key === "wb-todo") return "待办面板";
    if (key === "wb-sys-notify") return "系统通知面板";
    if (key === "wb-done") return "已处理面板";
    return "工作台面板";
  }

  function diseaseStatCard(color, icon, id, label, trend, unit) {
    var valueHtml = unit
      ? '<span class="disease-stat-card__num">0</span><span class="disease-stat-card__unit">' + esc(unit) + "</span>"
      : "0";
    return (
      '<div class="disease-stat-card disease-stat-card--' +
      color +
      '"><div class="disease-stat-card__icon"><i class="fa-solid ' +
      icon +
      '"></i></div><div><div id="' +
      id +
      '" class="disease-stat-card__value">' +
      valueHtml +
      '</div><div class="disease-stat-card__label">' +
      label +
      '</div><div class="disease-stat-card__trend">' +
      trend +
      "</div></div></div>"
    );
  }

  function statsHtmlForKey(key) {
    if (key === "wb-todo") {
      return (
        diseaseStatCard("blue", "fa-list-check", "wb-stat-total", "当前列表", "筛选结果", "条") +
        diseaseStatCard("cyan", "fa-file-signature", "wb-stat-approval", "审批", "待办分类", "条") +
        diseaseStatCard("amber", "fa-bell", "wb-stat-alert", "告警", "待办分类", "条") +
        diseaseStatCard("rose", "fa-hourglass-half", "wb-stat-pending", "本月待处理", "待审批/未复核", "条")
      );
    }
    if (key === "wb-sys-notify") {
      return (
        diseaseStatCard("amber", "fa-clipboard-list", "wb-stat-patrol", "项目巡查", "通知类型", "条") +
        diseaseStatCard("cyan", "fa-file-signature", "wb-stat-approval-msg", "审批消息", "通知类型", "条") +
        diseaseStatCard("green", "fa-route", "wb-stat-airspace", "空域许可", "到期提醒", "条") +
        diseaseStatCard("purple", "fa-shuffle", "wb-stat-section-adjust", "区间调配", "区间临时调配/变更", "条")
      );
    }
    if (key === "wb-done") {
      return (
        diseaseStatCard("blue", "fa-clipboard-check", "wb-stat-total", "当前列表", "筛选结果", "条") +
        diseaseStatCard("cyan", "fa-file-signature", "wb-stat-approval", "审批", "事项类型", "条") +
        diseaseStatCard("amber", "fa-bell", "wb-stat-alarm", "告警", "事项类型", "条") +
        diseaseStatCard("green", "fa-circle-check", "wb-stat-closed", "已通过/已复核", "通过/已复核", "条")
      );
    }
    return "";
  }

  function filterControlSidebar(item) {
    if (item.type === "date") {
      return (
        '<label><span>' +
        item.label +
        '</span><input data-filter="' +
        item.id +
        '" type="date" class="wh-input w-full"></label>'
      );
    }
    if (item.type === "text") {
      return (
        '<label><span>' +
        item.label +
        '</span><input data-filter="' +
        item.id +
        '" type="text" class="wh-input w-full" placeholder="' +
        esc(item.placeholder || "") +
        '"></label>'
      );
    }
    return (
      '<label><span>' +
      item.label +
      '</span><select data-filter="' +
      item.id +
      '" class="wh-input w-full px-2">' +
      item.options
        .map(function (option) {
          return "<option>" + option + "</option>";
        })
        .join("") +
      "</select></label>"
    );
  }

  function buildQuickLinks(activeKey) {
    var links = [
      { key: "wb-todo", href: "wb/wb-todo.html", icon: "fa-list-check", label: "待办" },
      { key: "wb-sys-notify", href: "wb/wb-sys-notify.html", icon: "fa-bell", label: "系统通知" },
      { key: "wb-done", href: "wb/wb-done.html", icon: "fa-clipboard-check", label: "已处理事项" },
    ];
    return links
      .map(function (link) {
        return (
          '<a class="disease-quick-link' +
          (link.key === activeKey ? " is-active" : "") +
          '" data-quick-href="' +
          link.href +
          '" href="' +
          link.href.split("/").pop() +
          '"><i class="fa-solid ' +
          link.icon +
          '"></i><span>' +
          link.label +
          "</span></a>"
        );
      })
      .join("");
  }

  function initQuickLinks() {
    document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
      var target = anchor.getAttribute("data-quick-href");
      if (target && typeof whPageHref === "function") anchor.setAttribute("href", whPageHref(target));
    });
  }

  function currentMonthPrefix() {
    var d = new Date();
    var pad = function (n) {
      return n < 10 ? "0" + n : String(n);
    };
    return d.getFullYear() + "-" + pad(d.getMonth() + 1);
  }

  function updateWorkbenchStats(rows, key) {
    function setStatNum(id, val) {
      var el = document.getElementById(id);
      if (!el) return;
      var numEl = el.querySelector(".disease-stat-card__num");
      if (numEl) {
        numEl.textContent = String(val);
        return;
      }
      el.textContent = String(val);
    }
    if (key === "wb-sys-notify") {
      setStatNum(
        "wb-stat-patrol",
        rows.filter(function (r) {
          return isPatrolNotify(r);
        }).length
      );
      setStatNum(
        "wb-stat-approval-msg",
        rows.filter(function (r) {
          return r.type === "审批消息";
        }).length
      );
      setStatNum(
        "wb-stat-airspace",
        rows.filter(function (r) {
          return isAirspaceNotify(r);
        }).length
      );
      setStatNum(
        "wb-stat-section-adjust",
        rows.filter(function (r) {
          return r.type === "区间调配";
        }).length
      );
      return;
    }
    setStatNum("wb-stat-total", rows.length);
    if (key === "wb-todo") {
      var all = current.rows;
      var month = currentMonthPrefix();
      setStatNum(
        "wb-stat-pending",
        all.filter(function (r) {
          return (
            (r.status === "待审批" || r.status === "未复核") &&
            r.time &&
            r.time.slice(0, 7) === month
          );
        }).length
      );
      setStatNum(
        "wb-stat-approval",
        all.filter(function (r) {
          return r.tab === "approval";
        }).length
      );
      setStatNum(
        "wb-stat-alert",
        all.filter(function (r) {
          return r.tab === "alert";
        }).length
      );
      return;
    }
    if (key === "wb-done") {
      setStatNum(
        "wb-stat-approval",
        rows.filter(function (r) {
          return r.type === "审批";
        }).length
      );
      setStatNum(
        "wb-stat-alarm",
        rows.filter(function (r) {
          return r.type === "告警";
        }).length
      );
      setStatNum(
        "wb-stat-closed",
        rows.filter(function (r) {
          return r.result === "通过" || r.result === "已复核";
        }).length
      );
    }
  }

  function buildTodoTabBar(key) {
    if (key !== "wb-todo" || !current.tabs) return "";
    return (
      '<div class="wb-todo-tabbar">' +
      current.tabs
        .map(function (tab) {
          return (
            '<button type="button" class="wb-todo-tab' +
            (tab.key === current.activeTab ? " is-active" : "") +
            '" data-todo-tab="' +
            tab.key +
            '">' +
            tab.label +
            "</button>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function buildToolbarHtml(key) {
    var buttons = (current.toolbar || [])
      .map(function (name) {
        var hidden =
          key === "wb-todo" && name === "批量审批" && !todoBatchUiVisible()
            ? " hidden"
            : "";
        var label = key === "wb-todo" && name === "批量审批" && current.activeTab === "alert" ? "批量复核" : name;
        return (
          '<button type="button" data-action="' +
          esc(name) +
          '" class="px-4 py-1.5 rounded text-xs wh-btn-primary' +
          hidden +
          '"><i class="fa-solid fa-check-double mr-1"></i>' +
          esc(label) +
          "</button>"
        );
      })
      .join("");
    return (
      '<div class="disease-list-toolbar">' +
      buttons +
      '<button type="button" data-action="export" class="px-4 py-1.5 rounded text-xs wh-btn-ghost"><i class="fa-solid fa-file-export mr-1"></i>导出</button></div>'
    );
  }

  function buildDiseasePageHtml(key) {
    return (
      '<div class="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-cyan-400/10 pb-3">' +
      '<h1 class="text-base md:text-lg font-semibold text-white tracking-tight" style="text-shadow:0 0 20px rgba(34,211,238,0.25)">' +
      esc(current.title) +
      '</h1><span class="text-[10px] px-2 py-1 rounded-md border border-cyan-400/25 text-cyan-100/80 bg-cyan-500/5">' +
      panelBadgeLabel(key) +
      "</span></div>" +
      '<section id="wb-list-view"><div class="disease-layout"><div class="disease-layout__left">' +
      '<div class="disease-stats" aria-label="' +
      esc(current.title) +
      '统计">' +
      statsHtmlForKey(key) +
      "</div>" +
      buildTodoTabBar(key) +
      buildToolbarHtml(key) +
      '<div class="wh-table-shell bg-slate-950/35"><div class="wb-table-wrap overflow-x-auto"><table class="wb-table min-w-[1180px] w-full text-left"><thead><tr id="wb-thead-row">' +
      todoTableHeadHtml(key) +
      '</tr></thead><tbody id="wb-body"></tbody></table></div><div class="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-t border-cyan-400/15 bg-slate-950/55 text-[11px] text-slate-400"><span>共 <b id="wb-total" class="text-cyan-200">0</b> 条</span><div class="flex items-center gap-2 flex-wrap"><button class="min-w-[28px] h-8 rounded text-xs wh-btn-ghost" type="button"><i class="fa-solid fa-angle-left"></i></button><button class="min-w-[32px] h-8 rounded text-xs wh-btn-primary" type="button">1</button><button class="min-w-[28px] h-8 rounded text-xs wh-btn-ghost" type="button"><i class="fa-solid fa-angle-right"></i></button><select class="wh-input px-2 py-1 text-[11px]"><option>10 条/页</option></select><span>跳至</span><input class="wh-input w-12 px-1 py-1 text-center text-[11px]" value="1" /><span>页</span></div></div></div></div>' +
      '<aside class="disease-layout__right" aria-label="筛选与快捷操作"><div class="disease-filter-panel"><div class="disease-panel-title"><i class="fa-solid fa-filter mr-2 text-cyan-400"></i>快捷筛选</div><div class="disease-panel-body">' +
      current.filters.map(filterControlSidebar).join("") +
      '<div class="disease-filter-actions"><button type="button" data-action="query" class="wh-btn-primary">搜索</button><button type="button" data-action="reset" class="wh-btn-ghost">重置</button></div></div></div>' +
      '<div class="disease-quick-panel"><div class="disease-panel-title"><i class="fa-solid fa-bolt mr-2 text-cyan-400"></i>快捷操作</div><div class="disease-panel-body">' +
      buildQuickLinks(key) +
      "</div></div></aside></div></section>" +
      '<div id="wb-modal-mask" class="wb-modal-mask"><div class="wb-modal"><div class="h-14 px-6 flex items-center justify-between gap-3 border-b border-cyan-400/15"><h3 class="text-white text-[16px] font-semibold">详情</h3><button type="button" data-action="close-modal" class="wh-modal-close" aria-label="关闭">×</button></div><div id="wb-modal-body" class="p-6 space-y-3"></div></div></div>' +
      '<div id="wb-approval-mask" class="wb-approval-mask"><div class="wb-approval-modal"><div class="flex items-center justify-between px-5 py-4 border-b border-white/10"><h3 id="wb-approval-modal-title" class="text-base font-semibold text-white">飞行计划审批</h3><button type="button" data-action="close-approval" class="wh-modal-close" aria-label="关闭">×</button></div><div id="wb-approval-box" class="p-5"></div></div></div>'
    );
  }

  function tag(value) {
    var cls =
      value === "未读" || value === "待处理" || value === "待审批" || value === "未复核"
        ? "wb-tag--warn"
        : value === "驳回" || value === "审核不通过"
          ? "wb-tag--danger"
          : value === "通过" ||
              value === "已处置" ||
              value === "已续期" ||
              value === "已读" ||
              value === "已复核" ||
              value === "审核通过"
            ? "wb-tag--ok"
            : "";
    return '<span class="wb-tag ' + cls + '">' + esc(value) + '</span>';
  }

  var todoApprovalSingleRow = null;
  var todoApprovalBatchRows = null;
  var todoApprovalMode = "approval";
  var todoFloatingReviewBound = false;

  function closeTodoReviewMenus(exceptWrap) {
    document.querySelectorAll("body > .alert-review-menu").forEach(function (menu) {
      var parent = menu._origParent;
      if (exceptWrap && parent === exceptWrap) return;
      restoreTodoReviewMenu(menu);
    });
    document.querySelectorAll(".alert-op-review-wrap.is-open").forEach(function (wrap) {
      if (exceptWrap && wrap === exceptWrap) return;
      wrap.classList.remove("is-open");
      var menu = wrap._reviewMenuEl || wrap.querySelector(".alert-review-menu");
      if (menu && menu.parentElement === document.body) restoreTodoReviewMenu(menu);
    });
  }

  function restoreTodoReviewMenu(menu) {
    if (!menu || !menu._origParent) return;
    menu.classList.remove("alert-review-menu--floating", "is-visible");
    menu.style.left = "";
    menu.style.top = "";
    menu._origParent.appendChild(menu);
  }

  function positionTodoFloatingReviewMenu(wrap) {
    var menu = wrap.querySelector(".alert-review-menu");
    var btn = wrap.querySelector('[data-action="review-menu"]');
    if (!menu || !btn) return;
    if (!menu._origParent) menu._origParent = wrap;
    wrap._reviewMenuEl = menu;
    document.body.appendChild(menu);
    menu.classList.add("alert-review-menu--floating", "is-visible");
    wrap.classList.add("is-open");
    var rect = btn.getBoundingClientRect();
    var gap = 4;
    var menuW = menu.offsetWidth || 108;
    var menuH = menu.offsetHeight || 72;
    var left = rect.right - menuW;
    var top = rect.bottom + gap;
    if (top + menuH > window.innerHeight - 8) {
      top = rect.top - menuH - gap;
    }
    left = Math.max(8, Math.min(left, window.innerWidth - menuW - 8));
    top = Math.max(72, Math.min(top, window.innerHeight - menuH - 8));
    menu.style.left = left + "px";
    menu.style.top = top + "px";
  }

  function setApprovalModalTitle(title) {
    var el = document.getElementById("wb-approval-modal-title");
    if (el) el.textContent = title;
  }

  function todoBatchUiVisible() {
    return !!(current && current.activeTab === "approval");
  }

  function tableColumnCount(key) {
    var count = (current.columns || []).length;
    if (key === "wb-todo" && todoBatchUiVisible()) count += 1;
    return count;
  }

  function renderTodoEmptyRow(key) {
    return (
      '<tr class="wb-todo-empty-row"><td colspan="' +
      tableColumnCount(key) +
      '" class="wb-todo-empty"><div class="wb-todo-empty__inner">' +
      '<div class="wb-todo-empty__illus" aria-hidden="true"><i class="fa-regular fa-inbox"></i></div>' +
      "<span>暂无数据</span></div></td></tr>"
    );
  }

  function isActionsColumn(label) {
    return label === "操作";
  }

  function finishAlertReviewRow(row, data) {
    if (!row) return false;
    var flow = global.WHTodoFlow;
    var opinion = (data && data.scene) || "";
    if (flow) {
      flow.patchTodoRow(row, { status: "已复核", workflowStatus: "已复核" }, current.rows);
    } else {
      row.status = "已复核";
      row.workflowStatus = "已复核";
    }
    if (flow && flow.shouldMoveToDone(row, "已复核")) {
      flow.moveTodoRowToDone(row, "已复核", opinion, current.rows);
      return true;
    }
    return false;
  }

  function finishAlertAuditRow(row, decision) {
    if (!row || !decision) return false;
    var flow = global.WHTodoFlow;
    var result = decision.result;
    var opinion = decision.opinion || "";
    if (flow && flow.shouldMoveToDone(row, result)) {
      flow.moveTodoRowToDone(row, result, opinion, current.rows);
      return true;
    }
    if (flow) {
      flow.patchTodoRow(row, { status: result, workflowStatus: result }, current.rows);
    } else {
      row.status = result;
      row.workflowStatus = result;
    }
    return false;
  }

  function todoTableHeadHtml(key) {
    var cols = current.columns || [];
    if (key === "wb-todo" && todoBatchUiVisible()) {
      return (
        '<th class="w-10 px-3"><input type="checkbox" id="wb-todo-check-all" title="全选" /></th>' +
        cols
          .map(function (col) {
            var cls = "px-3 text-cyan-50/95" + (isActionsColumn(col) ? " disease-col-actions" : "");
            return '<th class="' + cls + '">' + col + "</th>";
          })
          .join("")
      );
    }
    return cols
      .map(function (col) {
        var cls = "px-3 text-cyan-50/95" + (isActionsColumn(col) ? " disease-col-actions" : "");
        return '<th class="' + cls + '">' + col + "</th>";
      })
      .join("");
  }

  function updateTodoTableHead() {
    if (document.body.dataset.sidebarKey !== "wb-todo") return;
    var tr = document.getElementById("wb-thead-row");
    if (!tr) return;
    tr.innerHTML = todoTableHeadHtml("wb-todo");
    syncTodoCheckAllState();
  }

  function todoCheckboxCell(row) {
    var actionable =
      (row.tab === "approval" && row.status === "待审批") ||
      (row.tab === "alert" && row.status === "未复核");
    if (!actionable) {
      return (
        '<input type="checkbox" class="wb-todo-row-check" disabled title="当前状态不可批量操作" />'
      );
    }
    return (
      '<input type="checkbox" class="wb-todo-row-check" data-row-title="' +
      esc(row.title) +
      '" />'
    );
  }

  function syncTodoCheckAllState() {
    var all = document.getElementById("wb-todo-check-all");
    if (!all) return;
    var enabled = Array.prototype.slice.call(
      document.querySelectorAll(".wb-todo-row-check:not(:disabled)")
    );
    var checked = enabled.filter(function (c) {
      return c.checked;
    });
    all.checked = enabled.length > 0 && checked.length === enabled.length;
    all.indeterminate = checked.length > 0 && checked.length < enabled.length;
    all.disabled = !enabled.length;
  }

  function selectedTodoBatchRows() {
    var list = [];
    document.querySelectorAll(".wb-todo-row-check:checked:not(:disabled)").forEach(function (cb) {
      var row = rowByTitle(cb.getAttribute("data-row-title"));
      if (!row) return;
      if (current.activeTab === "approval" && row.tab === "approval" && row.status === "待审批") {
        list.push(row);
      }
      if (current.activeTab === "alert" && row.tab === "alert" && row.status === "未复核") {
        list.push(row);
      }
    });
    return list;
  }

  function renderTodoReviewAction(row, index) {
    return (
      '<span class="alert-op-review-wrap">' +
      '<span class="wb-action wb-action--hot" data-action="review-menu" data-index="' +
      index +
      '" data-row-title="' +
      esc(row.title) +
      '"><i class="fa-solid fa-clipboard-check"></i>复核</span>' +
      '<div class="alert-review-menu" role="menu">' +
      '<button type="button" class="alert-review-menu__item" data-action="review-manual" data-index="' +
      index +
      '" data-row-title="' +
      esc(row.title) +
      '">人工复核</button>' +
      '<button type="button" class="alert-review-menu__item" data-action="review-uav" data-index="' +
      index +
      '" data-row-title="' +
      esc(row.title) +
      '">无人机复核</button>' +
      "</div></span>"
    );
  }

  function rowCells(key, row, index) {
    if (key === "wb-todo") {
      var cells = [row.title, row.source, row.user, row.time, tag(row.status), todoActions(row, index)];
      if (todoBatchUiVisible()) cells.unshift(todoCheckboxCell(row));
      return cells;
    }
    if (key === "wb-sys-notify") return [renderNotifyTitleCell(row), tag(row.type), row.time, tag(row.read), actions(row, index)];
    if (key === "wb-done") {
      return [row.title, tag(row.type), row.source, row.user, row.time, tag(row.result), actions(row, index)];
    }
    return [row.title, tag(row.type), row.source, row.user, row.time, tag(row.result), row.opinion, actions(row, index)];
  }

  function todoActionNames(row) {
    if (row.tab === "approval") return ["查看", "审批"];
    var ws = row.workflowStatus || row.status;
    if (ws === "未复核") return ["查看", "复核"];
    if (ws === "已复核") return ["查看", "审核"];
    return ["查看"];
  }

  function todoActions(row, index) {
    return todoActionNames(row)
      .map(function (name) {
        if (name === "复核" && row.tab === "alert" && (row.workflowStatus || row.status) === "未复核") {
          return renderTodoReviewAction(row, index);
        }
        var cls =
          name === "审批" || name === "复核" || name === "审核"
            ? " wb-action--hot"
            : "";
        var icon =
          name === "审批"
            ? "fa-file-signature"
            : name === "复核"
              ? "fa-clipboard-check"
              : name === "审核"
                ? "fa-stamp"
                : "fa-eye";
        var iconStyle = name === "查看" ? "fa-regular" : "fa-solid";
        return (
          '<span class="wb-action' +
          cls +
          '" data-action="' +
          esc(name) +
          '" data-index="' +
          index +
          '" data-row-title="' +
          esc(row.title) +
          '"><i class="' +
          iconStyle +
          " " +
          icon +
          '"></i>' +
          name +
          "</span>"
        );
      })
      .join("");
  }

  function actions(row, index) {
    var names = (current.actions || []).slice();
    return names.map(function (name) {
      var cls = name.indexOf("删除") > -1 ? " wb-action--danger" : name.indexOf("处理") > -1 || name.indexOf("标记") > -1 || name === "审批" ? " wb-action--hot" : "";
      var icon = name.indexOf("删除") > -1 ? "fa-trash-can" : name === "审批" ? "fa-file-signature" : name.indexOf("处理") > -1 ? "fa-bolt" : name.indexOf("标记") > -1 ? "fa-envelope-open" : "fa-eye";
      return '<span class="wb-action' + cls + '" data-action="' + esc(name) + '" data-index="' + index + '" data-row-title="' + esc(row.title) + '"><i class="fa-regular ' + icon + '"></i>' + name + "</span>";
    }).join("");
  }

  var lastRenderedRows = [];

  function openWorkbenchRow(r) {
    var key = document.body.dataset.sidebarKey;
    if (key === "wb-todo" && r) {
      if (r.tab === "approval" && r.planId && window.TodoModalBridge) {
        TodoModalBridge.openFlightPlanDetail(r.planId);
      } else if (r.tab === "alert" && r.alertId && window.TodoModalBridge) {
        TodoModalBridge.openAlarmDetail(r.alertId, r);
      } else {
        detail(r);
      }
      return;
    }
    if (key === "wb-sys-notify" && r) {
      openNotifyView(r);
      return;
    }
    if (key === "wb-done" && r) {
      openDoneView(r);
    }
  }

  function renderRows(rows) {
    var key = document.body.dataset.sidebarKey;
    document.getElementById("wb-total").textContent = rows.length;
    updateWorkbenchStats(rows, key);
    lastRenderedRows = rows;
    if (window.WHTableRowClick) WHTableRowClick.injectStyles();
    if (!rows.length) {
      document.getElementById("wb-body").innerHTML = renderTodoEmptyRow(key);
      if (key === "wb-todo" && todoBatchUiVisible()) syncTodoCheckAllState();
      return;
    }
    document.getElementById("wb-body").innerHTML = rows
      .map(function (row, index) {
        var cells = rowCells(key, row, index);
        return (
          '<tr class="wh-row-open ' +
          (index % 2 ? "bg-slate-950/10" : "bg-slate-950/25") +
          '" data-row-index="' +
          index +
          '">' +
          cells
            .map(function (cell, cellIndex) {
              var isActions = cellIndex === cells.length - 1;
              var tdClass = "px-3" + (isActions ? " disease-col-actions" : "");
              var content = isActions ? '<div class="disease-op-actions">' + cell + "</div>" : cell;
              return '<td class="' + tdClass + '">' + content + "</td>";
            })
            .join("") +
          "</tr>"
        );
      })
      .join("");
    if (key === "wb-todo" && todoBatchUiVisible()) syncTodoCheckAllState();
  }

  function rowByTitle(title) {
    var t = title == null ? "" : String(title);
    return current.rows.find(function (r) { return r.title === t; });
  }

  function todoPlanFromRow(row) {
    var name = row.title.indexOf("飞行计划审批 ") === 0 ? row.title.slice("飞行计划审批 ".length) : row.title;
    return { name: name || row.title, audit: "审核中" };
  }

  function approvalRecordsTodo(plan) {
    var base = [
      { person: "张工", time: "2026-05-13 09:24", status: "审批通过", opinion: "申请资料完整，航线与空域许可匹配。" },
      { person: "李工", time: "2026-05-13 09:42", status: "审批通过", opinion: "施工保护区范围核对无误，同意执行。" },
      { person: "陈工", time: "2026-05-13 10:05", status: "审核中", opinion: "待核验无人机电池与载荷状态。" },
      { person: "王主任", time: "-", status: "待审批", opinion: "-" },
      { person: "赵经理", time: "-", status: "待审批", opinion: "-" }
    ];
    if (plan.audit === "审核通过") return base.map(function (r) { return Object.assign({}, r, { status: "审批通过", time: r.time === "-" ? "2026-05-13 10:36" : r.time, opinion: r.opinion === "-" ? "审批通过，同意按计划执行。" : r.opinion }); });
    if (plan.audit === "已驳回") return base.map(function (r, i) { return i === 2 ? Object.assign({}, r, { status: "已驳回", time: "2026-05-13 10:12", opinion: "空域许可临期，请补充续期材料后重新提交。" }) : r; });
    return base;
  }

  function recordClassTodo(status) {
    if (status === "审批通过") return "pass";
    if (status === "审核中") return "wait";
    if (status === "已驳回") return "reject";
    return "";
  }

  function renderApprovalRecordsTodo(plan) {
    if (window.ApprovalTimeline) {
      return ApprovalTimeline.renderApprovalRecords(approvalRecordsTodo(plan));
    }
    return "";
  }

  function buildTodoBatchListHtml(rows, label) {
    label = label || "待审批事项";
    return (
      '<div class="text-sm font-semibold text-cyan-100 mb-3">' +
      esc(label) +
      '</div><div class="max-h-[320px] overflow-y-auto pr-1 space-y-2">' +
      rows
        .map(function (row) {
          return (
            '<div class="rounded border border-cyan-400/15 bg-slate-950/30 px-3 py-2 text-xs text-slate-200">' +
            esc(row.title) +
            '<div class="mt-1 text-[11px] text-slate-500">' +
            esc(row.user) +
            " · " +
            esc(row.time) +
            "</div></div>"
          );
        })
        .join("") +
      "</div>"
    );
  }

  function buildTodoBatchReviewHtml(rows) {
    var reviewForm =
      global.WuhanExpertReviewModal && global.WuhanExpertReviewModal.buildDesktopBatchReviewFormHtml
        ? global.WuhanExpertReviewModal.buildDesktopBatchReviewFormHtml()
        : "";
    return (
      '<div class="mb-4"><div class="text-cyan-100 font-semibold">批量复核' +
      (rows.length > 1 ? "（" + rows.length + " 条）" : "") +
      '</div></div><div class="grid md:grid-cols-[1fr_360px] gap-4"><section class="min-w-0">' +
      reviewForm +
      '<div class="mt-4 flex justify-end"><button type="button" id="wb-batch-review-save" class="wh-btn-primary px-4 py-2">保存</button></div>' +
      '</section><section class="wb-todo-batch-list-panel">' +
      buildTodoBatchListHtml(rows, "待复核事项") +
      "</section></div>"
    );
  }

  function buildTodoApprovalHtml(plan, opts) {
    opts = opts || {};
    var planBadge = window.ApprovalTimeline
      ? ApprovalTimeline.statusBadge(plan.audit)
      : esc(plan.audit);
    var heading = opts.batchCount
      ? "批量审批（" + opts.batchCount + " 条）"
      : esc(plan.name);
    var rightPane = opts.batchRows
      ? buildTodoBatchListHtml(opts.batchRows)
      : '<div class="text-sm font-semibold text-cyan-100 mb-4">审批记录</div><div id="wb-approval-records">' +
        renderApprovalRecordsTodo(plan) +
        "</div>";
    return (
      '<div class="mb-4 flex items-center justify-between gap-3"><div><div class="text-cyan-100 font-semibold">' +
      heading +
      '</div><div class="mt-1 text-xs text-slate-400">审批流程：提交 → 工长 → 工务 → 物管 → 车间主任 → 部门领导</div></div>' +
      planBadge +
      '</div><div class="grid md:grid-cols-[360px_1fr] gap-4"><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4"><div class="text-sm font-semibold text-cyan-100 mb-3">审批意见</div><label><span class="field-label">审批意见</span><textarea id="wb-approval-opinion" class="wh-input w-full px-3 py-2 min-h-[132px]" placeholder="请输入审批意见">同意该飞行计划按审批流程继续执行。</textarea></label><div class="mt-4 flex justify-end gap-2"><button type="button" id="wb-reject-btn" class="wh-btn-ghost px-4 py-2">驳回</button><button type="button" id="wb-approve-btn" class="wh-btn-primary px-4 py-2">审批通过</button></div><div class="mt-3 text-xs text-cyan-100 leading-6">系统校验：飞行计划审批通过、航线空域许可有效、无人机满足起飞条件才允许起飞。</div></section><section class="rounded border border-cyan-400/20 bg-slate-950/25 p-4">' +
      rightPane +
      "</section></div>"
    );
  }

  function bindTodoApprovalModalActions() {
    var approveBtn = document.getElementById("wb-approve-btn");
    var rejectBtn = document.getElementById("wb-reject-btn");
    var saveBtn = document.getElementById("wb-batch-review-save");
    if (approveBtn) {
      approveBtn.onclick = function () {
        submitTodoApproval("审批通过");
      };
    }
    if (rejectBtn) {
      rejectBtn.onclick = function () {
        submitTodoApproval("已驳回");
      };
    }
    if (saveBtn) {
      saveBtn.onclick = function () {
        submitTodoBatchReview();
      };
    }
  }

  function openTodoFlightApproval(row) {
    var plan = todoPlanFromRow(row);
    todoApprovalSingleRow = row;
    todoApprovalBatchRows = null;
    todoApprovalMode = "approval";
    setApprovalModalTitle("飞行计划审批");
    document.getElementById("wb-approval-box").innerHTML = buildTodoApprovalHtml(plan);
    bindTodoApprovalModalActions();
    document.getElementById("wb-approval-mask").classList.add("show");
  }

  function openTodoBatchReview() {
    var selected = selectedTodoBatchRows();
    if (!selected.length) {
      alert("请选择待复核项");
      return;
    }
    todoApprovalSingleRow = null;
    todoApprovalBatchRows = selected.slice();
    todoApprovalMode = "batchReview";
    setApprovalModalTitle("批量复核");
    document.getElementById("wb-approval-box").innerHTML = buildTodoBatchReviewHtml(selected);
    if (global.WuhanExpertReviewModal && global.WuhanExpertReviewModal.initInlineReviewForm) {
      var first = selected[0];
      var project =
        global.TodoModalBridge && first && first.alertId != null
          ? global.TodoModalBridge.getAlarmProject(first.alertId, first)
          : null;
      global.WuhanExpertReviewModal.initInlineReviewForm({
        projectName: (project && project.projectName) || "",
        projectNameOptions:
          global.TodoModalBridge && global.TodoModalBridge.collectAlarmProjectNames
            ? global.TodoModalBridge.collectAlarmProjectNames()
            : [],
        falseAlarm: "非误报",
        levelAdjust: "一级告警",
        scene: "",
        photos: global.WuhanExpertReviewModal.DEFAULT_PHOTOS,
      });
    }
    bindTodoApprovalModalActions();
    document.getElementById("wb-approval-mask").classList.add("show");
  }

  function openTodoBatchApproval() {
    if (current.activeTab === "alert") {
      openTodoBatchReview();
      return;
    }
    var selected = selectedTodoBatchRows();
    if (!selected.length) {
      alert("请选择需要审批的待办");
      return;
    }
    todoApprovalSingleRow = null;
    todoApprovalBatchRows = selected.slice();
    todoApprovalMode = "approval";
    var plan = { name: "批量飞行计划审批", audit: "审核中" };
    setApprovalModalTitle("批量审批");
    document.getElementById("wb-approval-box").innerHTML = buildTodoApprovalHtml(plan, {
      batchCount: selected.length,
      batchRows: selected,
    });
    bindTodoApprovalModalActions();
    document.getElementById("wb-approval-mask").classList.add("show");
  }

  function submitTodoBatchReview() {
    var bridge = global.TodoModalBridge;
    var reviewModal = global.WuhanExpertReviewModal;
    if (!bridge || !reviewModal || !reviewModal.readInlineReviewForm) {
      alert("复核模块未加载");
      return;
    }
    var data = reviewModal.readInlineReviewForm();
    if (!data.scene && data.falseAlarm !== "误报") {
      alert("请填写现场复核情况");
      return;
    }
    var targets = todoApprovalBatchRows && todoApprovalBatchRows.length ? todoApprovalBatchRows : [];
    var applied = 0;
    targets.forEach(function (row) {
      if (!row || row.tab !== "alert" || row.status !== "未复核") return;
      if (bridge.applyAlarmReviewData(row.alertId, row, data)) {
        if (finishAlertReviewRow(row, data)) applied++;
      }
    });
    todoApprovalSingleRow = null;
    todoApprovalBatchRows = null;
    todoApprovalMode = "approval";
    document.getElementById("wb-approval-mask").classList.remove("show");
    applyFilter();
    if (!applied) {
      alert("所选待办均不可复核");
      return;
    }
    alert("批量复核完成，已移入已处理事项");
  }

  function submitTodoApproval(status) {
    if (todoApprovalMode === "batchReview") {
      submitTodoBatchReview();
      return;
    }
    var ta = document.getElementById("wb-approval-opinion");
    var opinion = (ta && ta.value) || "";
    opinion = opinion.trim();
    if (!opinion) {
      alert("请填写审批意见");
      return;
    }
    var resultStatus = status === "审批通过" ? "审批通过" : "已驳回";
    var targets = todoApprovalBatchRows && todoApprovalBatchRows.length
      ? todoApprovalBatchRows
      : todoApprovalSingleRow
        ? [todoApprovalSingleRow]
        : [];
    var applied = 0;
    var flow = global.WHTodoFlow;
    targets.forEach(function (row) {
      if (!row || row.tab !== "approval" || row.status !== "待审批") return;
      if (flow && flow.shouldMoveToDone(row, resultStatus)) {
        flow.moveTodoRowToDone(row, resultStatus, opinion, current.rows);
      } else {
        row.status = resultStatus;
        row.opinion = opinion;
      }
      applied++;
    });
    todoApprovalSingleRow = null;
    todoApprovalBatchRows = null;
    todoApprovalMode = "approval";
    document.getElementById("wb-approval-mask").classList.remove("show");
    applyFilter();
    if (!applied) {
      alert("所选待办均不可审批");
      return;
    }
    if (targets.length > 1) {
      alert(
        status === "审批通过"
          ? "已批量审批通过 " + applied + " 条，已移入已处理事项"
          : "已批量驳回 " + applied + " 条，已移入已处理事项"
      );
    } else {
      alert(
        status === "审批通过"
          ? "审批通过，已移入已处理事项"
          : "已驳回，已移入已处理事项"
      );
    }
  }

  function notifyTypeLabel(row) {
    if (row.type === "提醒" || row.type === "空域许可提醒") return "空域许可提醒";
    return row.type || "—";
  }

  function isAirspaceNotify(row) {
    return row.type === "空域许可提醒" || row.type === "提醒";
  }

  function isPatrolNotify(row) {
    return row && (row.type === "项目巡查" || row.type === "项目巡线");
  }

  function isSectionAdjustNotify(row) {
    return row && row.type === "区间调配";
  }

  function isPatrolBatch(row) {
    return isPatrolNotify(row) && Array.isArray(row.projects) && row.projects.length > 0;
  }

  function getProjectTypeLabel(proj) {
    return proj.projectType || proj.type || "一般项目";
  }

  function buildSortedProjectItems(projects, includeTemp) {
    var indexed = (projects || []).map(function (proj, idx) {
      return { proj: proj, idx: idx, typeLabel: getProjectTypeLabel(proj) };
    });
    var keys = [], normals = [], temps = [];
    indexed.forEach(function (item) {
      if (item.typeLabel === "重点项目") keys.push(item);
      else if (item.typeLabel === "临时项目") temps.push(item);
      else normals.push(item);
    });
    var result = keys.concat(normals);
    if (includeTemp) result = result.concat(temps);
    return result;
  }

  function buildPatrolSingleTitle(row) {
    if (row.title) return row.title;
    var date = String(row.patrolDate || row.time || "").slice(0, 10);
    var user = row.user || "—";
    var project = row.projectName || "项目";
    return date + " " + user + " 已完成 " + project + " 的巡查";
  }

  function buildPatrolBatchTitle(row) {
    if (row.title) return row.title;
    var date = String(row.time || "").slice(0, 10);
    return date + " " + patrolNotifyUsers(row) + " 已完成以下项目的巡查";
  }

  function patrolNotifyTitle(row) {
    if (!isPatrolNotify(row)) return row.title || "—";
    if (isPatrolBatch(row)) return buildPatrolBatchTitle(row);
    return buildPatrolSingleTitle(row);
  }

  function patrolBatchSubtitle(row) {
    var names = (row.projects || [])
      .map(function (proj) {
        return proj.projectName || proj.title || "";
      })
      .filter(Boolean);
    if (!names.length) return "";
    if (names.length <= 2) return "已完成项目：" + names.join("、");
    return "已完成项目：" + names.slice(0, 2).join("、") + " 等 " + names.length + " 项";
  }

  function patrolNotifyUsers(row) {
    var users = [];
    (row.projects || []).forEach(function (proj) {
      var name = proj.user || "李明";
      if (users.indexOf(name) < 0) users.push(name);
    });
    if (!users.length) users = ["李明"];
    return users.join("、");
  }

  function normalizePatrolNotifyRow(row) {
    if (!isPatrolNotify(row)) return row;
    row.title = patrolNotifyTitle(row);
    return row;
  }

  function renderNotifyTitleCell(row) {
    if (!isPatrolNotify(row)) return esc(row.title);
    var html =
      '<div class="wb-notify-title-cell"><div class="wb-notify-title-cell__main">' +
      esc(patrolNotifyTitle(row)) +
      "</div>";
    if (isPatrolBatch(row)) {
      html += '<div class="wb-notify-title-cell__sub">' + esc(patrolBatchSubtitle(row)) + "</div>";
    }
    html += "</div>";
    return html;
  }

  function patrolRecordField(label, value, full) {
    return (
      '<div class="wb-notify-patrol-record-item' +
      (full ? " wb-notify-patrol-record-item--full" : "") +
      '"><span class="wb-notify-patrol-record-key">' +
      esc(label) +
      '</span><span class="wb-notify-patrol-record-val">' +
      esc(value == null || value === "" ? "—" : value) +
      "</span></div>"
    );
  }

  function buildPatrolRecordDetailHtml(row, opts) {
    opts = opts || {};
    if (!row) return '<div class="wb-notify-patrol-record-empty">请选择左侧项目查看巡查详情</div>';
    var recordId = String(row.recordId || row.id || "").replace(/^(M-|n)/, "");
    var projectLabel = row.projectName || "—";
    if (row.projectType) projectLabel += " / " + row.projectType;
    var headHtml = opts.hideTitle
      ? '<div class="wb-notify-patrol-head"><p class="wb-notify-patrol-head__sub">人工巡查记录详情</p></div>'
      : '<div class="wb-notify-patrol-head">' +
        '<h4 class="wb-notify-patrol-head__title">查看详情</h4>' +
        '<p class="wb-notify-patrol-head__sub">人工巡查记录详情</p></div>';
    var html =
      headHtml +
      '<div class="wb-notify-patrol-record-grid">' +
      patrolRecordField("编号", recordId) +
      patrolRecordField("所属线路", row.line) +
      patrolRecordField("上下行", row.direction) +
      patrolRecordField("所在区间", row.section) +
      patrolRecordField("站点", row.station) +
      patrolRecordField("所在项目", projectLabel, true) +
      patrolRecordField("巡查日期", row.patrolDate || row.time);
    if (global.WHPatrolMediaGallery && global.WHPatrolMediaGallery.renderDetailGrid) {
      html +=
        '<div class="wb-notify-patrol-record-item wb-notify-patrol-record-item--full"><span class="wb-notify-patrol-record-key">巡查照片</span><span class="wb-notify-patrol-record-val">' +
        global.WHPatrolMediaGallery.renderDetailGrid({ kind: "photo", projectName: row.projectName, previewCount: 3 }) +
        "</span></div>";
      html +=
        '<div class="wb-notify-patrol-record-item wb-notify-patrol-record-item--full"><span class="wb-notify-patrol-record-key">巡查视频</span><span class="wb-notify-patrol-record-val">' +
        global.WHPatrolMediaGallery.renderDetailGrid({ kind: "video", projectName: row.projectName, previewCount: 2 }) +
        "</span></div>";
    }
    html +=
      patrolRecordField("项目进展", row.progress || row.result, true) +
      patrolRecordField("协调情况及备注", row.remark, true) +
      patrolRecordField("巡查人", row.user) +
      patrolRecordField("更新时间", row.updatedAt || row.time);
    html += "</div>";
    return html;
  }

  function sortNotifyRows(rows) {
    return rows.slice().sort(function (a, b) {
      var aUnread = a.read === "未读" ? 0 : 1;
      var bUnread = b.read === "未读" ? 0 : 1;
      if (aUnread !== bUnread) return aUnread - bUnread;
      return String(b.time || "").localeCompare(String(a.time || ""));
    });
  }

  function renderPatrolBatchNotifyDetail(row, selectedIndex) {
    var body = document.getElementById("wb-modal-body");
    if (!body) return;
    var projects = row.projects || [];
    var doneItems = buildSortedProjectItems(projects, true);
    var pendingProjects = (row.pendingProjects || []).filter(function (proj) {
      return getProjectTypeLabel(proj) !== "临时项目";
    });
    var pendingItems = buildSortedProjectItems(pendingProjects, false);

    var activeIndex =
      typeof selectedIndex === "number" && selectedIndex >= 0
        ? selectedIndex
        : doneItems.length
          ? doneItems[0].idx
          : -1;

    function renderProjectTag(typeLabel) {
      var cls = "wb-notify-project-tag";
      if (typeLabel === "重点项目") cls += " is-key";
      else if (typeLabel === "临时项目") cls += " is-temp";
      else cls += " is-normal";
      return '<span class="' + cls + '">' + esc(typeLabel) + "</span>";
    }

    function renderProjectItem(item, clickable, action, displayIndex, pending) {
      var name = esc(item.proj.projectName || item.proj.title || "项目");
      var activeClass = item.idx === activeIndex && action === "patrol-view-project" ? " is-active" : "";
      if (clickable) {
        return '<button type="button" class="wb-notify-project-link' + (pending ? " is-pending" : "") + activeClass + '" data-action="' + esc(action || "patrol-view-project") + '" data-project-index="' + (displayIndex != null ? displayIndex : item.idx) + '">' +
          '<span class="wb-notify-project-link__name">' + name + "</span>" +
          renderProjectTag(item.typeLabel) +
          "</button>";
      }
      return '<div class="wb-notify-project-link is-disabled">' +
        '<span class="wb-notify-project-link__name">' + name + "</span>" +
        renderProjectTag(item.typeLabel) +
        "</div>";
    }

    var leftHtml =
      '<div class="wb-notify-patrol-meta">' +
      notifyDetailField("标题", patrolNotifyTitle(row), { full: true }) +
      notifyDetailField("通知类型", "项目巡查", { full: true }) +
      notifyDetailField("发布时间", row.time, { full: true }) +
      notifyDetailField("巡查人员", patrolNotifyUsers(row), { full: true }) +
      "</div>" +
      '<div class="wb-notify-patrol-projects">' +
      '<div class="wb-notify-patrol-section">' +
      '<div class="wb-notify-patrol-projects__label">已完成项目</div>' +
      '<div class="wb-notify-project-links">' +
      doneItems.map(function (item) { return renderProjectItem(item, true, "patrol-view-project"); }).join("") +
      "</div></div>" +
      '<div class="wb-notify-patrol-section">' +
      '<div class="wb-notify-patrol-projects__label">未完成项目</div>' +
      '<div class="wb-notify-project-links">' +
      pendingItems.map(function (item, idx) { return renderProjectItem(item, true, "patrol-view-pending-project", idx, true); }).join("") +
      "</div></div>" +
      "</div>";
    var rightHtml =
      activeIndex >= 0 && projects[activeIndex]
        ? buildPatrolRecordDetailHtml(projects[activeIndex])
        : '<div class="wb-notify-patrol-record-empty">点击左侧项目名称查看巡查详情</div>';
    body.innerHTML =
      '<div class="wb-notify-patrol-split"><div class="wb-notify-patrol-left">' +
      leftHtml +
      '</div><div class="wb-notify-patrol-right" id="wb-patrol-detail-pane">' +
      rightHtml +
      "</div></div>";
  }

  function setPatrolNotifyModalMode(mode) {
    var mask = document.getElementById("wb-modal-mask");
    if (!mask) return;
    var modal = mask.querySelector(".wb-modal");
    if (!modal) return;
    modal.classList.remove("wb-modal--patrol-detail", "wb-modal--patrol-split");
    if (mode) modal.classList.add(mode);
  }

  function resetPatrolNotifyModal() {
    setPatrolNotifyModalMode("");
    patrolNotifyContext = null;
    var mask = document.getElementById("wb-modal-mask");
    if (!mask) return;
    var titleEl = mask.querySelector("h3");
    if (titleEl) titleEl.textContent = "详情";
  }

  function openProjectPatrolDrawer(projectName) {
    var id = "wb-project-patrol-drawer";
    var drawer = document.getElementById(id);
    if (!drawer) {
      drawer = document.createElement("div");
      drawer.id = id;
      drawer.innerHTML =
        '<div class="wb-project-patrol-drawer__mask" data-action="close-project-patrol-drawer"></div>' +
        '<div class="wb-project-patrol-drawer__panel">' +
        '<div class="wb-project-patrol-drawer__head">' +
        '<div><h3>项目巡查</h3><p class="wb-project-patrol-drawer__subtitle"></p></div>' +
        '<button type="button" class="wb-project-patrol-drawer__close" data-action="close-project-patrol-drawer" aria-label="关闭"><i class="fa-solid fa-xmark"></i></button>' +
        '</div>' +
        '<div class="wb-project-patrol-drawer__body">' +
        '<iframe id="wb-project-patrol-frame" title="巡查记录"></iframe>' +
        '</div></div>';
      document.body.appendChild(drawer);
      drawer.addEventListener("click", function (e) {
        var trigger = e.target.closest('[data-action="close-project-patrol-drawer"]');
        if (trigger) closeProjectPatrolDrawer();
      });
      var style = document.createElement("style");
      style.textContent =
        "#wb-project-patrol-drawer { position:fixed; inset:0; z-index:1300; display:none; }" +
        "#wb-project-patrol-drawer.is-open { display:block; }" +
        "#wb-project-patrol-drawer .wb-project-patrol-drawer__mask { position:absolute; inset:0; background:rgba(2,8,23,.72); }" +
        "#wb-project-patrol-drawer .wb-project-patrol-drawer__panel { position:absolute; right:0; top:0; bottom:0; width:100vw; background:linear-gradient(180deg,#040914,#091426); border-left:1px solid rgba(34,211,238,.18); box-shadow:-24px 0 80px rgba(0,0,0,.5); display:flex; flex-direction:column; }" +
        "#wb-project-patrol-drawer .wb-project-patrol-drawer__head { flex-shrink:0; display:flex; align-items:center; justify-content:space-between; gap:12px; padding:14px 18px; border-bottom:1px solid rgba(34,211,238,.12); }" +
        "#wb-project-patrol-drawer .wb-project-patrol-drawer__head h3 { font-size:16px; font-weight:600; color:#ecfeff; margin:0; }" +
        "#wb-project-patrol-drawer .wb-project-patrol-drawer__subtitle { font-size:11px; color:#94a3b8; margin:4px 0 0; }" +
        "#wb-project-patrol-drawer .wb-project-patrol-drawer__close { width:32px; height:32px; border:0; background:transparent; color:#94a3b8; font-size:18px; cursor:pointer; }" +
        "#wb-project-patrol-drawer .wb-project-patrol-drawer__close:hover { color:#fff; }" +
        "#wb-project-patrol-drawer .wb-project-patrol-drawer__body { flex:1; min-height:0; overflow:auto; padding:16px; }" +
        "#wb-project-patrol-drawer iframe { width:100%; height:100%; min-height:calc(100vh - 90px); border:0; border-radius:8px; background:#020617; }";
      document.head.appendChild(style);
    }
    var sub = drawer.querySelector(".wb-project-patrol-drawer__subtitle");
    if (sub) sub.textContent = projectName ? "关联项目：" + projectName : "";
    var frame = drawer.querySelector("iframe");
    if (frame) {
      var src = "in-project-patrol.html?embed=1";
      if (projectName) src += "&project=" + encodeURIComponent(projectName);
      frame.src = src;
    }
    drawer.classList.add("is-open");
  }

  function closeProjectPatrolDrawer() {
    var drawer = document.getElementById("wb-project-patrol-drawer");
    if (drawer) drawer.classList.remove("is-open");
  }

  function renderProjectPatrolPane(projectName) {
    var pane = document.getElementById("wb-patrol-detail-pane");
    if (!pane) return;
    var now = new Date();
    var weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    var records = PROJECT_PATROL_RECORDS.map(function (r) {
      return Object.assign({}, r, { projectName: projectName || r.projectName });
    });

    function parseTime(s) {
      if (!s) return null;
      var d = new Date(String(s).replace(/-/g, "/").replace("T", " "));
      return isNaN(d.getTime()) ? null : d;
    }

    function typeBadge(type) {
      var cls = "patrol-type-tag";
      if (type === "无人机巡查") cls += " patrol-type-tag--uav";
      else if (type === "全时全域告警") cls += " patrol-type-tag--alert";
      return '<span class="' + cls + '">' + esc(type) + "</span>";
    }

    function mediaCell(row, kind) {
      if (global.WHPatrolMediaGallery) {
        return global.WHPatrolMediaGallery.renderCell({
          kind: kind,
          projectName: row.projectName,
          rowKey: row.id,
          previewCount: kind === "photo" ? 2 : 1
        });
      }
      return '<span class="text-slate-500">—</span>';
    }

    function rowHtml(row, index) {
      var actions = row.patrolType === "人工巡查"
        ? '<span class="wb-action"><i class="fa-regular fa-pen-to-square"></i>编辑</span><span class="wb-action"><i class="fa-regular fa-circle-check"></i>工班确认</span><span class="wb-action wb-action--danger"><i class="fa-regular fa-circle-xmark"></i>拒绝</span><span class="wb-action wb-action--danger"><i class="fa-regular fa-trash-can"></i>删除</span><span class="wb-action"><i class="fa-regular fa-clock"></i>操作记录</span>'
        : '<span class="wb-action"><i class="fa-regular fa-file-lines"></i>查看报告</span><span class="wb-action"><i class="fa-solid fa-download"></i>下载报告</span>';
      return (
        '<tr data-patrol-index="' + index + '">' +
        '<td class="px-3 text-slate-100/95">' + esc(row.projectName) + "</td>" +
        '<td class="px-3">' + typeBadge(row.patrolType) + "</td>" +
        '<td class="px-3 text-slate-100/95 max-w-[200px] truncate" title="' + esc(row.progress) + '">' + esc(row.progress) + "</td>" +
        '<td class="px-3">' + mediaCell(row, "photo") + "</td>" +
        '<td class="px-3">' + mediaCell(row, "video") + "</td>" +
        '<td class="px-3 text-slate-100/95 whitespace-nowrap">' + esc(row.updatedAt) + "</td>" +
        '<td class="px-3 text-slate-100/95">' + esc(row.operator) + "</td>" +
        '<td class="px-3 disease-col-actions"><div class="disease-op-actions">' + actions + "</div></td></tr>"
      );
    }

    function renderTable(filtered) {
      var tbody = pane.querySelector(".wb-project-patrol-table tbody");
      if (!tbody) return;
      if (!filtered.length) {
        tbody.innerHTML = '<tr><td colspan="8" class="px-3 py-6 text-center text-slate-400">暂无巡查记录</td></tr>';
        return;
      }
      tbody.innerHTML = filtered.map(rowHtml).join("");
      var totalEl = pane.querySelector(".wb-project-patrol-total");
      if (totalEl) totalEl.textContent = String(filtered.length);
    }

    function applyFilters() {
      var typeEl = pane.querySelector('[data-pp-filter="type"]');
      var operatorEl = pane.querySelector('[data-pp-filter="operator"]');
      var startEl = pane.querySelector('[data-pp-filter="time-start"]');
      var endEl = pane.querySelector('[data-pp-filter="time-end"]');
      var type = typeEl ? typeEl.value : "";
      var operator = operatorEl ? operatorEl.value.trim() : "";
      var start = startEl ? startEl.value : "";
      var end = endEl ? endEl.value : "";
      var filtered = records.filter(function (row) {
        if (type && row.patrolType !== type) return false;
        if (operator && String(row.operator).indexOf(operator) < 0) return false;
        var t = parseTime(row.updatedAt);
        if (start) {
          var s = parseTime(start);
          if (s && t && t < s) return false;
        }
        if (end) {
          var e = parseTime(end);
          if (e && t && t > e) return false;
        }
        return true;
      });
      renderTable(filtered);
    }

    pane.innerHTML =
      '<div class="wb-project-patrol-pane">' +
      '<div class="wb-project-patrol-pane__head"><h4>项目巡查</h4><p>关联项目：' + esc(projectName || "—") + "</p></div>" +
      '<div class="wb-project-patrol-filters">' +
      '<label><span>巡查类型</span><select data-pp-filter="type" class="wh-input"><option value="">全部</option><option value="人工巡查">人工巡查</option><option value="无人机巡查">无人机巡查</option><option value="全时全域告警">全时全域告警</option></select></label>' +
      '<label><span>巡查人/飞手</span><input data-pp-filter="operator" class="wh-input" placeholder="请输入巡查人或飞手" /></label>' +
      '<label><span>更新时间</span><div class="wb-project-patrol-dates"><input data-pp-filter="time-start" type="datetime-local" class="wh-input" /><input data-pp-filter="time-end" type="datetime-local" class="wh-input" /></div></label>' +
      '<div class="wb-project-patrol-filters__actions"><button type="button" data-pp-action="search" class="wh-btn-primary">搜索</button><button type="button" data-pp-action="reset" class="wh-btn-ghost">重置</button></div>' +
      "</div>" +
      '<div class="wb-project-patrol-table-wrap">' +
      '<table class="wb-project-patrol-table wb-table">' +
      '<thead><tr><th>项目名称</th><th>巡查类型</th><th>项目进展</th><th>巡查照片</th><th>巡查视频</th><th>更新时间</th><th>巡查人/飞手</th><th>操作</th></tr></thead>' +
      '<tbody></tbody>' +
      "</table></div>" +
      '<div class="wb-project-patrol-foot"><span>共 <b class="wb-project-patrol-total">0</b> 条</span><div class="wb-project-patrol-pages"><button type="button" class="wh-btn-ghost">&lt;</button><button type="button" class="wh-btn-primary">1</button><button type="button" class="wh-btn-ghost">&gt;</button></div></div>' +
      "</div>";

    var startInput = pane.querySelector('[data-pp-filter="time-start"]');
    var endInput = pane.querySelector('[data-pp-filter="time-end"]');
    if (startInput) startInput.value = formatDateTimeLocal(weekAgo);
    if (endInput) endInput.value = formatDateTimeLocal(now);

    pane.querySelectorAll('[data-pp-filter]').forEach(function (el) {
      el.addEventListener("change", applyFilters);
      el.addEventListener("input", applyFilters);
    });
    pane.querySelectorAll('[data-pp-action]').forEach(function (btn) {
      btn.addEventListener("click", function () {
        var act = btn.getAttribute("data-pp-action");
        if (act === "search") {
          applyFilters();
        } else if (act === "reset") {
          pane.querySelectorAll('[data-pp-filter]').forEach(function (el) {
            if (el.tagName === "SELECT") el.selectedIndex = 0;
            else el.value = "";
          });
          if (startInput) startInput.value = formatDateTimeLocal(weekAgo);
          if (endInput) endInput.value = formatDateTimeLocal(now);
          applyFilters();
        }
      });
    });

    applyFilters();
    if (global.WHPatrolMediaGallery) {
      global.WHPatrolMediaGallery.bind(pane);
    }
  }

  var patrolNotifyContext = null;

  var PROJECT_PATROL_RECORDS = [
    {
      id: "M-122820",
      patrolType: "人工巡查",
      projectName: "武昌滨江总部基地项目",
      progress: "负二层消防泵房施工，负一层通风安装作业同步推进，现场文明施工情况正常。",
      updatedAt: "2026-07-15 10:00",
      operator: "李玲",
      line: "8号线",
      direction: "下行",
      section: "洪山路~小洪山",
      station: "小洪山"
    },
    {
      id: "FL20251225001",
      patrolType: "无人机巡查",
      projectName: "武昌滨江总部基地项目",
      progress: "—",
      updatedAt: "2026-07-16 09:00",
      operator: "张三",
      uav: {
        taskId: "FL20251225001",
        planId: 1,
        planName: "8号线车辆段常规巡检",
        route: "车辆段日常巡查航线",
        airport: "车辆段机场",
        deviceName: "车辆段无人机 M350",
        taskType: "自动执行计划/临时任务",
        line: "8号线",
        takeoff: "2026-07-16 08:00",
        landing: "2026-07-16 09:00",
        operator: "张三"
      }
    }
  ];

  function formatDateTimeLocal(date) {
    var d = date || new Date();
    var y = d.getFullYear();
    var m = String(d.getMonth() + 1).padStart(2, "0");
    var day = String(d.getDate()).padStart(2, "0");
    var h = String(d.getHours()).padStart(2, "0");
    var min = String(d.getMinutes()).padStart(2, "0");
    return y + "-" + m + "-" + day + "T" + h + ":" + min;
  }

  function openPatrolNotifyView(row) {
    markNotifyRead(row);
    patrolNotifyContext = row;
    var mask = document.getElementById("wb-modal-mask");
    var titleEl = mask && mask.querySelector("h3");
    if (titleEl) titleEl.textContent = "查看详情";
    if (isPatrolBatch(row)) {
      setPatrolNotifyModalMode("wb-modal--patrol-split");
      renderPatrolBatchNotifyDetail(row, 0);
    } else {
      setPatrolNotifyModalMode("wb-modal--patrol-detail");
      document.getElementById("wb-modal-body").innerHTML = buildPatrolRecordDetailHtml(row, { hideTitle: true });
    }
    mask.classList.add("show");
    applyFilter();
  }

  function notifyTypeMatchesFilter(row, filterType) {
    if (!filterType || filterType === "全部") return true;
    if (filterType === "空域许可提醒") return isAirspaceNotify(row);
    if (filterType === "项目巡查") return isPatrolNotify(row);
    if (filterType === "区间调配") return isSectionAdjustNotify(row);
    return row.type === filterType;
  }

  function notifyDetailField(label, value, opts) {
    opts = opts || {};
    var valClass = "wb-notify-detail-val";
    if (opts.tone === "pass") valClass += " wb-notify-detail-val--pass";
    if (opts.tone === "reject") valClass += " wb-notify-detail-val--reject";
    var itemClass = "wb-notify-detail-item" + (opts.full ? " wb-notify-detail-item--full" : "");
    return (
      '<div class="' +
      itemClass +
      '"><span class="wb-notify-detail-key">' +
      esc(label) +
      '</span><span class="' +
      valClass +
      '">' +
      esc(value == null || value === "" ? "—" : value) +
      "</span></div>"
    );
  }

  function notifyDetail(row) {
    var html;
    if (row.type === "审批消息") {
      var resultTone = row.auditResult === "审批通过" ? "pass" : row.auditResult === "已驳回" ? "reject" : "";
      html = [
        notifyDetailField("标题", row.title, { full: true }),
        notifyDetailField("计划名称", row.planName),
        notifyDetailField("飞行航线", row.route),
        notifyDetailField("使用机场", row.airport),
        notifyDetailField("审批结果", row.auditResult, { tone: resultTone }),
        notifyDetailField("通知类型", "审批消息"),
        notifyDetailField("发布时间", row.time),
      ].join("");
    } else if (isAirspaceNotify(row)) {
      html = [
        notifyDetailField("标题", row.title, { full: true }),
        notifyDetailField("审批号", row.approvalNo),
        notifyDetailField("航线名称", row.routeName),
        notifyDetailField("审批通过", row.approvedAt),
        notifyDetailField("许可结束", row.permitEnd),
        notifyDetailField("备注", row.remark, { full: true }),
        notifyDetailField("通知类型", "空域许可提醒"),
        notifyDetailField("发布时间", row.time),
      ].join("");
    } else if (isSectionAdjustNotify(row)) {
      var isUserChange = row.subType === "user-change";
      var fields = [
        notifyDetailField("标题", row.title, { full: true }),
        notifyDetailField("通知类型", "区间调配"),
        notifyDetailField("发布时间", row.time)
      ];
      if (isUserChange) {
        fields.push(notifyDetailField("用户姓名", row.userName));
        fields.push(notifyDetailField("原所属线路", row.oldLine));
        fields.push(notifyDetailField("原起始区间", row.oldStartSection));
        fields.push(notifyDetailField("原终点区间", row.oldEndSection));
        fields.push(notifyDetailField("新所属线路", row.newLine));
        fields.push(notifyDetailField("新起始区间", row.newStartSection));
        fields.push(notifyDetailField("新终点区间", row.newEndSection));
      } else {
        fields.push(notifyDetailField("被调配人", row.personName));
        fields.push(notifyDetailField("所属线路", row.line));
        fields.push(notifyDetailField("原区间", row.fromSection));
        fields.push(notifyDetailField("目标区间", row.toSection));
        fields.push(notifyDetailField("调配时段", (row.startTime || "—") + " 至 " + (row.endTime || "—")));
        fields.push(notifyDetailField("调配原因", row.reason));
      }
      fields.push(notifyDetailField("操作人", row.operator));
      html = fields.join("");
    } else {
      html = notifyDetailField("标题", row.title, { full: true }) + notifyDetailField("发布时间", row.time);
    }
    document.getElementById("wb-modal-body").innerHTML = '<div class="wb-notify-detail-grid">' + html + "</div>";
    document.getElementById("wb-modal-mask").classList.add("show");
  }

  function markNotifyRead(row) {
    if (!row || row.read === "已读") return;
    row.read = "已读";
    if (global.WHHeaderBadges) WHHeaderBadges.markNotifyRead(row);
  }

  function openNotifyView(row) {
    if (isPatrolNotify(row)) {
      openPatrolNotifyView(row);
      return;
    }
    markNotifyRead(row);
    resetPatrolNotifyModal();
    notifyDetail(row);
    applyFilter();
  }

  function openDoneView(row) {
    if (!row) return;
    if (row.doneKind === "flight-plan" && row.planId && global.TodoModalBridge) {
      global.TodoModalBridge.mountModals();
      global.TodoModalBridge.openFlightPlanDetail(row.planId);
      return;
    }
    if (row.doneKind === "alarm" && row.alertId && global.TodoModalBridge) {
      global.TodoModalBridge.mountModals();
      global.TodoModalBridge.openAlarmDetail(row.alertId, row);
      return;
    }
    if (row.doneKind === "airspace") {
      notifyDetail({
        type: "空域许可提醒",
        title: row.title,
        approvalNo: row.approvalNo,
        routeName: row.routeName,
        approvedAt: row.approvedAt,
        permitEnd: row.permitEnd,
        remark: row.remark || row.opinion,
        time: row.notifyTime || row.time,
      });
      return;
    }
    detail(row);
  }

  function detail(row) {
    var key = document.body.dataset.sidebarKey;
    if (key === "wb-sys-notify") {
      if (isPatrolNotify(row)) {
        openPatrolNotifyView(row);
      } else {
        notifyDetail(row);
      }
      return;
    }
    var body = Object.keys(row).filter(function (k) { return k !== "note"; }).map(function (k) {
      var labels = { title: "标题", type: "类型", source: "来源模块", user: "人员", time: "时间", status: "当前状态", read: "是否已读", result: "处理结果", opinion: "处理意见" };
      return '<div class="grid grid-cols-[96px_1fr] gap-3 text-xs"><span class="text-cyan-100/70 text-right">' + (labels[k] || k) + '：</span><span class="text-slate-100">' + esc(row[k]) + '</span></div>';
    }).join("");
    document.getElementById("wb-modal-body").innerHTML = body + (row.note ? '<div class="mt-4 rounded border border-cyan-400/15 bg-cyan-500/5 px-3 py-2 text-xs text-cyan-50/85">' + esc(row.note) + '</div>' : "");
    document.getElementById("wb-modal-mask").classList.add("show");
  }

  function visibleTodoRows() {
    var tab = current.activeTab || "approval";
    return current.rows.filter(function (row) {
      return row.tab === tab;
    });
  }

  function applyFilter() {
    var values = {};
    document.querySelectorAll("[data-filter]").forEach(function (el) {
      values[el.dataset.filter] = el.value;
    });
    var base = document.body.dataset.sidebarKey === "wb-todo" ? visibleTodoRows() : current.rows;
    var rows = base.filter(function (row) {
      if (values.title) {
        var q = String(values.title).trim().toLowerCase();
        if (q) {
          normalizePatrolNotifyRow(row);
          var searchable = [row.title, row.projectName, row.user, row.progress].join(" ").toLowerCase();
          if (isPatrolBatch(row)) {
            searchable +=
              " " +
              (row.projects || [])
                .map(function (proj) {
                  return [proj.projectName, proj.title, proj.user, proj.progress].join(" ");
                })
                .join(" ");
          }
          if (searchable.indexOf(q) < 0) return false;
        }
      }
      if (values.status && values.status !== "全部" && row.status !== values.status) return false;
      if (values.result && values.result !== "全部" && row.result !== values.result) return false;
      if (values.type && values.type !== "全部" && !notifyTypeMatchesFilter(row, values.type)) return false;
      var rowTime = row.time ? row.time.slice(0, 10) : "";
      if (values.start && rowTime < values.start) return false;
      if (values.end && rowTime > values.end) return false;
      return true;
    });
    if (document.body.dataset.sidebarKey === "wb-sys-notify") {
      rows = sortNotifyRows(rows);
    }
    renderRows(rows);
  }

  function syncTodoBatchToolbar() {
    var btn = document.querySelector('#wb-app [data-action="批量审批"]');
    if (!btn) return;
    btn.classList.toggle("hidden", !todoBatchUiVisible());
    var label = current.activeTab === "alert" ? "批量复核" : "批量审批";
    btn.innerHTML = '<i class="fa-solid fa-check-double mr-1"></i>' + label;
  }

  function switchTodoTab(tabKey) {
    current.activeTab = tabKey;
    document.querySelectorAll("[data-todo-tab]").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-todo-tab") === tabKey);
    });
    document.querySelectorAll("[data-filter]").forEach(function (el) {
      el.selectedIndex = 0;
      el.value = "";
    });
    updateTodoTableHead();
    syncTodoBatchToolbar();
    renderRows(visibleTodoRows());
  }

  var current = null;
  function init() {
    if (global.WHTodoFlow && global.WHTodoFlow.applyToConfigs) {
      global.WHTodoFlow.applyToConfigs();
    }
    var key = document.body.dataset.sidebarKey;
    current = configs[key];
    if (!current) return;
    style();
    document.title = current.title;
    document.getElementById("wb-app").innerHTML = buildDiseasePageHtml(key);
    initQuickLinks();
    if (key === "wb-sys-notify") {
      current.rows.forEach(normalizePatrolNotifyRow);
      if (global.WHHeaderBadges) WHHeaderBadges.applyNotifyReadToRows(current.rows);
      if (global.WHPatrolMediaGallery && global.WHPatrolMediaGallery.bind) {
        global.WHPatrolMediaGallery.bind(document);
      }
    }
    if (key === "wb-todo") {
      if (global.TodoModalBridge) global.TodoModalBridge.mountModals();
      if (global.WHMapAlerts && global.WHMapAlerts.initPortalDetailModal) {
        global.WHMapAlerts.initPortalDetailModal();
      }
      updateTodoTableHead();
      syncTodoBatchToolbar();
      renderRows(visibleTodoRows());
    } else if (key === "wb-done") {
      if (global.TodoModalBridge) global.TodoModalBridge.mountModals();
      renderRows(current.rows);
    } else if (key === "wb-sys-notify") {
      renderRows(sortNotifyRows(current.rows));
    } else {
      renderRows(current.rows);
    }
    if (global.WHHeaderBadges) WHHeaderBadges.refresh();

    if (key === "wb-todo") {
      document.addEventListener("click", function (e) {
        if (e.target.closest(".alert-op-review-wrap") || e.target.closest(".alert-review-menu")) return;
        closeTodoReviewMenus();
      });
      if (!todoFloatingReviewBound) {
        todoFloatingReviewBound = true;
        document.addEventListener("click", function (e) {
          if (document.body.dataset.sidebarKey !== "wb-todo") return;
          var node = e.target.closest("body > .alert-review-menu [data-action]");
          if (!node) return;
          var action = node.getAttribute("data-action");
          if (action !== "review-manual" && action !== "review-uav") return;
          e.stopPropagation();
          var r = rowByTitle(node.getAttribute("data-row-title"));
          if (!r || !r.alertId || !window.TodoModalBridge) return;
          closeTodoReviewMenus();
          if (action === "review-manual") {
            TodoModalBridge.openAlarmReview(r.alertId, r, function (data) {
              finishAlertReviewRow(r, data);
              applyFilter();
            });
          } else {
            TodoModalBridge.openDroneAlarmReview(r.alertId, r);
          }
        });
        window.addEventListener("resize", closeTodoReviewMenus);
        var tableWrap = document.querySelector(".wb-table-wrap");
        if (tableWrap) tableWrap.addEventListener("scroll", closeTodoReviewMenus);
      }
    }

    document.getElementById("wb-app").addEventListener("change", function (event) {
      if (key !== "wb-todo") return;
      if (event.target.id === "wb-todo-check-all") {
        var checked = event.target.checked;
        document.querySelectorAll(".wb-todo-row-check:not(:disabled)").forEach(function (cb) {
          cb.checked = checked;
        });
        syncTodoCheckAllState();
        return;
      }
      if (event.target.classList && event.target.classList.contains("wb-todo-row-check")) {
        syncTodoCheckAllState();
      }
    });

    document.getElementById("wb-app").addEventListener("click", function (event) {
      var rowTr = event.target.closest("#wb-body tr[data-row-index]");
      if (rowTr && !event.target.closest("[data-action], input, button, a, label, .wb-todo-row-check, .alert-op-review-wrap, .alert-review-menu")) {
        var rowIndex = Number(rowTr.getAttribute("data-row-index"));
        var rowData = lastRenderedRows[rowIndex];
        if (rowData) {
          openWorkbenchRow(rowData);
          return;
        }
      }

      var tabBtn = event.target.closest("[data-todo-tab]");
      if (tabBtn && key === "wb-todo") {
        switchTodoTab(tabBtn.getAttribute("data-todo-tab"));
        return;
      }

      var node = event.target.closest("[data-action]");
      if (!node) return;
      var action = node.dataset.action;
      var index = Number(node.dataset.index);
      if (action === "query") applyFilter();
      if (action === "reset") {
        document.querySelectorAll("[data-filter]").forEach(function (el) {
          el.selectedIndex = 0;
          el.value = "";
        });
        if (key === "wb-todo") renderRows(visibleTodoRows());
        else if (key === "wb-sys-notify") renderRows(sortNotifyRows(current.rows));
        else renderRows(current.rows);
      }
      if (action === "close-modal") {
        resetPatrolNotifyModal();
        document.getElementById("wb-modal-mask").classList.remove("show");
      }
      if (action === "patrol-view-project" && patrolNotifyContext) {
        var projectIndex = Number(node.dataset.projectIndex);
        renderPatrolBatchNotifyDetail(patrolNotifyContext, projectIndex);
        return;
      }
      if (action === "patrol-view-pending-project" && patrolNotifyContext) {
        var pendingIdx = Number(node.dataset.projectIndex);
        var pendingProjects = (patrolNotifyContext.pendingProjects || []).filter(function (proj) {
          return getProjectTypeLabel(proj) !== "临时项目";
        });
        var pendingItems = buildSortedProjectItems(pendingProjects, false);
        var pendingItem = pendingItems[pendingIdx];
        if (pendingItem && pendingItem.proj) {
          // 高亮当前选中的未完成项目，清空所有已完成/未完成项目的 active 状态
          document.querySelectorAll('.wb-notify-project-link').forEach(function (el) { el.classList.remove("is-active"); });
          node.classList.add("is-active");
          renderProjectPatrolPane(pendingItem.proj.projectName || pendingItem.proj.title || "");
        }
        return;
      }
      if (action === "close-approval") document.getElementById("wb-approval-mask").classList.remove("show");

      var rowFromClick = rowByTitle(node.dataset.rowTitle);
      var r = rowFromClick != null ? rowFromClick : current.rows[index];

      if (key === "wb-todo" && action === "批量审批") {
        openTodoBatchApproval();
        return;
      }

      if (key === "wb-todo" && r) {
        if (action === "查看") {
          if (r.tab === "approval" && r.planId && window.TodoModalBridge) {
            TodoModalBridge.openFlightPlanDetail(r.planId);
          } else if (r.tab === "alert" && r.alertId && window.TodoModalBridge) {
            TodoModalBridge.openAlarmDetail(r.alertId, r);
          } else {
            detail(r);
          }
          return;
        }
        if (action === "审批") {
          openTodoFlightApproval(r);
          return;
        }
        if (action === "review-menu") {
          var wrap = node.closest(".alert-op-review-wrap");
          var wasOpen = wrap && wrap.classList.contains("is-open");
          closeTodoReviewMenus();
          if (wrap && !wasOpen) positionTodoFloatingReviewMenu(wrap);
          return;
        }
        if (action === "review-manual" && r.alertId && window.TodoModalBridge) {
          closeTodoReviewMenus();
          TodoModalBridge.openAlarmReview(r.alertId, r, function (data) {
            finishAlertReviewRow(r, data);
            applyFilter();
          });
          return;
        }
        if (action === "review-uav" && r.alertId && window.TodoModalBridge) {
          closeTodoReviewMenus();
          TodoModalBridge.openDroneAlarmReview(r.alertId, r);
          return;
        }
        if (action === "审核" && r.alertId && window.TodoModalBridge) {
          TodoModalBridge.openAlarmAudit(r.alertId, r, function (project, decision) {
            finishAlertAuditRow(r, decision || { result: project && project.workflowStatus });
            applyFilter();
          });
          return;
        }
      }

      if (key === "wb-sys-notify" && r) {
        if (action === "查看") {
          openNotifyView(r);
          return;
        }
        if (action === "删除") {
          if (confirm("确定删除该通知吗？")) {
            current.rows.splice(index, 1);
            applyFilter();
            if (global.WHHeaderBadges) WHHeaderBadges.refresh();
          }
          return;
        }
        if (action === "全部已读") {
          current.rows.forEach(function (item) {
            item.read = "已读";
          });
          if (global.WHHeaderBadges) WHHeaderBadges.markAllNotifyRead();
          applyFilter();
          return;
        }
      }

      if (key === "wb-done" && r && action === "查看") {
        openDoneView(r);
        return;
      }

      if (action === "查看" || action === "查看详情") {
        if (r) detail(r);
      }
      if (action === "删除" || action === "export") alert("原型演示：操作已触发");
    });
  }
  function notifyDetailPairs(row) {
    if (!row) return [];
    if (row.type === "审批消息") {
      return [
        ["标题", row.title],
        ["计划名称", row.planName],
        ["飞行航线", row.route],
        ["使用机场", row.airport],
        ["审批结果", row.auditResult],
        ["通知类型", "审批消息"],
        ["发布时间", row.time],
      ];
    }
    if (isAirspaceNotify(row)) {
      return [
        ["标题", row.title],
        ["审批号", row.approvalNo],
        ["航线名称", row.routeName],
        ["审批通过", row.approvedAt],
        ["许可结束", row.permitEnd],
        ["备注", row.remark],
        ["通知类型", "空域许可提醒"],
        ["发布时间", row.time],
      ];
    }
    return [
      ["标题", row.title],
      ["发布时间", row.time],
    ];
  }

  global.WHWorkbenchNotify = {
    notifyDetailPairs: notifyDetailPairs,
    isAirspaceNotify: isAirspaceNotify,
    isPatrolNotify: isPatrolNotify,
    isPatrolBatch: isPatrolBatch,
    patrolNotifyTitle: patrolNotifyTitle,
    patrolBatchSubtitle: patrolBatchSubtitle,
    buildPatrolRecordDetailHtml: buildPatrolRecordDetailHtml,
  };

  function doneDetailPairs(row) {
    if (!row) return [];
    if (row.doneKind === "airspace") {
      return [
        ["标题", row.title],
        ["审批号", row.approvalNo],
        ["航线名称", row.routeName],
        ["审批通过", row.approvedAt],
        ["许可结束", row.permitEnd],
        ["备注", row.remark],
        ["事项类型", row.type || "空域许可续期"],
        ["处理时间", row.notifyTime || row.time],
        ["处理人", row.user],
        ["处理结果", row.result],
      ];
    }
    return [
      ["标题", row.title],
      ["类型", row.type],
      ["来源模块", row.source],
      ["处理人", row.user],
      ["处理时间", row.time],
      ["处理结果", row.result],
      ["处理意见", row.opinion],
    ];
  }

  global.WHWorkbenchDone = {
    doneDetailPairs: doneDetailPairs,
    isClosedResult: function (result) {
      return result === "通过" || result === "已复核";
    },
  };

  global.WH_WORKBENCH_DEFAULTS = JSON.parse(JSON.stringify(configs));
  global.WH_WORKBENCH_CONFIGS = configs;

  document.addEventListener("DOMContentLoaded", init);
})(typeof window !== "undefined" ? window : this);
