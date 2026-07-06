/**
 * 资源监控 — 演示数据（与 wb/am-ops-metro.html 一致）
 */
(function (global) {
  global.WH_OPS_METRO_DEFAULT_FILTER = {
    start: "2026-05-12T00:00",
    end: "2026-05-19T23:59",
  };

  global.WH_OPS_METRO_SERVER_DATA = {
    metro: {
      metrics: {
        cpu: "3%",
        cores: "8",
        mem: "16.88%",
        disk: "9%",
        memFree: "26.1 GiB / 31.4 GiB",
        diskFree: "1.0T / 45.0T",
      },
      store: {
        photoCount: "182",
        photoSize: "3.82 TB",
        projectCount: "96",
        projectSize: "1.26 TB",
        libCount: "268",
        libSize: "860 GB",
      },
      trends: {
        cpu: [4.2, 3.8, 5.1, 4.5, 3.2, 2.9, 3.5, 4.0, 3.0, 3.3, 2.8, 3.0],
        mem: [17.2, 16.9, 17.5, 16.7, 16.4, 16.6, 17.0, 16.8, 16.5, 16.3, 16.9, 16.88],
        disk: [9.1, 9.1, 9.0, 9.0, 9.0, 8.9, 8.9, 9.0, 9.0, 9.0, 9.0, 9.0],
      },
      chart: {
        total: "45.0 TB",
        used: "5.94 TB",
        free: "39.06 TB",
        pct: 13.2,
        pctDetail: "5.94 TB / 45.0 TB",
        bars: { photo: "64%", project: "21%", lib: "15%" },
        labels: { photo: "3.82 TB", project: "1.26 TB", lib: "860 GB" },
      },
      nodes: {
        core: ["ok", "在线"],
        app: ["ok", "在线"],
        db: ["ok", "在线"],
        gateway: ["warn", "在线"],
        backup: ["warn", "告警"],
        storage: ["ok", "在线"],
      },
    },
    fulltime: {
      metrics: {
        cpu: "12%",
        cores: "16",
        mem: "42.5%",
        disk: "18%",
        memFree: "18.2 GiB / 31.4 GiB",
        diskFree: "2.1T / 12.0T",
      },
      store: {
        photoCount: "256",
        photoSize: "4.12 TB",
        projectCount: "112",
        projectSize: "1.58 TB",
        libCount: "302",
        libSize: "920 GB",
      },
      trends: {
        cpu: [13.5, 12.8, 14.2, 11.9, 12.5, 11.5, 12.0, 13.1, 11.8, 12.4, 11.9, 12.0],
        mem: [43.1, 42.8, 43.5, 42.2, 42.0, 42.6, 42.9, 42.4, 42.1, 43.0, 42.7, 42.5],
        disk: [18.2, 18.1, 18.1, 18.0, 17.9, 18.0, 18.0, 18.1, 18.0, 17.9, 17.9, 18.0],
      },
      chart: {
        total: "12.0 TB",
        used: "6.62 TB",
        free: "5.38 TB",
        pct: 55.2,
        pctDetail: "6.62 TB / 12.0 TB",
        bars: { photo: "62%", project: "24%", lib: "14%" },
        labels: { photo: "4.12 TB", project: "1.58 TB", lib: "920 GB" },
      },
      nodes: {
        core: ["ok", "在线"],
        app: ["warn", "告警"],
        db: ["ok", "在线"],
        gateway: ["ok", "在线"],
        backup: ["ok", "在线"],
        storage: ["ok", "在线"],
      },
    },
    uav: {
      metrics: {
        cpu: "8%",
        cores: "12",
        mem: "58.2%",
        disk: "34%",
        memFree: "13.1 GiB / 31.4 GiB",
        diskFree: "6.6T / 10.0T",
      },
      store: {
        photoCount: "98",
        photoSize: "1.82 TB",
        projectCount: "64",
        projectSize: "860 GB",
        libCount: "188",
        libSize: "520 GB",
      },
      trends: {
        cpu: [8.5, 8.1, 9.0, 7.8, 8.2, 7.5, 8.0, 8.3, 7.6, 8.1, 7.9, 8.0],
        mem: [58.5, 58.0, 59.0, 57.5, 58.2, 57.8, 58.5, 58.0, 57.6, 58.4, 58.1, 58.2],
        disk: [34.2, 34.1, 34.1, 34.0, 33.9, 34.0, 34.0, 34.1, 34.0, 33.9, 33.9, 34.0],
      },
      chart: {
        total: "10.0 TB",
        used: "3.18 TB",
        free: "6.82 TB",
        pct: 31.8,
        pctDetail: "3.18 TB / 10.0 TB",
        bars: { photo: "57%", project: "27%", lib: "16%" },
        labels: { photo: "1.82 TB", project: "860 GB", lib: "520 GB" },
      },
      nodes: {
        core: ["ok", "在线"],
        app: ["ok", "在线"],
        db: ["warn", "告警"],
        gateway: ["ok", "在线"],
        backup: ["ok", "在线"],
        storage: ["ok", "在线"],
      },
    },
  };
})(window);
