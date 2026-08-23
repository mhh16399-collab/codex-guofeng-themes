import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-jingtai-hualan");
const [theme, themeCss, engineCss, renderer, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "renderer-inject.js"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.jpg")),
]);

const metadata = readImageMetadata(image, ".jpg");
assert.ok(metadata, "景泰华蓝背景必须是可识别的 JPEG");
assert.equal(metadata.wide, true, "景泰华蓝背景必须达到主页整窗绘制阈值");
assert.equal(theme.art.taskMode, "full", "景泰华蓝任务页必须使用连续整窗背景");
assert.match(themeCss, /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(5,\s*19,\s*34,\s*0\.72\);[^}]*backdrop-filter:\s*none;/s);
assert.match(themeCss, /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(11,\s*33,\s*55,\s*0\.18\)/s);
assert.match(themeCss, /\[data-ds-part="composer"\][^{]*\{[^}]*border-width:\s*0;[^}]*box-shadow:\s*none;[^}]*backdrop-filter:\s*none;/s);
assert.match(engineCss, /data-dream-theme-id="preset-jingtai-hualan"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(5,\s*19,\s*34,\s*\.72\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-jingtai-hualan"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*--ds-live-sidebar-width/s);
assert.match(renderer, /--ds-live-sidebar-width/);
assert.match(engineCss, /data-dream-theme-id="preset-jingtai-hualan"\][^{]*\[class\*="_ComposerLayoutRoot_"\]\s*\{[^}]*background:\s*rgba\(11,\s*33,\s*55,\s*\.62\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-jingtai-hualan"\]::after\s*\{[^}]*pointer-events:\s*none\s*!important;[^}]*width:\s*168px\s*!important;/s);

console.log("PASS: 景泰华蓝左侧保持清晰纹样，深蓝遮罩连续延伸到窗口顶部。");
