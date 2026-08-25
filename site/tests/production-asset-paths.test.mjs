import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { join } from "node:path";
import test from "node:test";

const clientDir = join(process.cwd(), "dist", "client");

test("production index references assets inside the GitHub Pages project path", () => {
  const html = readFileSync(join(clientDir, "index.html"), "utf8");
  const urls = [...html.matchAll(/(?:src|href)="(\/[^"?#]+)"/g)].map((match) => match[1]);
  const projectPath = "/codex-guofeng-themes/";

  assert.ok(urls.length > 0, "expected production index to reference built assets");
  for (const url of urls) {
    assert.equal(url.startsWith(projectPath), true, `asset must stay inside ${projectPath}: ${url}`);
    assert.equal(
      existsSync(join(clientDir, url.slice(projectPath.length))),
      true,
      `missing GitHub Pages asset for ${url}`,
    );
  }
});
