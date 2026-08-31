import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import path from "node:path";
import test from "node:test";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const clientRoot = path.resolve(here, "../dist/client");

const publishedThemes = [
  { id: "jingxiang-chaxi", name: "静香茶席" },
  { id: "citong-haibo", name: "刺桐海舶" },
  { id: "qingming-changjuan", name: "清明长卷" },
  { id: "yanlan-liubai", name: "烟岚留白" },
  { id: "bingqing-yuanxiu", name: "冰青远岫" },
  { id: "lanting-qushui", name: "兰亭曲水" },
  { id: "yanshan-qiuse", name: "燕山秋色" },
  { id: "chibi-yehang", name: "赤壁夜航" },
];

test("production gallery publishes all approved themes with previews and downloads", async () => {
  const assetNames = await readdir(path.join(clientRoot, "assets"));
  const scriptNames = assetNames.filter((name) => name.endsWith(".js"));
  const scripts = await Promise.all(
    scriptNames.map((name) => readFile(path.join(clientRoot, "assets", name), "utf8")),
  );
  const application = scripts.join("\n");
  assert.match(application, /downloads\/preset-/, "gallery must retain the theme-package download route");

  for (const theme of publishedThemes) {
    const preview = await stat(path.join(clientRoot, "themes", `${theme.id}.png`));
    const archiveName = `preset-${theme.id}.zip`;
    const archive = await stat(path.join(clientRoot, "downloads", archiveName));

    assert.ok(preview.size > 100_000, `${theme.name} must publish a real full-window preview`);
    assert.ok(archive.size > 100_000, `${theme.name} must publish a non-empty theme package`);
    assert.match(application, new RegExp(theme.name), `${theme.name} must appear in the gallery catalog`);
    assert.match(application, new RegExp(theme.id), `${theme.name} must use its stable package identifier`);
  }
});

test("new theme previews are synthetic assets with recorded provenance", async () => {
  const provenance = JSON.parse(
    await readFile(path.join(clientRoot, "themes", "preview-provenance.json"), "utf8"),
  );

  for (const theme of publishedThemes) {
    const asset = await readFile(path.join(clientRoot, "themes", `${theme.id}.png`));
    const record = provenance[theme.id];
    const digest = createHash("sha256").update(asset).digest("hex");

    assert.equal(record?.kind, "synthetic-ui-mockup");
    assert.equal(record?.containsRealDesktopContent, false);
    assert.equal(record?.sha256, digest);
  }
});
