import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-citong-haibo");

const themeExists = await fs.access(themeRoot).then(() => true, () => false);
assert.equal(themeExists, true, "必须新增刺桐海舶主题目录");

const [theme, themeCss, engineCss, renderer, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "renderer-inject.js"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.png")),
]);

const metadata = readImageMetadata(image, ".png");
assert.ok(metadata, "刺桐海舶背景必须是可识别的 PNG");
assert.equal(metadata.wide, true, "刺桐海舶背景必须达到整窗绘制阈值");
assert.equal(theme.id, "preset-citong-haibo");
assert.equal(theme.name, "刺桐海舶");
assert.equal(theme.art.taskMode, "full");
assert.equal(theme.colors.text, "#172a31", "雾海主区必须使用深蓝墨文字");
assert.equal(theme.colors.muted, "#647477", "次文字必须保持船坞雾灰蓝");

assert.match(
  themeCss,
  /\[data-ds-part="sidebar"\][^{]*\{[^}]*color:\s*#d7d6cc;[^}]*background-color:\s*rgba\(6,\s*25,\s*33,\s*0\.82\);[^}]*backdrop-filter:\s*blur\(2px\)\s+saturate\(0\.78\);/s,
  "侧栏必须按参考图使用深蓝黑半透明木船舱",
);
assert.match(themeCss, /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(220,\s*225,\s*218,\s*0\.10\)/s);
assert.match(themeCss, /\[data-ds-part="header"\][^{]*\{[^}]*background-color:\s*rgba\(207,\s*214,\s*207,\s*0\.12\)/s);
assert.match(
  themeCss,
  /\[data-ds-part="thread"\][^{]*\{[^}]*background-color:\s*rgba\(225,\s*229,\s*224,\s*0\.42\)/s,
  "正文承载区必须有足够的雾灰纸层，避免船体细节穿过文字",
);
assert.doesNotMatch(
  themeCss,
  /\[data-ds-part="composer"\][^{]*\{[^}]*(?:background|border-radius|border-width|box-shadow):/s,
  "主题不得给输入框再画上边横线、第二圈边框、第二层圆角或额外底色",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-citong-haibo"\][^{]*\[class\*="_ComposerLayoutRoot_"\]\s*\{[^}]*background:\s*rgba\(226,\s*222,\s*210,\s*\.94\)\s*!important;[^}]*border:\s*1px\s+solid\s+rgba\(76,\s*64,\s*50,\s*\.54\)\s*!important;[^}]*box-shadow:\s*0\s+10px\s+28px\s+rgba\(5,\s*20,\s*26,\s*\.20\)\s*!important;/s,
  "真实输入框外壳必须是参考图的旧纸色单层描边，且不得使用内阴影制造上横线",
);

assert.match(
  engineCss,
  /data-dream-theme-id="preset-citong-haibo"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(6,\s*25,\s*33,\s*\.82\)\s*!important;[^}]*backdrop-filter:\s*blur\(2px\)\s+saturate\(\.78\)\s*!important;/s,
  "真实侧栏必须覆盖为参考图的深蓝黑船舱色",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-citong-haibo"\][^{]*aside\.app-shell-left-panel\s+\*\s*\{[^}]*color:\s*#d7d6cc\s*!important;/s,
  "深色侧栏的图标和文字必须统一使用雾米白",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-citong-haibo"\][^{]*aside\.app-shell-left-panel\s+\[aria-current="page"\][^{]*\{[^}]*background:\s*rgba\(86,\s*106,\s*103,\s*\.68\)\s*!important;[^}]*border-color:\s*rgba\(180,\s*142,\s*88,\s*\.55\)\s*!important;/s,
  "当前会话必须使用参考图的灰青玻璃条和旧铜描边",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-citong-haibo"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*background:\s*rgba\(8,\s*24,\s*31,\s*\.22\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "顶部整条必须让同一张海舶背景连续穿过，只加统一蓝黑透层",
);
assert.match(
  engineCss,
  /@layer\s+dreamskin-accessibility\s*\{[\s\S]*?data-dream-theme-id="preset-citong-haibo"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s+\*\s*\{[^}]*color:\s*#d7d6cc\s*!important;/,
  "连续深色顶栏必须使用清晰的雾米白菜单文字",
);
assert.doesNotMatch(
  engineCss,
  /data-dream-theme-id="preset-citong-haibo"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*linear-gradient|--ds-citong-sidebar-edge/s,
  "顶部不得按侧栏边缘切成两段",
);
assert.match(
  renderer,
  /setAttribute\(root,\s*"data-dream-theme-id",\s*themeId\)/,
  "运行时必须写入主题 ID，确保刺桐海舶专属规则真的生效",
);

console.log("PASS: 刺桐海舶严格复刻雾港船坞、连续顶栏与单层输入框。");
