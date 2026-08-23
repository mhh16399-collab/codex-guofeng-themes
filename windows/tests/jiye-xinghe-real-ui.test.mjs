import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-jiye-xinghe");

const [theme, themeCss, engineCss] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
]);

assert.equal(theme.art.taskMode, "full", "霁夜星河任务页必须使用连续整窗背景");
assert.match(themeCss, /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(9,\s*20,\s*33,\s*0\.24\);[^}]*backdrop-filter:\s*none;/s);
assert.match(themeCss, /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(14,\s*26,\s*40,\s*0\.18\)/s);
assert.match(themeCss, /\[data-ds-part="composer"\][^{]*\{[^}]*border-width:\s*0;[^}]*box-shadow:\s*none;[^}]*backdrop-filter:\s*none;/s);
assert.match(engineCss, /data-dream-theme-id="preset-jiye-xinghe"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(9,\s*20,\s*33,\s*\.24\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-jiye-xinghe"\][^{]*\[class\*="_ComposerLayoutRoot_"\]\s*\{[^}]*background:\s*rgba\(14,\s*26,\s*40,\s*\.62\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-jiye-xinghe"\]::after\s*\{[^}]*pointer-events:\s*none\s*!important;[^}]*width:\s*168px\s*!important;/s);

console.log("PASS: 霁夜星河整窗连续、无遮罩模糊且输入框只有一圈边界。");
