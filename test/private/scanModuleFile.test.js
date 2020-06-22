'use strict';

const { deepStrictEqual } = require('assert');
const { resolve } = require('path');
const scanModuleFile = require('../../private/scanModuleFile');

module.exports = (tests) => {
  tests.add(
    '`scanModuleFile` with a file without imports or exports.',
    async () => {
      deepStrictEqual(
        await scanModuleFile(
          resolve(__dirname, '../fixtures/no-imports-exports.mjs')
        ),
        {
          imports: {},
          exports: new Set(),
        }
      );
    }
  );

  tests.add('`scanModuleFile` with a file with imports.', async () => {
    deepStrictEqual(
      await scanModuleFile(resolve(__dirname, '../fixtures/imports.mjs')),
      {
        imports: {
          './exports.mjs': new Set(['default', 'a', 'b', 'c', 'd', 'e']),
        },
        exports: new Set(),
      }
    );
  });

  tests.add('`scanModuleFile` with a file with exports.', async () => {
    deepStrictEqual(
      await scanModuleFile(resolve(__dirname, '../fixtures/exports.mjs')),
      {
        imports: {},
        exports: new Set(['default', 'a', 'b', 'c', 'd', 'e']),
      }
    );
  });
};
