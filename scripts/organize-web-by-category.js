/**
 * web/ 下 HTML 按业务分子目录，并修正资源与页面链接（不改 <style> 与业务样式规则）
 * 运行: node scripts/organize-web-by-category.js
 */
const fs = require("fs");
const path = require("path");

const projectRoot = path.join(__dirname, "..");
const webDir = path.join(projectRoot, "web");

/** @type {Record<string, string>} */
const FILE_FOLDER = {
  "map-gis.html": "map",
  "map-situation.html": "map",
  "map-flight-plan.html": "map",
  "map-alerts.html": "map",
  "map-expert.html": "map",
  "map-routes.html": "map",
  "map-cockpit-prep.html": "cockpit",
  "map-cockpit-fly.html": "cockpit",
  "ai.html": "ai",
  "in-disease.html": "patrol",
  "in-night.html": "patrol",
  "in-uav-report.html": "patrol",
  "in-manual.html": "patrol",
  "dc-line-stats.html": "stats",
  "dc-system-stats.html": "stats",
  "dc-drone-stats.html": "stats",
  "dc-library.html": "stats",
};

function folderForFile(name) {
  if (FILE_FOLDER[name]) return FILE_FOLDER[name];
  if (/^wb-/.test(name) || /^am-/.test(name)) return "wb";
  if (/^in-/.test(name)) return "wb";
  return null;
}

function relHref(fromRel, toCanonical) {
  const fromDir = path.dirname(fromRel);
  const fromNorm = fromDir === "." ? "" : fromDir.replace(/\\/g, "/");
  const toNorm = path.dirname(toCanonical).replace(/\\/g, "/");
  if (fromNorm === toNorm) return path.basename(toCanonical);
  const depth = fromNorm ? fromNorm.split("/").filter(Boolean).length : 0;
  const up = depth === 0 ? "" : "../".repeat(depth);
  return up + toCanonical.replace(/\\/g, "/");
}

function listWebHtml() {
  const out = [];
  function walk(dir) {
    fs.readdirSync(dir).forEach(function (name) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) return walk(full);
      if (!name.endsWith(".html") || name === "web-login.html") return;
      out.push(path.relative(webDir, full).replace(/\\/g, "/"));
    });
  }
  walk(webDir);
  return out;
}

function buildRouteMap() {
  const map = {};
  listWebHtml().forEach(function (rel) {
    const base = path.basename(rel);
    const folder = folderForFile(base);
    if (folder) map[base] = folder + "/" + base;
    else map[base] = rel;
  });
  return map;
}

function patchAssets(text, inSubfolder) {
  if (!inSubfolder) return text;
  return text
    .replace(/href="\.\.\/assets\//g, 'href="../../assets/')
    .replace(/src="\.\.\/assets\//g, 'src="../../assets/')
    .replace(/href='\.\.\/assets\//g, "href='../../assets/")
    .replace(/src='\.\.\/assets\//g, "src='../../assets/");
}

function patchPageLinks(text, fromRel, routes) {
  var out = text;
  var names = Object.keys(routes).sort(function (a, b) {
    return b.length - a.length;
  });
  names.forEach(function (name) {
    var target = routes[name];
    var href = relHref(fromRel, target);
    var escaped = name.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    var patterns = [
      [new RegExp('href="' + escaped + '"', "g"), 'href="' + href + '"'],
      [new RegExp("href='" + escaped + "'", "g"), "href='" + href + "'"],
      [
        new RegExp('href="' + escaped + "(\\?[^\"]*)\"", "g"),
        function (_m, q) {
          return 'href="' + href + (q || "") + '"';
        },
      ],
      [
        new RegExp("href='" + escaped + "(\\?[^']*)'", "g"),
        function (_m, q) {
          return "href='" + href + (q || "") + "'";
        },
      ],
      [new RegExp('location\\.href\\s*=\\s*"' + escaped + '"', "g"), 'location.href = "' + href + '"'],
      [new RegExp("location\\.href\\s*=\\s*'" + escaped + "'", "g"), "location.href = '" + href + "'"],
      [new RegExp('location\\.replace\\("' + escaped + '"\\)', "g"), 'location.replace("' + href + '")'],
      [new RegExp("location\\.replace\\('" + escaped + "'\\)", "g"), "location.replace('" + href + "')"],
      [
        new RegExp('content="0;url=' + escaped + '"', "g"),
        'content="0;url=' + href + '"',
      ],
      [new RegExp('data-cockpit-url="' + escaped + '"', "g"), 'data-cockpit-url="' + href + '"'],
      [new RegExp("data-cockpit-url='" + escaped + "'", "g"), "data-cockpit-url='" + href + "'"],
      [
        new RegExp("location\\.href=\\\\'" + escaped + "\\\\'", "g"),
        "location.href=\\'" + href + "\\'",
      ],
      [
        new RegExp('return "' + escaped + "(\\?[^\"]*)\"", "g"),
        function (_m, q) {
          return 'return "' + href + (q || "") + '"';
        },
      ],
    ];
    patterns.forEach(function (p) {
      if (typeof p[1] === "function") out = out.replace(p[0], p[1]);
      else out = out.replace(p[0], p[1]);
    });
  });
  return out;
}

function moveFilesToFolders() {
  fs.readdirSync(webDir).forEach(function (f) {
    if (!f.endsWith(".html") || f === "web-login.html") return;
    const folder = folderForFile(f);
    if (!folder) {
      console.warn("  skip (no folder):", f);
      return;
    }
    fs.mkdirSync(path.join(webDir, folder), { recursive: true });
    const from = path.join(webDir, f);
    const to = path.join(webDir, folder, f);
    if (!fs.existsSync(from)) return;
    if (fs.existsSync(to)) fs.unlinkSync(to);
    fs.renameSync(from, to);
    console.log("  moved", f, "→", folder + "/");
  });
}

function walkPatchHtml(routes) {
  function walk(dir) {
    fs.readdirSync(dir).forEach(function (name) {
      const full = path.join(dir, name);
      if (fs.statSync(full).isDirectory()) return walk(full);
      if (!name.endsWith(".html")) return;
      const rel = path.relative(webDir, full).replace(/\\/g, "/");
      let text = fs.readFileSync(full, "utf8");
      if (rel.includes("/")) text = patchAssets(text, true);
      text = patchPageLinks(text, rel, routes);
      fs.writeFileSync(full, text, "utf8");
    });
  }
  walk(webDir);
}

function patchMenuConfig(routes) {
  const file = path.join(projectRoot, "assets", "js", "menu-config.js");
  let text = fs.readFileSync(file, "utf8");
  const names = Object.keys(routes).sort(function (a, b) {
    return b.length - a.length;
  });
  names.forEach(function (name) {
    const canon = routes[name];
    text = text.split('href: "' + name + '"').join('href: "' + canon + '"');
    text = text.split("href: '" + name + "'").join("href: '" + canon + "'");
  });
  const routesJson = JSON.stringify(routes, null, 2);
  if (/global\.WH_PAGE_ROUTES\s*=/.test(text)) {
    text = text.replace(
      /global\.WH_PAGE_ROUTES\s*=\s*\{[\s\S]*?\};/,
      "global.WH_PAGE_ROUTES = " + routesJson + ";"
    );
  } else {
    text = text.replace(
      "global.whPageHref = whPageHref;",
      "global.whPageHref = whPageHref;\n  global.WH_PAGE_ROUTES = " + routesJson + ";"
    );
  }
  fs.writeFileSync(file, text, "utf8");
  console.log("  patched assets/js/menu-config.js hrefs + WH_PAGE_ROUTES");
}

function patchSharedJs(routes, onlyFiles) {
  const jsDir = path.join(projectRoot, "assets", "js");
  const files = (onlyFiles || fs.readdirSync(jsDir).filter(function (f) {
    return f.endsWith(".js");
  }))
  files.forEach(function (f) {
    const full = path.join(jsDir, f);
    let text = fs.readFileSync(full, "utf8");
    let changed = false;
    Object.keys(routes)
      .sort(function (a, b) {
        return b.length - a.length;
      })
      .forEach(function (name) {
        const canon = routes[name];
        if (text.indexOf(name) < 0) return;
        const before = text;
        text = text.split('"' + name + '"').join('"' + canon + '"');
        text = text.split("'" + name + "'").join("'" + canon + "'");
        if (text !== before) changed = true;
      });
    if (changed) {
      fs.writeFileSync(full, text, "utf8");
      console.log("  patched assets/js/" + f);
    }
  });
}

function main() {
  moveFilesToFolders();
  const routes = buildRouteMap();
  walkPatchHtml(routes);
  const loginPath = path.join(webDir, "web-login.html");
  if (fs.existsSync(loginPath)) {
    let login = fs.readFileSync(loginPath, "utf8");
    login = patchPageLinks(login, "web-login.html", routes);
    fs.writeFileSync(loginPath, login, "utf8");
    console.log("  patched web-login.html");
  }
  routes["web-login.html"] = "web-login.html";
  patchMenuConfig(routes);
  patchSharedJs(routes, [
    "map-gis.js",
    "map-situation.js",
    "map-expert.js",
    "map-alerts.js",
    "in-uav-report.js",
    "map-patrol-overlay.js",
  ]);
  console.log("\n[OK] Routes:", Object.keys(routes).length);
  Object.keys(routes)
    .sort()
    .forEach(function (k) {
      console.log("   ", k, "→", routes[k]);
    });
}

main();
