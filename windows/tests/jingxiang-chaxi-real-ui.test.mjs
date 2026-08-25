import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-jingxiang-chaxi");

const themeExists = await fs.access(themeRoot).then(() => true, () => false);
assert.equal(themeExists, true, "必须新增静香茶席主题目录");

const [theme, themeCss, engineCss, renderer, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "renderer-inject.js"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.png")),
]);

const metadata = readImageMetadata(image, ".png");
assert.ok(metadata, "静香茶席背景必须是可识别的 PNG");
assert.equal(metadata.wide, true, "静香茶席背景必须达到整窗绘制阈值");
assert.equal(theme.id, "preset-jingxiang-chaxi");
assert.equal(theme.name, "静香茶席");
assert.equal(theme.art.taskMode, "full");
assert.equal(theme.colors.text, "#2a2119", "浅宣纸主区必须使用深茶墨文字");
assert.equal(theme.colors.muted, "#6f6254", "次文字必须保持暖灰褐而不是绿色");

assert.match(
  themeCss,
  /\[data-ds-part="sidebar"\][^{]*\{[^}]*color:\s*#eadfce;[^}]*background-color:\s*rgba\(30,\s*25,\s*20,\s*0\.78\);[^}]*backdrop-filter:\s*blur\(4px\)\s+saturate\(0\.82\);/s,
  "侧栏必须按参考图使用深暖褐半透明木影",
);
assert.match(themeCss, /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(232,\s*210,\s*176,\s*0\.12\)/s);
assert.match(themeCss, /\[data-ds-part="header"\][^{]*\{[^}]*background-color:\s*rgba\(232,\s*210,\s*176,\s*0\.18\)/s);
assert.match(themeCss, /\[data-ds-part="thread"\][^{]*\{[^}]*background-color:\s*rgba\(244,\s*226,\s*198,\s*0\.14\)/s);
assert.doesNotMatch(
  themeCss,
  /\[data-ds-part="composer"\][^{]*\{[^}]*(?:border-radius|border-width|box-shadow):/s,
  "主题不得给输入框再画上边横线、第二圈边框或第二层圆角",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-jingxiang-chaxi"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(30,\s*25,\s*20,\s*\.78\)\s*!important;[^}]*backdrop-filter:\s*blur\(4px\)\s+saturate\(\.82\)\s*!important;/s,
  "真实侧栏必须覆盖为参考图的深暖褐色",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-jingxiang-chaxi"\][^{]*aside\.app-shell-left-panel\s+\*\s*\{[^}]*color:\s*#eadfce\s*!important;/s,
  "深色侧栏的图标和文字必须统一使用暖米白",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-jingxiang-chaxi"\][^{]*aside\.app-shell-left-panel\s+\[aria-current="page"\][^{]*\{[^}]*background:\s*rgba\(220,\s*202,\s*174,\s*\.72\)\s*!important;[^}]*color:\s*#2a2119\s*!important;/s,
  "当前会话必须按参考图使用浅茶色选中条和深色文字",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-jingxiang-chaxi"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*background:\s*rgba\(30,\s*25,\s*20,\s*\.22\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "顶部整条必须像参考图一样让同一张背景连续穿过，只加统一暖褐透层",
);
assert.match(
  engineCss,
  /@layer\s+dreamskin-accessibility\s*\{[^}]*data-dream-theme-id="preset-jingxiang-chaxi"\][^{]*aside\.app-shell-left-panel\s+\*\s*\{[^}]*color:\s*#eadfce\s*!important;/s,
  "浅色外壳的无障碍规则不得把深色侧栏文字重新压成深茶色",
);
assert.match(
  engineCss,
  /@layer\s+dreamskin-accessibility\s*\{[\s\S]*?data-dream-theme-id="preset-jingxiang-chaxi"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s+\*\s*\{[^}]*color:\s*#eadfce\s*!important;/,
  "连续暖茶顶栏必须按参考图使用清晰的暖米白菜单文字",
);
assert.doesNotMatch(
  engineCss,
  /data-dream-theme-id="preset-jingxiang-chaxi"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*linear-gradient|--ds-jingxiang-sidebar-edge/s,
  "顶部不得再按侧栏边缘切成两段",
);
assert.match(
  renderer,
  /setAttribute\(root,\s*"data-dream-theme-id",\s*themeId\)/,
  "运行时必须写入主题 ID，确保顶部和侧栏专属规则真的生效",
);

console.log("PASS: 静香茶席严格复刻暖褐茶室、连续顶栏与单层输入框。");
