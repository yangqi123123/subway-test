const fs = require("fs");
const p = "assets/js/map-alerts.js";
let s = fs.readFileSync(p, "utf8");
const d = "d" + "iv";

s = s.replace(/<motion\b/g, "<" + d);
s = s.replace(/<\/motion>/g, "</" + d + ">");

s = s.replace(
  /function renderDisposal\(item\) \{[\s\S]*?^  \}/m,
  `function renderDisposal(item) {
    return item.disposalRecord
      .map(function (record) {
        var extra = "";
        if (record.type === "review") {
          extra =
            '<${d} class="alert-disposal-audit">' +
            "<${d}>复核结果：<strong>" +
            (record.result || "已复核") +
            "</strong></${d}>" +
            "<${d}>是否误报：" +
            (record.falseAlarm || "—") +
            "</${d}>" +
            "<${d}>报警级别调整：" +
            (record.levelAdjust || "—") +
            "</${d}>" +
            "<${d}>现场情况：" +
            (record.scene || "—") +
            "</${d}></${d}>";
        }
        if (record.type === "audit") {
          var cls =
            record.result === "审核通过" ? "alert-disposal-result--pass" : "alert-disposal-result--reject";
          extra =
            '<${d} class="alert-disposal-audit">' +
            "<${d}>审核结果：<strong class=\\"" +
            cls +
            '\\">' +
            (record.result || "—") +
            "</strong></${d}>" +
            "<${d}>审批意见：" +
            (record.opinion || "—") +
            "</${d}></${d}>";
        }
        return (
          '<${d} class="alert-timeline-item">' +
          '<${d} class="alert-time">' +
          record.time +
          "</${d}>" +
          '<${d} class="alert-disposal-text">' +
          record.text +
          "</${d}>" +
          extra +
          "</${d}>"
        );
      })
      .join("");
  }`.replace(/\$\{d\}/g, d)
);

s = s.replace(
  /document\.getElementById\("record-alarm"\)\.innerHTML =[\s\S]*?\.innerHTML\.replace\([^)]+\);/,
  `document.getElementById("record-alarm").innerHTML =
      '<${d} class="flex items-center justify-center gap-3 mb-3">' +
      '<span class="alert-dot"></span>' +
      '<span class="alert-code-tag">' +
      item.alarmRecord.code +
      "</span>" +
      '<span class="alert-duration-pill">持续时间：' +
      item.alarmRecord.duration +
      "</span></${d}>" +
      '<${d} class="text-center text-[18px] text-slate-500">' +
      item.alarmRecord.time +
      "</${d}>";`.replace(/\$\{d\}/g, d)
);

s = s.replace(
  /function fillDetail\(item\) \{[\s\S]*?document\.getElementById\("record-disposal"\)\.innerHTML =[\s\S]*?\+ "<\/div>";/,
  `function fillDetail(item) {
    document.getElementById("alert-detail-grid").innerHTML = [
      ["报警类型", item.type],
      ["报警区间", item.section],
      ["位置", item.location],
      ["测点编码", '<span class="alert-code-tag">' + item.code + "</span>"],
      ["报警开始时间", item.startTime],
      ["最新报警时间", item.lastTime],
      ["流程状态", item.workflowStatus],
      ["时域图", "已生成"],
      [
        "时域图操作",
        '<span class="alert-detail-link">生成</span><span class="alert-detail-link">查看</span><span class="alert-detail-link">典型事件标注</span>',
      ],
      ["", ""],
    ]
      .map(function (pair) {
        return (
          '<${d} class="alert-detail-item"><${d} class="alert-detail-key">' +
          (pair[0] || "&nbsp;") +
          '</${d}><${d} class="alert-detail-val">' +
          (pair[1] || "&nbsp;") +
          "</${d}></${d}>"
        );
      })
      .join("")
      .replace(/<\\$\\{d\\}>/g, "<${d}>")
      .replace(/<\\/\\$\\{d\\}>/g, "</${d}>");

    document.getElementById("record-alarm").innerHTML =
      '<${d} class="flex items-center justify-center gap-3 mb-3">' +
      '<span class="alert-dot"></span>' +
      '<span class="alert-code-tag">' +
      item.alarmRecord.code +
      "</span>" +
      '<span class="alert-duration-pill">持续时间：' +
      item.alarmRecord.duration +
      "</span></${d}>" +
      '<${d} class="text-center text-[18px] text-slate-500">' +
      item.alarmRecord.time +
      "</${d}>";

    document.getElementById("record-uav").innerHTML =
      '<${d} class="alert-uav-shot"><img src="' +
      (item.uavRecord.image || item.image) +
      '" alt="无人机实拍记录" /></${d}>';
    document.getElementById("record-disposal").innerHTML =
      '<${d} class="alert-timeline">' + renderDisposal(item) + "</${d}>";`.replace(/\$\{d\}/g, d)
);

s = s.replace(
  /iconHtml:[\s\S]*?popup: item\.location,[\s\S]*?\},/,
  `iconHtml:
              '<${d} style="width:22px;height:22px;border-radius:999px;background:#ef4444;border:3px solid #fff;display:flex;align-items:center;justify-content:center;color:#fff;font-size:10px;"><i class="fa-solid fa-location-crosshairs"></i></${d}>',
            iconSize: [22, 22],
            iconAnchor: [11, 11],
            popup: item.location,
          },`.replace(/\$\{d\}/g, d)
);

s = s.replace(
  /if \(mapEl && mapEl\.innerHTML\.indexOf\("[^"]*"\)[^}]+\}/,
  ""
);

fs.writeFileSync(p, s);
console.log("ok");
