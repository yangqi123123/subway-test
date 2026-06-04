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
