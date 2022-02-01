// @ts-check

import { deepStrictEqual, rejects } from "assert";
import { join, resolve } from "path";
import { fileURLToPath } from "url";

import findUnusedExports from "./findUnusedExports.mjs";

/**
 * Adds `findUnusedExports` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add(
    "`findUnusedExports` with files but no exports or imports.",
    async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL(
              "./test/fixtures/files-without-exports-imports",
              import.meta.url
            )
          ),
        }),
        {}
      );
    }
  );

  tests.add(
    "`findUnusedExports` with multiple files importing from the same file.",
    async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL(
              "./test/fixtures/multiple-files-importing-from-same-file",
              import.meta.url
            )
          ),
        }),
        {}
      );
    }
  );

  tests.add("`findUnusedExports` with no unused exports.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL("./test/fixtures/no-unused-exports", import.meta.url)
        ),
      }),
      {}
    );
  });

  tests.add("`findUnusedExports` with some unused exports.", async () => {
    const fixtureProjectPath = fileURLToPath(
      new URL("./test/fixtures/some-unused-exports", import.meta.url)
    );

    deepStrictEqual(await findUnusedExports({ cwd: fixtureProjectPath }), {
      [join(fixtureProjectPath, "a.mjs")]: new Set(["default", "a"]),
      [resolve(fixtureProjectPath, "b.mjs")]: new Set(["b"]),
    });
  });

  tests.add(
    "`findUnusedExports` with a namespace import and a default import.",
    async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL(
              "./test/fixtures/namespace-import-and-default-import",
              import.meta.url
            )
          ),
        }),
        {}
      );
    }
  );

  tests.add(
    "`findUnusedExports` with a namespace import without a default import.",
    async () => {
      const fixtureProjectPath = fileURLToPath(
        new URL(
          "./test/fixtures/namespace-import-without-default-import",
          import.meta.url
        )
      );

      deepStrictEqual(await findUnusedExports({ cwd: fixtureProjectPath }), {
        [join(fixtureProjectPath, "a.mjs")]: new Set(["default"]),
      });
    }
  );

  tests.add("`findUnusedExports` with a bare import specifier.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL("./test/fixtures/bare-import-specifier", import.meta.url)
        ),
      }),
      {}
    );
  });

  tests.add(
    "`findUnusedExports` with an unresolvable import specifier.",
    async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL(
              "./test/fixtures/unresolvable-import-specifier",
              import.meta.url
            )
          ),
        }),
        {}
      );
    }
  );

  tests.add("`findUnusedExports` with a .gitignore file.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL("./test/fixtures/gitignore", import.meta.url)
        ),
      }),
      {}
    );
  });

  tests.add(
    "`findUnusedExports` with ignore unused exports comments.",
    async () => {
      const fixtureProjectPath = fileURLToPath(
        new URL(
          "./test/fixtures/ignore-unused-exports-comments",
          import.meta.url
        )
      );

      deepStrictEqual(
        await findUnusedExports({
          cwd: fixtureProjectPath,
        }),
        {
          [join(fixtureProjectPath, "b.mjs")]: new Set(["a"]),
          [join(fixtureProjectPath, "c.mjs")]: new Set(["default"]),
        }
      );
    }
  );

  tests.add("`findUnusedExports` with option `moduleGlob`.", async () => {
    const fixtureProjectPath = fileURLToPath(
      new URL("./test/fixtures/moduleGlob", import.meta.url)
    );

    deepStrictEqual(
      await findUnusedExports({
        cwd: fixtureProjectPath,
        moduleGlob: "**/*.txt",
      }),
      {
        [join(fixtureProjectPath, "a.txt")]: new Set(["default"]),
      }
    );
  });

  tests.add(
    "`findUnusedExports` with option `resolveFileExtensions`.",
    async () => {
      const fixtureProjectPath = fileURLToPath(
        new URL(
          "./test/fixtures/extensionless-import-specifiers",
          import.meta.url
        )
      );

      deepStrictEqual(
        await findUnusedExports({
          cwd: fixtureProjectPath,
          resolveFileExtensions: ["mjs", "a.mjs"],
        }),
        {
          [join(fixtureProjectPath, "b.a.mjs")]: new Set(["default"]),
        }
      );
    }
  );

  tests.add(
    "`findUnusedExports` with options `resolveFileExtensions` and `resolveIndexFiles`.",
    async () => {
      const fixtureProjectPath = fileURLToPath(
        new URL(
          "./test/fixtures/extensionless-import-specifiers-and-index-files",
          import.meta.url
        )
      );

      deepStrictEqual(
        await findUnusedExports({
          cwd: fixtureProjectPath,
          resolveFileExtensions: ["mjs", "a.mjs"],
          resolveIndexFiles: true,
        }),
        {
          [join(fixtureProjectPath, "b/index.a.mjs")]: new Set(["default"]),
        }
      );
    }
  );

  tests.add("`findUnusedExports` with option `cwd` not a string.", async () => {
    await rejects(
      findUnusedExports({
        // @ts-expect-error Testing invalid.
        cwd: true,
      }),
      new TypeError("Option `cwd` must be a string.")
    );
  });

  tests.add(
    "`findUnusedExports` with option `cwd` an inaccessible directory path.",
    async () => {
      await rejects(
        findUnusedExports({
          cwd: fileURLToPath(new URL("nonexistent", import.meta.url)),
        }),
        new TypeError("Option `cwd` must be an accessible directory path.")
      );
    }
  );

  tests.add(
    "`findUnusedExports` with option `moduleGlob` not a string.",
    async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          moduleGlob: true,
        }),
        new TypeError("Option `moduleGlob` must be a string.")
      );
    }
  );

  tests.add(
    "`findUnusedExports` with option `resolveFileExtensions` not an array.",
    async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          resolveFileExtensions: true,
        }),
        new TypeError(
          "Option `resolveFileExtensions` must be an array of strings."
        )
      );
    }
  );

  tests.add(
    "`findUnusedExports` with option `resolveFileExtensions` an empty array.",
    async () => {
      await rejects(
        findUnusedExports({ resolveFileExtensions: [] }),
        new TypeError(
          "Option `resolveFileExtensions` must be an array of strings."
        )
      );
    }
  );

  tests.add(
    "`findUnusedExports` with option `resolveFileExtensions` an array with an item not a string.",
    async () => {
      await rejects(
        findUnusedExports({
          resolveFileExtensions: [
            "a",
            // @ts-expect-error Testing invalid.
            true,
            "b",
          ],
        }),
        new TypeError(
          "Option `resolveFileExtensions` must be an array of strings."
        )
      );
    }
  );

  tests.add(
    "`findUnusedExports` with option `resolveIndexFiles` not a boolean.",
    async () => {
      await rejects(
        findUnusedExports({
          resolveFileExtensions: ["js"],
          // @ts-expect-error Testing invalid.
          resolveIndexFiles: "",
        }),
        new TypeError("Option `resolveIndexFiles` must be a boolean.")
      );
    }
  );

  tests.add(
    "`findUnusedExports` with option `resolveIndexFiles` `true` without using option `resolveFileExtensions`.",
    async () => {
      await rejects(
        findUnusedExports({ resolveIndexFiles: true }),
        new TypeError(
          "Option `resolveIndexFiles` can only be `true` if the option `resolveFileExtensions` is used."
        )
      );
    }
  );
};
