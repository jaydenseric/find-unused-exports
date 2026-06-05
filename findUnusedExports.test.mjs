// @ts-check

import { deepStrictEqual, ok, rejects, strictEqual } from "node:assert";
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
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL("./test/fixtures/some-unused-exports", import.meta.url),
        ),
      }),
      {
        "a.mjs": new Set(["default", "a"]),
        "b.mjs": new Set(["b"]),
      },
    );
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
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test/fixtures/namespace-import-without-default-import",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
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

  it("Protocol `node:` import specifier.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test/fixtures/protocol-node-import-specifier",
            import.meta.url,
          ),
        ),
      }),
      {
        "a.mjs": new Set(["default"]),
      },
    );
  });

  it("Side effect import.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL("./test/fixtures/side-effect-import", import.meta.url),
        ),
      }),
      {
        "a.mjs": new Set(["default"]),
      },
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
      {
        "a.mjs": new Set(["default"]),
      },
    );
  });

  it("Ignore unused exports comments.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test/fixtures/ignore-unused-exports-comments",
            import.meta.url,
          ),
        ),
      }),
      {
        "b.mjs": new Set(["a"]),
        "c.mjs": new Set(["default"]),
      },
    );
  });

  describe("Option `excludeGlob`.", { concurrency: true }, () => {
    it("Not a string.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          excludeGlob: true,
        }),
        new TypeError("Option `excludeGlob` must be a string."),
      );
    });

    it("Valid.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test/fixtures/excludeGlob", import.meta.url),
          ),
          excludeGlob: "**/b.mjs",
        }),
        {
          "a.mjs": new Set(["default"]),
        },
      );
    });
  });

  describe("Option `ignore`.", { concurrency: true }, () => {
    it("Not an object.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          ignore: true,
        }),
        new TypeError("Option `ignore` must be an object."),
      );
    });

    it("Object with an entry not an array.", async () => {
      await rejects(
        findUnusedExports({
          ignore: {
            // @ts-expect-error Testing invalid.
            a: true,
          },
        }),
        new TypeError("Option `ignore` entry `a` must be an array."),
      );
    });

    it("Object with an entry array with an item not a string.", async () => {
      await rejects(
        findUnusedExports({
          ignore: {
            a: [
              "a",
              // @ts-expect-error Testing invalid.
              true,
            ],
          },
        }),
        new TypeError("Option `ignore` entry `a` entry 1 must be a string."),
      );
    });

    it("Ignoring some unused exports.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test/fixtures/option-ignore", import.meta.url),
          ),
          ignore: {
            "a.mjs": ["default"],
            "b.mjs": ["a"],
          },
        }),
        {
          "a.mjs": new Set(["b"]),
          "b.mjs": new Set(["default"]),
        },
      );
    });

    it("Ignoring all unused exports.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test/fixtures/option-ignore", import.meta.url),
          ),
          ignore: {
            "a.mjs": ["default", "b"],
            "b.mjs": ["default", "a"],
          },
        }),
        {},
      );
    });
  });

  describe("Option `importMap`.", { concurrency: true }, () => {
    it("Invalid.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          importMap: true,
        }),
        (error) => {
          ok(error instanceof TypeError);
          strictEqual(
            error.message,
            "Option `importMap` must be a valid import map.",
          );
          ok(error.cause instanceof TypeError);
          return true;
        },
      );
    });

    it("Valid.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test/fixtures/import-map", import.meta.url),
          ),
          importMap: {
            imports: {
              "#a": "./a.mjs",
            },
          },
        }),
        {
          "b.mjs": new Set(["default"]),
        },
      );
    });
  });

  describe("Option `moduleGlob`.", { concurrency: true }, () => {
    it("Not a string.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          moduleGlob: true,
        }),
        new TypeError("Option `moduleGlob` must be a string."),
      );
    });

    it("Valid.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test/fixtures/moduleGlob", import.meta.url),
          ),
          moduleGlob: "**/*.txt",
        }),
        {
          "a.txt": new Set(["default"]),
        },
      );
    });
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

    it("Valid.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL(
              "./test/fixtures/extensionless-import-specifiers",
              import.meta.url,
            ),
          ),
          resolveFileExtensions: ["mjs", "a.mjs"],
        }),
        {
          "b.a.mjs": new Set(["default"]),
        },
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

  it("Options `resolveFileExtensions` and `resolveIndexFiles`.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test/fixtures/extensionless-import-specifiers-and-index-files",
            import.meta.url,
          ),
        ),
        resolveFileExtensions: ["mjs", "a.mjs"],
        resolveIndexFiles: true,
      }),
      {
        "b/index.a.mjs": new Set(["default"]),
      },
    );
  });
});
