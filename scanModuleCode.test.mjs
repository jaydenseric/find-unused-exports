// @ts-check

import { deepStrictEqual, rejects } from "node:assert";
import { describe, it } from "node:test";

import scanModuleCode from "./scanModuleCode.mjs";

describe("Function `scanModuleCode`.", { concurrency: true }, () => {
  it("Argument 1 `code` not a string.", async () => {
    await rejects(
      scanModuleCode(
        // @ts-expect-error Testing invalid.
        true,
      ),
      new TypeError("Argument 1 `code` must be a string."),
    );
  });

  describe("Argument 2 `path`.", { concurrency: true }, () => {
    it("Not a string.", async () => {
      await rejects(
        scanModuleCode(
          "",
          // @ts-expect-error Testing invalid.
          true,
        ),
        new TypeError("Argument 2 `path` must be a string."),
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

    it("`.ts` file, TypeScript syntax.", async () => {
      deepStrictEqual(await scanModuleCode("let a: boolean;", "a.ts"), {
        imports: {},
        exports: new Set(),
      });
    });

    it("`.tsx` file, TypeScript and JSX syntax.", async () => {
      deepStrictEqual(
        await scanModuleCode("let a: boolean; const b = <div />;", "a.tsx"),
        {
          imports: {},
          exports: new Set(),
        },
      );
    });

    it("`.jsx` file, JavaScript and JSX syntax.", async () => {
      deepStrictEqual(await scanModuleCode("const a = <div />;", "a.jsx"), {
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

  describe("Static imports.", { concurrency: true }, () => {
    it("Default.", async () => {
      deepStrictEqual(await scanModuleCode('import a from "a"'), {
        imports: {
          a: new Set(["default"]),
        },
        exports: new Set(),
      });
    });

    describe("Named.", { concurrency: true }, () => {
      describe("Identifiers.", { concurrency: true }, () => {
        it("Not aliased.", async () => {
          deepStrictEqual(await scanModuleCode('import { a, b } from "a"'), {
            imports: {
              a: new Set(["a", "b"]),
            },
            exports: new Set(),
          });
        });

        it("Aliased to identifiers.", async () => {
          deepStrictEqual(
            await scanModuleCode('import { a as b, c as d } from "a"'),
            {
              imports: {
                a: new Set(["a", "c"]),
              },
              exports: new Set(),
            },
          );
        });
      });

      describe("String literals.", { concurrency: true }, () => {
        it("Aliased to identifiers.", async () => {
          deepStrictEqual(
            await scanModuleCode('import { "a-a" as a, "b-b" as b } from "a"'),
            {
              imports: {
                a: new Set(["a-a", "b-b"]),
              },
              exports: new Set(),
            },
          );
        });
      });
    });

    it("Namespaced.", async () => {
      deepStrictEqual(await scanModuleCode('import * as a from "a"'), {
        imports: {
          a: new Set(["*"]),
        },
        exports: new Set(),
      });
    });

    it("Default and namespaced.", async () => {
      deepStrictEqual(await scanModuleCode('import a, * as b from "a"'), {
        imports: {
          a: new Set(["default", "*"]),
        },
        exports: new Set(),
      });
    });

    it("Default and named.", async () => {
      deepStrictEqual(await scanModuleCode('import a, { b, c } from "a"'), {
        imports: {
          a: new Set(["default", "b", "c"]),
        },
        exports: new Set(),
      });
    });

    it("Accumulates imports for a repeated module specifier.", async () => {
      deepStrictEqual(
        await scanModuleCode('import { a } from "a"; import b from "a"'),
        {
          imports: {
            a: new Set(["default", "a"]),
          },
          exports: new Set(),
        },
      );
    });
  });

  describe("Dynamic imports.", { concurrency: true }, () => {
    it("Standalone.", async () => {
      deepStrictEqual(await scanModuleCode('import("a")'), {
        imports: {
          a: new Set(["default", "*"]),
        },
        exports: new Set(),
      });
    });

    it("In a default export.", async () => {
      deepStrictEqual(await scanModuleCode('export default import("a")'), {
        imports: {
          a: new Set(["default", "*"]),
        },
        exports: new Set(["default"]),
      });
    });

    it("In a named export.", async () => {
      deepStrictEqual(await scanModuleCode('export const a = import("a")'), {
        imports: {
          a: new Set(["default", "*"]),
        },
        exports: new Set(["a"]),
      });
    });
  });

  describe("Exports.", { concurrency: true }, () => {
    it("Default.", async () => {
      deepStrictEqual(await scanModuleCode("export default 1"), {
        imports: {},
        exports: new Set(["default"]),
      });
    });

    describe("Named.", { concurrency: true }, () => {
      describe("Declaration.", { concurrency: true }, () => {
        it("Class.", async () => {
          deepStrictEqual(await scanModuleCode("export class A {}"), {
            imports: {},
            exports: new Set(["A"]),
          });
        });

        it("Function.", async () => {
          deepStrictEqual(await scanModuleCode("export function a() {}"), {
            imports: {},
            exports: new Set(["a"]),
          });
        });

        describe("Variable.", { concurrency: true }, () => {
          describe("Single.", { concurrency: true }, () => {
            it("Simple identifier.", async () => {
              deepStrictEqual(await scanModuleCode("export const a = 1"), {
                imports: {},
                exports: new Set(["a"]),
              });
            });

            describe("Object pattern.", { concurrency: true }, () => {
              it("No renaming.", async () => {
                deepStrictEqual(
                  await scanModuleCode(
                    "export const { a, b } = { a: 1, b: 1 }",
                  ),
                  {
                    imports: {},
                    exports: new Set(["a", "b"]),
                  },
                );
              });

              it("Renaming.", async () => {
                deepStrictEqual(
                  await scanModuleCode(
                    "export const { a, b: c } = { a: 1, b: 1 }",
                  ),
                  {
                    imports: {},
                    exports: new Set(["a", "c"]),
                  },
                );
              });

              it("Rest element.", async () => {
                deepStrictEqual(
                  await scanModuleCode(
                    "export const { a, ...b } = { a: 1, b: 1, c: 1 }",
                  ),
                  {
                    imports: {},
                    exports: new Set(["a", "b"]),
                  },
                );
              });

              it("Nested array pattern.", async () => {
                deepStrictEqual(
                  await scanModuleCode(
                    "export const { a, b: [c]} = { a: 1, b: [1] }",
                  ),
                  {
                    imports: {},
                    exports: new Set(["a", "c"]),
                  },
                );
              });

              it("Nested object pattern.", async () => {
                deepStrictEqual(
                  await scanModuleCode(
                    "export const { a, b: { c }} = { a: 1, b: { c: 1 } }",
                  ),
                  {
                    imports: {},
                    exports: new Set(["a", "c"]),
                  },
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
                  },
                );
              });

              it("Skipping.", async () => {
                deepStrictEqual(
                  await scanModuleCode("export const [, b] = [1, 2]"),
                  {
                    imports: {},
                    exports: new Set(["b"]),
                  },
                );
              });

              it("Rest element.", async () => {
                deepStrictEqual(
                  await scanModuleCode("export const [a, ...b] = [1, 2, 3]"),
                  {
                    imports: {},
                    exports: new Set(["a", "b"]),
                  },
                );
              });

              it("Nested array pattern.", async () => {
                deepStrictEqual(
                  await scanModuleCode(
                    "export const [a, [b]] = [1, [1, 2, 3]]",
                  ),
                  {
                    imports: {},
                    exports: new Set(["a", "b"]),
                  },
                );
              });

              it("Nested object pattern.", async () => {
                deepStrictEqual(
                  await scanModuleCode(
                    "export const [a, { b }] = [1, { b: 1 }]",
                  ),
                  {
                    imports: {},
                    exports: new Set(["a", "b"]),
                  },
                );
              });
            });
          });

          it("Multiple.", async () => {
            deepStrictEqual(await scanModuleCode("export var a, b = 1"), {
              imports: {},
              exports: new Set(["a", "b"]),
            });
          });
        });

        describe("Export specifier.", { concurrency: true }, () => {
          it("Identifiers.", async () => {
            deepStrictEqual(
              await scanModuleCode("const a = 1, b = 2; export { a, b }"),
              {
                imports: {},
                exports: new Set(["a", "b"]),
              },
            );
          });

          it("String literals.", async () => {
            deepStrictEqual(
              await scanModuleCode(
                'const a = 1, b = 2; export { a as "a-a", b as "b-b" }',
              ),
              {
                imports: {},
                exports: new Set(["a-a", "b-b"]),
              },
            );
          });
        });
      });
    });

    it("Named and default.", async () => {
      deepStrictEqual(
        await scanModuleCode("export const a = 1; export default 1"),
        {
          imports: {},
          exports: new Set(["default", "a"]),
        },
      );
    });
  });

  it("Import and export.", async () => {
    deepStrictEqual(await scanModuleCode('import a from "a"; export { a }'), {
      imports: {
        a: new Set(["default"]),
      },
      exports: new Set(["a"]),
    });
  });

  describe("Re-exports.", { concurrency: true }, () => {
    describe("Default.", { concurrency: true }, () => {
      it("Not aliased.", async () => {
        deepStrictEqual(await scanModuleCode('export { default } from "a"'), {
          imports: {
            a: new Set(["default"]),
          },
          exports: new Set(["default"]),
        });
      });

      describe("Aliased.", { concurrency: true }, () => {
        it("Identifiers.", async () => {
          deepStrictEqual(
            await scanModuleCode(
              'export { default as a, default as b } from "a"',
            ),
            {
              imports: {
                a: new Set(["default"]),
              },
              exports: new Set(["a", "b"]),
            },
          );
        });

        it("String literals.", async () => {
          deepStrictEqual(
            await scanModuleCode(
              'export { default as "a-a", default as "b-b" } from "a"',
            ),
            {
              imports: {
                a: new Set(["default"]),
              },
              exports: new Set(["a-a", "b-b"]),
            },
          );
        });
      });

      it("Accumulates imports for a repeated module specifier.", async () => {
        deepStrictEqual(
          await scanModuleCode(
            'import { a } from "a"; export { default } from "a"',
          ),
          {
            imports: {
              a: new Set(["default", "a"]),
            },
            exports: new Set(["default"]),
          },
        );
      });
    });

    describe("Named.", { concurrency: true }, () => {
      describe("Identifiers.", { concurrency: true }, () => {
        it("Not aliased.", async () => {
          deepStrictEqual(await scanModuleCode('export { a, b } from "a"'), {
            imports: {
              a: new Set(["a", "b"]),
            },
            exports: new Set(["a", "b"]),
          });
        });

        it("Aliased to identifiers.", async () => {
          deepStrictEqual(
            await scanModuleCode(
              'export { a as default, b as c, c as d } from "a"',
            ),
            {
              imports: {
                a: new Set(["a", "b", "c"]),
              },
              exports: new Set(["default", "c", "d"]),
            },
          );
        });

        it("Aliased to string literals.", async () => {
          deepStrictEqual(
            await scanModuleCode('export { a as "b-b", c as "d-d" } from "a"'),
            {
              imports: {
                a: new Set(["a", "c"]),
              },
              exports: new Set(["b-b", "d-d"]),
            },
          );
        });
      });

      describe("String literals.", { concurrency: true }, () => {
        it("Not aliased.", async () => {
          deepStrictEqual(
            await scanModuleCode('export { "a-a", "b-b" } from "a"'),
            {
              imports: {
                a: new Set(["a-a", "b-b"]),
              },
              exports: new Set(["a-a", "b-b"]),
            },
          );
        });

        it("Aliased to identifiers.", async () => {
          deepStrictEqual(
            await scanModuleCode('export { "a-a" as b, "c-c" as d } from "a"'),
            {
              imports: {
                a: new Set(["a-a", "c-c"]),
              },
              exports: new Set(["b", "d"]),
            },
          );
        });

        it("Aliased to string literals.", async () => {
          deepStrictEqual(
            await scanModuleCode(
              'export { "a-a" as "b-b", "c-c" as "d-d" } from "a"',
            ),
            {
              imports: {
                a: new Set(["a-a", "c-c"]),
              },
              exports: new Set(["b-b", "d-d"]),
            },
          );
        });
      });
    });

    describe("All.", { concurrency: true }, () => {
      it("Not namespaced.", async () => {
        deepStrictEqual(await scanModuleCode('export * from "a"'), {
          imports: {
            a: new Set(["*"]),
          },
          exports: new Set([
            // All export names are unknown.
          ]),
        });
      });

      it("Namespaced.", async () => {
        deepStrictEqual(await scanModuleCode('export * as a from "a"'), {
          imports: {
            a: new Set(["*"]),
          },
          exports: new Set(["a"]),
        });
      });

      it("Accumulates imports for a repeated module specifier.", async () => {
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
          },
        );
      });
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
        },
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
        },
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
`,
        ),
        {
          imports: {},
          exports: new Set(),
        },
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
        },
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
        },
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
        },
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
          },
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
          },
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
        },
      );
    });
  });
});
