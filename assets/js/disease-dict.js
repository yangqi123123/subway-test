/**
 * 病害巡查枚举 — 与「字典管理」数据字典类型对应（原型静态数据）
 * dictType: disease_inspect_item | disease_structure_type | disease_type | disease_level | disease_development
 */
(function (global) {
  var DISEASE_DICT_TYPES = {
    disease_inspect_item: "巡查项",
    disease_structure_type: "结构类型",
    disease_type: "病害类型",
    disease_level: "病害程度",
    disease_development: "病害发展",
  };

  var DISEASE_DICT_ROWS = [
    { dictType: "disease_inspect_item", dictLabel: "管片", dictValue: "segment", dictSort: "1", status: true },
    { dictType: "disease_inspect_item", dictLabel: "道床", dictValue: "trackbed", dictSort: "2", status: true },
    { dictType: "disease_inspect_item", dictLabel: "挡土墙", dictValue: "retaining_wall", dictSort: "3", status: true },
    { dictType: "disease_inspect_item", dictLabel: "衬砌结构", dictValue: "lining", dictSort: "4", status: true },
    { dictType: "disease_inspect_item", dictLabel: "铸铁管", dictValue: "cast_iron_pipe", dictSort: "5", status: true },
    { dictType: "disease_inspect_item", dictLabel: "沉沙坑", dictValue: "sediment_pit", dictSort: "6", status: true },
    { dictType: "disease_inspect_item", dictLabel: "接水盒", dictValue: "water_box", dictSort: "7", status: true },
    { dictType: "disease_inspect_item", dictLabel: "变形缝", dictValue: "expansion_joint", dictSort: "8", status: true },
    { dictType: "disease_structure_type", dictLabel: "盾构结构", dictValue: "shield", dictSort: "1", status: true },
    { dictType: "disease_structure_type", dictLabel: "桥梁结构", dictValue: "bridge", dictSort: "2", status: true },
    { dictType: "disease_structure_type", dictLabel: "明挖结构", dictValue: "open_cut", dictSort: "3", status: true },
    { dictType: "disease_structure_type", dictLabel: "敞口结构", dictValue: "open_air", dictSort: "4", status: true },
    { dictType: "disease_structure_type", dictLabel: "路基结构", dictValue: "subgrade", dictSort: "5", status: true },
    { dictType: "disease_structure_type", dictLabel: "暗挖结构", dictValue: "mined", dictSort: "6", status: true },
    { dictType: "disease_type", dictLabel: "鼓包", dictValue: "bulge", dictSort: "1", status: true },
    { dictType: "disease_type", dictLabel: "破损", dictValue: "damage", dictSort: "2", status: true },
    { dictType: "disease_type", dictLabel: "渗漏", dictValue: "leak", dictSort: "3", status: true },
    { dictType: "disease_type", dictLabel: "裂缝", dictValue: "crack", dictSort: "4", status: true },
    { dictType: "disease_type", dictLabel: "其他", dictValue: "other", dictSort: "5", status: true },
    { dictType: "disease_level", dictLabel: "轻微", dictValue: "minor", dictSort: "1", status: true },
    { dictType: "disease_level", dictLabel: "一般", dictValue: "normal", dictSort: "2", status: true },
    { dictType: "disease_level", dictLabel: "严重", dictValue: "serious", dictSort: "3", status: true },
    { dictType: "disease_development", dictLabel: "稳定", dictValue: "stable", dictSort: "1", status: true },
    { dictType: "disease_development", dictLabel: "发展", dictValue: "developing", dictSort: "2", status: true },
    { dictType: "disease_development", dictLabel: "恶化", dictValue: "worsening", dictSort: "3", status: true },
    { dictType: "disease_development", dictLabel: "病害未处理", dictValue: "untreated", dictSort: "4", status: true },
  ];

  function optionsByType(dictType) {
    return DISEASE_DICT_ROWS.filter(function (r) {
      return r.dictType === dictType && r.status !== false;
    })
      .sort(function (a, b) {
        return Number(a.dictSort) - Number(b.dictSort);
      })
      .map(function (r) {
        return { label: r.dictLabel, value: r.dictValue };
      });
  }

  function labelByValue(dictType, value) {
    var row = DISEASE_DICT_ROWS.find(function (r) {
      return r.dictType === dictType && r.dictValue === value;
    });
    return row ? row.dictLabel : value || "—";
  }

  function fillSelect(el, dictType, placeholder, selected) {
    if (!el) return;
    var opts = optionsByType(dictType);
    el.innerHTML =
      '<option value="">' +
      (placeholder || "请选择") +
      "</option>" +
      opts
        .map(function (o) {
          return (
            '<option value="' +
            o.value +
            '"' +
            (o.value === selected ? " selected" : "") +
            ">" +
            o.label +
            "</option>"
          );
        })
        .join("");
  }

  global.DiseaseDict = {
    types: DISEASE_DICT_TYPES,
    rows: DISEASE_DICT_ROWS,
    optionsByType: optionsByType,
    labelByValue: labelByValue,
    fillSelect: fillSelect,
  };
})(typeof window !== "undefined" ? window : this);
