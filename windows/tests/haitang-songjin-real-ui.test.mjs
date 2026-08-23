import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-haitang-songjin");

const [theme, themeCss, engineCss] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
]);

assert.equal(theme.art.taskMode, "full", "海棠宋锦任务页必须使用连续整窗背景");
assert.match(
  themeCss,
  /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(245,\s*236,\s*219,\s*0\.22\);[^}]*backdrop-filter:\s*none;/s,
  "海棠宋锦侧栏必须使用低透明锦纸层且不模糊底图",
);
assert.match(
  themeCss,
  /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(247,\s*240,\s*226,\s*0\.18\)/s,
  "海棠宋锦正文区不得保留不透明遮罩",
);
assert.match(
  themeCss,
  /\[data-ds-part="composer"\][^{]*\{[^}]*border-width:\s*0;[^}]*box-shadow:\s*none;/s,
  "海棠宋锦输入框内层不得重复绘制第二圈边框",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-haitang-songjin"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(245,\s*236,\s*219,\s*\.22\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "可信运行时必须压掉海棠宋锦原生侧栏的不透明渐变",
);

console.log("PASS: 海棠宋锦整窗连续、左右无遮罩且输入框只有一圈边界。");
