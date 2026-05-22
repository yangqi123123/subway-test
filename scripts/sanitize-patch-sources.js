const fs = require("fs");
const path = require("path");

var file = path.join(__dirname, "patch-in-disease-form2.js");
var s = fs.readFileSync(file, "utf8");
s = s.replace(
  /'<' \+ 'div class="flex items-center">' \+ imgs \+ '<\/' \+ d \+ '>/g,
  "'<${TAG} class=\"flex items-center\">' + imgs + '</${TAG}>'"
);
fs.writeFileSync(file, s);
console.log(/newJs[\s\S]*\+\s*d\s*\+/.test(s) ? "warn: may still match" : "ok");
