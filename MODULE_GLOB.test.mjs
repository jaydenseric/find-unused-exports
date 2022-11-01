// @ts-check

import { deepEqual } from "node:assert";

import { globby } from "globby";

import MODULE_GLOB from "./MODULE_GLOB.mjs";

/**
 * Adds `MODULE_GLOB` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`MODULE_GLOB` with matching modules.", async () => {
    deepEqual(
      await globby(MODULE_GLOB, {
        cwd: new URL(
          "./test/fixtures/MODULE_GLOB/matching-modules/",
          import.meta.url
        ),
      }),
      [
        ".cjs",
        ".cts",
        ".js",
        ".mjs",
        ".mts",
        "a.mjs",
        "ad.cts",
        "ad.mts",
        "a/.cjs",
        "a/.cts",
        "a/.js",
        "a/.mjs",
        "a/.mts",
        "a/a.mjs",
        "a/ad.cts",
        "a/ad.mts",
      ]
    );
  });

  tests.add("`MODULE_GLOB` with excluded files.", async () => {
    deepEqual(
      await globby(MODULE_GLOB, {
        cwd: new URL(
          "./test/fixtures/MODULE_GLOB/excluded-files/",
          import.meta.url
        ),
      }),
      []
    );
  });
};
