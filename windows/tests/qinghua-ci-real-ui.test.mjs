import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-qinghua-ci");

const [themeCss, engineCss] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
]);

assert.match(
  themeCss,
  /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(240,\s*246,\s*248,\s*0\.58\);[^}]*backdrop-filter:\s*none;/s,
  "青花瓷侧栏必须使用半透明冷瓷白校色层且不模糊底图",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-qinghua-ci"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(240,\s*246,\s*248,\s*\.58\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "可信运行时必须压掉青花瓷侧栏底图的暖黄色偏色",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-qinghua-ci"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*background:\s*rgba\(240,\s*246,\s*248,\s*\.72\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "青花瓷顶部菜单栏必须用冷瓷白校色，不能保留暖黄色",
);
assert.match(
  themeCss,
  /\[data-ds-part="composer"\][^{]*\{[^}]*border-width:\s*0;[^}]*box-shadow:\s*none;/s,
  "青花瓷输入框内层不得重复绘制第二圈边框",
);

console.log("PASS: 青花瓷侧栏清晰，输入框只有一圈边界。");
