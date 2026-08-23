import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-heiqi-luodian");
const [theme, themeCss, engineCss, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.jpg")),
]);

const metadata = readImageMetadata(image, ".jpg");
assert.ok(metadata, "黑漆螺钿背景必须是可识别的 JPEG");
assert.equal(metadata.wide, true, "黑漆螺钿背景必须达到主页整窗绘制阈值");
assert.equal(theme.art.taskMode, "full", "黑漆螺钿任务页必须使用连续整窗背景");
assert.match(themeCss, /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(8,\s*10,\s*11,\s*0\.58\);[^}]*backdrop-filter:\s*none;/s);
assert.match(themeCss, /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(17,\s*20,\s*22,\s*0\.18\)/s);
assert.match(themeCss, /\[data-ds-part="composer"\][^{]*\{[^}]*border-width:\s*0;[^}]*box-shadow:\s*none;[^}]*backdrop-filter:\s*none;/s);
assert.match(engineCss, /data-dream-theme-id="preset-heiqi-luodian"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(8,\s*10,\s*11,\s*\.58\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-heiqi-luodian"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*rgba\(8,\s*10,\s*11,\s*\.58\)\s+0\s+var\(--ds-live-sidebar-width,\s*360px\)[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-heiqi-luodian"\][^{]*\[class\*="_ComposerLayoutRoot_"\]\s*\{[^}]*background:\s*rgba\(17,\s*20,\s*22,\s*\.62\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-heiqi-luodian"\]::after\s*\{[^}]*pointer-events:\s*none\s*!important;[^}]*width:\s*168px\s*!important;/s);

console.log("PASS: 黑漆螺钿左栏按原稿深黑压暗、无模糊，并连续延伸到窗口顶部。");
