// @ts-check

import { ok, strictEqual } from "node:assert";
import { matchesGlob } from "node:path";
import { suite, test } from "node:test";

import EXCLUDE_GLOB from "./EXCLUDE_GLOB.mjs";

suite("Constant `EXCLUDE_GLOB`.", { concurrency: true }, () => {
  for (const extension of ["d.mts", "d.cts", "d.ts"])
    suite(
      `Matching TypeScript declaration file extension \`${extension}\`.`,
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
              ok(matchesGlob(filename, EXCLUDE_GLOB));
            });

            test("Nested.", () => {
              ok(matchesGlob(`a/${filename}`, EXCLUDE_GLOB));
            });
          });
      },
    );

  suite("Matching `node_modules` directories.", { concurrency: true }, () => {
    test("Not nested.", () => {
      ok(matchesGlob("node_modules/a.mjs", EXCLUDE_GLOB));
    });

    test("Nested.", () => {
      ok(matchesGlob("a/node_modules/a.mjs", EXCLUDE_GLOB));
    });
  });

  test("Not matching.", () => {
    strictEqual(matchesGlob("a.a.ts", EXCLUDE_GLOB), false);
    strictEqual(matchesGlob("a/a.mjs", EXCLUDE_GLOB), false);
  });
});
