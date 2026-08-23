import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-tangsancai");
const [theme, themeCss, engineCss, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.jpg")),
]);

const metadata = readImageMetadata(image, ".jpg");
assert.ok(metadata, "唐三彩背景必须是可识别的 JPEG");
assert.equal(metadata.wide, true, "唐三彩背景必须达到主页整窗绘制阈值");
assert.equal(theme.art.taskMode, "full", "唐三彩任务页必须使用连续整窗背景");
assert.match(themeCss, /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(239,\s*225,\s*194,\s*0\.82\);[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(0\.88\);/s);
assert.match(themeCss, /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(248,\s*237,\s*218,\s*0\.18\)/s);
assert.match(themeCss, /\[data-ds-part="composer"\][^{]*\{[^}]*border-width:\s*0;[^}]*box-shadow:\s*none;/s);
assert.match(engineCss, /data-dream-theme-id="preset-tangsancai"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(239,\s*225,\s*194,\s*\.82\)\s*!important;[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(\.88\)\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-tangsancai"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*rgba\(239,\s*225,\s*194,\s*\.82\)\s+0\s+var\(--ds-live-sidebar-width,\s*360px\)[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(\.88\)\s*!important;/s);

console.log("PASS: 唐三彩暖釉色轻柔左栏连续延伸到窗口顶部。");
