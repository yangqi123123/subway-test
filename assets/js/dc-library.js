(function () {
  "use strict";

  var ALLOWED_EXT = ["jpg", "jpeg", "png", "mp4", "pdf", "docx", "xlsx"];
  var MAX_MP4 = 300 * 1024 * 1024;
  var MAX_OTHER = 50 * 1024 * 1024;
  var COVER_EXT = ["jpg", "jpeg", "png"];

  var categories = [
    { id: 1, name: "保护区技术资料", parentId: null, sort: 1 },
    { id: 2, name: "7号线", parentId: 1, sort: 1 },
    { id: 3, name: "无人机航测", parentId: null, sort: 2 },
    { id: 4, name: "原始影像", parentId: 3, sort: 1 },
    { id: 5, name: "项目交底资料", parentId: null, sort: 3 },
  ];

  var materials = [
    {
      id: 101,
      categoryId: 2,
      title: "7号线保护区技术方案",
      desc: "存放保护区技术方案、专家意见及汇报材料，供审批与归档查阅。",
      coverUrl: "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80",
      updatedAt: "2026-05-07 16:20",
      updater: "张三",
      files: [
        { id: 1001, name: "保护区技术方案.pdf", ext: "PDF", size: 2048000 },
        { id: 1002, name: "现场踏勘照片.jpg", ext: "JPG", size: 890000 },
      ],
    },
    {
      id: 102,
      categoryId: 4,
      title: "白沙六路航拍影像",
      desc: "无人机原始航拍视频与关键截图，用于保护区巡查复核。",
      coverUrl: "https://images.unsplash.com/photo-1473968512647-3e447244af8f?auto=format&fit=crop&w=600&q=80",
      updatedAt: "2026-05-06 11:02",
      updater: "李四",
      files: [{ id: 1003, name: "白沙六路航拍.mp4", ext: "MP4", size: 125000000 }],
    },
    {
      id: 103,
      categoryId: 5,
      title: "项目交底纪要",
      desc: "项目交底、会议纪要及签收材料汇总。",
      coverUrl: "",
      updatedAt: "2026-05-05 15:36",
      updater: "王军",
      files: [{ id: 1004, name: "交底纪要.docx", ext: "DOCX", size: 512000 }],
    },
    {
      id: 104,
      categoryId: 2,
      title: "巡查现场照片集",
      desc: "人工巡查、无人机巡查现场图片归档。",
      coverUrl: "https://images.unsplash.com/photo-1465447142348-e9952c393450?auto=format&fit=crop&w=600&q=80",
      updatedAt: "2026-05-04 09:22",
      updater: "赵敏",
      files: [
        { id: 1005, name: "常青花园巡查1.jpg", ext: "JPG", size: 420000 },
        { id: 1006, name: "统计表.xlsx", ext: "XLSX", size: 180000 },
      ],
    },
  ];

  var selectedCategoryId = null;
  var expandedIds = { 1: true, 3: true };
  var pageState = { page: 1, pageSize: 12 };
  var editingCategoryId = null;
  var addingCategoryParentId = null;
  var editingMaterialId = null;
  var pendingFiles = [];
  var pendingCoverFile = null;
  var coverPreviewUrl = null;

  var $ = function (id) {
    return document.getElementById(id);
  };

  function toast(msg) {
    var el = $("lib-toast");
    if (!el) return;
    el.textContent = msg;
    el.classList.remove("hidden");
    clearTimeout(toast._t);
    toast._t = setTimeout(function () {
      el.classList.add("hidden");
    }, 2200);
  }

  function extOf(name) {
    var p = (name || "").split(".");
    return p.length > 1 ? p.pop().toLowerCase() : "";
  }

  function formatSize(bytes) {
    if (!bytes) return "—";
    if (bytes >= 1024 * 1024) return (bytes / (1024 * 1024)).toFixed(1) + " MB";
    if (bytes >= 1024) return (bytes / 1024).toFixed(1) + " KB";
    return bytes + " B";
  }

  function nowStr() {
    var d = new Date();
    return (
      d.getFullYear() +
      "-" +
      String(d.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(d.getDate()).padStart(2, "0") +
      " " +
      String(d.getHours()).padStart(2, "0") +
      ":" +
      String(d.getMinutes()).padStart(2, "0")
    );
  }

  function getCategory(id) {
    return categories.find(function (c) {
      return c.id === id;
    });
  }

  function getChildren(parentId) {
    return categories
      .filter(function (c) {
        return c.parentId === parentId;
      })
      .sort(function (a, b) {
        return (a.sort || 0) - (b.sort || 0);
      });
  }

  function getDescendantIds(id) {
    var ids = [id];
    getChildren(id).forEach(function (c) {
      ids = ids.concat(getDescendantIds(c.id));
    });
    return ids;
  }

  function categoryPath(id) {
    var names = [];
    var cur = getCategory(id);
    while (cur) {
      names.unshift(cur.name);
      cur = cur.parentId ? getCategory(cur.parentId) : null;
    }
    return names.join(" / ");
  }

  function validateUploadFile(file) {
    var ext = extOf(file.name);
    if (ALLOWED_EXT.indexOf(ext) < 0) {
      return "不支持该文件格式，仅支持 JPG、PNG、MP4、PDF、DOCX、XLSX";
    }
    if (ext === "mp4" && file.size > MAX_MP4) return "MP4 文件不能超过 300MB";
    if (ext !== "mp4" && file.size > MAX_OTHER) return "文件不能超过 50MB";
    return null;
  }

  function buildCategoryOptions(selectedId, parentIdFilter) {
    var opts = [];
    function walk(parentId, depth) {
      getChildren(parentId).forEach(function (c) {
        if (parentIdFilter != null && c.id === parentIdFilter) return;
        opts.push({
          id: c.id,
          label: (depth ? "　".repeat(depth) : "") + c.name,
        });
        walk(c.id, depth + 1);
      });
    }
    walk(null, 0);
    return opts
      .map(function (o) {
        return (
          '<option value="' +
          o.id +
          '"' +
          (o.id === selectedId ? " selected" : "") +
          ">" +
          o.label +
          "</option>"
        );
      })
      .join("");
  }

  function renderTree() {
    var root = $("lib-tree-root");
    if (!root) return;

    function nodeHtml(cat, depth) {
      var children = getChildren(cat.id);
      var hasChild = children.length > 0;
      var expanded = expandedIds[cat.id];
      var selected = selectedCategoryId === cat.id;
      var indent = 12 + depth * 14;
      var row =
        '<div class="lib-tree-row' +
        (selected ? " is-selected" : "") +
        '" data-id="' +
        cat.id +
        '" style="padding-left:' +
        indent +
        'px">' +
        (hasChild
          ? '<button type="button" class="lib-tree-toggle" data-action="toggle-cat" data-id="' +
            cat.id +
            '" aria-label="展开">' +
            (expanded ? '<i class="fa-solid fa-chevron-down"></i>' : '<i class="fa-solid fa-chevron-right"></i>') +
            "</button>"
          : '<span class="lib-tree-toggle lib-tree-toggle--spacer"></span>') +
        '<span class="lib-tree-label">' +
        cat.name +
        "</span>" +
        '<span class="lib-tree-actions">' +
        '<button type="button" class="lib-tree-btn" data-action="add-child-cat" data-id="' +
        cat.id +
        '" title="新增子分类"><i class="fa-solid fa-plus"></i></button>' +
        '<button type="button" class="lib-tree-btn" data-action="edit-cat" data-id="' +
        cat.id +
        '" title="编辑"><i class="fa-regular fa-pen-to-square"></i></button>' +
        '<button type="button" class="lib-tree-btn lib-tree-btn--danger" data-action="delete-cat" data-id="' +
        cat.id +
        '" title="删除"><i class="fa-regular fa-trash-can"></i></button>' +
        "</span></div>";

      var childHtml = "";
      if (hasChild && expanded) {
        childHtml =
          '<div class="lib-tree-children">' +
          children.map(function (ch) {
            return nodeHtml(ch, depth + 1);
          }).join("") +
          "</div>";
      }
      return '<div class="lib-tree-node">' + row + childHtml + "</div>";
    }

    var allSelected = selectedCategoryId === null;
    var html =
      '<button type="button" class="lib-tree-row lib-tree-row--all' +
      (allSelected ? " is-selected" : "") +
      '" data-action="select-all-cat">' +
      '<span class="lib-tree-toggle lib-tree-toggle--spacer"></span>' +
      '<span class="lib-tree-label">全部资料</span></button>';

    getChildren(null).forEach(function (c) {
      html += nodeHtml(c, 0);
    });
    root.innerHTML = html;
  }

  function getFilteredMaterials() {
    var title = ($("lib-search-title") && $("lib-search-title").value.trim()) || "";
    var start = ($("lib-search-start") && $("lib-search-start").value) || "";
    var end = ($("lib-search-end") && $("lib-search-end").value) || "";

    return materials.filter(function (m) {
      if (selectedCategoryId != null) {
        var ids = getDescendantIds(selectedCategoryId);
        if (ids.indexOf(m.categoryId) < 0) return false;
      }
      if (title && m.title.indexOf(title) < 0) return false;
      if (start && m.updatedAt < start.replace("T", " ")) return false;
      if (end && m.updatedAt > end.replace("T", " ") + ":59") return false;
      return true;
    });
  }

  function defaultCover() {
    return "https://images.unsplash.com/photo-1518005020951-eccb494ad742?auto=format&fit=crop&w=600&q=80";
  }

  function countFilesInList(list) {
    return list.reduce(function (n, m) {
      return n + (m.files ? m.files.length : 0);
    }, 0);
  }

  function updateLibraryStats(filteredList) {
    var list = filteredList || getFilteredMaterials();
    var totalEl = $("stat-total");
    var filteredEl = $("stat-filtered");
    var catEl = $("stat-categories");
    var filesEl = $("stat-files");
    if (totalEl) totalEl.textContent = String(materials.length);
    if (filteredEl) filteredEl.textContent = String(list.length);
    if (catEl) catEl.textContent = String(categories.length);
    if (filesEl) filesEl.textContent = String(countFilesInList(list));
  }

  function initQuickLinks() {
    document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
      var target = anchor.getAttribute("data-quick-href");
      if (target && typeof whPageHref === "function") anchor.setAttribute("href", whPageHref(target));
    });
  }

  function resetPage() {
    pageState.page = 1;
  }

  function renderCards() {
    var grid = $("lib-card-grid");
    var pagerEl = $("lib-card-pager");
    var countEl = $("lib-result-count");
    if (!grid) return;
    var list = getFilteredMaterials();
    updateLibraryStats(list);
    if (countEl) countEl.textContent = String(list.length);

    if (!list.length) {
      grid.innerHTML =
        '<div class="lib-empty col-span-full"><i class="fa-regular fa-folder-open text-3xl text-cyan-400/50 mb-3"></i><p>暂无资料</p></div>';
      if (pagerEl) pagerEl.innerHTML = "";
      return;
    }

    var pager = window.WHCardGridPager;
    var meta = pager ? pager.paginate(list, pageState) : { rows: list, total: list.length, page: 1, pages: 1, pageSize: list.length };

    grid.innerHTML = meta.rows
      .map(function (m) {
        var cover = m.coverUrl || defaultCover();
        return (
          '<article class="lib-card" data-id="' +
          m.id +
          '">' +
          '<div class="lib-card__cover"><img src="' +
          cover +
          '" alt="" loading="lazy" /></div>' +
          '<div class="lib-card__body">' +
          '<h3 class="lib-card__title">' +
          m.title +
          "</h3>" +
          '<p class="lib-card__desc">' +
          m.desc +
          "</p>" +
          '<time class="lib-card__time">' +
          m.updatedAt +
          "</time>" +
          "</div>" +
          '<div class="lib-card__overlay">' +
          '<button type="button" class="lib-card__op" data-action="view-material" data-id="' +
          m.id +
          '">查看</button>' +
          '<button type="button" class="lib-card__op" data-action="edit-material" data-id="' +
          m.id +
          '">编辑</button>' +
          '<button type="button" class="lib-card__op lib-card__op--danger" data-action="delete-material" data-id="' +
          m.id +
          '">删除</button>' +
          "</div></article>"
        );
      })
      .join("");

    if (pager && pagerEl) {
      pager.mountPager(pagerEl, meta, pageState, renderCards, { pageSizes: [12, 20, 40] });
    }
  }

  function openModal(maskId) {
    var m = $(maskId);
    if (m) m.classList.add("show");
  }

  function closeModal(maskId) {
    var m = $(maskId);
    if (m) m.classList.remove("show");
  }

  function openCategoryModal(mode, catId, parentId) {
    editingCategoryId = mode === "edit" ? catId : null;
    addingCategoryParentId = mode === "add" ? parentId : null;
    $("cat-modal-title").textContent =
      mode === "edit" ? "编辑分类" : parentId ? "新增子分类" : "新增分类";
    var cat = catId ? getCategory(catId) : null;
    $("cat-name").value = cat ? cat.name : "";
    $("cat-sort").value = cat ? cat.sort : getChildren(parentId || null).length + 1;
    var hint = $("cat-parent-hint");
    if (parentId && mode === "add") {
      hint.textContent = "上级分类：" + categoryPath(parentId);
      hint.classList.remove("hidden");
    } else {
      hint.textContent = "";
      hint.classList.add("hidden");
    }
    openModal("cat-modal-mask");
  }

  function saveCategory() {
    var name = $("cat-name").value.trim();
    if (!name) return toast("请填写分类名称");
    var sort = Number($("cat-sort").value) || 0;
    if (editingCategoryId) {
      var c = getCategory(editingCategoryId);
      if (c) {
        c.name = name;
        c.sort = sort;
      }
    } else {
      var id = Date.now();
      categories.push({
        id: id,
        name: name,
        parentId: addingCategoryParentId,
        sort: sort,
      });
      if (addingCategoryParentId) expandedIds[addingCategoryParentId] = true;
      selectedCategoryId = id;
    }
    closeModal("cat-modal-mask");
    renderTree();
    renderCards();
    toast("分类已保存");
  }

  function deleteCategory(id) {
    var child = categories.some(function (c) {
      return c.parentId === id;
    });
    var hasMat = materials.some(function (m) {
      return m.categoryId === id || getDescendantIds(id).indexOf(m.categoryId) >= 0;
    });
    if (child || hasMat) {
      if (!confirm("该分类下存在子分类或资料，确定删除？")) return;
    }
    var removeIds = getDescendantIds(id);
    categories = categories.filter(function (c) {
      return removeIds.indexOf(c.id) < 0;
    });
    materials = materials.filter(function (m) {
      return removeIds.indexOf(m.categoryId) < 0;
    });
    if (selectedCategoryId && removeIds.indexOf(selectedCategoryId) >= 0) selectedCategoryId = null;
    renderTree();
    renderCards();
    toast("分类已删除");
  }

  function resetUploadForm() {
    pendingFiles = [];
    pendingCoverFile = null;
    if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
    coverPreviewUrl = null;
    $("mat-title").value = "";
    $("mat-desc").value = "";
    $("mat-category").innerHTML = buildCategoryOptions(null, null);
    $("mat-cover-input").value = "";
    $("mat-file-input").value = "";
    $("mat-cover-name").textContent = "未选择封面";
    renderPendingFiles();
    var prev = $("mat-cover-preview");
    if (prev) {
      prev.innerHTML = '<span class="text-xs text-slate-500">封面预览</span>';
    }
  }

  function renderPendingFiles() {
    var box = $("mat-file-list");
    if (!box) return;
    if (!pendingFiles.length) {
      box.innerHTML = '<span class="text-xs text-slate-500">拖拽文件到此处，或点击选择</span>';
      return;
    }
    box.innerHTML = pendingFiles
      .map(function (f, i) {
        return (
          '<div class="lib-file-chip"><span class="truncate">' +
          f.name +
          " (" +
          formatSize(f.size) +
          ')</span><button type="button" data-action="remove-pending-file" data-idx="' +
          i +
          '">×</button></div>'
        );
      })
      .join("");
  }

  function addPendingFiles(fileList) {
    Array.from(fileList || []).forEach(function (file) {
      var err = validateUploadFile(file);
      if (err) return toast(err);
      pendingFiles.push(file);
    });
    renderPendingFiles();
  }

  function openMaterialModal(mode, materialId) {
    editingMaterialId = mode === "edit" ? materialId : null;
    resetUploadForm();
    $("mat-modal-title").textContent = mode === "edit" ? "编辑资料" : "上传资料";
    if (mode === "edit" && materialId) {
      var m = materials.find(function (x) {
        return x.id === materialId;
      });
      if (m) {
        $("mat-title").value = m.title;
        $("mat-desc").value = m.desc;
        $("mat-category").innerHTML = buildCategoryOptions(m.categoryId, null);
        if (m.coverUrl) {
          $("mat-cover-preview").innerHTML = '<img src="' + m.coverUrl + '" alt="" />';
        }
        pendingFiles = m.files.map(function (f) {
          return { name: f.name, size: f.size, _mock: true, ext: f.ext };
        });
        renderPendingFiles();
      }
    } else {
      var defCat = selectedCategoryId || (categories[0] && categories[0].id);
      $("mat-category").innerHTML = buildCategoryOptions(defCat, null);
    }
    openModal("mat-modal-mask");
  }

  function saveMaterial() {
    var title = $("mat-title").value.trim();
    var desc = $("mat-desc").value.trim();
    var categoryId = Number($("mat-category").value);
    if (!title) return toast("请填写资料标题");
    if (!categoryId) return toast("请选择资料分类");
    if (!desc) return toast("请填写资料描述");
    if (!editingMaterialId && !pendingFiles.length) return toast("请上传资料文件");

    var files = pendingFiles.map(function (f, i) {
      return {
        id: Date.now() + i,
        name: f.name,
        ext: extOf(f.name).toUpperCase(),
        size: f.size || 0,
      };
    });

    var existForCover = editingMaterialId
      ? materials.find(function (m) {
          return m.id === editingMaterialId;
        })
      : null;
    var coverUrl = coverPreviewUrl || (existForCover && existForCover.coverUrl) || "";

    if (editingMaterialId) {
      var exist = materials.find(function (m) {
        return m.id === editingMaterialId;
      });
      if (exist) {
        exist.title = title;
        exist.desc = desc;
        exist.categoryId = categoryId;
        exist.updatedAt = nowStr();
        exist.updater = "当前用户";
        if (coverUrl) exist.coverUrl = coverUrl;
        if (files.length) exist.files = files;
      }
    } else {
      materials.unshift({
        id: Date.now(),
        categoryId: categoryId,
        title: title,
        desc: desc,
        coverUrl: coverUrl || defaultCover(),
        updatedAt: nowStr(),
        updater: "当前用户",
        files: files,
      });
    }
    closeModal("mat-modal-mask");
    renderCards();
    toast("资料已保存");
  }

  function openViewModal(id) {
    var m = materials.find(function (x) {
      return x.id === id;
    });
    if (!m) return;
    $("view-title").textContent = m.title;
    $("view-cover").innerHTML = m.coverUrl
      ? '<img src="' + m.coverUrl + '" alt="" />'
      : '<div class="lib-view-cover-placeholder"><i class="fa-regular fa-image"></i></div>';
    $("view-mat-title").textContent = m.title;
    $("view-desc").textContent = m.desc;
    $("view-category").textContent = categoryPath(m.categoryId);
    $("view-time").textContent = m.updatedAt;
    $("view-user").textContent = m.updater;
    $("view-file-list").innerHTML = m.files
      .map(function (f) {
        return (
          '<div class="lib-view-file">' +
          '<span class="lib-view-file__icon"><i class="fa-regular fa-file"></i></span>' +
          '<span class="lib-view-file__name">' +
          f.name +
          ' <em class="text-slate-500">(' +
          f.ext +
          " · " +
          formatSize(f.size) +
          ")</em></span>" +
          '<span class="lib-view-file__ops">' +
          '<button type="button" class="wh-btn-ghost px-3 py-1 text-xs" data-action="preview-mat-file" data-mid="' +
          m.id +
          '" data-fid="' +
          f.id +
          '">预览</button>' +
          '<button type="button" class="wh-btn-primary px-3 py-1 text-xs" data-action="download-mat-file" data-mid="' +
          m.id +
          '" data-fid="' +
          f.id +
          '">下载</button>' +
          "</span></div>"
        );
      })
      .join("");
    openModal("view-modal-mask");
  }

  function previewMaterialFile(mid, fid) {
    var m = materials.find(function (x) {
      return x.id === mid;
    });
    var f = m && m.files.find(function (x) {
      return x.id === fid;
    });
    if (!f) return;
    $("preview-title").textContent = f.name;
    var body = $("preview-body");
    var ext = (f.ext || "").toLowerCase();
    if (ext === "JPG" || ext === "JPEG" || ext === "PNG") {
      body.innerHTML =
        '<img src="' +
        (m.coverUrl || defaultCover()) +
        '" alt="' +
        f.name +
        '" />';
    } else if (ext === "MP4") {
      body.innerHTML =
        '<div><i class="fa-regular fa-circle-play text-5xl text-cyan-300 mb-3"></i><p class="text-white">' +
        f.name +
        '</p><p class="text-sm text-cyan-100/70 mt-2">视频预览（原型）</p></div>';
    } else {
      body.innerHTML =
        '<div><i class="fa-regular fa-file-lines text-5xl text-cyan-300 mb-3"></i><p class="text-white">' +
        f.name +
        '</p><p class="text-sm text-cyan-100/70 mt-2">文档预览（原型）</p></div>';
    }
    openModal("preview-modal-mask");
  }

  function bindEvents() {
    document.addEventListener("click", function (e) {
      var t = e.target.closest("[data-action]");
      if (!t) return;
      var action = t.getAttribute("data-action");
      var id = Number(t.getAttribute("data-id"));
      var mid = Number(t.getAttribute("data-mid"));
      var fid = Number(t.getAttribute("data-fid"));
      var idx = Number(t.getAttribute("data-idx"));

      if (action === "select-all-cat") {
        selectedCategoryId = null;
        resetPage();
        renderTree();
        renderCards();
      }
      if (action === "toggle-cat") {
        expandedIds[id] = !expandedIds[id];
        renderTree();
      }
      if (t.closest(".lib-tree-row") && t.closest(".lib-tree-row").dataset.id && !t.closest(".lib-tree-btn") && !t.closest(".lib-tree-toggle")) {
        var row = t.closest(".lib-tree-row");
        if (row.dataset.id) {
          selectedCategoryId = Number(row.dataset.id);
          resetPage();
          renderTree();
          renderCards();
        }
      }
      if (action === "add-root-cat") openCategoryModal("add", null, null);
      if (action === "add-child-cat") openCategoryModal("add", null, id);
      if (action === "edit-cat") openCategoryModal("edit", id, null);
      if (action === "delete-cat") deleteCategory(id);
      if (action === "close-cat-modal") closeModal("cat-modal-mask");
      if (action === "save-cat") saveCategory();

      if (action === "search-lib") {
        resetPage();
        renderCards();
      }
      if (action === "reset-lib-search") {
        $("lib-search-title").value = "";
        $("lib-search-start").value = "";
        $("lib-search-end").value = "";
        resetPage();
        renderCards();
      }
      if (action === "upload-material") openMaterialModal("new");
      if (action === "view-material") openViewModal(id);
      if (action === "edit-material") openMaterialModal("edit", id);
      if (action === "delete-material") {
        if (confirm("确定删除该资料？")) {
          materials = materials.filter(function (m) {
            return m.id !== id;
          });
          renderCards();
          toast("已删除");
        }
      }
      if (action === "close-mat-modal") closeModal("mat-modal-mask");
      if (action === "save-mat") saveMaterial();
      if (action === "close-view-modal") closeModal("view-modal-mask");
      if (action === "preview-mat-file") previewMaterialFile(mid, fid);
      if (action === "download-mat-file") toast("开始下载（原型）");
      if (action === "close-preview-modal") closeModal("preview-modal-mask");
      if (action === "remove-pending-file") {
        pendingFiles.splice(idx, 1);
        renderPendingFiles();
      }
    });

    var drop = $("mat-dropzone");
    if (drop) {
      drop.addEventListener("dragover", function (e) {
        e.preventDefault();
        drop.classList.add("is-dragover");
      });
      drop.addEventListener("dragleave", function () {
        drop.classList.remove("is-dragover");
      });
      drop.addEventListener("drop", function (e) {
        e.preventDefault();
        drop.classList.remove("is-dragover");
        addPendingFiles(e.dataTransfer.files);
      });
    }

    var fileInput = $("mat-file-input");
    if (fileInput) {
      fileInput.addEventListener("change", function () {
        addPendingFiles(fileInput.files);
        fileInput.value = "";
      });
    }

    var coverInput = $("mat-cover-input");
    if (coverInput) {
      coverInput.addEventListener("change", function () {
        var file = coverInput.files && coverInput.files[0];
        if (!file) return;
        var ext = extOf(file.name);
        if (COVER_EXT.indexOf(ext) < 0) return toast("封面仅支持 JPG、PNG");
        if (file.size > MAX_OTHER) return toast("封面不能超过 50MB");
        pendingCoverFile = file;
        $("mat-cover-name").textContent = file.name;
        if (coverPreviewUrl) URL.revokeObjectURL(coverPreviewUrl);
        coverPreviewUrl = URL.createObjectURL(file);
        $("mat-cover-preview").innerHTML = '<img src="' + coverPreviewUrl + '" alt="" />';
      });
    }
  }

  function init() {
    initQuickLinks();
    renderTree();
    renderCards();
    bindEvents();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
