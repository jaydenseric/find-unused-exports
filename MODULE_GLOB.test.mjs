// @ts-check

import { ok, strictEqual } from "node:assert";
import { matchesGlob } from "node:path";
import { suite, test } from "node:test";

import MODULE_GLOB from "./MODULE_GLOB.mjs";

suite("Constant `MODULE_GLOB`.", { concurrency: true }, () => {
  for (const extension of [
    "cjs",
    "cts",
    "js",
    "jsx",
    "mjs",
    "mts",
    "ts",
    "tsx",
  ])
    suite(
      `Matching module file extension \`${extension}\`.`,
      { concurrency: true },
      () => {
        for (const filename of [
          `.${extension}`,
          `.a.${extension}`,
          `..a.${extension}`,
          `.a..${extension}`,
          `.a.a.${extension}`,
          `a.${extension}`,
          `a.a.${extension}`,
          `a..a.${extension}`,
          `a.a..${extension}`,
          `a.a.a.${extension}`,
        ])
          suite(`Filename \`${filename}\`.`, { concurrency: true }, () => {
            test("Not nested.", () => {
              ok(matchesGlob(filename, MODULE_GLOB));
            });

            test("Nested.", () => {
              ok(matchesGlob(`a/${filename}`, MODULE_GLOB));
            });
          });
      },
    );

  test("Not matching.", () => {
    strictEqual(matchesGlob("/a.txt", MODULE_GLOB), false);
  });
});
