'use strict';

const { deepStrictEqual } = require('assert');
const scanModuleCode = require('../../private/scanModuleCode');

module.exports = (tests) => {
  tests.add('`scanModuleCode` without imports or exports.', async () => {
    deepStrictEqual(await scanModuleCode(''), {
      imports: {},
      exports: new Set(),
    });
  });

  tests.add('`scanModuleCode` with a default import.', async () => {
    deepStrictEqual(await scanModuleCode("import a from 'a'"), {
      imports: {
        a: new Set(['default']),
      },
      exports: new Set(),
    });
  });

  tests.add(
    '`scanModuleCode` with a default import, existing specifier.',
    async () => {
      deepStrictEqual(
        await scanModuleCode("import { a } from 'a'; import b from 'a'"),
        {
          imports: {
            a: new Set(['default', 'a']),
          },
          exports: new Set(),
        }
      );
    }
  );

  tests.add('`scanModuleCode` with named imports.', async () => {
    deepStrictEqual(await scanModuleCode("import { a, b } from 'a'"), {
      imports: {
        a: new Set(['a', 'b']),
      },
      exports: new Set(),
    });
  });

  tests.add('`scanModuleCode` with a namespace import.', async () => {
    deepStrictEqual(await scanModuleCode("import * as a from 'a'"), {
      imports: {
        a: new Set(['*']),
      },
      exports: new Set(),
    });
  });

  tests.add(
    '`scanModuleCode` with a default and namespace import.',
    async () => {
      deepStrictEqual(await scanModuleCode("import a, * as b from 'a'"), {
        imports: {
          a: new Set(['default', '*']),
        },
        exports: new Set(),
      });
    }
  );

  tests.add('`scanModuleCode` with a default and named imports.', async () => {
    deepStrictEqual(await scanModuleCode("import a, { b, c } from 'a'"), {
      imports: {
        a: new Set(['default', 'b', 'c']),
      },
      exports: new Set(),
    });
  });

  tests.add('`scanModuleCode` with a dynamic import.', async () => {
    deepStrictEqual(await scanModuleCode("import('a')"), {
      imports: {
        a: new Set(['default', '*']),
      },
      exports: new Set(),
    });
  });

  tests.add('`scanModuleCode` with a default export.', async () => {
    deepStrictEqual(await scanModuleCode('export default true'), {
      imports: {},
      exports: new Set(['default']),
    });
  });

  tests.add(
    '`scanModuleCode` with a named export, ExportNamedDeclaration, FunctionDeclaration.',
    async () => {
      deepStrictEqual(await scanModuleCode('export function a() {}'), {
        imports: {},
        exports: new Set(['a']),
      });
    }
  );

  tests.add(
    '`scanModuleCode` with a named export, ExportNamedDeclaration, VariableDeclarator, one declaration.',
    async () => {
      deepStrictEqual(await scanModuleCode('export const a = true'), {
        imports: {},
        exports: new Set(['a']),
      });
    }
  );

  tests.add(
    '`scanModuleCode` with a named export, ExportNamedDeclaration, VariableDeclarator, multiple declarations.',
    async () => {
      deepStrictEqual(await scanModuleCode('export var a, b, c = true'), {
        imports: {},
        exports: new Set(['a', 'b', 'c']),
      });
    }
  );

  tests.add(
    '`scanModuleCode` with a named export, ExportNamedDeclaration, ExportSpecifier.',
    async () => {
      deepStrictEqual(await scanModuleCode('const a = true; export { a }'), {
        imports: {},
        exports: new Set(['a']),
      });
    }
  );

  tests.add('`scanModuleCode` with a named and default export.', async () => {
    deepStrictEqual(
      await scanModuleCode('export const a = true; export default true'),
      {
        imports: {},
        exports: new Set(['default', 'a']),
      }
    );
  });

  tests.add('`scanModuleCode` with an import and export.', async () => {
    deepStrictEqual(await scanModuleCode("import a from 'a'; export { a }"), {
      imports: {
        a: new Set(['default']),
      },
      exports: new Set(['a']),
    });
  });

  tests.add('`scanModuleCode` with an export default from.', async () => {
    deepStrictEqual(await scanModuleCode("export { default } from 'a'"), {
      imports: {
        a: new Set(['default']),
      },
      exports: new Set(['default']),
    });
  });

  tests.add(
    '`scanModuleCode` with an export default from, existing specifier.',
    async () => {
      deepStrictEqual(
        await scanModuleCode(
          "import { a } from 'a'; export { default } from 'a'"
        ),
        {
          imports: {
            a: new Set(['default', 'a']),
          },
          exports: new Set(['default']),
        }
      );
    }
  );

  tests.add(
    '`scanModuleCode` with an export default as name from.',
    async () => {
      deepStrictEqual(
        await scanModuleCode("export { default as a } from 'a'"),
        {
          imports: {
            a: new Set(['default']),
          },
          exports: new Set(['a']),
        }
      );
    }
  );

  tests.add(
    '`scanModuleCode` with an export name as default from.',
    async () => {
      deepStrictEqual(
        await scanModuleCode("export { a as default } from 'a'"),
        {
          imports: {
            a: new Set(['a']),
          },
          exports: new Set(['default']),
        }
      );
    }
  );

  tests.add('`scanModuleCode` with an export all from.', async () => {
    deepStrictEqual(await scanModuleCode("export * from 'a'"), {
      imports: {
        a: new Set(['*']),
      },
      exports: new Set([
        // All export names are unknown.
      ]),
    });
  });

  tests.add(
    '`scanModuleCode` with an export all from, existing specifier.',
    async () => {
      deepStrictEqual(
        await scanModuleCode("export { a } from 'a'; export * from 'a'"),
        {
          imports: {
            a: new Set(['*', 'a']),
          },
          exports: new Set([
            'a',
            // All export names are unknown.
          ]),
        }
      );
    }
  );

  tests.add('`scanModuleCode` with an export namespace from.', async () => {
    deepStrictEqual(await scanModuleCode("export * as a from 'a'"), {
      imports: {
        a: new Set(['*']),
      },
      exports: new Set(['a']),
    });
  });
};
