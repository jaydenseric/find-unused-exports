// @ts-check

import { deepStrictEqual, rejects } from "node:assert";
import { describe, it } from "node:test";

import scanModuleCode from "./scanModuleCode.mjs";

describe("Function `scanModuleCode`.", { concurrency: true }, () => {
  it("Argument 1 `code` not a string.", async () => {
    await rejects(
      scanModuleCode(
        // @ts-expect-error Testing invalid.
        true
      ),
      new TypeError("Argument 1 `code` must be a string.")
    );
  });

  describe("Argument 2 `path`.", { concurrency: true }, () => {
    it("Not a string.", async () => {
      await rejects(
        scanModuleCode(
          "",
          // @ts-expect-error Testing invalid.
          true
        ),
        new TypeError("Argument 2 `path` must be a string.")
      );
    });

    it("`.mts` file, TypeScript syntax.", async () => {
      deepStrictEqual(await scanModuleCode("let a: boolean;", "a.mts"), {
        imports: {},
        exports: new Set(),
      });
    });

    it("`.cts` file, TypeScript syntax.", async () => {
      deepStrictEqual(await scanModuleCode("let a: boolean;", "a.cts"), {
        imports: {},
        exports: new Set(),
      });
    });
  });

  it("No imports or exports.", async () => {
    deepStrictEqual(await scanModuleCode(""), {
      imports: {},
      exports: new Set(),
    });
  });

  it("Default import.", async () => {
    deepStrictEqual(await scanModuleCode('import a from "a"'), {
      imports: {
        a: new Set(["default"]),
      },
      exports: new Set(),
    });
  });

  it("Default import, existing specifier.", async () => {
    deepStrictEqual(
      await scanModuleCode('import { a } from "a"; import b from "a"'),
      {
        imports: {
          a: new Set(["default", "a"]),
        },
        exports: new Set(),
      }
    );
  });

  it("Named imports.", async () => {
    deepStrictEqual(await scanModuleCode('import { a, b } from "a"'), {
      imports: {
        a: new Set(["a", "b"]),
      },
      exports: new Set(),
    });
  });

  it("Namespace import.", async () => {
    deepStrictEqual(await scanModuleCode('import * as a from "a"'), {
      imports: {
        a: new Set(["*"]),
      },
      exports: new Set(),
    });
  });

  it("Default and namespace import.", async () => {
    deepStrictEqual(await scanModuleCode('import a, * as b from "a"'), {
      imports: {
        a: new Set(["default", "*"]),
      },
      exports: new Set(),
    });
  });

  it("Default and named imports.", async () => {
    deepStrictEqual(await scanModuleCode('import a, { b, c } from "a"'), {
      imports: {
        a: new Set(["default", "b", "c"]),
      },
      exports: new Set(),
    });
  });

  it("Dynamic import.", async () => {
    deepStrictEqual(await scanModuleCode('import("a")'), {
      imports: {
        a: new Set(["default", "*"]),
      },
      exports: new Set(),
    });
  });

  it("Default export.", async () => {
    deepStrictEqual(await scanModuleCode("export default 1"), {
      imports: {},
      exports: new Set(["default"]),
    });
  });

  describe("Named export.", { concurrency: true }, () => {
    describe("Declaration.", { concurrency: true }, () => {
      it("Function declaration.", async () => {
        deepStrictEqual(await scanModuleCode("export function a() {}"), {
          imports: {},
          exports: new Set(["a"]),
        });
      });

      describe("Variable declaration.", { concurrency: true }, () => {
        describe("Single declaration.", { concurrency: true }, () => {
          it("Simple identifier.", async () => {
            deepStrictEqual(await scanModuleCode("export const a = 1"), {
              imports: {},
              exports: new Set(["a"]),
            });
          });

          describe("Object pattern.", { concurrency: true }, () => {
            it("No renaming.", async () => {
              deepStrictEqual(
                await scanModuleCode("export const { a, b } = { a: 1, b: 1 }"),
                {
                  imports: {},
                  exports: new Set(["a", "b"]),
                }
              );
            });

            it("Renaming.", async () => {
              deepStrictEqual(
                await scanModuleCode(
                  "export const { a, b: c } = { a: 1, b: 1 }"
                ),
                {
                  imports: {},
                  exports: new Set(["a", "c"]),
                }
              );
            });

            it("Rest element.", async () => {
              deepStrictEqual(
                await scanModuleCode(
                  "export const { a, ...b } = { a: 1, b: 1, c: 1 }"
                ),
                {
                  imports: {},
                  exports: new Set(["a", "b"]),
                }
              );
            });

            it("Nested array pattern.", async () => {
              deepStrictEqual(
                await scanModuleCode(
                  "export const { a, b: [c]} = { a: 1, b: [1] }"
                ),
                {
                  imports: {},
                  exports: new Set(["a", "c"]),
                }
              );
            });

            it("Nested object pattern.", async () => {
              deepStrictEqual(
                await scanModuleCode(
                  "export const { a, b: { c }} = { a: 1, b: { c: 1 } }"
                ),
                {
                  imports: {},
                  exports: new Set(["a", "c"]),
                }
              );
            });
          });

          describe("Array pattern.", { concurrency: true }, () => {
            it("No skipping.", async () => {
              deepStrictEqual(
                await scanModuleCode("export const [a, b] = [1, 2]"),
                {
                  imports: {},
                  exports: new Set(["a", "b"]),
                }
              );
            });

            it("Skipping.", async () => {
              deepStrictEqual(
                await scanModuleCode("export const [, b] = [1, 2]"),
                {
                  imports: {},
                  exports: new Set(["b"]),
                }
              );
            });

            it("Rest element.", async () => {
              deepStrictEqual(
                await scanModuleCode("export const [a, ...b] = [1, 2, 3]"),
                {
                  imports: {},
                  exports: new Set(["a", "b"]),
                }
              );
            });

            it("Nested array pattern.", async () => {
              deepStrictEqual(
                await scanModuleCode("export const [a, [b]] = [1, [1, 2, 3]]"),
                {
                  imports: {},
                  exports: new Set(["a", "b"]),
                }
              );
            });

            it("Nested object pattern.", async () => {
              deepStrictEqual(
                await scanModuleCode("export const [a, { b }] = [1, { b: 1 }]"),
                {
                  imports: {},
                  exports: new Set(["a", "b"]),
                }
              );
            });
          });
        });

        it("Multiple declarations.", async () => {
          deepStrictEqual(await scanModuleCode("export var a, b = 1"), {
            imports: {},
            exports: new Set(["a", "b"]),
          });
        });
      });

      it("Export specifier.", async () => {
        deepStrictEqual(await scanModuleCode("const a = 1; export { a }"), {
          imports: {},
          exports: new Set(["a"]),
        });
      });
    });
  });

  it("Named and default export.", async () => {
    deepStrictEqual(
      await scanModuleCode("export const a = 1; export default 1"),
      {
        imports: {},
        exports: new Set(["default", "a"]),
      }
    );
  });

  it("Import and export.", async () => {
    deepStrictEqual(await scanModuleCode('import a from "a"; export { a }'), {
      imports: {
        a: new Set(["default"]),
      },
      exports: new Set(["a"]),
    });
  });

  it("Export default from.", async () => {
    deepStrictEqual(await scanModuleCode('export { default } from "a"'), {
      imports: {
        a: new Set(["default"]),
      },
      exports: new Set(["default"]),
    });
  });

  it("Export default from, existing specifier.", async () => {
    deepStrictEqual(
      await scanModuleCode(
        'import { a } from "a"; export { default } from "a"'
      ),
      {
        imports: {
          a: new Set(["default", "a"]),
        },
        exports: new Set(["default"]),
      }
    );
  });

  it("Export default as name from.", async () => {
    deepStrictEqual(await scanModuleCode('export { default as a } from "a"'), {
      imports: {
        a: new Set(["default"]),
      },
      exports: new Set(["a"]),
    });
  });

  it("Export name as default from.", async () => {
    deepStrictEqual(await scanModuleCode('export { a as default } from "a"'), {
      imports: {
        a: new Set(["a"]),
      },
      exports: new Set(["default"]),
    });
  });

  it("Export all from.", async () => {
    deepStrictEqual(await scanModuleCode('export * from "a"'), {
      imports: {
        a: new Set(["*"]),
      },
      exports: new Set([
        // All export names are unknown.
      ]),
    });
  });

  it("Export all from, existing specifier.", async () => {
    deepStrictEqual(
      await scanModuleCode('export { a } from "a"; export * from "a"'),
      {
        imports: {
          a: new Set(["*", "a"]),
        },
        exports: new Set([
          "a",
          // All export names are unknown.
        ]),
      }
    );
  });

  it("Export namespace from.", async () => {
    deepStrictEqual(await scanModuleCode('export * as a from "a"'), {
      imports: {
        a: new Set(["*"]),
      },
      exports: new Set(["a"]),
    });
  });

  describe("Ignore unused exports comment.", { concurrency: true }, () => {
    it("No names.", async () => {
      deepStrictEqual(
        await scanModuleCode(`// ignore unused exports
export const a = 1;
export default 1;
`),
        {
          imports: {},
          exports: new Set(),
        }
      );
    });

    it("Case insensitivity.", async () => {
      deepStrictEqual(
        await scanModuleCode(`// iGnOrE UnUsEd eXpOrTs
export const a = 1;
export default 1;
`),
        {
          imports: {},
          exports: new Set(),
        }
      );
    });

    it("Whitespace tolerance.", async () => {
      deepStrictEqual(
        await scanModuleCode(
          "//  ignore unused exports  a,  b,c " +
            `
export const a = 1;
export const b = 1;
export const c = 1;
`
        ),
        {
          imports: {},
          exports: new Set(),
        }
      );
    });

    it("One name.", async () => {
      deepStrictEqual(
        await scanModuleCode(`// ignore unused exports default
export const a = 1;
export default 1;
`),
        {
          imports: {},
          exports: new Set(["a"]),
        }
      );
    });

    it("Multiple names.", async () => {
      deepStrictEqual(
        await scanModuleCode(`// ignore unused exports a, default
export const a = 1;
export const b = 1;
export default 1;
`),
        {
          imports: {},
          exports: new Set(["b"]),
        }
      );
    });

    it("Invalid names.", async () => {
      deepStrictEqual(
        await scanModuleCode(`// ignore unused exports default,,
export default 1;
`),
        {
          imports: {},
          exports: new Set(["default"]),
        }
      );
    });

    describe("Multiple.", { concurrency: true }, () => {
      it("Same name.", async () => {
        deepStrictEqual(
          await scanModuleCode(`// ignore unused exports default
// ignore unused exports default
export const a = 1;
export default 1;
`),
          {
            imports: {},
            exports: new Set(["a"]),
          }
        );
      });

      it("Different names.", async () => {
        deepStrictEqual(
          await scanModuleCode(`// ignore unused exports a
// ignore unused exports b
export const a = 1;
export const b = 1;
export default 1;
`),
          {
            imports: {},
            exports: new Set(["default"]),
          }
        );
      });
    });

    it("Comment block.", async () => {
      deepStrictEqual(
        await scanModuleCode(`/* ignore unused exports a */
export const a = 1;
export default 1;
`),
        {
          imports: {},
          exports: new Set(["default"]),
        }
      );
    });
  });
});
