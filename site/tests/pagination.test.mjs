import assert from "node:assert/strict";
import test from "node:test";

import { paginateThemes } from "../src/pagination.js";

const themes = Array.from({ length: 18 }, (_, index) => ({ id: index + 1 }));

test("gallery pagination shows six themes per page across the full collection", () => {
  const first = paginateThemes(themes, 1, 6);
  const second = paginateThemes(themes, 2, 6);
  const third = paginateThemes(themes, 3, 6);

  assert.deepEqual(first.items.map(({ id }) => id), [1, 2, 3, 4, 5, 6]);
  assert.deepEqual(second.items.map(({ id }) => id), [7, 8, 9, 10, 11, 12]);
  assert.deepEqual(third.items.map(({ id }) => id), [13, 14, 15, 16, 17, 18]);
  assert.equal(first.pageCount, 3);
});

test("gallery pagination clamps an obsolete page after filtering", () => {
  const filtered = themes.slice(0, 5);
  const result = paginateThemes(filtered, 3, 6);

  assert.equal(result.page, 1);
  assert.equal(result.pageCount, 1);
  assert.deepEqual(result.items.map(({ id }) => id), [1, 2, 3, 4, 5]);
});

test("gallery pagination handles an empty result without invalid page numbers", () => {
  const result = paginateThemes([], 2, 6);

  assert.equal(result.page, 1);
  assert.equal(result.pageCount, 1);
  assert.deepEqual(result.items, []);
});
