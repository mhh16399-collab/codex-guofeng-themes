import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { readImageMetadata } from "../scripts/image-metadata.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const presetsRoot = path.resolve(here, "../presets");
const engineCss = await fs.readFile(path.resolve(here, "../assets/dream-skin.css"), "utf8");

const expectedThemes = [
  {
    id: "preset-lanting-qushui",
    name: "兰亭曲水",
    appearance: "light",
    text: "#263334",
    accent: "#537c76",
    topBar: "rgb(243, 239, 228)",
  },
  {
    id: "preset-yanshan-qiuse",
    name: "燕山秋色",
    appearance: "light",
    text: "#332d27",
    accent: "#a65a38",
    topBar: "rgb(238, 229, 213)",
  },
  {
    id: "preset-chibi-yehang",
    name: "赤壁夜航",
    appearance: "dark",
    text: "#e6e2da",
    accent: "#b45c45",
    topBar: "rgb(12, 21, 31)",
  },
];

for (const expected of expectedThemes) {
  const themeRoot = path.join(presetsRoot, expected.id);
  const [theme, css, image] = await Promise.all([
    fs.readFile(path.join(themeRoot, "theme.json"), "utf8").then(JSON.parse),
    fs.readFile(path.join(themeRoot, "theme.css"), "utf8"),
    fs.readFile(path.join(themeRoot, "background.png")),
  ]);

  assert.equal(theme.id, expected.id);
  assert.equal(theme.name, expected.name);
  assert.equal(theme.image, "background.png");
  assert.equal(theme.appearance, expected.appearance);
  assert.equal(theme.art.safeArea, "left");
  assert.equal(theme.art.taskMode, "full");
  assert.equal(theme.colors.text, expected.text);
  assert.equal(theme.colors.accent, expected.accent);
  assert.equal(readImageMetadata(image, ".png")?.wide, true, `${expected.name} 背景必须支持整窗绘制`);

  assert.match(css, /\[data-ds-part="sidebar"\][^{]*\{[^}]*backdrop-filter:\s*none;/s, `${expected.name} 左侧不得虚化`);
  assert.doesNotMatch(css, /\bblur\s*\(/i, `${expected.name} 不得引入任何模糊`);
  assert.doesNotMatch(
    css,
    /\[data-ds-part="composer"\][^{]*\{[^}]*(?:border-radius|border-width|box-shadow):/s,
    `${expected.name} 不得重绘原生输入框`,
  );
  assert.match(
    engineCss,
    new RegExp(`data-dream-theme-id="${expected.id}"\\][^{]*\\[class\\*="_ApplicationMenuTopBar_"\\]\\s*\\{[^}]*background:\\s*${expected.topBar.replace(/[()]/g, "\\$&")}\\s*!important;[^}]*backdrop-filter:\\s*none\\s*!important;`, "s"),
    `${expected.name} 原生 Windows 顶栏必须使用统一主题色`,
  );
}

console.log("PASS: 兰亭曲水、燕山秋色与赤壁夜航满足统一 Windows 主题合同。");
