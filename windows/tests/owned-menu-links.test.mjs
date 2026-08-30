import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";

const tray = readFileSync(fileURLToPath(new URL("../scripts/tray-dream-skin.ps1", import.meta.url)), "utf8");
const localization = readFileSync(
  fileURLToPath(new URL("../scripts/localization-windows.ps1", import.meta.url)),
  "utf8",
);

assert.match(tray, /https:\/\/mhh16399-collab\.github\.io\/codex-guofeng-themes\//);
assert.match(tray, /https:\/\/github\.com\/mhh16399-collab\/codex-guofeng-themes/);
assert.doesNotMatch(tray, /dreamskin\.cc\/(?:gallery|studio)|https:\/\/dreamskin\.cc'/);
assert.doesNotMatch(tray, /Get-DreamSkinTrayText -Key 'Studio'/);

assert.match(localization, /OpenSite = 'Project Home'/);
assert.match(localization, /OpenSite = '打开项目主页'/);
assert.doesNotMatch(localization, /Studio = '(?:Online|在线) Studio'/);

console.log("PASS: Windows tray links only to the owned gallery and project home.");
