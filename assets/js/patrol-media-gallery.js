/**
 * 巡查记录列表 — 照片/视频缩略条 + 展开小窗（与专家工具/飞行报告共用系统现场照片）
 */
(function (global) {
  var popoverEl = null;
  var openAnchor = null;

  /** 系统原型统一现场巡查照片（与专家复核、告警、飞行报告一致） */
  var SYSTEM_PATROL_PHOTOS = [
    "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1513828583688-c52646db42da?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1599707254554-027aeb4deacd?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541888946425-d81bb19240f5?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1541976590-713941681591?auto=format&fit=crop&w=800&q=80",
  ];

  var SYSTEM_PATROL_VIDEOS = [
    {
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      poster: "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=800&q=80",
      title: "巡查视频 1",
    },
    {
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      poster: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=800&q=80",
      title: "巡查视频 2",
    },
    {
      url: "https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4",
      poster: "https://images.unsplash.com/photo-1504307651254-35680f356dfd?auto=format&fit=crop&w=800&q=80",
      title: "巡查视频 3",
    },
  ];

  var mediaByProject = Object.create(null);

  function esc(value) {
    return String(value == null ? "" : value).replace(/[&<>"']/g, function (ch) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[ch];
    });
  }

  /** 一行多项目时拆成列表，供每张素材单独展示一个项目名称 */
  function resolveProjectNameList(projectName, projectNames) {
    if (Array.isArray(projectNames) && projectNames.length) {
      return projectNames
        .map(function (n) {
          return String(n || "").trim();
        })
        .filter(Boolean);
    }
    var s = String(projectName || "").trim();
    if (!s) return ["—"];
    if (/[、,，]/.test(s)) {
      var parts = s
        .split(/[、,，]+/)
        .map(function (p) {
          return p.trim();
        })
        .filter(Boolean);
      if (parts.length) return parts;
    }
    return [s];
  }

  function projectLabelAt(names, index) {
    if (!names.length) return "—";
    return names[index % names.length];
  }

  function hashStr(str) {
    var h = 0;
    var s = String(str || "");
    for (var i = 0; i < s.length; i++) h = (h << 5) - h + s.charCodeAt(i);
    return h | 0;
  }

  function normalizePhotoUrl(url, width) {
    var u = String(url || "").trim();
    if (!u) return u;
    if (u.indexOf("images.unsplash.com") === -1) return u;
    width = width || 800;
    if (/[?&]w=\d+/.test(u)) u = u.replace(/w=\d+/, "w=" + width);
    else u += (u.indexOf("?") > -1 ? "&" : "?") + "w=" + width;
    if (!/[?&]q=\d+/.test(u)) u += "&q=80";
    if (!/fit=crop/.test(u)) u += "&fit=crop";
    return u;
  }

  function getSystemPhotoList() {
    if (global.WuhanExpertReviewModal && global.WuhanExpertReviewModal.DEFAULT_PHOTOS && global.WuhanExpertReviewModal.DEFAULT_PHOTOS.length) {
      return global.WuhanExpertReviewModal.DEFAULT_PHOTOS.map(function (u) {
        return normalizePhotoUrl(u, 800);
      });
    }
    return SYSTEM_PATROL_PHOTOS.slice();
  }

  function rotateList(list, offset) {
    if (!list.length) return [];
    var n = ((offset % list.length) + list.length) % list.length;
    return list.slice(n).concat(list.slice(0, n));
  }

  function resolveAsset(rel) {
    if (typeof global.whAsset === "function") return global.whAsset(rel);
    if (global.WHMetroMenu && typeof global.WHMetroMenu.asset === "function") {
      return global.WHMetroMenu.asset(rel);
    }
    var path =
      typeof location !== "undefined" && location.pathname
        ? String(location.pathname).replace(/\\/g, "/")
        : "";
    if (/\/web(\/|$)/i.test(path) || /\/app(\/|$)/i.test(path)) {
      return "../" + String(rel).replace(/^\//, "");
    }
    return rel;
  }

  function ensureStyles() {
    var href = resolveAsset("assets/css/patrol-media-gallery.css");
    var existing = document.getElementById("patrol-media-gallery-css");
    if (existing) {
      if (existing.getAttribute("href") !== href) existing.setAttribute("href", href);
      return;
    }
    var link = document.createElement("link");
    link.id = "patrol-media-gallery-css";
    link.rel = "stylesheet";
    link.href = href;
    document.head.appendChild(link);
  }

  function ensurePopover() {
    if (popoverEl) return popoverEl;
    document.body.insertAdjacentHTML(
      "beforeend",
      '<div id="patrol-media-popover" class="patrol-media-popover" role="dialog" aria-modal="true" aria-hidden="true">' +
        '<div class="patrol-media-popover__panel" role="document">' +
        '<div class="patrol-media-popover__head">' +
        '<div><h4 class="patrol-media-popover__title" id="patrol-media-popover-title"></h4>' +
        '<span class="patrol-media-popover__sub" id="patrol-media-popover-sub"></span></div>' +
        '<button type="button" class="wh-modal-close patrol-media-popover__close" id="patrol-media-popover-close" aria-label="关闭">×</button>' +
        "</div>" +
        '<div class="patrol-media-popover__body" id="patrol-media-popover-body"></div>' +
        "</div></div>"
    );
    popoverEl = document.getElementById("patrol-media-popover");
    document.getElementById("patrol-media-popover-close").addEventListener("click", closePopover);
    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape") closePopover();
    });
    document.addEventListener(
      "click",
      function (e) {
        if (!popoverEl || !popoverEl.classList.contains("is-open")) return;
        var panel = popoverEl.querySelector(".patrol-media-popover__panel");
        if (panel && panel.contains(e.target)) return;
        if (openAnchor && (openAnchor === e.target || openAnchor.contains(e.target))) return;
        closePopover();
      },
      true
    );
    return popoverEl;
  }

  function getProjectMedia(projectName) {
    var key = String(projectName || "").trim();
    if (mediaByProject[key]) return mediaByProject[key];
    var photos = getSystemPhotoList();
    var offset = Math.abs(hashStr(key)) % (photos.length || 1);
    return {
      photos: rotateList(photos, offset),
      videos: SYSTEM_PATROL_VIDEOS.slice(),
    };
  }

  function registerProjectMedia(projectName, data) {
    if (!projectName) return;
    var key = String(projectName).trim();
    var photos = (data.photos || []).map(function (item) {
      return typeof item === "string" ? normalizePhotoUrl(item, 800) : item;
    });
    mediaByProject[key] = {
      photos: photos,
      videos: data.videos || SYSTEM_PATROL_VIDEOS.slice(),
    };
  }

  function initBuiltinMediaRegistry() {
    var photos = getSystemPhotoList();
    var keys = [
      "项目1、项目2、项目3",
      "青山站保护区巡查",
      "金融街六中北项目",
      "新建商业文化设施项目",
      "洪山路至小洪山商业公寓项目",
      "三金潭车辆段上盖物业综合开发项目",
      "常青花园-长港路 / 常青花园",
      "常青花园-长港路 / 长港路",
      "白沙六路-光霞 / 上行",
      "盘龙城-宏图大道 / 下行",
      "天河停车场 / 场段",
    ];
    keys.forEach(function (key, i) {
      registerProjectMedia(key, {
        photos: rotateList(photos, i % photos.length),
        videos: SYSTEM_PATROL_VIDEOS,
      });
    });
    ["项目1", "项目2", "项目3"].forEach(function (key, i) {
      registerProjectMedia(key, {
        photos: rotateList(photos, i % photos.length),
        videos: SYSTEM_PATROL_VIDEOS,
      });
    });
  }

  function photoThumb(url) {
    return (
      '<img class="patrol-media-thumb" src="' +
      esc(normalizePhotoUrl(url, 96)) +
      '" alt="" loading="lazy" decoding="async" />'
    );
  }

  function videoThumb(item) {
    var v = typeof item === "string" ? { poster: item, url: item } : item;
    var poster = normalizePhotoUrl(v.poster || v.url, 96);
    return (
      '<span class="patrol-video-thumb"><img src="' +
      esc(poster) +
      '" alt="" loading="lazy" decoding="async" /></span>'
    );
  }

  function renderStripHtml(kind, projectName, previewCount, clickable, projectNames) {
    var media = getProjectMedia(projectName);
    var list = kind === "video" ? media.videos || [] : media.photos || [];
    var n = Math.min(list.length, Math.max(1, previewCount || 2));
    if (!list.length) {
      return '<span class="text-[10px] text-slate-500">—</span>';
    }
    var names = resolveProjectNameList(projectName, projectNames);
    return list
      .slice(0, n)
      .map(function (item, index) {
        var inner;
        if (kind === "video") inner = videoThumb(item);
        else {
          var url = typeof item === "string" ? item : item.url;
          inner = photoThumb(url);
        }
        if (!clickable) return inner;
        var itemLabel = projectLabelAt(names, index);
        return (
          '<button type="button" class="patrol-media-strip__item" data-patrol-media-item data-media-kind="' +
          kind +
          '" data-media-index="' +
          index +
          '" data-project-name="' +
          esc(projectName) +
          '" data-project-label="' +
          esc(itemLabel) +
          '">' +
          inner +
          "</button>"
        );
      })
      .join("");
  }

  function renderDetailGrid(options) {
    ensureStyles();
    options = options || {};
    var kind = options.kind === "video" ? "video" : "photo";
    var projectName = options.projectName || "";
    return (
      '<div class="patrol-media-cell patrol-media-cell--direct patrol-media-cell--detail-grid">' +
      renderPopoverGrid(kind, projectName, options.projectNames) +
      "</div>"
    );
  }

  function renderCell(options) {
    ensureStyles();
    options = options || {};
    var kind = options.kind === "video" ? "video" : "photo";
    var projectName = options.projectName || "";
    var rowKey = options.rowKey || projectName;
    var nameList = resolveProjectNameList(projectName, options.projectNames);
    var directPreview = !!options.directPreview;
    var stripHtml = renderStripHtml(kind, projectName, options.previewCount, directPreview, nameList);
    var icon = kind === "video" ? "fa-clapperboard" : "fa-images";
    var label = kind === "video" ? "视频" : "照片";
    var namesAttr =
      nameList.length > 1
        ? ' data-project-names="' + esc(JSON.stringify(nameList)) + '"'
        : "";
    var expandBtn = directPreview
      ? ""
      : '<button type="button" class="patrol-media-expand" data-patrol-media-expand data-media-kind="' +
        kind +
        '" data-row-key="' +
        esc(rowKey) +
        '" data-project-name="' +
        esc(projectName) +
        '"' +
        namesAttr +
        ' title="查看全部' +
        label +
        '">' +
        '<i class="fa-solid ' +
        icon +
        '"></i></button>';
    var cellClass = directPreview ? " patrol-media-cell--direct" : "";

    return (
      '<div class="patrol-media-cell' +
      cellClass +
      '">' +
      '<div class="patrol-media-strip">' +
      stripHtml +
      "</div>" +
      expandBtn +
      "</div>"
    );
  }

  function renderPopoverGrid(kind, projectName, projectNames) {
    var media = getProjectMedia(projectName);
    var list = kind === "video" ? media.videos || [] : media.photos || [];
    if (!list.length) {
      return '<div class="patrol-media-popover__empty">暂无' + (kind === "video" ? "视频" : "照片") + "</div>";
    }
    var names = resolveProjectNameList(projectName, projectNames);
    return (
      '<div class="patrol-media-popover__grid">' +
      list
        .map(function (item, index) {
          var itemLabel = projectLabelAt(names, index);
          var cardHead =
            '<div class="patrol-media-popover__card-head" title="' +
            esc(itemLabel) +
            '">' +
            esc(itemLabel) +
            "</div>";
          if (kind === "video") {
            var v = typeof item === "string" ? { url: item, poster: item, title: "视频 " + (index + 1) } : item;
            return (
              '<article class="patrol-media-popover__card">' +
              cardHead +
              '<button type="button" class="patrol-media-popover__item patrol-media-popover__item--video" data-patrol-media-item data-media-kind="video" data-media-index="' +
              index +
              '" data-project-name="' +
              esc(projectName) +
              '" data-project-label="' +
              esc(itemLabel) +
              '"><img src="' +
              esc(normalizePhotoUrl(v.poster || v.url, 480)) +
              '" alt="" /></button></article>'
            );
          }
          var url = typeof item === "string" ? item : item.url;
          return (
            '<article class="patrol-media-popover__card">' +
            cardHead +
            '<button type="button" class="patrol-media-popover__item" data-patrol-media-item data-media-kind="photo" data-media-index="' +
            index +
            '" data-project-name="' +
            esc(projectName) +
            '" data-project-label="' +
            esc(itemLabel) +
            '"><img src="' +
            esc(normalizePhotoUrl(url, 480)) +
            '" alt="" /></button></article>'
          );
        })
        .join("") +
      "</div>"
    );
  }

  function parseProjectNamesAttr(raw) {
    if (!raw) return null;
    try {
      var parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : null;
    } catch (e) {
      return null;
    }
  }

  function openPopover(anchor, kind, projectName, projectNames) {
    ensureStyles();
    ensurePopover();
    openAnchor = anchor;
    var label = kind === "video" ? "巡查视频" : "巡查照片";
    var media = getProjectMedia(projectName);
    var list = kind === "video" ? media.videos || [] : media.photos || [];
    document.getElementById("patrol-media-popover-title").textContent = label;
    document.getElementById("patrol-media-popover-sub").textContent = "共 " + list.length + " 项";
    document.getElementById("patrol-media-popover-body").innerHTML = renderPopoverGrid(
      kind,
      projectName,
      projectNames
    );
    popoverEl.classList.add("is-open");
    popoverEl.setAttribute("aria-hidden", "false");
    document.body.style.overflow = "hidden";
  }

  function closePopover() {
    if (popoverEl) {
      popoverEl.classList.remove("is-open");
      popoverEl.setAttribute("aria-hidden", "true");
    }
    document.body.style.overflow = "";
    openAnchor = null;
  }

  function isMiniAppPage() {
    return !!(global.document.body && global.document.body.classList.contains("miniapp-page"));
  }

  function openItemPreview(kind, projectName, index, projectLabel) {
    var media = getProjectMedia(projectName);
    var list = kind === "video" ? media.videos || [] : media.photos || [];
    var item = list[index];
    if (!item) return;
    var displayName = projectLabel || projectName || "";
    if (isMiniAppPage() && global.WHProjectMobile && global.WHProjectMobile.openFilePreview) {
      if (kind === "video") {
        var videoItem = typeof item === "string" ? { url: item, poster: item, title: "巡查视频" } : item;
        WHProjectMobile.openFilePreview({
          url: videoItem.url,
          title: displayName || videoItem.title || "巡查视频",
          name: displayName || videoItem.title || "巡查视频",
          kind: "video",
          mimeType: "video/mp4",
        });
      } else {
        var photoUrl = typeof item === "string" ? item : item.url;
        WHProjectMobile.openFilePreview({
          url: normalizePhotoUrl(photoUrl, 1200),
          title: displayName || "巡查照片",
          name: displayName || "巡查照片",
          kind: "image",
          mimeType: "image/jpeg",
        });
      }
      return;
    }
    if (global.WHFlightReportModal && global.WHFlightReportModal.openMediaPreview) {
      if (kind === "video") {
        var v = typeof item === "string" ? { url: item, poster: item, title: "巡查视频" } : item;
        WHFlightReportModal.openMediaPreview({
          kind: "video",
          url: v.url,
          poster: v.poster,
          title: displayName || v.title || "巡查视频",
        });
      } else {
        var url = typeof item === "string" ? item : item.url;
        WHFlightReportModal.openMediaPreview({
          kind: "image",
          url: normalizePhotoUrl(url, 1200),
          title: displayName || "巡查照片",
        });
      }
      return;
    }
    if (global.WHProjectMobile && global.WHProjectMobile.openFilePreview) {
      if (kind === "video") {
        var fallbackVideo = typeof item === "string" ? { url: item, poster: item, title: "巡查视频" } : item;
        WHProjectMobile.openFilePreview({
          url: fallbackVideo.url,
          title: displayName || fallbackVideo.title || "巡查视频",
          name: displayName || fallbackVideo.title || "巡查视频",
          kind: "video",
          mimeType: "video/mp4",
        });
      } else {
        var fallbackPhotoUrl = typeof item === "string" ? item : item.url;
        WHProjectMobile.openFilePreview({
          url: normalizePhotoUrl(fallbackPhotoUrl, 1200),
          title: displayName || "巡查照片",
          name: displayName || "巡查照片",
          kind: "image",
          mimeType: "image/jpeg",
        });
      }
      return;
    }
    window.open(typeof item === "string" ? item : kind === "video" ? item.url : item.url, "_blank");
  }

  function bind(root) {
    root = root || document;
    root.addEventListener("click", function (e) {
      var expandBtn = e.target.closest("[data-patrol-media-expand]");
      if (expandBtn) {
        e.preventDefault();
        e.stopPropagation();
        var kind = expandBtn.getAttribute("data-media-kind") || "photo";
        var projectName = expandBtn.getAttribute("data-project-name") || "";
        var projectNames = parseProjectNamesAttr(expandBtn.getAttribute("data-project-names"));
        if (popoverEl && popoverEl.classList.contains("is-open") && openAnchor === expandBtn) {
          closePopover();
        } else {
          openPopover(expandBtn, kind, projectName, projectNames);
        }
        return;
      }
      var itemBtn = e.target.closest("[data-patrol-media-item]");
      if (itemBtn) {
        e.preventDefault();
        openItemPreview(
          itemBtn.getAttribute("data-media-kind"),
          itemBtn.getAttribute("data-project-name"),
          Number(itemBtn.getAttribute("data-media-index")),
          itemBtn.getAttribute("data-project-label")
        );
      }
    });
  }

  initBuiltinMediaRegistry();

  global.WHPatrolMediaGallery = {
    renderCell: renderCell,
    renderDetailGrid: renderDetailGrid,
    registerProjectMedia: registerProjectMedia,
    getProjectMedia: getProjectMedia,
    getSystemPhotoList: getSystemPhotoList,
    openPopover: openPopover,
    closePopover: closePopover,
    bind: bind,
  };
})(window);
