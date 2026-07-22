/**
 * 巡线任务频率设置 — 数据与字典
 */
(function (global) {
  "use strict";

  /** 项目类型（与项目管理一致） */
  var PROJECT_TYPES = ["重点项目", "一般项目", "临时项目"];

  /** 生成周期（周一 ~ 周日） */
  var WEEKDAYS = ["周一", "周二", "周三", "周四", "周五", "周六", "周日"];

  /** 线路 → 站点字典（浅埋段起/终站点联动下拉，原型简化数据） */
  var LINE_STATIONS = {
    "2号线": ["金潭路", "宏图大道", "中南路", "宝通寺", "珞雄路", "华中科技大学", "光谷广场", "杨家湾", "积玉桥", "螃蟹岬"],
    "3号线": ["后湖大道", "兴业路"],
    "4号线": ["蔡甸广场", "凤凰路", "青鱼嘴", "中南路", "岳家嘴", "铁机路", "复兴路", "首义路"],
    "5号线": ["复兴路", "宝通寺"],
    "6号线": ["江城大道", "老关村"],
    "7号线": ["松槐路", "天阳大道", "板桥", "野芷湖", "徐家棚", "湖北大学", "洪山路", "小洪山", "巨龙大道", "汤云海路"],
    "8号线": ["水果湖", "洪山路", "小洪山", "街道口", "马房山", "徐家棚", "徐东"],
    "19号线": ["花山车辆段"],
  };

  /**
   * 频率规则
   * scope: "all" 全线范围 | "shallow" 浅埋段范围
   * weekdays: ["周一", ...]
   * 规则：重点项目每天巡线（周一~周日），一般项目和临时项目每周 3 次（周一/三/五）
   */
  var WH_TASK_FREQ_RULES = [
    {
      id: "R-001",
      scope: "all",
      types: ["重点项目"],
      weekdays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      enabled: true,
      remark: "全线重点项目每日巡查",
      lastGen: "2026-07-20 08:00",
    },
    {
      id: "R-002",
      scope: "all",
      types: ["一般项目", "临时项目"],
      weekdays: ["周一", "周三", "周五"],
      enabled: true,
      remark: "全线一般/临时项目每周三巡",
      lastGen: "",
    },
    {
      id: "R-003",
      scope: "shallow",
      types: ["重点项目"],
      weekdays: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
      enabled: true,
      remark: "浅埋段重点项目每日巡查",
      lastGen: "",
    },
    {
      id: "R-004",
      scope: "shallow",
      types: ["一般项目", "临时项目"],
      weekdays: ["周一", "周三", "周五"],
      enabled: true,
      remark: "浅埋段一般/临时项目每周三巡",
      lastGen: "",
    },
  ];

  /** 浅埋段范围设置：起始站点 - 终点站点区间内的项目视为浅埋段项目 */
  var WH_SHALLOW_SECTIONS = [
    {
      id: "S-001",
      line: "8号线",
      from: "水果湖",
      to: "小洪山",
      remark: "水果湖至小洪山区间为穿江浅埋段，需加密巡查",
    },
  ];

  /** 规则备注默认文案 */
  var DEFAULT_RULE_REMARK = "按项目类型配置巡线任务生成周期，周期到达自动生成任务并下发至移动端「今日任务」";

  global.WHTaskFreqData = {
    PROJECT_TYPES: PROJECT_TYPES,
    WEEKDAYS: WEEKDAYS,
    LINE_STATIONS: LINE_STATIONS,
    rules: WH_TASK_FREQ_RULES,
    shallowSections: WH_SHALLOW_SECTIONS,
    DEFAULT_RULE_REMARK: DEFAULT_RULE_REMARK,
  };
})(typeof window !== "undefined" ? window : this);
