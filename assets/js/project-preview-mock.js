/**
 * 项目资料 / 交底交涉 — 本地 Mock 预览资源（离线可用，不依赖外网）
 */
(function (global) {
  var MOCK_IMAGES = [
    "assets/images/flight-report-event.png",
    "assets/images/flight-report-track.png",
    "assets/images/ai-risk-aerial.png"
  ];

  var _assetsBase = null;

  function resolveAssetsBase() {
    if (_assetsBase) return _assetsBase;
    if (global.__WH_GIS_ASSETS_BASE) {
      _assetsBase = String(global.__WH_GIS_ASSETS_BASE).replace(/\/?$/, "/");
      return _assetsBase;
    }
    var scripts = document.getElementsByTagName("script");
    var i;
    for (i = scripts.length - 1; i >= 0; i--) {
      var src = scripts[i].src || "";
      if (/project-preview-mock|project-doc-shared|in-project-page|project-exchange-shared/.test(src)) {
        _assetsBase = src.replace(/\/js\/[^/]+$/, "/");
        return _assetsBase;
      }
    }
    _assetsBase = "../../../assets/";
    return _assetsBase;
  }

  function mockImageUrl(index) {
    var rel = MOCK_IMAGES[Math.abs(Number(index) || 0) % MOCK_IMAGES.length];
    return resolveAssetsBase() + rel;
  }

  function mockDocumentSvg(title, extLabel) {
    title = title || "资料文件";
    extLabel = extLabel || "PDF";
    var svg =
      '<svg xmlns="http://www.w3.org/2000/svg" width="800" height="1100" viewBox="0 0 800 1100">' +
      '<rect width="800" height="1100" fill="#f8fafc"/>' +
      '<rect x="48" y="48" width="704" height="1004" rx="16" fill="#fff" stroke="#dbeafe" stroke-width="2"/>' +
      '<rect x="88" y="96" width="180" height="28" rx="6" fill="#dbeafe"/>' +
      '<text x="98" y="116" font-family="sans-serif" font-size="14" fill="#2563eb">' +
      extLabel +
      " · 演示预览</text>" +
      '<text x="88" y="168" font-family="sans-serif" font-size="24" font-weight="600" fill="#0f172a">' +
      escapeXml(title) +
      "</text>" +
      '<rect x="88" y="210" width="624" height="12" rx="6" fill="#e2e8f0"/>' +
      '<rect x="88" y="240" width="560" height="12" rx="6" fill="#e2e8f0"/>' +
      '<rect x="88" y="270" width="600" height="12" rx="6" fill="#e2e8f0"/>' +
      '<rect x="88" y="320" width="624" height="420" rx="12" fill="#eff6ff" stroke="#bfdbfe"/>' +
      '<text x="400" y="560" text-anchor="middle" font-family="sans-serif" font-size="18" fill="#64748b">Mock 文件预览</text>' +
      '<text x="400" y="590" text-anchor="middle" font-family="sans-serif" font-size="14" fill="#94a3b8">武汉地铁保护区 · 原型演示数据</text>' +
      "</svg>";
    return "data:image/svg+xml;charset=utf-8," + encodeURIComponent(svg);
  }

  function escapeXml(text) {
    return String(text || "")
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  }

  function getFileExt(name) {
    var parts = String(name || "").split(".");
    return parts.length > 1 ? parts.pop().toLowerCase() : "";
  }

  function isEmptyFileLabel(name) {
    return !name || name === "未选择文件" || name === "未上传资料" || name === "未上传文件" || name === "未上传";
  }

  function isRemoteBlockedUrl(url) {
    if (!url) return false;
    return /w3\.org|unsplash\.com|mdn\.mozilla|w3schools\.com/i.test(url);
  }

  function resolveMockPreviewUrl(fileName, explicitUrl) {
    if (explicitUrl && !isRemoteBlockedUrl(explicitUrl)) {
      if (explicitUrl.indexOf("blob:") === 0 || explicitUrl.indexOf("data:") === 0) return explicitUrl;
      if (/^https?:\/\//i.test(explicitUrl)) return explicitUrl;
      return explicitUrl;
    }
    if (isEmptyFileLabel(fileName)) return "";
    var ext = getFileExt(fileName);
    if (ext === "pdf") return mockDocumentSvg(fileName, "PDF");
    if (["doc", "docx", "xls", "xlsx", "ppt", "pptx"].indexOf(ext) >= 0) {
      return mockDocumentSvg(fileName, ext.toUpperCase());
    }
    if (["jpg", "jpeg", "png", "gif", "webp", "bmp"].indexOf(ext) >= 0) {
      return mockImageUrl(fileName.length);
    }
    if (["mp4", "webm", "mov"].indexOf(ext) >= 0) {
      return mockImageUrl(fileName.length + 1);
    }
    return mockDocumentSvg(fileName, "FILE");
  }

  function isMockVideoPlaceholder(url, fileName) {
    if (url && url.indexOf("blob:") === 0) return false;
    if (url && /\.(mp4|webm|mov)(\?|$)/i.test(url)) return false;
    var ext = getFileExt(fileName);
    return ["mp4", "webm", "mov"].indexOf(ext) >= 0;
  }

  function isInlinePreviewUrl(url) {
    if (!url) return false;
    if (url.indexOf("data:") === 0) return true;
    if (/\.(png|jpe?g|gif|webp|svg)(\?|$)/i.test(url)) return true;
    return url.indexOf(resolveAssetsBase()) === 0 || url.indexOf("images/") >= 0;
  }

  global.ProjectPreviewMock = {
    resolveAssetsBase: resolveAssetsBase,
    resolveMockPreviewUrl: resolveMockPreviewUrl,
    mockImageUrl: mockImageUrl,
    mockDocumentSvg: mockDocumentSvg,
    isRemoteBlockedUrl: isRemoteBlockedUrl,
    isMockVideoPlaceholder: isMockVideoPlaceholder,
    isInlinePreviewUrl: isInlinePreviewUrl
  };
})(typeof window !== "undefined" ? window : global);
