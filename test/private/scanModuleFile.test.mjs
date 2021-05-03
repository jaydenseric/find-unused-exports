import { deepStrictEqual } from 'assert';
import { fileURLToPath } from 'url';
import scanModuleFile from '../../private/scanModuleFile.mjs';

export default (tests) => {
  tests.add(
    '`scanModuleFile` with a file without imports or exports.',
    async () => {
      deepStrictEqual(
        await scanModuleFile(
          fileURLToPath(
            new URL('../fixtures/no-imports-exports.mjs', import.meta.url)
          )
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
      await scanModuleFile(
        fileURLToPath(new URL('../fixtures/imports.mjs', import.meta.url))
      ),
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
      await scanModuleFile(
        fileURLToPath(new URL('../fixtures/exports.mjs', import.meta.url))
      ),
      {
        imports: {},
        exports: new Set(['default', 'a', 'b', 'c', 'd', 'e']),
      }
    );
  });
};
