// @ts-check

import { ok, strictEqual } from "node:assert";
import { matchesGlob } from "node:path";
import { describe, it } from "node:test";

import EXCLUDE_GLOB from "./EXCLUDE_GLOB.mjs";

describe("Constant `EXCLUDE_GLOB`.", { concurrency: true }, () => {
  for (const extension of ["d.mts", "d.cts", "d.ts"])
    describe(
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
          describe(`Filename \`${filename}\`.`, { concurrency: true }, () => {
            it("Not nested.", () => {
              ok(matchesGlob(filename, EXCLUDE_GLOB));
            });

            it("Nested.", () => {
              ok(matchesGlob(`a/${filename}`, EXCLUDE_GLOB));
            });
          });
      },
    );

  describe(
    "Matching `node_modules` directories.",
    { concurrency: true },
    () => {
      it("Not nested.", () => {
        ok(matchesGlob("node_modules/a.mjs", EXCLUDE_GLOB));
      });

      it("Nested.", () => {
        ok(matchesGlob("a/node_modules/a.mjs", EXCLUDE_GLOB));
      });
    },
  );

  it("Not matching.", () => {
    strictEqual(matchesGlob("a.a.ts", EXCLUDE_GLOB), false);
    strictEqual(matchesGlob("a/a.mjs", EXCLUDE_GLOB), false);
  });
});
