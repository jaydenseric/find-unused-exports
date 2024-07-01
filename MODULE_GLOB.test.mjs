// @ts-check

import { deepEqual } from "node:assert";
import { describe, it } from "node:test";

import { globby } from "globby";

import MODULE_GLOB from "./MODULE_GLOB.mjs";

describe("Constant `MODULE_GLOB`.", { concurrency: true }, () => {
  it("Matching modules.", async () => {
    deepEqual(
      await globby(MODULE_GLOB, {
        cwd: new URL(
          "./test/fixtures/MODULE_GLOB/matching-modules/",
          import.meta.url,
        ),
        dot: true,
      }),
      [
        ".a.ad.cts",
        ".a.ad.mts",
        ".a.cjs",
        ".a.cts",
        ".a.js",
        ".a.mjs",
        ".a.mts",
        ".cjs",
        ".cts",
        ".js",
        ".mjs",
        ".mts",
        "a.mjs",
        "ad.cts",
        "ad.mts",
        "a/.a.ad.cts",
        "a/.a.ad.mts",
        "a/.a.cjs",
        "a/.a.cts",
        "a/.a.js",
        "a/.a.mjs",
        "a/.a.mts",
        "a/.cjs",
        "a/.cts",
        "a/.js",
        "a/.mjs",
        "a/.mts",
        "a/a.mjs",
        "a/ad.cts",
        "a/ad.mts",
      ],
    );
  });

  it("Excluded files.", async () => {
    deepEqual(
      await globby(MODULE_GLOB, {
        cwd: new URL(
          "./test/fixtures/MODULE_GLOB/excluded-files/",
          import.meta.url,
        ),
        dot: true,
      }),
      [],
    );
  });
});
