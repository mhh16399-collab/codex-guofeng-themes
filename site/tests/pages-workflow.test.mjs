import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

const pagesUrl = new URL("../../.github/workflows/pages.yml", import.meta.url);
const ciUrl = new URL("../../.github/workflows/ci.yml", import.meta.url);

async function readOptional(url) {
  try {
    return await readFile(url, "utf8");
  } catch (error) {
    if (error?.code === "ENOENT") return "";
    throw error;
  }
}

test("Pages deploys the built gallery with pinned official actions and minimal permissions", async () => {
  const workflow = await readOptional(pagesUrl);

  assert.match(workflow, /^name:\s*Pages/m);
  assert.match(workflow, /contents:\s*read/);
  assert.match(workflow, /pages:\s*write/);
  assert.match(workflow, /id-token:\s*write/);
  assert.match(workflow, /actions\/configure-pages@[0-9a-f]{40}/);
  assert.match(workflow, /actions\/upload-pages-artifact@[0-9a-f]{40}/);
  assert.match(workflow, /actions\/deploy-pages@[0-9a-f]{40}/);
  assert.doesNotMatch(workflow, /uses:\s*[^\n]+@v\d/);
  assert.match(workflow, /site\/dist\/client/);
});

test("CI tests and builds the gallery before publication", async () => {
  const workflow = await readFile(ciUrl, "utf8");

  assert.match(workflow, /working-directory:\s*site/);
  assert.match(workflow, /npm ci/);
  assert.match(workflow, /npm run build/);
  assert.match(workflow, /node --test tests\/\*\.test\.mjs/);
  assert.ok(
    workflow.indexOf("npm run build") < workflow.indexOf("node --test tests/*.test.mjs"),
    "CI must build the gallery before tests inspect generated packaging files",
  );
});

test("Pages builds the gallery before validating generated packaging files", async () => {
  const workflow = await readFile(pagesUrl, "utf8");

  assert.ok(
    workflow.indexOf("npm run build") < workflow.indexOf("node --test tests/*.test.mjs"),
    "Pages must build the gallery before tests inspect generated packaging files",
  );
});
