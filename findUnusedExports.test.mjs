// @ts-check

import { deepStrictEqual, rejects } from "node:assert";
import { join, resolve } from "node:path";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import findUnusedExports from "./findUnusedExports.mjs";

describe("Function `findUnusedExports`.", { concurrency: true }, () => {
  it("Files but no exports or imports.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test/fixtures/files-without-exports-imports",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
  });

  it("Multiple files importing from the same file.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test/fixtures/multiple-files-importing-from-same-file",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
  });

  it("No unused exports.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL("./test/fixtures/no-unused-exports", import.meta.url),
        ),
      }),
      {},
    );
  });

  it("Some unused exports.", async () => {
    const fixtureProjectPath = fileURLToPath(
      new URL("./test/fixtures/some-unused-exports", import.meta.url),
    );

    deepStrictEqual(await findUnusedExports({ cwd: fixtureProjectPath }), {
      [join(fixtureProjectPath, "a.mjs")]: new Set(["default", "a"]),
      [resolve(fixtureProjectPath, "b.mjs")]: new Set(["b"]),
    });
  });

  it("Namespace import and a default import.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test/fixtures/namespace-import-and-default-import",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
  });

  it("Namespace import without a default import.", async () => {
    const fixtureProjectPath = fileURLToPath(
      new URL(
        "./test/fixtures/namespace-import-without-default-import",
        import.meta.url,
      ),
    );

    deepStrictEqual(await findUnusedExports({ cwd: fixtureProjectPath }), {
      [join(fixtureProjectPath, "a.mjs")]: new Set(["default"]),
    });
  });

  it("Bare import specifier.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL("./test/fixtures/bare-import-specifier", import.meta.url),
        ),
      }),
      {},
    );
  });

  it("Unresolvable import specifier.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test/fixtures/unresolvable-import-specifier",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
  });

  it("`.gitignore` file.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL("./test/fixtures/gitignore", import.meta.url),
        ),
      }),
      {},
    );
  });

  it("Ignore unused exports comments.", async () => {
    const fixtureProjectPath = fileURLToPath(
      new URL(
        "./test/fixtures/ignore-unused-exports-comments",
        import.meta.url,
      ),
    );

    deepStrictEqual(
      await findUnusedExports({
        cwd: fixtureProjectPath,
      }),
      {
        [join(fixtureProjectPath, "b.mjs")]: new Set(["a"]),
        [join(fixtureProjectPath, "c.mjs")]: new Set(["default"]),
      },
    );
  });

  it("Option `moduleGlob`.", async () => {
    const fixtureProjectPath = fileURLToPath(
      new URL("./test/fixtures/moduleGlob", import.meta.url),
    );

    deepStrictEqual(
      await findUnusedExports({
        cwd: fixtureProjectPath,
        moduleGlob: "**/*.txt",
      }),
      {
        [join(fixtureProjectPath, "a.txt")]: new Set(["default"]),
      },
    );
  });

  it("Option `resolveFileExtensions`.", async () => {
    const fixtureProjectPath = fileURLToPath(
      new URL(
        "./test/fixtures/extensionless-import-specifiers",
        import.meta.url,
      ),
    );

    deepStrictEqual(
      await findUnusedExports({
        cwd: fixtureProjectPath,
        resolveFileExtensions: ["mjs", "a.mjs"],
      }),
      {
        [join(fixtureProjectPath, "b.a.mjs")]: new Set(["default"]),
      },
    );
  });

  it("Options `resolveFileExtensions` and `resolveIndexFiles`.", async () => {
    const fixtureProjectPath = fileURLToPath(
      new URL(
        "./test/fixtures/extensionless-import-specifiers-and-index-files",
        import.meta.url,
      ),
    );

    deepStrictEqual(
      await findUnusedExports({
        cwd: fixtureProjectPath,
        resolveFileExtensions: ["mjs", "a.mjs"],
        resolveIndexFiles: true,
      }),
      {
        [join(fixtureProjectPath, "b/index.a.mjs")]: new Set(["default"]),
      },
    );
  });

  describe("Option `cwd`.", { concurrency: true }, () => {
    it("Not a string.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          cwd: true,
        }),
        new TypeError("Option `cwd` must be a string."),
      );
    });

    it("Inaccessible directory path.", async () => {
      await rejects(
        findUnusedExports({
          cwd: fileURLToPath(new URL("nonexistent", import.meta.url)),
        }),
        new TypeError("Option `cwd` must be an accessible directory path."),
      );
    });
  });

  it("Option `moduleGlob` not a string.", async () => {
    await rejects(
      findUnusedExports({
        // @ts-expect-error Testing invalid.
        moduleGlob: true,
      }),
      new TypeError("Option `moduleGlob` must be a string."),
    );
  });

  describe("Option `resolveFileExtensions`.", { concurrency: true }, () => {
    it("Not an array.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          resolveFileExtensions: true,
        }),
        new TypeError(
          "Option `resolveFileExtensions` must be an array of strings.",
        ),
      );
    });

    it("Empty array.", async () => {
      await rejects(
        findUnusedExports({ resolveFileExtensions: [] }),
        new TypeError(
          "Option `resolveFileExtensions` must be an array of strings.",
        ),
      );
    });

    it("Array with an item not a string.", async () => {
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
          "Option `resolveFileExtensions` must be an array of strings.",
        ),
      );
    });
  });

  describe("Option `resolveIndexFiles`.", { concurrency: true }, () => {
    it("Not a boolean.", async () => {
      await rejects(
        findUnusedExports({
          resolveFileExtensions: ["js"],
          // @ts-expect-error Testing invalid.
          resolveIndexFiles: "",
        }),
        new TypeError("Option `resolveIndexFiles` must be a boolean."),
      );
    });

    it("Without using option `resolveFileExtensions`.", async () => {
      await rejects(
        findUnusedExports({ resolveIndexFiles: true }),
        new TypeError(
          "Option `resolveIndexFiles` can only be `true` if the option `resolveFileExtensions` is used.",
        ),
      );
    });
  });
});
