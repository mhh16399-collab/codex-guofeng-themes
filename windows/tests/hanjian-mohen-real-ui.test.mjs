import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-hanjian-mohen");
const [theme, themeCss, engineCss, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(windowsRoot, "assets", "dream-skin.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.jpg")),
]);

const metadata = readImageMetadata(image, ".jpg");
assert.ok(metadata, "汉简墨痕背景必须是可识别的 JPEG");
assert.equal(theme.art.taskMode, "ambient", "汉简墨痕必须保留现有任务页背景模式");
assert.match(themeCss, /\[data-ds-part="sidebar"\][^{]*\{[^}]*background-color:\s*rgba\(23,\s*18,\s*14,\s*0\.64\);[^}]*backdrop-filter:\s*none;/s);
assert.match(engineCss, /data-dream-theme-id="preset-hanjian-mohen"\][^{]*aside\.app-shell-left-panel\s*\{[^}]*background:\s*rgba\(23,\s*18,\s*14,\s*\.64\)\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s);
assert.match(engineCss, /data-dream-theme-id="preset-hanjian-mohen"\][^{]*\[class\*="_ApplicationMenuTopBar_"\]\s*\{[^}]*rgba\(23,\s*18,\s*14,\s*\.64\)\s+0\s+var\(--ds-live-sidebar-width,\s*360px\)[^}]*backdrop-filter:\s*none\s*!important;/s);

console.log("PASS: 汉简墨痕深棕黑清晰左栏连续延伸到窗口顶部。");
