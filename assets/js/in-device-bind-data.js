/**
 * 设备领用 — 种子数据（对齐 web/wb/in-device-bind.html）
 */
(function (global) {
  global.WH_DEVICE_BIND_LINES = {
    "2号线": ["常青花园", "长港路", "汉口火车站"],
    "5号线": ["白沙六路", "青菱"],
    "7号线": ["光谷广场", "杨家湾"],
    "8号线": ["洪山路", "小洪山", "徐家棚", "徐东"],
    "11号线": ["光谷五路", "左岭"],
  };

  global.WH_DEVICE_BIND_PERSONS = [
    { name: "张强", line: "8号线", start: "洪山路", end: "小洪山", phone: "13800001111", dept: "巡检业务部 / 人工巡检组" },
    { name: "李磊", line: "8号线", start: "徐家棚", end: "徐东", phone: "13800002222", dept: "巡检业务部 / 无人机巡检组" },
    { name: "王芳", line: "2号线", start: "常青花园", end: "长港路", phone: "13800003333", dept: "数据中心 / 资料管理组" },
    { name: "赵敏", line: "7号线", start: "光谷广场", end: "杨家湾", phone: "13800004444", dept: "巡检业务部 / 人工巡检组" },
    { name: "陈杰", line: "11号线", start: "光谷五路", end: "左岭", phone: "13800005555", dept: "数据中心 / 分析研判组" },
  ];

  global.WH_DEVICE_BIND_ROWS = [
    { id: 1, user: "张强", phone: "13800001111", dept: "巡检业务部 / 人工巡检组", line: "8号线", section: "洪山路-小洪山", imei: "864502070112345", model: "WH-TRK01", devName: "定位手环-01", bound: true, lastOnline: "2026-07-23 18:42", bindTime: "2026-06-01 09:30", useStart: "2026-06-01 10:00", useEnd: "2026-06-10 18:00" },
    { id: 2, user: "李磊", phone: "13800002222", dept: "巡检业务部 / 无人机巡检组", line: "8号线", section: "徐家棚-徐东", imei: "864502070112346", model: "WH-TRK01", devName: "定位手环-02", bound: true, lastOnline: "2026-07-23 17:05", bindTime: "2026-06-01 09:35", useStart: "2026-06-01 10:05", useEnd: "" },
    { id: 3, user: "", phone: "", dept: "", line: "", section: "", imei: "869523054478812", model: "BD-900", devName: "安全帽定位器-01", bound: false, lastOnline: "2026-07-22 08:30", bindTime: "", useStart: "", useEnd: "" },
    { id: 4, user: "赵敏", phone: "13800004444", dept: "巡检业务部 / 人工巡检组", line: "7号线", section: "光谷广场-杨家湾", imei: "869523054478813", model: "BD-900", devName: "安全帽定位器-02", bound: true, lastOnline: "2026-07-23 19:11", bindTime: "2026-06-02 14:10", useStart: "2026-06-02 14:30", useEnd: "2026-06-20 17:40" },
    { id: 5, user: "", phone: "", dept: "", line: "", section: "", imei: "862104059977331", model: "GT-06N", devName: "车载定位器-01", bound: false, lastOnline: "2026-07-20 11:56", bindTime: "", useStart: "", useEnd: "" },
  ];
})(window);
