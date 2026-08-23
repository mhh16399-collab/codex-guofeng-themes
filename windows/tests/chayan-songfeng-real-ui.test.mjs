import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-chayan-songfeng");

const [theme, themeCss, engineCss, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.jpg")),
]);

const metadata = readImageMetadata(image, ".jpg");
assert.ok(metadata, "茶烟松风背景必须是可识别的 JPEG");
assert.equal(metadata.wide, true, "茶烟松风背景必须达到与千里江山一致的整窗绘制阈值");
assert.equal(theme.art.taskMode, "full", "茶烟松风任务页必须使用连续整窗背景");
assert.match(
  themeCss,
  /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(240,\s*232,\s*215,\s*0\.58\);[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(0\.9\);/s,
  "侧栏必须使用暖米色宣纸层并轻微柔化底图",
);
assert.match(
  themeCss,
  /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(248,\s*240,\s*227,\s*0\.18\)/s,
  "正文区必须使用低透明宣纸层",
);
assert.match(
  themeCss,
  /\[data-ds-part="thread"\][^{]*\{[^}]*background-color:\s*rgba\(248,\s*240,\s*227,\s*0\.14\)/s,
  "任务滚动区必须透出连续背景",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-chayan-songfeng"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(240,\s*232,\s*215,\s*\.58\)\s*!important;[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(\.9\)\s*!important;/s,
  "可信运行时必须覆盖原生侧栏的不透明渐变",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-chayan-songfeng"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*rgba\(240,\s*232,\s*215,\s*\.58\)\s+0\s+var\(--ds-live-sidebar-width,\s*360px\)[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(\.9\)\s*!important;/s,
  "左侧暖米色遮罩必须按真实侧栏宽度延伸到窗口顶部",
);
assert.doesNotMatch(
  engineCss,
  /data-dream-theme-id="preset-chayan-songfeng"\][^{]*main:is\(/s,
  "茶烟松风达到整窗素材阈值后不得保留无效的主题专属主壳补丁",
);
assert.match(
  themeCss,
  /\[data-ds-part="composer"\][^{]*\{[^}]*border-width:\s*0;[^}]*box-shadow:\s*none;/s,
  "输入框内层不得重复绘制第二圈边框",
);

console.log("PASS: 茶烟松风左栏按原稿使用暖米色轻柔遮罩，并连续延伸到窗口顶部。");
