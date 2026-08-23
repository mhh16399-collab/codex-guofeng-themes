import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-qianli-jiangshan");

const [theme, themeCss, engineCss, renderer, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "renderer-inject.js"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.jpg")),
]);

const metadata = readImageMetadata(image, ".jpg");
assert.ok(metadata, "千里江山背景必须是可识别的 JPEG");
assert.equal(metadata.wide, true, "背景必须达到 DreamSkin 整窗绘制阈值（宽高比至少 1.75）");
assert.equal(theme.art.taskMode, "full", "任务页必须保留清晰的完整千里江山背景");
assert.doesNotMatch(
  themeCss,
  /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*var\(--ds-theme-color-background\)/s,
  "主题不得用不透明主题底色覆盖千里江山主背景",
);
assert.match(
  engineCss,
  /data-dream-theme-id="preset-qianli-jiangshan"\][^{]*\[data-dream-art-wide="true"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(231,\s*238,\s*228,\s*\.58\)\s*!important;[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(90%\)\s*!important;/s,
  "千里江山左侧必须使用原稿浅青遮罩，并让底图在下方柔和模糊",
);
assert.match(renderer, /"data-dream-theme-id"/);
assert.match(renderer, /setAttribute\(root,\s*"data-dream-theme-id",\s*themeId\)/);
assert.match(
  themeCss,
  /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(231,\s*238,\s*228,\s*0\.58\);[^}]*backdrop-filter:\s*blur\(6px\)\s+saturate\(0\.9\);/s,
  "侧栏必须使用原稿浅青蒙版和柔和磨砂",
);
assert.match(
  themeCss,
  /\[data-ds-part="main"\][^{]*\{[^}]*background-color:\s*rgba\(247,\s*243,\s*232,\s*0\.26\)/s,
  "主区必须使用半透明宣纸蒙版并透出画面",
);
assert.match(
  themeCss,
  /\[data-ds-part="header"\][^{]*\{[^}]*background-color:\s*rgba\(247,\s*243,\s*232,\s*0\.18\);[^}]*border-bottom-color:\s*transparent;[^}]*backdrop-filter:\s*none;/s,
  "千里江山顶栏必须透出山水并移除白色分隔杠",
);
assert.match(
  themeCss,
  /\[data-ds-part="thread"\][^{]*\{[^}]*background-color:\s*rgba\(247,\s*243,\s*232,\s*0\.18\)/s,
  "任务滚动区必须保持低遮罩，让山水背景清晰可见",
);
assert.match(
  engineCss,
  /html\[data-dream-skin="active"\]\s*\{[^}]*--color-background-surface:\s*var\(--ds-bg\)\s*!important;[^}]*--color-background-control:\s*rgb\(var\(--ds-panel-rgb\)\s*\/\s*\.96\)\s*!important;[^}]*--color-background-button-primary:\s*var\(--ds-accent\)\s*!important;/s,
  "启用皮肤后必须把 Codex 原生粉紫表面与主按钮映射到当前主题",
);
assert.match(
  engineCss,
  /html\[data-dream-skin="active"\]\s*\{[^}]*--color-background-primary-solid:\s*var\(--ds-accent\)\s*!important;[^}]*--color-text-foreground-secondary:\s*var\(--ds-muted\)\s*!important;/s,
  "新版 Codex 的主操作与状态文字令牌必须映射到主题色，不能残留紫色",
);
assert.match(
  engineCss,
  /main:is\([^}]+\):has\(\[role="main"\]\)::after\s*\{\s*content:\s*none\s*!important;/s,
  "首页已有副标题时不得再把英文口号压在输入框上",
);
assert.match(
  engineCss,
  /composer[^}]+button:is\(\[class~="bg-token-foreground"\],\s*\[class~="bg-primary-solid"\]\)\s*\{[^}]*background:\s*var\(--ds-accent\)\s*!important;[^}]*color:\s*var\(--ds-on-accent\)\s*!important;/s,
  "输入框主操作按钮必须使用主题石青色，不能残留原生紫色",
);
assert.match(
  engineCss,
  /\[data-ds-part="header"\]::before,\s*\n\[data-ds-part="header"\]::after\s*\{\s*content:\s*none\s*!important;/,
  "新版 Codex 顶栏必须隐藏 DreamSkin 的宣传伪元素",
);
assert.match(
  engineCss,
  /html\[data-dream-skin="active"\]\s*\{[^}]*--color-token-foreground:\s*var\(--ds-text\);[^}]*--color-token-text-secondary:\s*var\(--ds-muted\);/s,
  "浅色国风背景必须把 Codex 原生正文颜色映射到主题文本色",
);
assert.match(
  engineCss,
  /html\[data-dream-skin="active"\]\[data-dream-shell="light"\][^{]*\[class\*="_markdown" i\]\s*\{[^}]*color:\s*var\(--ds-text\)\s*!important;/s,
  "新版 Codex Markdown 正文必须直接使用浅色主题的深墨文本色",
);
assert.match(
  engineCss,
  /\[data-ds-part="sidebar"\]\s+\*,[\s\S]{0,500}?\{[^}]*color:\s*var\(--ds-text\)\s*!important;/,
  "浅色主题侧栏的原生深色模式子节点必须改为深墨色",
);
assert.match(
  engineCss,
  /data-dream-shell="light"\]\s*\n\s*\[class\*="_ComposerLayoutRoot_"\]:has\(\[data-ds-part="composer"\]\)\s*\{[^}]*background:\s*rgb\(var\(--ds-panel-rgb\)\s*\/\s*\.94\)\s*!important;/s,
  "浅色主题输入框必须使用浅宣纸表面",
);
assert.match(
  engineCss,
  /data-dream-shell="light"\][^{]*\[class\*="_ApplicationMenuTopBar_"\][\s\S]{0,500}?\{[^}]*color:\s*var\(--ds-text\)\s*!important;/,
  "浅色主题的 Windows 顶部菜单必须使用深墨色",
);
assert.match(
  engineCss,
  /data-dream-shell="light"\][^{]*\.ProseMirror\s+\[data-placeholder\]::after\s*\{[^}]*color:\s*rgb\(var\(--ds-muted-rgb\)\s*\/\s*\.92\)\s*!important;/s,
  "浅色主题输入区占位文字必须使用可读的深灰绿色",
);
assert.match(
  engineCss,
  /\[class\*="text-codex-description"\][\s\S]{0,300}?\{[^}]*color:\s*var\(--ds-text\)\s*!important;/,
  "浅色主题的活动记录和状态文字不得继续使用原生白色",
);
assert.match(
  engineCss,
  /data-dream-shell="light"\][^{]*\[class~="bg-background-primary-soft\/70"\]\s*\{[^}]*background:\s*rgb\(var\(--ds-panel-rgb\)\s*\/\s*\.88\)\s*!important;[^}]*border-color:\s*var\(--ds-line\)\s*!important;/s,
  "浅色主题的步骤进度与持续目标条必须使用浅宣纸表面",
);

console.log("PASS: 千里江山使用真实 Codex 分层渲染且不遮挡原生顶栏。");
