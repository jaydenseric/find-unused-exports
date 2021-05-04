import { rejects, strictEqual } from 'assert';
import { fileURLToPath } from 'url';
import isDirectoryPath from '../../private/isDirectoryPath.mjs';

export default (tests) => {
  tests.add(
    '`isDirectoryPath` with argument 1 `path` not a string.',
    async () => {
      await rejects(
        isDirectoryPath(true),
        new TypeError('Argument 1 `path` must be a string.')
      );
    }
  );

  tests.add('`isDirectoryPath` with a directory path.', async () => {
    strictEqual(
      await isDirectoryPath(fileURLToPath(new URL('./', import.meta.url))),
      true
    );
  });

  tests.add('`isDirectoryPath` with a file path.', async () => {
    strictEqual(await isDirectoryPath(fileURLToPath(import.meta.url)), false);
  });

  tests.add('`isDirectoryPath` with a nonexistent path.', async () => {
    strictEqual(
      await isDirectoryPath(
        fileURLToPath(new URL('nonexistent', import.meta.url))
      ),
      false
    );
  });
};
