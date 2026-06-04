/**
 * 人员轨迹 — 演示数据（与后台 wb/in-track-person.html 一致）
 */
(function (global) {
  global.WH_TRACK_PERSON_ROWS = [
    {
      id: 1,
      personName: "张鹏",
      deviceCode: "Y18807",
      dept: "巡检一部",
      line: "2号线",
      latestTime: "2026-05-14 09:26:18",
      status: "在线",
      points: [
        { id: "LOC-248447", time: "2026-05-14 08:38:15", lat: 30.5828, lng: 114.2982, name: "积玉桥站北侧" },
        { id: "LOC-248451", time: "2026-05-14 08:56:42", lat: 30.5863, lng: 114.3069, name: "临江大道巡查点" },
        { id: "LOC-248459", time: "2026-05-14 09:08:11", lat: 30.5901, lng: 114.3142, name: "中山路转角" },
        { id: "LOC-248468", time: "2026-05-14 09:26:18", lat: 30.5948, lng: 114.3214, name: "武昌江滩入口" },
      ],
    },
    {
      id: 2,
      personName: "李威",
      deviceCode: "Y18812",
      dept: "巡检二部",
      line: "5号线",
      latestTime: "2026-05-14 10:42:09",
      status: "在线",
      points: [
        { id: "LOC-248602", time: "2026-05-14 09:52:07", lat: 30.5685, lng: 114.3293, name: "复兴路站巡查口" },
        { id: "LOC-248615", time: "2026-05-14 10:03:48", lat: 30.5718, lng: 114.3361, name: "首义路交叉口" },
        { id: "LOC-248624", time: "2026-05-14 10:18:30", lat: 30.5756, lng: 114.3428, name: "武珞路地下通道" },
        { id: "LOC-248633", time: "2026-05-14 10:42:09", lat: 30.5803, lng: 114.3492, name: "宝通寺站东广场" },
      ],
    },
    {
      id: 3,
      personName: "周敏",
      deviceCode: "Y18819",
      dept: "应急中心",
      line: "8号线",
      latestTime: "2026-05-14 14:08:52",
      status: "离线",
      points: [
        { id: "LOC-248741", time: "2026-05-14 13:12:22", lat: 30.6062, lng: 114.3348, name: "徐东大街西口" },
        { id: "LOC-248752", time: "2026-05-14 13:31:45", lat: 30.6108, lng: 114.3405, name: "岳家嘴站A口" },
        { id: "LOC-248763", time: "2026-05-14 13:52:17", lat: 30.6154, lng: 114.3468, name: "中北路高架下" },
        { id: "LOC-248788", time: "2026-05-14 14:08:52", lat: 30.6201, lng: 114.3521, name: "团结大道巡查点" },
      ],
    },
  ];
})(typeof window !== "undefined" ? window : global);
