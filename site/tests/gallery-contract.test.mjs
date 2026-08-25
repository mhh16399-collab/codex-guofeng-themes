import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appUrl = new URL("../src/App.jsx", import.meta.url);
const stylesUrl = new URL("../src/styles.css", import.meta.url);

test("gallery exposes the current reviewed Guofeng themes and core controls", async () => {
  const source = await readFile(appUrl, "utf8");
  const themeIds = [
    "zhuqing",
    "zhusha",
    "moyun",
    "ruyao-tianqing",
    "dunhuang-liujin",
    "qinghua-ci",
    "haitang-songjin",
    "jiye-xinghe",
    "qianli-jiangshan",
    "jingtai-hualan",
    "heiqi-luodian",
    "chayan-songfeng",
    "sunmao-danying",
    "ruihe-lingxiao",
    "tangsancai",
    "hanjian-mohen",
    "luoshui-liuxia",
    "jinling-yunjin",
  ];

  for (const id of themeIds) {
    assert.match(source, new RegExp(`id:\\s*[\"']${id}[\"']`));
  }

  assert.match(source, /placeholder=["']搜索主题/);
  assert.match(source, /全部主题/);
  assert.match(source, /浅色/);
  assert.match(source, /深色/);
  assert.match(source, /dreamskin:\/\/preset\?theme=preset-/);
  assert.doesNotMatch(source, /dreamskin:\/\/apply\?version=/);
  assert.match(source, /下载主题包/);
  assert.match(source, /查看详情/);
  assert.match(source, /下载原版 DreamSkin/);
  assert.match(source, /主题图鉴/);
  assert.match(source, /使用指南/);
  assert.match(source, /更新日志/);
  assert.match(source, /在 GitHub 上收藏此馆/);
  assert.match(source, /持续扩展的原创国风主题库/);
  assert.match(source, /浏览当前馆藏/);
  assert.match(source, /馆藏.*themes\.length/);
  assert.doesNotMatch(source, /十八套原创国风主题|浏览十八套主题|\/ 18/);
});

test("desktop gallery follows the approved three-column large-preview layout", async () => {
  const styles = await readFile(stylesUrl, "utf8");

  assert.match(styles, /\.theme-grid\s*\{[^}]*grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(styles, /\.theme-card\s*\{[^}]*border-radius:\s*14px[^}]*padding:\s*14px\s+14px\s+0/s);
  assert.match(styles, /\.preview-button\s*\{[^}]*border-radius:\s*10px[^}]*box-shadow:/s);
  assert.match(styles, /\.featured-frame img\s*\{[^}]*border-radius:\s*16px/s);
  assert.match(styles, /@media\s*\(max-width:\s*1000px\)[\s\S]*?\.theme-grid\s*\{[^}]*grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.theme-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
});

test("detail dialog clips both panels inside a rounded outer frame", async () => {
  const styles = await readFile(stylesUrl, "utf8");

  assert.match(styles, /\.theme-dialog\s*\{[^}]*overflow:\s*auto[^}]*border-radius:\s*16px/s);
  assert.match(styles, /\.theme-dialog\s*>\s*img\s*\{[^}]*border-radius:\s*15px\s+0\s+0\s+15px/s);
  assert.match(styles, /@media\s*\(max-width:\s*1000px\)[\s\S]*?\.theme-dialog\s*>\s*img\s*\{[^}]*border-radius:\s*15px\s+15px\s+0\s+0/s);
});
