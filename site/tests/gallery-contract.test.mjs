import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const appUrl = new URL("../src/App.jsx", import.meta.url);
const stylesUrl = new URL("../src/styles.css", import.meta.url);

test("gallery exposes the eight reviewed Guofeng themes and core controls", async () => {
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
  ];

  for (const id of themeIds) {
    assert.match(source, new RegExp(`id:\\s*[\"']${id}[\"']`));
  }

  assert.match(source, /placeholder=["']搜索主题/);
  assert.match(source, /全部主题/);
  assert.match(source, /浅色/);
  assert.match(source, /深色/);
  assert.match(source, /查看详情/);
  assert.match(source, /下载 Windows 安装包/);
  assert.match(source, /主题图鉴/);
  assert.match(source, /使用指南/);
  assert.match(source, /更新日志/);
  assert.match(source, /在 GitHub 上收藏此馆/);
});

test("desktop gallery follows the approved four-column museum layout", async () => {
  const styles = await readFile(stylesUrl, "utf8");

  assert.match(styles, /\.theme-grid\s*\{[^}]*grid-template-columns:\s*repeat\(4,\s*minmax\(0,\s*1fr\)\)/s);
  assert.match(styles, /@media\s*\(max-width:\s*760px\)[\s\S]*?\.theme-grid\s*\{[^}]*grid-template-columns:\s*1fr/s);
});
