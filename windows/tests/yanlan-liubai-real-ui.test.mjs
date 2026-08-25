import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const themeRoot = path.resolve(here, "../presets/preset-yanlan-liubai");

const [theme, css, image, engineCss] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.png")),
  fs.readFile(path.join(themeRoot, "../../assets/dream-skin.css"), "utf8"),
]);

assert.equal(theme.id, "preset-yanlan-liubai");
assert.equal(theme.name, "烟岚留白");
assert.equal(theme.image, "background.png");
assert.equal(theme.appearance, "light");
assert.equal(theme.art.taskMode, "full");
assert.equal(readImageMetadata(image, ".png")?.wide, true, "背景必须支持整窗绘制");
assert.match(css, /\[data-ds-part="sidebar"\][^{]*\{[^}]*backdrop-filter:\s*none;/s, "左侧不得虚化");
assert.doesNotMatch(css, /\[data-ds-part="composer"\][^{]*\{[^}]*(?:border-radius|box-shadow):/s, "不得重绘原生输入框");
assert.match(
  engineCss,
  /data-dream-theme-id="preset-yanlan-liubai"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*background:\s*rgb\(232,\s*235,\s*231\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "原生 Windows 顶栏必须使用冷灰主题色，不得透出暖色壁纸",
);

console.log("PASS: 烟岚留白使用整窗水墨背景、清晰侧栏和原生输入框。");
