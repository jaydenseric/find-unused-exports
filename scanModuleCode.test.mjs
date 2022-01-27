import { deepStrictEqual, rejects } from "assert";
import scanModuleCode from "./scanModuleCode.mjs";

export default (tests) => {
  tests.add(
    "`scanModuleCode` with argument 1 `code` not a string.",
    async () => {
      await rejects(
        scanModuleCode(true),
        new TypeError("Argument 1 `code` must be a string.")
      );
    }
  );

  tests.add(
    "`scanModuleCode` with argument 2 `path` not a string.",
    async () => {
      await rejects(
        scanModuleCode("", true),
        new TypeError("Argument 2 `path` must be a string.")
      );
    }
  );

  tests.add("`scanModuleCode` without imports or exports.", async () => {
    deepStrictEqual(await scanModuleCode(""), {
      imports: {},
      exports: new Set(),
    });
  });

  tests.add("`scanModuleCode` with a default import.", async () => {
    deepStrictEqual(await scanModuleCode('import a from "a"'), {
      imports: {
        a: new Set(["default"]),
      },
      exports: new Set(),
    });
  });

  tests.add(
    "`scanModuleCode` with a default import, existing specifier.",
    async () => {
      deepStrictEqual(
        await scanModuleCode('import { a } from "a"; import b from "a"'),
        {
          imports: {
            a: new Set(["default", "a"]),
          },
          exports: new Set(),
        }
      );
    }
  );

  tests.add("`scanModuleCode` with named imports.", async () => {
    deepStrictEqual(await scanModuleCode('import { a, b } from "a"'), {
      imports: {
        a: new Set(["a", "b"]),
      },
      exports: new Set(),
    });
  });

  tests.add("`scanModuleCode` with a namespace import.", async () => {
    deepStrictEqual(await scanModuleCode('import * as a from "a"'), {
      imports: {
        a: new Set(["*"]),
      },
      exports: new Set(),
    });
  });

  tests.add(
    "`scanModuleCode` with a default and namespace import.",
    async () => {
      deepStrictEqual(await scanModuleCode('import a, * as b from "a"'), {
        imports: {
          a: new Set(["default", "*"]),
        },
        exports: new Set(),
      });
    }
  );

  tests.add("`scanModuleCode` with a default and named imports.", async () => {
    deepStrictEqual(await scanModuleCode('import a, { b, c } from "a"'), {
      imports: {
        a: new Set(["default", "b", "c"]),
      },
      exports: new Set(),
    });
  });

  tests.add("`scanModuleCode` with a dynamic import.", async () => {
    deepStrictEqual(await scanModuleCode('import("a")'), {
      imports: {
        a: new Set(["default", "*"]),
      },
      exports: new Set(),
    });
  });

  tests.add("`scanModuleCode` with a default export.", async () => {
    deepStrictEqual(await scanModuleCode("export default 1"), {
      imports: {},
      exports: new Set(["default"]),
    });
  });

  tests.add(
    "`scanModuleCode` with a named export, declaration, function declaration.",
    async () => {
      deepStrictEqual(await scanModuleCode("export function a() {}"), {
        imports: {},
        exports: new Set(["a"]),
      });
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, simple identifier.",
    async () => {
      deepStrictEqual(await scanModuleCode("export const a = 1"), {
        imports: {},
        exports: new Set(["a"]),
      });
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, object pattern, no renaming.",
    async () => {
      deepStrictEqual(
        await scanModuleCode("export const { a, b } = { a: 1, b: 1 }"),
        {
          imports: {},
          exports: new Set(["a", "b"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, object pattern, renaming.",
    async () => {
      deepStrictEqual(
        await scanModuleCode("export const { a, b: c } = { a: 1, b: 1 }"),
        {
          imports: {},
          exports: new Set(["a", "c"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, object pattern, rest element.",
    async () => {
      deepStrictEqual(
        await scanModuleCode("export const { a, ...b } = { a: 1, b: 1, c: 1 }"),
        {
          imports: {},
          exports: new Set(["a", "b"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, object pattern, nested array pattern.",
    async () => {
      deepStrictEqual(
        await scanModuleCode("export const { a, b: [c]} = { a: 1, b: [1] }"),
        {
          imports: {},
          exports: new Set(["a", "c"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, object pattern, nested object pattern.",
    async () => {
      deepStrictEqual(
        await scanModuleCode(
          "export const { a, b: { c }} = { a: 1, b: { c: 1 } }"
        ),
        {
          imports: {},
          exports: new Set(["a", "c"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, array pattern, no skipping.",
    async () => {
      deepStrictEqual(await scanModuleCode("export const [a, b] = [1, 2]"), {
        imports: {},
        exports: new Set(["a", "b"]),
      });
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, array pattern, skipping.",
    async () => {
      deepStrictEqual(await scanModuleCode("export const [, b] = [1, 2]"), {
        imports: {},
        exports: new Set(["b"]),
      });
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, array pattern, rest element.",
    async () => {
      deepStrictEqual(
        await scanModuleCode("export const [a, ...b] = [1, 2, 3]"),
        {
          imports: {},
          exports: new Set(["a", "b"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, array pattern, nested array pattern.",
    async () => {
      deepStrictEqual(
        await scanModuleCode("export const [a, [b]] = [1, [1, 2, 3]]"),
        {
          imports: {},
          exports: new Set(["a", "b"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, single declaration, array pattern, nested object pattern.",
    async () => {
      deepStrictEqual(
        await scanModuleCode("export const [a, { b }] = [1, { b: 1 }]"),
        {
          imports: {},
          exports: new Set(["a", "b"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, variable declaration, multiple declarations.",
    async () => {
      deepStrictEqual(await scanModuleCode("export var a, b = 1"), {
        imports: {},
        exports: new Set(["a", "b"]),
      });
    }
  );

  tests.add(
    "`scanModuleCode` with a named export, declaration, export specifier.",
    async () => {
      deepStrictEqual(await scanModuleCode("const a = 1; export { a }"), {
        imports: {},
        exports: new Set(["a"]),
      });
    }
  );

  tests.add("`scanModuleCode` with a named and default export.", async () => {
    deepStrictEqual(
      await scanModuleCode("export const a = 1; export default 1"),
      {
        imports: {},
        exports: new Set(["default", "a"]),
      }
    );
  });

  tests.add("`scanModuleCode` with an import and export.", async () => {
    deepStrictEqual(await scanModuleCode('import a from "a"; export { a }'), {
      imports: {
        a: new Set(["default"]),
      },
      exports: new Set(["a"]),
    });
  });

  tests.add("`scanModuleCode` with an export default from.", async () => {
    deepStrictEqual(await scanModuleCode('export { default } from "a"'), {
      imports: {
        a: new Set(["default"]),
      },
      exports: new Set(["default"]),
    });
  });

  tests.add(
    "`scanModuleCode` with an export default from, existing specifier.",
    async () => {
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
    }
  );

  tests.add(
    "`scanModuleCode` with an export default as name from.",
    async () => {
      deepStrictEqual(
        await scanModuleCode('export { default as a } from "a"'),
        {
          imports: {
            a: new Set(["default"]),
          },
          exports: new Set(["a"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with an export name as default from.",
    async () => {
      deepStrictEqual(
        await scanModuleCode('export { a as default } from "a"'),
        {
          imports: {
            a: new Set(["a"]),
          },
          exports: new Set(["default"]),
        }
      );
    }
  );

  tests.add("`scanModuleCode` with an export all from.", async () => {
    deepStrictEqual(await scanModuleCode('export * from "a"'), {
      imports: {
        a: new Set(["*"]),
      },
      exports: new Set([
        // All export names are unknown.
      ]),
    });
  });

  tests.add(
    "`scanModuleCode` with an export all from, existing specifier.",
    async () => {
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
    }
  );

  tests.add("`scanModuleCode` with an export namespace from.", async () => {
    deepStrictEqual(await scanModuleCode('export * as a from "a"'), {
      imports: {
        a: new Set(["*"]),
      },
      exports: new Set(["a"]),
    });
  });

  tests.add(
    "`scanModuleCode` with an ignore unused exports comment, no names.",
    async () => {
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
    }
  );

  tests.add(
    "`scanModuleCode` with an ignore unused exports comment, case insensitivity.",
    async () => {
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
    }
  );

  tests.add(
    "`scanModuleCode` with an ignore unused exports comment, whitespace tolerance.",
    async () => {
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
    }
  );

  tests.add(
    "`scanModuleCode` with an ignore unused exports comment, one name.",
    async () => {
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
    }
  );

  tests.add(
    "`scanModuleCode` with an ignore unused exports comment, multiple names.",
    async () => {
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
    }
  );

  tests.add(
    "`scanModuleCode` with an ignore unused exports comment, invalid names.",
    async () => {
      deepStrictEqual(
        await scanModuleCode(`// ignore unused exports default,,
export default 1;
`),
        {
          imports: {},
          exports: new Set(["default"]),
        }
      );
    }
  );

  tests.add(
    "`scanModuleCode` with multiple ignore unused exports comments, same name.",
    async () => {
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
    }
  );

  tests.add(
    "`scanModuleCode` with multiple ignore unused exports comments, different names.",
    async () => {
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
    }
  );

  tests.add(
    "`scanModuleCode` with an ignore unused comment block.",
    async () => {
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
    }
  );
};
