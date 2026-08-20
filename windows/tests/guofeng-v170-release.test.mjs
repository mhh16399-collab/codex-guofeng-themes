import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const root = new URL("../../", import.meta.url);

async function read(relativePath) {
  return readFile(new URL(relativePath, root), "utf8");
}

test("v1.7.0 is bound across all six release version sources", async () => {
  const [macVersion, windowsVersion, pkg, common, macInjector, windowsInjector] = await Promise.all([
    read("macos/VERSION"),
    read("windows/VERSION"),
    read("macos/package.json"),
    read("macos/scripts/common-macos.sh"),
    read("macos/scripts/injector.mjs"),
    read("windows/scripts/injector.mjs"),
  ]);

  assert.equal(macVersion.trim(), "1.7.0");
  assert.equal(windowsVersion.trim(), "1.7.0");
  assert.equal(JSON.parse(pkg).version, "1.7.0");
  assert.match(common, /^SKIN_VERSION="1\.7\.0"$/m);
  assert.match(macInjector, /^const SKIN_VERSION = "1\.7\.0";$/m);
  assert.match(windowsInjector, /^const SKIN_VERSION = "1\.7\.0";$/m);
});

test("release notes advertise all eight reviewed themes", async () => {
  const workflow = await read(".github/workflows/release.yml");

  for (const name of ["竹青", "朱砂", "墨韵", "汝窑天青", "敦煌鎏金", "青花瓷", "海棠宋锦", "霁夜星河"]) {
    assert.match(workflow, new RegExp(name));
  }
  assert.match(workflow, /内置八套国风主题/);
});
