import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const root = new URL('../../', import.meta.url);
const read = (relativePath) => readFile(new URL(relativePath, root), 'utf8');

test('v1.7.2 is bound across every release version source', async () => {
  const [macVersion, windowsVersion, pkg, common, macInjector] = await Promise.all([
    read('macos/VERSION'),
    read('windows/VERSION'),
    read('macos/package.json'),
    read('macos/scripts/common-macos.sh'),
    read('macos/scripts/injector.mjs'),
  ]);

  assert.equal(macVersion.trim(), '1.7.2');
  assert.equal(windowsVersion.trim(), '1.7.2');
  assert.equal(JSON.parse(pkg).version, '1.7.2');
  assert.match(common, /^SKIN_VERSION="1\.7\.2"$/m);
  assert.match(macInjector, /^const SKIN_VERSION = "1\.7\.2";$/m);
});
