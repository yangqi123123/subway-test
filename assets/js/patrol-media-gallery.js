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
      '<div id="patrol-media-popover" class="patrol-media-popover" role="dialog" aria-modal="false">' +
        '<div class="patrol-media-popover__head">' +
        '<div><h4 class="patrol-media-popover__title" id="patrol-media-popover-title"></h4>' +
        '<span class="patrol-media-popover__sub" id="patrol-media-popover-sub"></span></div>' +
        '<button type="button" class="wh-modal-close patrol-media-popover__close" id="patrol-media-popover-close" aria-label="关闭">×</button>' +
        "</div>" +
        '<div class="patrol-media-popover__body" id="patrol-media-popover-body"></div>' +
        "</div>"
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
        if (popoverEl.contains(e.target)) return;
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

  function renderStripHtml(kind, projectName, previewCount) {
    var media = getProjectMedia(projectName);
    var list = kind === "video" ? media.videos || [] : media.photos || [];
    var n = Math.min(list.length, Math.max(1, previewCount || 2));
    if (!list.length) {
      return '<span class="text-[10px] text-slate-500">—</span>';
    }
    return list
      .slice(0, n)
      .map(function (item) {
        if (kind === "video") return videoThumb(item);
        var url = typeof item === "string" ? item : item.url;
        return photoThumb(url);
      })
      .join("");
  }

  function renderCell(options) {
    ensureStyles();
    options = options || {};
    var kind = options.kind === "video" ? "video" : "photo";
    var projectName = options.projectName || "";
    var rowKey = options.rowKey || projectName;
    var stripHtml = renderStripHtml(kind, projectName, options.previewCount);
    var icon = kind === "video" ? "fa-clapperboard" : "fa-images";
    var label = kind === "video" ? "视频" : "照片";

    return (
      '<div class="patrol-media-cell">' +
      '<div class="patrol-media-strip">' +
      stripHtml +
      "</div>" +
      '<button type="button" class="patrol-media-expand" data-patrol-media-expand data-media-kind="' +
      kind +
      '" data-row-key="' +
      esc(rowKey) +
      '" data-project-name="' +
      esc(projectName) +
      '" title="查看全部' +
      label +
      '">' +
      '<i class="fa-solid ' +
      icon +
      '"></i></button></div>'
    );
  }

  function renderPopoverGrid(kind, projectName) {
    var media = getProjectMedia(projectName);
    var list = kind === "video" ? media.videos || [] : media.photos || [];
    if (!list.length) {
      return '<div class="patrol-media-popover__empty">暂无' + (kind === "video" ? "视频" : "照片") + "</div>";
    }
    return (
      '<div class="patrol-media-popover__grid">' +
      list
        .map(function (item, index) {
          if (kind === "video") {
            var v = typeof item === "string" ? { url: item, poster: item, title: "视频 " + (index + 1) } : item;
            return (
              '<button type="button" class="patrol-media-popover__item patrol-media-popover__item--video" data-patrol-media-item data-media-kind="video" data-media-index="' +
              index +
              '" data-project-name="' +
              esc(projectName) +
              '"><img src="' +
              esc(normalizePhotoUrl(v.poster || v.url, 320)) +
              '" alt="" /></button>'
            );
          }
          var url = typeof item === "string" ? item : item.url;
          return (
            '<button type="button" class="patrol-media-popover__item" data-patrol-media-item data-media-kind="photo" data-media-index="' +
            index +
            '" data-project-name="' +
            esc(projectName) +
            '"><img src="' +
            esc(normalizePhotoUrl(url, 320)) +
            '" alt="" /></button>'
          );
        })
        .join("") +
      "</div>"
    );
  }

  function positionPopover(anchor) {
    if (!popoverEl || !anchor) return;
    var rect = anchor.getBoundingClientRect();
    var popRect = popoverEl.getBoundingClientRect();
    var w = popRect.width || 400;
    var h = popRect.height || 280;
    var left = rect.right - w;
    var top = rect.bottom + 8;
    if (left < 12) left = 12;
    if (left + w > window.innerWidth - 12) left = window.innerWidth - w - 12;
    if (top + h > window.innerHeight - 12) top = rect.top - h - 8;
    if (top < 12) top = 12;
    popoverEl.style.left = left + "px";
    popoverEl.style.top = top + "px";
  }

  function openPopover(anchor, kind, projectName) {
    ensureStyles();
    ensurePopover();
    openAnchor = anchor;
    var label = kind === "video" ? "巡查视频" : "巡查照片";
    document.getElementById("patrol-media-popover-title").textContent = label;
    document.getElementById("patrol-media-popover-sub").textContent = projectName || "";
    document.getElementById("patrol-media-popover-body").innerHTML = renderPopoverGrid(kind, projectName);
    popoverEl.classList.add("is-open");
    positionPopover(anchor);
    requestAnimationFrame(function () {
      positionPopover(anchor);
    });
  }

  function closePopover() {
    if (popoverEl) popoverEl.classList.remove("is-open");
    openAnchor = null;
  }

  function openItemPreview(kind, projectName, index) {
    var media = getProjectMedia(projectName);
    var list = kind === "video" ? media.videos || [] : media.photos || [];
    var item = list[index];
    if (!item) return;
    if (global.WHFlightReportModal && global.WHFlightReportModal.openMediaPreview) {
      if (kind === "video") {
        var v = typeof item === "string" ? { url: item, poster: item, title: "巡查视频" } : item;
        WHFlightReportModal.openMediaPreview({
          kind: "video",
          url: v.url,
          poster: v.poster,
          title: v.title || "巡查视频",
        });
      } else {
        var url = typeof item === "string" ? item : item.url;
        WHFlightReportModal.openMediaPreview({
          kind: "image",
          url: normalizePhotoUrl(url, 1200),
          title: "巡查照片",
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
        if (popoverEl && popoverEl.classList.contains("is-open") && openAnchor === expandBtn) {
          closePopover();
        } else {
          openPopover(expandBtn, kind, projectName);
        }
        return;
      }
      var itemBtn = e.target.closest("[data-patrol-media-item]");
      if (itemBtn) {
        e.preventDefault();
        openItemPreview(
          itemBtn.getAttribute("data-media-kind"),
          itemBtn.getAttribute("data-project-name"),
          Number(itemBtn.getAttribute("data-media-index"))
        );
      }
    });
  }

  initBuiltinMediaRegistry();

  global.WHPatrolMediaGallery = {
    renderCell: renderCell,
    registerProjectMedia: registerProjectMedia,
    getProjectMedia: getProjectMedia,
    getSystemPhotoList: getSystemPhotoList,
    openPopover: openPopover,
    closePopover: closePopover,
    bind: bind,
  };
})(window);
