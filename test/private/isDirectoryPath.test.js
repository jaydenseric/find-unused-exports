'use strict';

const { strictEqual } = require('assert');
const { join } = require('path');
const isDirectoryPath = require('../../private/isDirectoryPath');

module.exports = (tests) => {
  tests.add('`isDirectoryPath` with a directory path.', async () => {
    strictEqual(await isDirectoryPath(__dirname), true);
  });

  tests.add('`isDirectoryPath` with a file path.', async () => {
    strictEqual(await isDirectoryPath(__filename), false);
  });

  tests.add('`isDirectoryPath` with a nonexistent path.', async () => {
    strictEqual(await isDirectoryPath(join(__dirname, 'nonexistent')), false);
  });
};
