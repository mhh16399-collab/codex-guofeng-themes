import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-sunmao-danying");
const [theme, themeCss, engineCss, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.jpg")),
]);

const metadata = readImageMetadata(image, ".jpg");
assert.ok(metadata, "榫卯丹楹背景必须是可识别的 JPEG");
assert.equal(metadata.wide, true, "榫卯丹楹背景必须达到主页整窗绘制阈值");
assert.equal(theme.art.taskMode, "full", "榫卯丹楹任务页必须使用连续整窗背景");
assert.match(themeCss, /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(239,\s*225,\s*206,\s*0\.68\);[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(0\.9\);/s);
assert.match(themeCss, /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(248,\s*241,\s*231,\s*0\.18\)/s);
assert.match(themeCss, /\[data-ds-part="composer"\][^{]*\{[^}]*border-width:\s*0;[^}]*box-shadow:\s*none;/s);
assert.match(engineCss, /data-dream-theme-id="preset-sunmao-danying"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(239,\s*225,\s*206,\s*\.68\)\s*!important;[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(\.9\)\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-sunmao-danying"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*rgba\(239,\s*225,\s*206,\s*\.68\)\s+0\s+var\(--ds-live-sidebar-width,\s*360px\)[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(\.9\)\s*!important;/s);

console.log("PASS: 榫卯丹楹左栏按原稿使用暖象牙色轻柔遮罩，并连续延伸到窗口顶部。");
