import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..", "..");
const engineCss = fs.readFileSync(path.join(root, "windows", "assets", "dream-skin.css"), "utf8");

assert.match(
  engineCss,
  /html\[data-dream-skin="active"\]\s+main:is\([^}]+\)\s*>\s*header:is\([^}]+\)\s*\{[^}]*background:\s*transparent\s*!important;[^}]*border-bottom:\s*1px\s+solid\s+var\(--ds-line\)\s*!important;[^}]*box-shadow:\s*none\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "所有主题必须取消主内容顶栏的宽遮罩，但保留一条细分隔线",
);

assert.match(
  engineCss,
  /html\[data-dream-skin="active"\]\[data-dream-shell="dark"\]::after\s*\{[^}]*pointer-events:\s*none\s*!important;[^}]*position:\s*fixed\s*!important;[^}]*top:\s*0\s*!important;[^}]*right:\s*0\s*!important;[^}]*width:\s*168px\s*!important;[^}]*height:\s*36px\s*!important;[^}]*rgba\(226,\s*232,\s*235,\s*\.92\)[^}]*z-index:\s*2147483646\s*!important;/s,
  "所有深色主题必须在 Windows 最小化、最大化和关闭按钮下提供不拦截点击的浅色衬底",
);

assert.match(
  engineCss,
  /@layer\s+dreamskin-accessibility\s*\{[\s\S]*?html\[data-dream-skin="active"\]\[data-dream-theme-id\]\s+\[class\*="_ComposerLayoutRoot_"\]\s+\[data-ds-part="composer"\]\s*\{[^}]*border:\s*0\s*!important;[^}]*background:\s*transparent\s*!important;[^}]*box-shadow:\s*none\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "新版输入框的内层 footer 不得重复绘制第二圈边界",
);

assert.match(
  engineCss,
  /@layer\s+dreamskin-accessibility\s*\{[\s\S]*?html\[data-dream-skin="active"\][^{]*\.app-shell-main-content-top-fade[^{]*\{[^}]*display:\s*none\s*!important;[^}]*background:\s*transparent\s*!important;[^}]*box-shadow:\s*none\s*!important;[^}]*backdrop-filter:\s*none\s*!important;/s,
  "所有主题都必须隐藏原生 MainContentTopFade 宽横带，不能只处理宽幅素材",
);

assert.match(
  engineCss,
  /@layer\s+dreamskin-accessibility\s*\{[\s\S]*?button\[aria-label="编辑图片"\][\s\S]*?button\[aria-label="Edit image"\][\s\S]*?button\[aria-label="下载图片"\][\s\S]*?button\[aria-label="Download image"\][\s\S]*?button\[aria-label="关闭图片预览"\][\s\S]*?button\[aria-label="Close image preview"\][^{]*\{[^}]*color:\s*#20242b\s*!important;[^}]*background:\s*rgba\(248,\s*249,\s*250,\s*\.94\)\s*!important;[^}]*opacity:\s*1\s*!important;/s,
  "图片预览的编辑、下载和关闭圆形按钮必须使用高对比度深色图标",
);

console.log("PASS: 全主题顶部横带、窗口三键、图片预览按钮和输入框单边界规则均已锁定。");
