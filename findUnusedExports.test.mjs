// @ts-check

import { deepStrictEqual, ok, rejects, strictEqual } from "node:assert";
import { suite, test } from "node:test";
import { fileURLToPath } from "node:url";

import findUnusedExports from "./findUnusedExports.mjs";

suite("Function `findUnusedExports`.", { concurrency: true }, () => {
  test("Files but no exports or imports.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/files-without-exports-imports",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
  });

  test("Multiple files importing from the same file.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/multiple-files-importing-from-same-file",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
  });

  test("No unused exports.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL("./test-helpers/fixtures/no-unused-exports", import.meta.url),
        ),
      }),
      {},
    );
  });

  test("Some unused exports.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/some-unused-exports",
            import.meta.url,
          ),
        ),
      }),
      {
        "a.mjs": new Set(["default", "a"]),
        "b.mjs": new Set(["b"]),
      },
    );
  });

  test("Namespace import and a default import.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/namespace-import-and-default-import",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
  });

  test("Namespace import without a default import.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/namespace-import-without-default-import",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
  });

  test("Bare import specifier.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/bare-import-specifier",
            import.meta.url,
          ),
        ),
      }),
      {},
    );
  });

  test("Protocol `node:` import specifier.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/protocol-node-import-specifier",
            import.meta.url,
          ),
        ),
      }),
      {
        "a.mjs": new Set(["default"]),
      },
    );
  });

  test("Side effect import.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/side-effect-import",
            import.meta.url,
          ),
        ),
      }),
      {
        "a.mjs": new Set(["default"]),
      },
    );
  });

  test("Unresolvable import specifier.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/unresolvable-import-specifier",
            import.meta.url,
          ),
        ),
      }),
      {
        "a.mjs": new Set(["default"]),
      },
    );
  });

  test("Ignore unused exports comments.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/ignore-unused-exports-comments",
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

  suite("Option `excludeGlob`.", { concurrency: true }, () => {
    test("Not a string.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          excludeGlob: true,
        }),
        new TypeError("Option `excludeGlob` must be a string."),
      );
    });

    test("Valid.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test-helpers/fixtures/excludeGlob", import.meta.url),
          ),
          excludeGlob: "**/b.mjs",
        }),
        {
          "a.mjs": new Set(["default"]),
        },
      );
    });
  });

  suite("Option `ignore`.", { concurrency: true }, () => {
    test("Not an object.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          ignore: true,
        }),
        new TypeError("Option `ignore` must be an object."),
      );
    });

    test("Object with an entry not an array.", async () => {
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

    test("Object with an entry array with an item not a string.", async () => {
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

    test("Ignoring some unused exports.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test-helpers/fixtures/option-ignore", import.meta.url),
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

    test("Ignoring all unused exports.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test-helpers/fixtures/option-ignore", import.meta.url),
          ),
          ignore: {
            "**/*.mjs": ["*"],
          },
        }),
        {},
      );
    });
  });

  suite("Option `importMap`.", { concurrency: true }, () => {
    test("Invalid.", async () => {
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

    test("Valid.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test-helpers/fixtures/import-map", import.meta.url),
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

  suite("Option `moduleGlob`.", { concurrency: true }, () => {
    test("Not a string.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          moduleGlob: true,
        }),
        new TypeError("Option `moduleGlob` must be a string."),
      );
    });

    test("Valid.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL("./test-helpers/fixtures/moduleGlob", import.meta.url),
          ),
          moduleGlob: "**/*.txt",
        }),
        {
          "a.txt": new Set(["default"]),
        },
      );
    });
  });

  suite("Option `cwd`.", { concurrency: true }, () => {
    test("Not a string.", async () => {
      await rejects(
        findUnusedExports({
          // @ts-expect-error Testing invalid.
          cwd: true,
        }),
        new TypeError("Option `cwd` must be a string."),
      );
    });

    test("Inaccessible directory path.", async () => {
      await rejects(
        findUnusedExports({
          cwd: fileURLToPath(new URL("nonexistent", import.meta.url)),
        }),
        new TypeError("Option `cwd` must be an accessible directory path."),
      );
    });
  });

  suite("Option `resolveFileExtensions`.", { concurrency: true }, () => {
    test("Not an array.", async () => {
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

    test("Empty array.", async () => {
      await rejects(
        findUnusedExports({ resolveFileExtensions: [] }),
        new TypeError(
          "Option `resolveFileExtensions` must be an array of strings.",
        ),
      );
    });

    test("Array with an item not a string.", async () => {
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

    test("Valid.", async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: fileURLToPath(
            new URL(
              "./test-helpers/fixtures/extensionless-import-specifiers",
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

  suite("Option `resolveIndexFiles`.", { concurrency: true }, () => {
    test("Not a boolean.", async () => {
      await rejects(
        findUnusedExports({
          resolveFileExtensions: ["js"],
          // @ts-expect-error Testing invalid.
          resolveIndexFiles: "",
        }),
        new TypeError("Option `resolveIndexFiles` must be a boolean."),
      );
    });

    test("Without using option `resolveFileExtensions`.", async () => {
      await rejects(
        findUnusedExports({ resolveIndexFiles: true }),
        new TypeError(
          "Option `resolveIndexFiles` can only be `true` if the option `resolveFileExtensions` is used.",
        ),
      );
    });
  });

  test("Options `resolveFileExtensions` and `resolveIndexFiles`.", async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: fileURLToPath(
          new URL(
            "./test-helpers/fixtures/extensionless-import-specifiers-and-index-files",
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
