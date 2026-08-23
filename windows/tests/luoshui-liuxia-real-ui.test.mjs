import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const preset = path.join(root, "windows", "presets", "preset-luoshui-liuxia");
const theme = JSON.parse(fs.readFileSync(path.join(preset, "theme.json"), "utf8"));
const themeCss = fs.readFileSync(path.join(preset, "theme.css"), "utf8");
const engineCss = fs.readFileSync(path.join(root, "windows", "assets", "dream-skin.css"), "utf8");
const image = fs.readFileSync(path.join(preset, "background.jpg"));

assert.equal(theme.id, "preset-luoshui-liuxia");
assert.equal(theme.art.taskMode, "ambient");
assert.equal(image[0], 0xff);
assert.equal(image[1], 0xd8);

assert.match(themeCss, /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(22,\s*20,\s*40,\s*0\.64\);[^}]*backdrop-filter:\s*none;/s);
assert.match(engineCss, /data-dream-theme-id="preset-luoshui-liuxia"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(22,\s*20,\s*40,\s*\.64\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-luoshui-liuxia"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*rgba\(22,\s*20,\s*40,\s*\.64\)\s+0\s+var\(--ds-live-sidebar-width,\s*360px\)[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-luoshui-liuxia"\]:has\(main:is\([^)]*\)\s+\[role="main"\]\)\s+body\s*\{[^}]*background-image:\s*var\(--dream-skin-art\)\s*!important;[^}]*background-size:\s*cover\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-luoshui-liuxia"\][^{]*main:is\([^)]*\):has\(\[role="main"\]\)\s*\{[^}]*background:\s*linear-gradient\(90deg,[^}]*var\(--ds-immersive-far\)\)\s*!important;[^}]*border:\s*0\s*!important;/s);

console.log("PASS: 洛水流霞左栏连续，并在新对话首页整窗绘制背景。");
