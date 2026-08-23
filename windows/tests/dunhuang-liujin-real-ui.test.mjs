import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-dunhuang-liujin");

const [themeCss, engineCss, themeJson] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
]);

assert.equal(themeJson.art.taskMode, "full", "敦煌鎏金任务页必须使用整窗低遮罩模式");

assert.match(
  themeCss,
  /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(21,\s*18,\s*16,\s*0\.24\);[^}]*backdrop-filter:\s*none;/s,
  "敦煌鎏金侧栏必须使用低透明黑金遮罩并关闭模糊",
);
assert.match(
  themeCss,
  /\[data-ds-part="composer"\][^{]*\{[^}]*background-color:\s*rgba\(27,\s*24,\s*21,\s*0\.62\);[^}]*backdrop-filter:\s*none;/s,
  "敦煌鎏金输入框必须降低不透明度并关闭模糊",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-dunhuang-liujin"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(21,\s*18,\s*16,\s*\.24\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "可信运行时必须覆盖原生侧栏的不透明渐变",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-dunhuang-liujin"\]\s*\{[^}]*--ds-immersive-edge:\s*rgba\(21,\s*18,\s*16,\s*\.22\);[^}]*--ds-immersive-mid:\s*rgba\(21,\s*18,\s*16,\s*\.14\);[^}]*--ds-immersive-far:\s*rgba\(21,\s*18,\s*16,\s*\.08\);[^}]*--ds-immersive-composer-solid:\s*rgba\(27,\s*24,\s*21,\s*\.62\);/s,
  "敦煌鎏金任务页必须覆盖为低透明黑金层",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-dunhuang-liujin"\][^{]*\[class\*="_ComposerLayoutRoot_"\][^{]*\{[^}]*background:\s*rgba\(27,\s*24,\s*21,\s*\.62\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "敦煌鎏金原生输入框外层不得保留 96% 不透明底色",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-dunhuang-liujin"\][^{]*main:is\([^}]*>\s*header:is\([^}]*\{[^}]*background:\s*rgba\(21,\s*18,\s*16,\s*\.28\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "敦煌鎏金顶栏不得在 full 模式下退回实色黑底",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-dunhuang-liujin"\]::after\s*\{[^}]*pointer-events:\s*none\s*!important;[^}]*position:\s*fixed\s*!important;[^}]*top:\s*0\s*!important;[^}]*right:\s*0\s*!important;[^}]*width:\s*168px\s*!important;[^}]*height:\s*36px\s*!important;[^}]*linear-gradient\([^}]*rgba\(240,\s*228,\s*208,\s*\.92\)[^}]*z-index:\s*2147483646\s*!important;/s,
  "敦煌鎏金必须在 Windows 原生窗口三键下提供浅金衬底，且不能拦截点击",
);

console.log("PASS: 敦煌鎏金任务区、卡片和输入框保持低透明，侧栏及窗口三键可见。\n");
