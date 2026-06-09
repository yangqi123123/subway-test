(function (global) {
  "use strict";

  var TYPE_VIDEO = "视频";
  var TYPE_PHOTO = "照片";
  var SUB_ALL = "全部";
  var SUB_THERMAL = "热成像";
  var SUB_NATURAL = "自然光";

  var DEMO_VIDEO =
    "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4";

  var PHOTOS = [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
  ];

  var ITEMS = [
    { id: "r1", mediaTitle: "20260508-1徐东-自然光-01", planName: "20260508-1徐东", mediaType: TYPE_VIDEO, subType: SUB_NATURAL, duration: "00:12:36", sizeBytes: 3124754432, uploadMethod: "自动回传", uploadedAt: "2026/05/08 11:08:34", projectName: "新建商业文化设施项目", patrolSource: "无人机", aiDetect: true },
    { id: "r2", mediaTitle: "20260508-1徐东-热成像-01", planName: "20260508-1徐东", mediaType: TYPE_VIDEO, subType: SUB_THERMAL, duration: "00:08:02", sizeBytes: 595345408, uploadMethod: "自动回传", uploadedAt: "2026/05/08 11:15:20", projectName: "新建商业文化设施项目", patrolSource: "无人机", aiDetect: true },
    { id: "r3", mediaTitle: "20260508-1中南医院-自然光-01", planName: "20260508-1中南医院", mediaType: TYPE_VIDEO, subType: SUB_NATURAL, duration: "00:15:48", sizeBytes: 2789212160, uploadMethod: "自动回传", uploadedAt: "2026/05/08 14:22:11", projectName: "洪山路至小洪山商业公寓项目", patrolSource: "无人机", aiDetect: true },
    { id: "r4", mediaTitle: "20260508-1中南医院-照片-01", planName: "20260508-1中南医院", mediaType: TYPE_PHOTO, subType: SUB_NATURAL, duration: "", sizeBytes: 4200000, uploadMethod: "自动回传", uploadedAt: "2026/05/08 14:25:03", projectName: "洪山路至小洪山商业公寓项目", patrolSource: "无人机", aiDetect: false },
    { id: "r5", mediaTitle: "20260507-2宏图大道-热成像-01", planName: "20260507-2宏图大道", mediaType: TYPE_VIDEO, subType: SUB_THERMAL, duration: "00:06:15", sizeBytes: 412876800, uploadMethod: "自动回传", uploadedAt: "2026/05/07 16:40:55", projectName: "三金潭车辆段上盖物业综合开发项目", patrolSource: "无人机", aiDetect: true },
    { id: "r6", mediaTitle: "20260507-2宏图大道-热成像-02", planName: "20260507-2宏图大道", mediaType: TYPE_PHOTO, subType: SUB_THERMAL, duration: "", sizeBytes: 2800000, uploadMethod: "自动回传", uploadedAt: "2026/05/07 16:42:18", projectName: "三金潭车辆段上盖物业综合开发项目", patrolSource: "无人机", aiDetect: false },
    { id: "r7", mediaTitle: "RG-122820-现场-01", planName: "RG-20260305-122820", mediaType: TYPE_PHOTO, subType: SUB_NATURAL, duration: "", sizeBytes: 1900000, uploadMethod: "人工上传", uploadedAt: "2026/03/05 12:19:08", projectName: "新建商业文化设施项目", patrolSource: "人工", aiDetect: false },
    { id: "r8", mediaTitle: "RG-122820-现场-02", planName: "RG-20260305-122820", mediaType: TYPE_PHOTO, subType: SUB_NATURAL, duration: "", sizeBytes: 2100000, uploadMethod: "人工上传", uploadedAt: "2026/03/05 12:20:41", projectName: "新建商业文化设施项目", patrolSource: "人工", aiDetect: false },
    { id: "r9", mediaTitle: "RG-122704-视频-01", planName: "RG-20260304-122704", mediaType: TYPE_VIDEO, subType: SUB_NATURAL, duration: "00:03:22", sizeBytes: 156237824, uploadMethod: "人工上传", uploadedAt: "2026/03/04 17:06:12", projectName: "三金潭车辆段上盖物业综合开发项目", patrolSource: "人工", aiDetect: false },
    { id: "r10", mediaTitle: "20260506-3水果湖-自然光-01", planName: "20260506-3水果湖", mediaType: TYPE_VIDEO, subType: SUB_NATURAL, duration: "00:18:04", sizeBytes: 3456106496, uploadMethod: "自动回传", uploadedAt: "2026/05/06 09:12:00", projectName: "新建商业文化设施项目", patrolSource: "无人机", aiDetect: true },
    { id: "r11", mediaTitle: "20260506-3水果湖-照片-01", planName: "20260506-3水果湖", mediaType: TYPE_PHOTO, subType: SUB_NATURAL, duration: "", sizeBytes: 3500000, uploadMethod: "自动回传", uploadedAt: "2026/05/06 09:18:44", projectName: "新建商业文化设施项目", patrolSource: "无人机", aiDetect: true },
    { id: "r12", mediaTitle: "RG-122819-现场-01", planName: "RG-20260305-122819", mediaType: TYPE_PHOTO, subType: SUB_NATURAL, duration: "", sizeBytes: 1650000, uploadMethod: "人工上传", uploadedAt: "2026/03/05 12:19:55", projectName: "洪山路至小洪山商业公寓项目", patrolSource: "人工", aiDetect: false },
    { id: "r13", mediaTitle: "20260505-1夜班-热成像-01", planName: "20260505-1夜班巡查", mediaType: TYPE_VIDEO, subType: SUB_THERMAL, duration: "00:09:41", sizeBytes: 892456960, uploadMethod: "自动回传", uploadedAt: "2026/05/05 23:48:30", projectName: "洪山路至小洪山商业公寓项目", patrolSource: "无人机", aiDetect: true },
    { id: "r14", mediaTitle: "20260505-1夜班-热成像-02", planName: "20260505-1夜班巡查", mediaType: TYPE_PHOTO, subType: SUB_THERMAL, duration: "", sizeBytes: 2400000, uploadMethod: "自动回传", uploadedAt: "2026/05/05 23:50:02", projectName: "洪山路至小洪山商业公寓项目", patrolSource: "无人机", aiDetect: false },
    { id: "r15", mediaTitle: "RG-122704-现场-01", planName: "RG-20260304-122704", mediaType: TYPE_PHOTO, subType: SUB_NATURAL, duration: "", sizeBytes: 1800000, uploadMethod: "人工上传", uploadedAt: "2026/03/04 17:05:33", projectName: "三金潭车辆段上盖物业综合开发项目", patrolSource: "人工", aiDetect: false },
  ];

  var COORD_POOL = [
    [114.35582, 30.561615],
    [114.3328, 30.5365],
    [114.3085, 30.6012],
    [114.3145, 30.5868],
    [114.292, 30.572],
    [114.325, 30.575],
    [114.3168, 30.5301],
    [114.3378, 30.5512],
  ];

  ITEMS.forEach(function (item, index) {
    var c = COORD_POOL[index % COORD_POOL.length];
    item.lng = item.lng != null ? item.lng : c[0];
    item.lat = item.lat != null ? item.lat : c[1];
    item.mediaUrl = item.mediaUrl || PHOTOS[index % PHOTOS.length];
    if (item.mediaType === TYPE_VIDEO) {
      item.videoUrl = item.videoUrl || DEMO_VIDEO;
      item.posterUrl = item.posterUrl || item.mediaUrl;
    }
  });

  var groupMode = "plan";
  var selectedTreeKey = "all";
  var expandedIds = Object.create(null);
  var selectedIds = Object.create(null);
  var pageState = { page: 1, pageSize: 12 };
  var toastTimer = null;
  var detailItem = null;
  var detailGallery = [];
  var detailGalleryIndex = 0;
  var mediaView = { scale: 1, rotate: 0 };

  function $(id) {
    return document.getElementById(id);
  }

  function esc(s) {
    return String(s == null ? "" : s).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  function formatSize(bytes) {
    if (!bytes) return "—";
    if (bytes >= 1024 * 1024 * 1024) return (bytes / (1024 * 1024 * 1024)).toFixed(2) + "GB";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(2) + "MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + "KB";
    return bytes + "B";
  }

  function parseDate(s) {
    if (!s) return null;
    var t = String(s).replace(/\//g, "-").replace(" ", "T");
    var d = new Date(t);
    return isNaN(d.getTime()) ? null : d;
  }

  function thumbFor(item, index) {
    return item.mediaUrl || item.posterUrl || PHOTOS[index % PHOTOS.length];
  }

  function formatCoord(item) {
    if (item == null || item.lng == null || item.lat == null) return "—";
    return Number(item.lng).toFixed(6) + ", " + Number(item.lat).toFixed(6);
  }

  function findItemById(id) {
    return ITEMS.find(function (x) {
      return x.id === id;
    });
  }

  function uniqueValues(list, field) {
    var seen = Object.create(null);
    var out = [];
    list.forEach(function (item) {
      var v = item[field];
      if (!v || seen[v]) return;
      seen[v] = true;
      out.push(v);
    });
    return out.sort();
  }

  function getFilters() {
    return {
      planName: ($("f-plan-name") && $("f-plan-name").value.trim()) || "",
      mediaType: ($("f-media-type") && $("f-media-type").value) || "全部",
      subType: ($("f-sub-type") && $("f-sub-type").value) || SUB_ALL,
      dateStart: ($("f-date-start") && $("f-date-start").value) || "",
      dateEnd: ($("f-date-end") && $("f-date-end").value) || "",
      project: ($("f-project") && $("f-project").value) || "全部",
    };
  }

  function filterItems() {
    var f = getFilters();
    var start = f.dateStart ? new Date(f.dateStart + "T00:00:00") : null;
    var end = f.dateEnd ? new Date(f.dateEnd + "T23:59:59") : null;
    return ITEMS.filter(function (item) {
      if (f.planName && item.planName.indexOf(f.planName) < 0) return false;
      if (f.mediaType !== "全部" && item.mediaType !== f.mediaType) return false;
      if (f.subType !== SUB_ALL && item.subType !== f.subType) return false;
      if (f.project !== "全部" && item.projectName !== f.project) return false;
      if (start || end) {
        var d = parseDate(item.uploadedAt);
        if (!d) return false;
        if (start && d < start) return false;
        if (end && d > end) return false;
      }
      return true;
    });
  }

  function matchTreeKey(item, key) {
    if (!key || key === "all") return true;
    var parts = key.split("|");
    var planPart = "";
    var projectPart = "";
    parts.forEach(function (p) {
      if (p.indexOf("plan:") === 0) planPart = p.slice(5);
      if (p.indexOf("project:") === 0) projectPart = p.slice(8);
    });
    if (projectPart && item.projectName !== projectPart) return false;
    if (planPart && item.planName !== planPart) return false;
    if (groupMode === "plan" && key.indexOf("plan:") === 0 && !planPart) {
      planPart = key.slice(5);
      if (item.planName !== planPart) return false;
    }
    return true;
  }

  function filterByTree(list) {
    return list.filter(function (item) {
      return matchTreeKey(item, selectedTreeKey);
    });
  }

  function buildPlanTree(list) {
    var nodes = uniqueValues(list, "planName").map(function (name) {
      var count = list.filter(function (x) {
        return x.planName === name;
      }).length;
      return { key: "plan:" + name, label: name, count: count, children: [] };
    });
    return nodes;
  }

  function buildProjectTree(list) {
    return uniqueValues(list, "projectName").map(function (proj) {
      var total = list.filter(function (x) {
        return x.projectName === proj;
      }).length;
      return { key: "project:" + proj, label: proj, count: total, children: [] };
    });
  }

  function renderTree() {
    var root = $("pr-tree-root");
    var titleEl = $("pr-tree-title");
    if (!root) return;
    var list = filterItems();
    var nodes = groupMode === "project" ? buildProjectTree(list) : buildPlanTree(list);

    if (titleEl) titleEl.textContent = groupMode === "project" ? "项目分组" : "计划分组";

    function rowHtml(node, depth) {
      var hasChild = node.children && node.children.length > 0;
      var expanded = !!expandedIds[node.key];
      var selected = selectedTreeKey === node.key;
      var indent = 12 + depth * 14;
      var html =
        '<button type="button" class="lib-tree-row' +
        (selected ? " is-selected" : "") +
        '" data-tree-key="' +
        esc(node.key) +
        '" style="padding-left:' +
        indent +
        'px">' +
        (hasChild
          ? '<span class="lib-tree-toggle" data-action="toggle-tree" data-tree-key="' +
            esc(node.key) +
            '" role="presentation">' +
            (expanded ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-right"></i>') +
            "</span>"
          : '<span class="lib-tree-toggle lib-tree-toggle--spacer"></span>') +
        '<span class="lib-tree-label" title="' +
        esc(node.label) +
        '">' +
        esc(node.label) +
        "</span>" +
        '<span class="lib-tree-count">' +
        node.count +
        "</span></button>";
      if (hasChild && expanded) {
        html +=
          '<div class="lib-tree-children">' +
          node.children
            .map(function (ch) {
              return rowHtml(ch, depth + 1);
            })
            .join("") +
          "</div>";
      }
      return '<div class="lib-tree-node">' + html + "</div>";
    }

    var allCount = list.length;
    var allSelected = selectedTreeKey === "all";
    var html =
      '<button type="button" class="lib-tree-row' +
      (allSelected ? " is-selected" : "") +
      '" data-tree-key="all">' +
      '<span class="lib-tree-toggle lib-tree-toggle--spacer"></span>' +
      '<span class="lib-tree-label">全部成果</span>' +
      '<span class="lib-tree-count">' +
      allCount +
      "</span></button>";

    nodes.forEach(function (n) {
      html += rowHtml(n, 0);
    });
    root.innerHTML = html;
  }

  function cardBadge(item) {
    if (groupMode === "plan" || item.patrolSource === "无人机") {
      return '<span class="pr-card__badge">AI检测</span>';
    }
    return '<span class="pr-card__badge pr-card__badge--manual">人工</span>';
  }

  function cardHtml(item, index) {
    var isVideo = item.mediaType === TYPE_VIDEO;
    var checked = !!selectedIds[item.id];
    var badge = cardBadge(item);
    return (
      '<article class="pr-card' +
      (checked ? " is-selected" : "") +
      '" data-id="' +
      esc(item.id) +
      '">' +
      '<div class="pr-card__thumb' +
      (isVideo ? " pr-card__thumb--video" : "") +
      '">' +
      '<img src="' +
      esc(thumbFor(item, index)) +
      '" alt="" loading="lazy" />' +
      badge +
      (isVideo ? '<span class="pr-card__play"><i class="fa-solid fa-play"></i></span>' : "") +
      '<label class="pr-card__check"><input type="checkbox" data-select-id="' +
      esc(item.id) +
      '"' +
      (checked ? " checked" : "") +
      " /></label>" +
      "</div>" +
      '<div class="pr-card__body">' +
      '<div class="pr-card__row pr-card__row--name"><span>计划名称</span><b class="pr-card__name" title="' +
      esc(item.planName) +
      '">' +
      esc(item.planName) +
      "</b></div>" +
      '<div class="pr-card__row"><span>经纬坐标</span><b class="pr-card__coord" title="' +
      esc(formatCoord(item)) +
      '">' +
      esc(formatCoord(item)) +
      "</b></div>" +
      '<div class="pr-card__row"><span>上传时间</span><b>' +
      esc(item.uploadedAt) +
      "</b></div>" +
      '<div class="pr-card__row"><span>关联项目</span><b title="' +
      esc(item.projectName) +
      '">' +
      esc(item.projectName) +
      "</b></div>" +
      '<div class="pr-card__actions">' +
      '<button type="button" class="pr-card__view-btn" data-action="view-result" data-id="' +
      esc(item.id) +
      '"><i class="fa-regular fa-eye" aria-hidden="true"></i>查看</button>' +
      "</div>" +
      "</div></article>"
    );
  }

  function updateStats(filtered) {
    var totalEl = $("stat-total");
    var filteredEl = $("stat-filtered");
    var plansEl = $("stat-plans");
    var projectsEl = $("stat-projects");
    if (totalEl) totalEl.textContent = String(ITEMS.length);
    if (filteredEl) filteredEl.textContent = String(filtered.length);
    if (plansEl) plansEl.textContent = String(uniqueValues(ITEMS, "planName").length);
    if (projectsEl) projectsEl.textContent = String(uniqueValues(ITEMS, "projectName").length);
  }

  function updateSelectAllState(visibleIds) {
    var allEl = $("pr-select-all");
    if (!allEl) return;
    if (!visibleIds.length) {
      allEl.checked = false;
      allEl.indeterminate = false;
      return;
    }
    var selected = visibleIds.filter(function (id) {
      return selectedIds[id];
    });
    allEl.checked = selected.length === visibleIds.length;
    allEl.indeterminate = selected.length > 0 && selected.length < visibleIds.length;
  }

  function resetPage() {
    pageState.page = 1;
  }

  function renderCards() {
    var filtered = filterItems();
    var list = filterByTree(filtered);
    var grid = $("pr-card-grid");
    var pagerEl = $("pr-card-pager");
    var countEl = $("pr-result-count");
    if (countEl) countEl.textContent = String(list.length);
    updateStats(filtered);
    if (!grid) return;
    if (!list.length) {
      grid.innerHTML = '<div class="pr-empty"><i class="fa-regular fa-folder-open mr-2"></i>暂无符合条件的巡检成果</div>';
      if (pagerEl) pagerEl.innerHTML = "";
      updateSelectAllState([]);
      return;
    }

    var pager = global.WHCardGridPager;
    var meta = pager ? pager.paginate(list, pageState) : { rows: list, total: list.length, page: 1, pages: 1 };
    grid.innerHTML = meta.rows
      .map(function (item, i) {
        return cardHtml(item, (pageState.page - 1) * pageState.pageSize + i);
      })
      .join("");

    if (pager && pagerEl) {
      pager.mountPager(pagerEl, meta, pageState, renderCards, { pageSizes: [12, 20, 40] });
    }

    updateSelectAllState(
      meta.rows.map(function (x) {
        return x.id;
      })
    );
  }

  function render() {
    renderTree();
    renderCards();
  }

  function toast(msg) {
    var el = $("pr-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.add("is-show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.classList.remove("is-show");
    }, 2600);
  }

  function selectedList() {
    return ITEMS.filter(function (x) {
      return selectedIds[x.id];
    });
  }

  function setGroupMode(mode) {
    groupMode = mode;
    selectedTreeKey = "all";
    expandedIds = Object.create(null);
    resetPage();
    document.querySelectorAll(".pr-tree-mode-btn").forEach(function (btn) {
      btn.classList.toggle("is-active", btn.getAttribute("data-action") === (mode === "project" ? "group-project" : "group-plan"));
    });
    render();
  }

  function resetFilters() {
    if ($("f-plan-name")) $("f-plan-name").value = "";
    if ($("f-media-type")) $("f-media-type").value = "全部";
    if ($("f-sub-type")) $("f-sub-type").value = SUB_ALL;
    if ($("f-date-start")) $("f-date-start").value = "";
    if ($("f-date-end")) $("f-date-end").value = "";
    if ($("f-project")) $("f-project").value = "全部";
    selectedTreeKey = "all";
    resetPage();
    render();
  }

  function bindQuickLinks() {
    document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
      var canon = anchor.getAttribute("data-quick-href") || "";
      var file = canon.split("/").pop();
      var routes = global.WH_PAGE_ROUTES || {};
      var resolved = routes[file] || canon;
      if (global.whPageHref) anchor.setAttribute("href", global.whPageHref(resolved));
    });
  }

  function applyMediaTransform() {
    var inner = $("pr-detail-media-inner");
    if (!inner) return;
    inner.style.transform = "scale(" + mediaView.scale + ") rotate(" + mediaView.rotate + "deg)";
  }

  function resetMediaView() {
    mediaView.scale = 1;
    mediaView.rotate = 0;
    applyMediaTransform();
  }

  function renderDetailInfo(item) {
    var grid = $("pr-detail-info-grid");
    if (!grid || !item) return;
    var isVideo = item.mediaType === TYPE_VIDEO;
    var rows = [
      ["计划名称", item.planName],
      ["成果类型", item.mediaType],
      ["成果子类型", item.subType],
      ["视频时长", isVideo ? item.duration || "—" : "—"],
      ["文件大小", formatSize(item.sizeBytes)],
      ["上传方式", item.uploadMethod],
      ["上传时间", item.uploadedAt],
      ["关联项目", item.projectName],
      ["经纬坐标", formatCoord(item)],
    ];
    grid.innerHTML = rows
      .map(function (pair) {
        var valClass = pair[0] === "经纬坐标" ? " pr-detail-info__val--coord" : "";
        return (
          '<div class="pr-detail-info__row">' +
          '<span class="pr-detail-info__key">' +
          esc(pair[0]) +
          "</span>" +
          '<span class="pr-detail-info__val' +
          valClass +
          '" title="' +
          esc(pair[1]) +
          '">' +
          esc(pair[1]) +
          "</span></div>"
        );
      })
      .join("");
  }

  function getPhotoGallery(item) {
    if (!item || item.mediaType !== TYPE_PHOTO) return [];
    return ITEMS.filter(function (x) {
      return x.mediaType === TYPE_PHOTO && x.planName === item.planName;
    }).map(function (x, i) {
      return {
        id: x.id,
        url: x.mediaUrl || thumbFor(x, i),
        title: x.mediaTitle || x.planName || "照片" + (i + 1),
      };
    });
  }

  function renderDetailThumbs() {
    var wrap = $("pr-detail-thumbs");
    if (!wrap) return;
    if (!detailItem || detailItem.mediaType !== TYPE_PHOTO || detailGallery.length <= 1) {
      wrap.classList.add("hidden");
      wrap.innerHTML = "";
      return;
    }
    wrap.classList.remove("hidden");
    wrap.innerHTML = detailGallery
      .map(function (ph, i) {
        return (
          '<button type="button" class="pr-detail-thumb' +
          (i === detailGalleryIndex ? " is-active" : "") +
          '" data-action="detail-thumb" data-thumb-index="' +
          i +
          '" title="' +
          esc(ph.title) +
          '"><img src="' +
          esc(ph.url) +
          '" alt="" loading="lazy" /></button>'
        );
      })
      .join("");
  }

  function setDetailPhotoIndex(index) {
    if (!detailGallery.length) return;
    detailGalleryIndex = Math.max(0, Math.min(index, detailGallery.length - 1));
    var ph = detailGallery[detailGalleryIndex];
    var img = $("pr-detail-img");
    if (img && ph) {
      img.src = ph.url;
      img.alt = ph.title;
    }
    resetMediaView();
    renderDetailThumbs();
  }

  function loadDetailMedia(item) {
    var img = $("pr-detail-img");
    var video = $("pr-detail-video");
    if (!img || !video) return;
    var isVideo = item.mediaType === TYPE_VIDEO;
    resetMediaView();
    if (isVideo) {
      img.classList.add("hidden");
      video.classList.remove("hidden");
      video.poster = item.posterUrl || item.mediaUrl || "";
      video.src = item.videoUrl || DEMO_VIDEO;
      video.load();
    } else {
      video.classList.add("hidden");
      video.pause();
      video.removeAttribute("src");
      img.classList.remove("hidden");
      var ph = detailGallery[detailGalleryIndex] || { url: item.mediaUrl || thumbFor(item, 0), title: item.mediaTitle };
      img.src = ph.url;
      img.alt = ph.title || item.mediaTitle || item.planName || "巡检成果";
    }
    renderDetailThumbs();
  }

  function openDetail(item) {
    if (!item) return;
    detailItem = item;
    detailGallery = getPhotoGallery(item);
    detailGalleryIndex = detailGallery.findIndex(function (p) {
      return p.id === item.id;
    });
    if (detailGalleryIndex < 0) detailGalleryIndex = 0;
    var mask = $("pr-detail-mask");
    var titleEl = $("pr-detail-title");
    if (titleEl) {
      titleEl.textContent =
        item.mediaType === TYPE_VIDEO ? "巡检视频详情" : item.subType === SUB_THERMAL ? "拍照图片详情" : "巡检照片详情";
    }
    renderDetailInfo(item);
    loadDetailMedia(item);
    if (mask) {
      mask.classList.add("is-open");
      mask.setAttribute("aria-hidden", "false");
    }
  }

  function closeDetail() {
    var mask = $("pr-detail-mask");
    var video = $("pr-detail-video");
    if (video) {
      video.pause();
    }
    detailItem = null;
    detailGallery = [];
    detailGalleryIndex = 0;
    if (mask) {
      mask.classList.remove("is-open");
      mask.setAttribute("aria-hidden", "true");
    }
    closeLightbox();
  }

  function closeLightbox() {
    var lb = $("pr-lightbox-mask");
    if (lb) {
      lb.classList.remove("is-open");
      lb.setAttribute("aria-hidden", "true");
    }
  }

  function openLightbox() {
    if (!detailItem) return;
    var lb = $("pr-lightbox-mask");
    var img = $("pr-lightbox-img");
    if (!lb || !img || detailItem.mediaType === TYPE_VIDEO) {
      toast("视频请使用播放器全屏查看（原型演示）");
      return;
    }
    img.src = (detailGallery[detailGalleryIndex] && detailGallery[detailGalleryIndex].url) || detailItem.mediaUrl || thumbFor(detailItem, 0);
    lb.classList.add("is-open");
    lb.setAttribute("aria-hidden", "false");
  }

  function downloadDetailMedia() {
    if (!detailItem) return;
    var isVideo = detailItem.mediaType === TYPE_VIDEO;
    var url =
      isVideo
        ? detailItem.videoUrl || DEMO_VIDEO
        : (detailGallery[detailGalleryIndex] && detailGallery[detailGalleryIndex].url) ||
          detailItem.mediaUrl ||
          thumbFor(detailItem, 0);
    var name = (detailItem.mediaTitle || detailItem.planName || "patrol-result").replace(/[\\/:*?"<>|]/g, "_");
    var a = document.createElement("a");
    a.href = url;
    a.download = name + (isVideo ? ".mp4" : ".jpg");
    a.rel = "noopener";
    a.target = "_blank";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    toast("已开始下载（原型演示）");
  }

  function handleMediaAction(act) {
    if (!detailItem) return;
    if (act === "media-zoom-in") {
      mediaView.scale = Math.min(mediaView.scale + 0.2, 3);
      applyMediaTransform();
    }
    if (act === "media-zoom-out") {
      mediaView.scale = Math.max(mediaView.scale - 0.2, 0.4);
      applyMediaTransform();
    }
    if (act === "media-rotate-left") {
      mediaView.rotate -= 90;
      applyMediaTransform();
    }
    if (act === "media-rotate-right") {
      mediaView.rotate += 90;
      applyMediaTransform();
    }
    if (act === "media-reset") resetMediaView();
    if (act === "media-view-large") openLightbox();
    if (act === "media-download") downloadDetailMedia();
  }

  function init() {
    bindQuickLinks();
    render();

    document.addEventListener("click", function (e) {
      var t = e.target;
      if (!(t instanceof Element)) return;

      var toggleBtn = t.closest("[data-action='toggle-tree']");
      if (toggleBtn) {
        e.preventDefault();
        e.stopPropagation();
        var tk = toggleBtn.getAttribute("data-tree-key");
        if (tk) {
          expandedIds[tk] = !expandedIds[tk];
          renderTree();
        }
        return;
      }

      var treeRow = t.closest("[data-tree-key]");
      if (treeRow && treeRow.classList.contains("lib-tree-row")) {
        var key = treeRow.getAttribute("data-tree-key");
        if (key) {
          selectedTreeKey = key;
          resetPage();
          render();
        }
        return;
      }

      var viewBtn = t.closest("[data-action='view-result']");
      if (viewBtn) {
        e.preventDefault();
        var vid = viewBtn.getAttribute("data-id");
        var item = findItemById(vid);
        if (item) openDetail(item);
        return;
      }

      var action = t.closest("[data-action]");
      if (!action) return;
      var act = action.getAttribute("data-action");
      if (act === "close-detail") {
        closeDetail();
        return;
      }
      if (act === "close-lightbox") {
        closeLightbox();
        return;
      }
      if (act && act.indexOf("media-") === 0) {
        handleMediaAction(act);
        return;
      }
      if (act === "detail-thumb") {
        var thumbIndex = Number(action.getAttribute("data-thumb-index"));
        if (!Number.isNaN(thumbIndex)) setDetailPhotoIndex(thumbIndex);
        return;
      }
      if (act === "search") {
        resetPage();
        render();
      }
      if (act === "reset") resetFilters();
      if (act === "group-plan") setGroupMode("plan");
      if (act === "group-project") setGroupMode("project");
      if (act === "batch-download") {
        var picked = selectedList();
        if (!picked.length) {
          toast("请先勾选需要下载的巡检成果");
          return;
        }
        toast("已开始批量下载 " + picked.length + " 项（原型演示）");
      }
      if (act === "export-list") toast("导出列表功能（原型演示）");
    });

    var detailMask = $("pr-detail-mask");
    if (detailMask) {
      detailMask.addEventListener("click", function (e) {
        if (e.target === detailMask) closeDetail();
      });
    }
    var lightboxMask = $("pr-lightbox-mask");
    if (lightboxMask) {
      lightboxMask.addEventListener("click", function (e) {
        if (e.target === lightboxMask) closeLightbox();
      });
    }
    document.addEventListener("keydown", function (e) {
      if (e.key !== "Escape") return;
      if ($("pr-lightbox-mask") && $("pr-lightbox-mask").classList.contains("is-open")) {
        closeLightbox();
        return;
      }
      if ($("pr-detail-mask") && $("pr-detail-mask").classList.contains("is-open")) {
        closeDetail();
      }
    });

    var grid = $("pr-card-grid");
    if (grid) {
      grid.addEventListener("change", function (e) {
        var target = e.target;
        if (!(target instanceof HTMLInputElement) || target.type !== "checkbox") return;
        var id = target.getAttribute("data-select-id");
        if (!id) return;
        if (target.checked) selectedIds[id] = true;
        else delete selectedIds[id];
        var card = target.closest(".pr-card");
        if (card) card.classList.toggle("is-selected", target.checked);
        var filtered = filterByTree(filterItems());
        var pager = global.WHCardGridPager;
        var meta = pager ? pager.paginate(filtered, pageState) : { rows: filtered };
        updateSelectAllState(
          meta.rows.map(function (x) {
            return x.id;
          })
        );
      });
    }

    var allEl = $("pr-select-all");
    if (allEl) {
      allEl.addEventListener("change", function () {
        var filtered = filterByTree(filterItems());
        var pager = global.WHCardGridPager;
        var meta = pager ? pager.paginate(filtered, pageState) : { rows: filtered };
        meta.rows.forEach(function (item) {
          if (allEl.checked) selectedIds[item.id] = true;
          else delete selectedIds[item.id];
        });
        renderCards();
      });
    }
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  global.WHPatrolResults = { items: ITEMS, render: render };
})(window);
