import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const here = path.dirname(fileURLToPath(import.meta.url));
const workflowPath = path.resolve(here, "../../.github/workflows/release.yml");
const workflow = await fs.readFile(workflowPath, "utf8");

assert.match(
  workflow,
  /^\s+ref: \$\{\{ github\.sha \}\}\s*$/m,
  "The release guard must check out the immutable event commit.",
);
assert.doesNotMatch(
  workflow,
  /^\s+ref: main\s*$/m,
  "The release guard must not check out moving main.",
);
assert.match(
  workflow,
  /^\s+event_sha="\$\(git rev-parse HEAD\)"\s*$/m,
  "The release candidate must derive from the checked-out event commit.",
);
assert.match(workflow, /^\s+release_sha="\$event_sha"\s*$/m);
assert.doesNotMatch(
  workflow,
  /main_sha="\$\(git rev-parse origin\/main\)"/,
  "The release candidate must not be rebound to a later origin/main tip.",
);
assert.doesNotMatch(
  workflow,
  /^  build-macos:/m,
  "The Guofeng v1 release must remain Windows-only.",
);
assert.doesNotMatch(
  workflow,
  /CodexDreamSkin-v\$\{VERSION\}\.dmg/,
  "A Windows-only Guofeng release must not require a DMG.",
);
assert.match(
  workflow,
  /CodexGuofengThemes-Setup-v\$\{VERSION\}\.exe/,
  "The public installer must use the Guofeng project name.",
);
assert.match(
  workflow,
  /github\.com\/mhh16399-collab\/codex-guofeng-themes\/releases\/download/,
  "Release notes must link to this fork rather than the upstream repository.",
);

console.log("PASS: Release workflow binds assets and tag to the exact event commit.");
