'use strict';

const { deepStrictEqual, rejects } = require('assert');
const { resolve, join } = require('path');
const findUnusedExports = require('../../public/findUnusedExports');

module.exports = (tests) => {
  tests.add(
    '`findUnusedExports` with files but no exports or imports.',
    async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: resolve(__dirname, '../fixtures/files-without-exports-imports'),
        }),
        {}
      );
    }
  );

  tests.add(
    '`findUnusedExports` with multiple files importing from the same file.',
    async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: resolve(
            __dirname,
            '../fixtures/multiple-files-importing-from-same-file'
          ),
        }),
        {}
      );
    }
  );

  tests.add('`findUnusedExports` with no unused exports.', async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: resolve(__dirname, '../fixtures/no-unused-exports'),
      }),
      {}
    );
  });

  tests.add('`findUnusedExports` with some unused exports.', async () => {
    const fixtureProjectPath = resolve(
      __dirname,
      '../fixtures/some-unused-exports'
    );

    deepStrictEqual(await findUnusedExports({ cwd: fixtureProjectPath }), {
      [join(fixtureProjectPath, 'a.mjs')]: new Set(['default', 'a']),
      [resolve(fixtureProjectPath, 'b.mjs')]: new Set(['b']),
    });
  });

  tests.add(
    '`findUnusedExports` with a namespace import and a default import.',
    async () => {
      const fixtureProjectPath = resolve(
        __dirname,
        '../fixtures/namespace-import-and-default-import'
      );

      deepStrictEqual(await findUnusedExports({ cwd: fixtureProjectPath }), {});
    }
  );

  tests.add(
    '`findUnusedExports` with a namespace import without a default import.',
    async () => {
      const fixtureProjectPath = resolve(
        __dirname,
        '../fixtures/namespace-import-without-default-import'
      );

      deepStrictEqual(await findUnusedExports({ cwd: fixtureProjectPath }), {
        [join(fixtureProjectPath, 'a.mjs')]: new Set(['default']),
      });
    }
  );

  tests.add('`findUnusedExports` with a bare import specifier.', async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: resolve(__dirname, '../fixtures/bare-import-specifier'),
      }),
      {}
    );
  });

  tests.add(
    '`findUnusedExports` with an unresolvable import specifier.',
    async () => {
      deepStrictEqual(
        await findUnusedExports({
          cwd: resolve(__dirname, '../fixtures/unresolvable-import-specifier'),
        }),
        {}
      );
    }
  );

  tests.add('`findUnusedExports` with a .gitignore file.', async () => {
    deepStrictEqual(
      await findUnusedExports({
        cwd: resolve(__dirname, '../fixtures/gitignore'),
      }),
      {}
    );
  });

  tests.add(
    '`findUnusedExports` with ignore unused exports comments.',
    async () => {
      const fixtureProjectPath = resolve(
        __dirname,
        '../fixtures/ignore-unused-exports-comments'
      );

      deepStrictEqual(
        await findUnusedExports({
          cwd: fixtureProjectPath,
        }),
        {
          [join(fixtureProjectPath, 'b.mjs')]: new Set(['a']),
          [join(fixtureProjectPath, 'c.mjs')]: new Set(['default']),
        }
      );
    }
  );

  tests.add('`findUnusedExports` with option `moduleGlob`.', async () => {
    const fixtureProjectPath = resolve(__dirname, '../fixtures/moduleGlob');

    deepStrictEqual(
      await findUnusedExports({
        cwd: fixtureProjectPath,
        moduleGlob: '**/*.txt',
      }),
      {
        [join(fixtureProjectPath, 'a.txt')]: new Set(['default']),
      }
    );
  });

  tests.add(
    '`findUnusedExports` with option `resolveFileExtensions`.',
    async () => {
      const fixtureProjectPath = resolve(
        __dirname,
        '../fixtures/extensionless-import-specifiers'
      );

      deepStrictEqual(
        await findUnusedExports({
          cwd: fixtureProjectPath,
          resolveFileExtensions: ['mjs', 'a.mjs'],
        }),
        {
          [join(fixtureProjectPath, 'b.a.mjs')]: new Set(['default']),
        }
      );
    }
  );

  tests.add(
    '`findUnusedExports` with options `resolveFileExtensions` and `resolveIndexFiles`.',
    async () => {
      const fixtureProjectPath = resolve(
        __dirname,
        '../fixtures/extensionless-import-specifiers-and-index-files'
      );

      deepStrictEqual(
        await findUnusedExports({
          cwd: fixtureProjectPath,
          resolveFileExtensions: ['mjs', 'a.mjs'],
          resolveIndexFiles: true,
        }),
        {
          [join(fixtureProjectPath, 'b/index.a.mjs')]: new Set(['default']),
        }
      );
    }
  );

  tests.add('`findUnusedExports` with option `cwd` not a string.', async () => {
    await rejects(
      findUnusedExports({ cwd: true }),
      new TypeError('Option `cwd` must be a string.')
    );
  });

  tests.add(
    '`findUnusedExports` with option `cwd` an inaccessible directory path.',
    async () => {
      await rejects(
        findUnusedExports({ cwd: join(__dirname, 'nonexistent') }),
        new TypeError('Option `cwd` must be an accessible directory path.')
      );
    }
  );

  tests.add(
    '`findUnusedExports` with option `moduleGlob` not a string.',
    async () => {
      await rejects(
        findUnusedExports({ moduleGlob: true }),
        new TypeError('Option `moduleGlob` must be a string.')
      );
    }
  );

  tests.add(
    '`findUnusedExports` with option `resolveFileExtensions` not an array.',
    async () => {
      await rejects(
        findUnusedExports({ resolveFileExtensions: true }),
        new TypeError(
          'Option `resolveFileExtensions` must be an array of strings.'
        )
      );
    }
  );

  tests.add(
    '`findUnusedExports` with option `resolveFileExtensions` an empty array.',
    async () => {
      await rejects(
        findUnusedExports({ resolveFileExtensions: [] }),
        new TypeError(
          'Option `resolveFileExtensions` must be an array of strings.'
        )
      );
    }
  );

  tests.add(
    '`findUnusedExports` with option `resolveFileExtensions` an array with an item not a string.',
    async () => {
      await rejects(
        findUnusedExports({ resolveFileExtensions: ['a', true, 'b'] }),
        new TypeError(
          'Option `resolveFileExtensions` must be an array of strings.'
        )
      );
    }
  );

  tests.add(
    '`findUnusedExports` with option `resolveIndexFiles` not a boolean.',
    async () => {
      await rejects(
        findUnusedExports({
          resolveFileExtensions: ['js'],
          resolveIndexFiles: '',
        }),
        new TypeError('Option `resolveIndexFiles` must be a boolean.')
      );
    }
  );

  tests.add(
    '`findUnusedExports` with option `resolveIndexFiles` `true` without using option `resolveFileExtensions`.',
    async () => {
      await rejects(
        findUnusedExports({ resolveIndexFiles: true }),
        new TypeError(
          'Option `resolveIndexFiles` can only be `true` if the option `resolveFileExtensions` is used.'
        )
      );
    }
  );
};
