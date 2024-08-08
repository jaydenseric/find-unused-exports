// @ts-check

import { deepEqual } from "node:assert";
import { mkdir, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { describe, it } from "node:test";

import disposableDirectory from "disposable-directory";
import { globby } from "globby";

import MODULE_GLOB from "./MODULE_GLOB.mjs";

describe("Constant `MODULE_GLOB`.", { concurrency: true }, () => {
  describe("Matching modules.", async () => {
    for (const fileExtension of [
      "cjs",
      "cts",
      "js",
      "jsx",
      "mjs",
      "mts",
      "ts",
      "tsx",
    ])
      it(`File extension \`${fileExtension}\`.`, async () => {
        await disposableDirectory(async (tempDirPath) => {
          const fileNames = [
            `a.${fileExtension}`,

            // Test that dotfiles are included.
            `.${fileExtension}`,
            `.a.${fileExtension}`,

            // Test that files with a name ending in `d` aren’t mistakenly
            // excluded as a TypeScript declaration file.
            `ad.${fileExtension}`,
          ];

          const subdirectoryName = "a";
          const expectedPaths = [
            ...fileNames,

            // Test that files in subdirectories are recursively included.
            ...fileNames.map((fileName) => join(subdirectoryName, fileName)),
          ].sort();

          await mkdir(join(tempDirPath, subdirectoryName));
          await Promise.all(
            expectedPaths.map((relativePath) =>
              writeFile(join(tempDirPath, relativePath), ""),
            ),
          );

          deepEqual(
            (
              await globby(MODULE_GLOB, {
                cwd: tempDirPath,
                dot: true,
              })
            ).sort(),
            expectedPaths,
          );
        });
      });
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
