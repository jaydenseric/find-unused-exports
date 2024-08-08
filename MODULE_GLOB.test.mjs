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
        ".a.ad.ts",
        ".a.cjs",
        ".a.cts",
        ".a.js",
        ".a.jsx",
        ".a.mjs",
        ".a.mts",
        ".a.ts",
        ".a.tsx",
        ".cjs",
        ".cts",
        ".js",
        ".jsx",
        ".mjs",
        ".mts",
        ".ts",
        ".tsx",
        "a.cts",
        "a.d.tsx",
        "a.jsx",
        "a.mjs",
        "a.mts",
        "a.ts",
        "a.tsx",
        "ad.cts",
        "ad.mts",
        "ad.ts",
        "a/.a.ad.cts",
        "a/.a.ad.mts",
        "a/.a.ad.ts",
        "a/.a.cjs",
        "a/.a.cts",
        "a/.a.js",
        "a/.a.jsx",
        "a/.a.mjs",
        "a/.a.mts",
        "a/.a.ts",
        "a/.a.tsx",
        "a/.cjs",
        "a/.cts",
        "a/.js",
        "a/.jsx",
        "a/.mjs",
        "a/.mts",
        "a/.ts",
        "a/.tsx",
        "a/a.cts",
        "a/a.d.tsx",
        "a/a.jsx",
        "a/a.mjs",
        "a/a.mts",
        "a/a.ts",
        "a/a.tsx",
        "a/ad.cts",
        "a/ad.mts",
        "a/ad.ts",
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
