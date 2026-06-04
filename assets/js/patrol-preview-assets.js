/**
 * 巡查记录 / 飞行报告 — 移动端预览图资源
 */
(function (global) {
  "use strict";

  var TRACK = "assets/images/flight-report-track.png";
  var EVENT = "assets/images/flight-report-event.png";

  function url(rel) {
    if (global.whAsset) return global.whAsset(rel);
    return "../../../assets/" + rel;
  }

  global.WHPatrolPreviewAssets = {
    trackUrl: function () {
      return url(TRACK);
    },
    eventUrl: function () {
      return url(EVENT);
    },
    trackRel: TRACK,
    eventRel: EVENT
  };
})(window);
