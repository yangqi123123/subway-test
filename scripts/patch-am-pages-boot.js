const fs = require("fs");
const path = require("path");

const root = path.join(__dirname, "..");
const maintPath = path.join(root, "web/wb/am-maintenance.html");
const flightPath = path.join(root, "web/wb/am-flight-log.html");

const maintTail = `
  <script src="../../assets/js/am-maintenance-data.js"></script>
  <script src="../../assets/js/am-maintenance-page.js"></script>
  <script src="../../assets/js/search-select.js"></script>
  <script src="../../assets/js/upload-widget.js"></script>
  <script>
    (function () {
      document.addEventListener("DOMContentLoaded", function () {
        var uploaders = {};
        if (window.WHUpload) {
          uploaders.doc = WHUpload.createDocUploader({
            inputId: "f-doc-input",
            listId: "f-doc-list",
            tileId: "f-doc-tile",
            hintId: "f-doc-hint",
          });
          uploaders.photo = WHUpload.createPhotoUploader({
            inputId: "f-photo-input",
            listId: "f-photo-list",
            tileId: "f-photo-tile",
            hintId: "f-photo-hint",
          });
          uploaders.video = WHUpload.createVideoUploader({
            inputId: "f-video-input",
            listId: "f-video-list",
            tileId: "f-video-tile",
            hintId: "f-video-hint",
          });
        }
        if (window.WHMaintenancePage) {
          WHMaintenancePage.boot({ mobile: false, uploaders: uploaders });
        }
        document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
          var target = anchor.getAttribute("data-quick-href");
          if (target && typeof whPageHref === "function") anchor.setAttribute("href", whPageHref(target));
        });
      });
    })();
  </script>
  <script src="../../assets/js/menu-config.js"></script>
  <script src="../../assets/js/workbench-mega.js"></script>
  <script src="../../assets/js/shell.js"></script>
</body>
</html>
`;

const flightTail = `
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js" crossorigin=""></script>
  <script src="../../assets/js/am-flight-log-data.js"></script>
  <script src="../../assets/js/am-flight-log-page.js"></script>
  <script src="../../assets/js/track-playback.js"></script>
  <script src="../../assets/js/flight-report-modal.js"></script>
  <script>
    (function () {
      document.addEventListener("DOMContentLoaded", function () {
        if (window.WHFlightLogPage) {
          WHFlightLogPage.boot({ mobile: false });
        }
        document.querySelectorAll(".disease-quick-link[data-quick-href]").forEach(function (anchor) {
          var target = anchor.getAttribute("data-quick-href");
          if (target && typeof whPageHref === "function") anchor.setAttribute("href", whPageHref(target));
        });
      });
    })();
  </script>
  <script src="../../assets/js/menu-config.js"></script>
  <script src="../../assets/js/workbench-mega.js"></script>
  <script src="../../assets/js/shell.js"></script>
</body>
</html>
`;

let maint = fs.readFileSync(maintPath, "utf8");
const maintIdx = maint.indexOf('  <script src="../../assets/js/menu-config.js"></script>');
if (maintIdx < 0) throw new Error("maint anchor not found");
fs.writeFileSync(maintPath, maint.slice(0, maintIdx) + maintTail);

let flight = fs.readFileSync(flightPath, "utf8");
const flightIdx = flight.indexOf('  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"');
if (flightIdx < 0) throw new Error("flight anchor not found");
fs.writeFileSync(flightPath, flight.slice(0, flightIdx) + flightTail);

console.log("patched am-maintenance.html and am-flight-log.html");
