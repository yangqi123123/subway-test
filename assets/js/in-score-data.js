/**
 * 巡查打分 — 演示数据（与后台 wb/in-score.html 一致）
 */
(function (global) {
  global.WH_SCORE_DEFAULT_DATE_START = "2026-03-09T10:44";
  global.WH_SCORE_DEFAULT_DATE_END = "2026-04-08T10:44";

  global.WH_SCORE_LIST_ROWS = [
    { id: 1, account: "yanghaotian", user: "杨昊天", line: "5号线", device: "Y18807", date: "2026-04-13 00:00:00", minScore: 50 },
    { id: 2, account: "yanghaotian", user: "杨昊天", line: "5号线", device: "Y18807", date: "2026-04-12 00:00:00", minScore: 56 },
    { id: 3, account: "zhangwei", user: "张伟", line: "2号线", device: "Y15502", date: "2026-04-11 00:00:00", minScore: 61 },
    { id: 4, account: "liulei", user: "刘磊", line: "7号线", device: "Y17328", date: "2026-04-10 00:00:00", minScore: 58 },
    { id: 5, account: "wangjun", user: "王军", line: "2号线", device: "Y12216", date: "2026-04-09 00:00:00", minScore: 65 },
    { id: 6, account: "zhaomin", user: "赵敏", line: "11号线", device: "Y19831", date: "2026-04-08 00:00:00", minScore: 63 },
    { id: 7, account: "chenkai", user: "陈凯", line: "5号线", device: "Y18810", date: "2026-04-07 00:00:00", minScore: 67 },
  ];

  global.WH_SCORE_DETAIL_MAP = {
    Y18807: [
      { device: "Y18807", user: "杨昊天", section: "红霞-黄家湖", line: "5号线", inside: 26.75, outside: 10.75, date: "2026-04-13 00:00:00", score: 70 },
      { device: "Y18807", user: "杨昊天", section: "中医药大学-白沙六路", line: "5号线", inside: 57.67, outside: 19.25, date: "2026-04-13 00:00:00", score: 60 },
      { device: "Y18807", user: "杨昊天", section: "黄家湖-中医药大学", line: "5号线", inside: 8.08, outside: 0, date: "2026-04-13 00:00:00", score: 50 },
    ],
    Y15502: [
      { device: "Y15502", user: "张伟", section: "常青花园-长港路", line: "2号线", inside: 31.2, outside: 5.4, date: "2026-04-11 00:00:00", score: 82 },
      { device: "Y15502", user: "张伟", section: "长港路-汉口火车站", line: "2号线", inside: 24.5, outside: 7.2, date: "2026-04-11 00:00:00", score: 61 },
    ],
    Y17328: [
      { device: "Y17328", user: "刘磊", section: "园博园-园博大道", line: "7号线", inside: 22.14, outside: 11.3, date: "2026-04-10 00:00:00", score: 58 },
    ],
    Y12216: [
      { device: "Y12216", user: "王军", section: "金银潭-常青车辆段", line: "2号线", inside: 39.5, outside: 4.8, date: "2026-04-09 00:00:00", score: 65 },
    ],
    Y19831: [
      { device: "Y19831", user: "赵敏", section: "光谷五路-左岭", line: "11号线", inside: 41.9, outside: 8.6, date: "2026-04-08 00:00:00", score: 63 },
    ],
    Y18810: [
      { device: "Y18810", user: "陈凯", section: "白沙六路-青菱", line: "5号线", inside: 44.12, outside: 6.35, date: "2026-04-07 00:00:00", score: 67 },
    ],
  };
})(typeof window !== "undefined" ? window : global);
