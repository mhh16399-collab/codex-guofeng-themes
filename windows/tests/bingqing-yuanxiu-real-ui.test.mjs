import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const themeRoot = path.resolve(here, "../presets/preset-bingqing-yuanxiu");
const [theme, css, image, engineCss] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.png")),
  fs.readFile(path.join(themeRoot, "../../assets/dream-skin.css"), "utf8"),
]);

assert.equal(theme.id, "preset-bingqing-yuanxiu");
assert.equal(theme.name, "冰青远岫");
assert.equal(theme.image, "background.png");
assert.equal(theme.appearance, "light");
assert.equal(theme.art.taskMode, "full");
assert.equal(readImageMetadata(image, ".png")?.wide, true, "背景必须支持整窗绘制");
assert.match(css, /\[data-ds-part="sidebar"\][^{]*\{[^}]*backdrop-filter:\s*none;/s, "左侧不得虚化");
assert.doesNotMatch(css, /\[data-ds-part="composer"\][^{]*\{[^}]*(?:border-radius|box-shadow):/s, "不得重绘原生输入框");
assert.match(
  engineCss,
  /data-dream-theme-id="preset-bingqing-yuanxiu"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*background:\s*rgb\(232,\s*238,\s*238\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "原生 Windows 顶栏必须使用冰青冷灰色",
);

console.log("PASS: 冰青远岫使用整窗背景、清晰侧栏和冷灰 Windows 顶栏。");
