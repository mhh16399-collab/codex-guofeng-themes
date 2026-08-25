import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const css = await fs.readFile(path.resolve(here, "../../runtime/dream-skin.css"), "utf8");

assert.doesNotMatch(
  css,
  /__DREAM_SELECTOR_HEADER_TINT__::before\s*\{[^}]*content:\s*var\(--dream-skin-name/s,
  "任务顶栏不得注入主题名称和品牌副标题",
);
assert.doesNotMatch(
  css,
  /__DREAM_SELECTOR_HEADER_TINT__::after\s*\{[^}]*content:\s*var\(--dream-skin-status/s,
  "任务顶栏不得注入状态文字",
);
assert.match(
  css,
  /__DREAM_SELECTOR_HEADER_TINT__::before,\s*[\s\S]*?__DREAM_SELECTOR_HEADER_TINT__::after\s*\{\s*content:\s*none\s*!important;/,
  "任务顶栏伪元素必须被显式关闭",
);

console.log("PASS: Windows 原生任务顶栏不再显示皮肤品牌装饰。");
