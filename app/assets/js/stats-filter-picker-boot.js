/**
 * 统计页筛选底部选器初始化
 */
(function (global) {
  "use strict";

  global.WHStatsFilterPickerBoot = {
    boot: function (sheetId) {
      if (global.WHFilterPicker && global.WHFilterPicker.init) {
        global.WHFilterPicker.init(sheetId ? [sheetId] : []);
      }
    },
  };
})(window);
