import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const windowsRoot = path.resolve(here, "..");
const themeRoot = path.join(windowsRoot, "presets", "preset-qingming-changjuan");

const themeExists = await fs.access(themeRoot).then(() => true, () => false);
assert.equal(themeExists, true, "必须新增清明长卷主题目录");
const contractFiles = ["theme.json", "theme.css", "background.png"];
for (const file of contractFiles) {
  const exists = await fs.access(path.join(themeRoot, file)).then(() => true, () => false);
  assert.equal(exists, true, `清明长卷主题缺少 ${file}`);
}

const [theme, themeCss, image] = await Promise.all([
  fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
  fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
  fs.readFile(path.join(themeRoot, "background.png")),
]);

const metadata = readImageMetadata(image, ".png");
assert.ok(metadata, "清明长卷背景必须是可识别的 PNG");
assert.equal(metadata.wide, true, "清明长卷背景必须达到整窗绘制阈值");
assert.equal(theme.id, "preset-qingming-changjuan");
assert.equal(theme.name, "清明长卷");
assert.equal(theme.image, "background.png");
assert.equal(theme.appearance, "light");
assert.equal(theme.art.taskMode, "full");
assert.equal(theme.colors.text, "#302c26");
assert.equal(theme.colors.accent, "#a45135");

assert.match(
  themeCss,
  /\[data-ds-part="sidebar"\][^{]*\{[^}]*color:\s*#2f2c27;[^}]*background-color:\s*rgba\(242,\s*235,\s*219,\s*0\.58\);/s,
  "侧栏必须使用参考图中的浅宣纸层与深墨文字",
);
assert.match(
  themeCss,
  /\[data-ds-part="sidebar"\][^{]*\{[^}]*backdrop-filter:\s*none;/s,
  "侧栏是独立宣纸画面，不得使用毛玻璃虚化",
);
assert.match(
  themeCss,
  /\[data-ds-part="header"\][^{]*\{[^}]*background-color:\s*rgba\(250,\s*247,\s*239,\s*0\.38\);/s,
  "顶栏必须保持宣纸背景连续可见",
);
assert.doesNotMatch(
  themeCss,
  /\[data-ds-part="composer"\][^{]*\{[^}]*(?:border-radius|border-width|box-shadow):/s,
  "主题不得给原生输入框重复绘制边框或圆角",
);

console.log("PASS: 清明长卷使用纯背景、浅宣纸侧栏和原生单层输入框。");
