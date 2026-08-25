import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const templatePath = path.resolve(here, "../tools/windows-preview.html");

test("theme previews use one fixed Windows Codex layout", async () => {
  const source = await readFile(templatePath, "utf8");

  assert.match(source, /data-region="windows-titlebar"/);
  assert.match(source, /data-region="sidebar"/);
  assert.match(source, /data-region="workspace"/);
  assert.match(source, /data-region="composer"/);
  assert.match(source, /data-region="composer-toolbar"/);
  assert.match(source, /data-region="profile"/);
  assert.match(source, /完全访问/);
  assert.match(source, /5\.6 Sol/);
  assert.match(source, /语音/);
  assert.match(source, /class="window-controls"[^>]*>[\s\S]*─[\s\S]*□[\s\S]*×/);
  assert.doesNotMatch(source, /traffic-light|macos|suggestion-card/);
  assert.match(source, /"jingxiang-chaxi"/);
  assert.match(source, /"citong-haibo"/);
  assert.match(source, /"qingming-changjuan"/);
  assert.match(source, /"yanlan-liubai"/);
  assert.match(source, /"bingqing-yuanxiu"/);
  assert.match(source, /wallpaperMode:\s*"window"/);
  assert.match(source, /wallpaperMode:\s*"main"/);
  assert.match(source, /--window-bg/);
  assert.match(source, /--workspace-bg/);
  assert.match(source, /--sidebar-filter/);
  assert.match(source, /--titlebar/);
  assert.match(source, /sidebarFilter:\s*"none"/);
});
