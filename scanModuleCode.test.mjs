// @ts-check

import { deepStrictEqual, rejects } from "node:assert";
import { suite, test } from "node:test";

import scanModuleCode from "./scanModuleCode.mjs";

suite("Function `scanModuleCode`.", { concurrency: true }, () => {
  test("Argument 1 `code` not a string.", async () => {
    await rejects(
      scanModuleCode(
        // @ts-expect-error Testing invalid.
        true,
      ),
      new TypeError("Argument 1 `code` must be a string."),
    );
  });

  suite("Argument 2 `path`.", { concurrency: true }, () => {
    test("Not a string.", async () => {
      await rejects(
        scanModuleCode(
          "",
          // @ts-expect-error Testing invalid.
          true,
        ),
        new TypeError("Argument 2 `path` must be a string."),
      );
    });

    for (const extension of ["mts", "cts", "ts"])
      test(`\`.${extension}\` file, TypeScript syntax.`, async () => {
        deepStrictEqual(
          await scanModuleCode("let a: boolean;", `a.${extension}`),
          {
            imports: {},
            exports: new Set(),
          },
        );
      });

    test("`.tsx` file, TypeScript and JSX syntax.", async () => {
      deepStrictEqual(
        await scanModuleCode("let a: boolean; const b = <div />;", "a.tsx"),
        {
          imports: {},
          exports: new Set(),
        },
      );
    });

    test("`.jsx` file, JavaScript and JSX syntax.", async () => {
      deepStrictEqual(await scanModuleCode("const a = <div />;", "a.jsx"), {
        imports: {},
        exports: new Set(),
      });
    });
  });

  test("No imports or exports.", async () => {
    deepStrictEqual(await scanModuleCode(""), {
      imports: {},
      exports: new Set(),
    });
  });

  suite("Static imports.", { concurrency: true }, () => {
    test("Default.", async () => {
      deepStrictEqual(await scanModuleCode('import a from "a"'), {
        imports: {
          a: new Set(["default"]),
        },
        exports: new Set(),
      });
    });

    suite("Named.", { concurrency: true }, () => {
      suite("Identifiers.", { concurrency: true }, () => {
        test("Not aliased.", async () => {
          deepStrictEqual(await scanModuleCode('import { a, b } from "a"'), {
            imports: {
              a: new Set(["a", "b"]),
            },
            exports: new Set(),
          });
        });

        test("Aliased to identifiers.", async () => {
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

      suite("String literals.", { concurrency: true }, () => {
        test("Aliased to identifiers.", async () => {
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

    test("Namespaced.", async () => {
      deepStrictEqual(await scanModuleCode('import * as a from "a"'), {
        imports: {
          a: new Set(["*"]),
        },
        exports: new Set(),
      });
    });

    test("Default and namespaced.", async () => {
      deepStrictEqual(await scanModuleCode('import a, * as b from "a"'), {
        imports: {
          a: new Set(["default", "*"]),
        },
        exports: new Set(),
      });
    });

    test("Default and named.", async () => {
      deepStrictEqual(await scanModuleCode('import a, { b, c } from "a"'), {
        imports: {
          a: new Set(["default", "b", "c"]),
        },
        exports: new Set(),
      });
    });

    test("Accumulates imports for a repeated module specifier.", async () => {
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

  suite("Dynamic imports.", { concurrency: true }, () => {
    test("Standalone.", async () => {
      deepStrictEqual(await scanModuleCode('import("a")'), {
        imports: {
          a: new Set(["default", "*"]),
        },
        exports: new Set(),
      });
    });

    test("In a default export.", async () => {
      deepStrictEqual(await scanModuleCode('export default import("a")'), {
        imports: {
          a: new Set(["default", "*"]),
        },
        exports: new Set(["default"]),
      });
    });

    test("In a named export.", async () => {
      deepStrictEqual(await scanModuleCode('export const a = import("a")'), {
        imports: {
          a: new Set(["default", "*"]),
        },
        exports: new Set(["a"]),
      });
    });
  });

  suite("Exports.", { concurrency: true }, () => {
    test("Default.", async () => {
      deepStrictEqual(await scanModuleCode("export default 1"), {
        imports: {},
        exports: new Set(["default"]),
      });
    });

    suite("Named.", { concurrency: true }, () => {
      suite("Declaration.", { concurrency: true }, () => {
        test("Class.", async () => {
          deepStrictEqual(await scanModuleCode("export class A {}"), {
            imports: {},
            exports: new Set(["A"]),
          });
        });

        test("Function.", async () => {
          deepStrictEqual(await scanModuleCode("export function a() {}"), {
            imports: {},
            exports: new Set(["a"]),
          });
        });

        suite("Variable.", { concurrency: true }, () => {
          suite("Single.", { concurrency: true }, () => {
            test("Simple identifier.", async () => {
              deepStrictEqual(await scanModuleCode("export const a = 1"), {
                imports: {},
                exports: new Set(["a"]),
              });
            });

            suite("Object pattern.", { concurrency: true }, () => {
              test("No renaming.", async () => {
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

              test("Renaming.", async () => {
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

              test("Rest element.", async () => {
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

              test("Nested array pattern.", async () => {
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

              test("Nested object pattern.", async () => {
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

            suite("Array pattern.", { concurrency: true }, () => {
              test("No skipping.", async () => {
                deepStrictEqual(
                  await scanModuleCode("export const [a, b] = [1, 2]"),
                  {
                    imports: {},
                    exports: new Set(["a", "b"]),
                  },
                );
              });

              test("Skipping.", async () => {
                deepStrictEqual(
                  await scanModuleCode("export const [, b] = [1, 2]"),
                  {
                    imports: {},
                    exports: new Set(["b"]),
                  },
                );
              });

              test("Rest element.", async () => {
                deepStrictEqual(
                  await scanModuleCode("export const [a, ...b] = [1, 2, 3]"),
                  {
                    imports: {},
                    exports: new Set(["a", "b"]),
                  },
                );
              });

              test("Nested array pattern.", async () => {
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

              test("Nested object pattern.", async () => {
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

          test("Multiple.", async () => {
            deepStrictEqual(await scanModuleCode("export var a, b = 1"), {
              imports: {},
              exports: new Set(["a", "b"]),
            });
          });
        });

        suite("Export specifier.", { concurrency: true }, () => {
          test("Identifiers.", async () => {
            deepStrictEqual(
              await scanModuleCode("const a = 1, b = 2; export { a, b }"),
              {
                imports: {},
                exports: new Set(["a", "b"]),
              },
            );
          });

          test("String literals.", async () => {
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

    test("Named and default.", async () => {
      deepStrictEqual(
        await scanModuleCode("export const a = 1; export default 1"),
        {
          imports: {},
          exports: new Set(["default", "a"]),
        },
      );
    });
  });

  test("Import and export.", async () => {
    deepStrictEqual(await scanModuleCode('import a from "a"; export { a }'), {
      imports: {
        a: new Set(["default"]),
      },
      exports: new Set(["a"]),
    });
  });

  suite("Re-exports.", { concurrency: true }, () => {
    suite("Default.", { concurrency: true }, () => {
      test("Not aliased.", async () => {
        deepStrictEqual(await scanModuleCode('export { default } from "a"'), {
          imports: {
            a: new Set(["default"]),
          },
          exports: new Set(["default"]),
        });
      });

      suite("Aliased.", { concurrency: true }, () => {
        test("Identifiers.", async () => {
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

        test("String literals.", async () => {
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

      test("Accumulates imports for a repeated module specifier.", async () => {
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

    suite("Named.", { concurrency: true }, () => {
      suite("Identifiers.", { concurrency: true }, () => {
        test("Not aliased.", async () => {
          deepStrictEqual(await scanModuleCode('export { a, b } from "a"'), {
            imports: {
              a: new Set(["a", "b"]),
            },
            exports: new Set(["a", "b"]),
          });
        });

        test("Aliased to identifiers.", async () => {
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

        test("Aliased to string literals.", async () => {
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

      suite("String literals.", { concurrency: true }, () => {
        test("Not aliased.", async () => {
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

        test("Aliased to identifiers.", async () => {
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

        test("Aliased to string literals.", async () => {
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

    suite("All.", { concurrency: true }, () => {
      test("Not namespaced.", async () => {
        deepStrictEqual(await scanModuleCode('export * from "a"'), {
          imports: {
            a: new Set(["*"]),
          },
          exports: new Set([
            // All export names are unknown.
          ]),
        });
      });

      test("Namespaced.", async () => {
        deepStrictEqual(await scanModuleCode('export * as a from "a"'), {
          imports: {
            a: new Set(["*"]),
          },
          exports: new Set(["a"]),
        });
      });

      test("Accumulates imports for a repeated module specifier.", async () => {
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

  suite("Ignore unused exports comment.", { concurrency: true }, () => {
    test("No names.", async () => {
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

    test("Case insensitivity.", async () => {
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

    test("Whitespace tolerance.", async () => {
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

    test("One name.", async () => {
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

    test("Multiple names.", async () => {
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

    test("Invalid names.", async () => {
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

    suite("Multiple.", { concurrency: true }, () => {
      test("Same name.", async () => {
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

      test("Different names.", async () => {
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

    test("Comment block.", async () => {
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
