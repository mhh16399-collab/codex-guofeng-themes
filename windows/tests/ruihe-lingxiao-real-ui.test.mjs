import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-ruihe-lingxiao");
const [theme, themeCss, engineCss, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.jpg")),
]);

const metadata = readImageMetadata(image, ".jpg");
assert.ok(metadata, "瑞鹤凌霄背景必须是可识别的 JPEG");
assert.equal(metadata.wide, true, "瑞鹤凌霄背景必须达到主页整窗绘制阈值");
assert.equal(theme.art.taskMode, "full", "瑞鹤凌霄任务页必须使用连续整窗背景");
assert.match(themeCss, /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(235,\s*241,\s*240,\s*0\.87\);[^}]*backdrop-filter:\s*blur\(19px\)\s+saturate\(0\.88\);/s);
assert.match(themeCss, /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(248,\s*245,\s*237,\s*0\.18\)/s);
assert.match(themeCss, /\[data-ds-part="composer"\][^{]*\{[^}]*border-width:\s*0;[^}]*box-shadow:\s*none;/s);
assert.match(engineCss, /data-dream-theme-id="preset-ruihe-lingxiao"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(235,\s*241,\s*240,\s*\.87\)\s*!important;[^}]*backdrop-filter:\s*blur\(19px\)\s+saturate\(88%\)\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-ruihe-lingxiao"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*rgba\(235,\s*241,\s*240,\s*\.87\)\s+0\s+var\(--ds-live-sidebar-width,\s*360px\)[^}]*backdrop-filter:\s*blur\(19px\)\s+saturate\(88%\)\s*!important;/s);

console.log("PASS: 瑞鹤凌霄冷蓝灰磨砂左栏连续延伸到窗口顶部。");
