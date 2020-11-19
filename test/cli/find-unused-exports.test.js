'use strict';

const { strictEqual } = require('assert');
const { spawnSync } = require('child_process');
const { resolve } = require('path');
const snapshot = require('snapshot-assertion');
const stripStackTraces = require('../stripStackTraces');

const CLI_PATH = resolve(__dirname, '../../cli/find-unused-exports.js');
const [nodeVersionMajor] = process.versions.node.split('.');

module.exports = (tests) => {
  tests.add('`find-unused-exports` CLI with no unused exports.', async () => {
    const fixtureProjectPath = resolve(
      __dirname,
      '../fixtures/no-unused-exports'
    );
    const { stdout, stderr, status, error } = spawnSync('node', [CLI_PATH], {
      cwd: fixtureProjectPath,
      env: { ...process.env, FORCE_COLOR: 1 },
    });

    if (error) throw error;

    await snapshot(
      stdout.toString(),
      resolve(
        __dirname,
        '../snapshots/find-unused-exports/no-unused-exports-stdout.txt'
      )
    );
    strictEqual(stderr.toString(), '');
    strictEqual(status, 0);
  });

  tests.add('`find-unused-exports` CLI with some unused exports.', async () => {
    const fixtureProjectPath = resolve(
      __dirname,
      '../fixtures/some-unused-exports'
    );
    const { stdout, stderr, status, error } = spawnSync('node', [CLI_PATH], {
      cwd: fixtureProjectPath,
      env: { ...process.env, FORCE_COLOR: 1 },
    });

    if (error) throw error;

    strictEqual(stdout.toString(), '');
    await snapshot(
      stderr.toString(),
      resolve(
        __dirname,
        '../snapshots/find-unused-exports/some-unused-exports-stderr.txt'
      )
    );
    strictEqual(status, 1);
  });

  tests.add('`find-unused-exports` CLI with arg `--module-glob`.', async () => {
    const fixtureProjectPath = resolve(__dirname, '../fixtures/moduleGlob');
    const { stdout, stderr, status, error } = spawnSync(
      'node',
      [CLI_PATH, '--module-glob', '**/*.txt'],
      {
        cwd: fixtureProjectPath,
        env: { ...process.env, FORCE_COLOR: 1 },
      }
    );

    if (error) throw error;

    strictEqual(stdout.toString(), '');
    await snapshot(
      stderr.toString(),
      resolve(
        __dirname,
        '../snapshots/find-unused-exports/module-glob-stderr.txt'
      )
    );
    strictEqual(status, 1);
  });

  tests.add(
    '`find-unused-exports` CLI with arg `--resolve-file-extensions`.',
    async () => {
      const fixtureProjectPath = resolve(
        __dirname,
        '../fixtures/extensionless-import-specifiers'
      );
      const { stdout, stderr, status, error } = spawnSync(
        'node',
        [CLI_PATH, '--resolve-file-extensions', 'mjs,a.mjs'],
        {
          cwd: fixtureProjectPath,
          env: { ...process.env, FORCE_COLOR: 1 },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), '');
      await snapshot(
        stderr.toString(),
        resolve(
          __dirname,
          '../snapshots/find-unused-exports/resolve-file-extensions-stderr.txt'
        )
      );
      strictEqual(status, 1);
    }
  );

  tests.add(
    '`find-unused-exports` CLI with args `--resolve-file-extensions` and `--resolve-index-files`.',
    async () => {
      const fixtureProjectPath = resolve(
        __dirname,
        '../fixtures/extensionless-import-specifiers-and-index-files'
      );
      const { stdout, stderr, status, error } = spawnSync(
        'node',
        [
          CLI_PATH,
          '--resolve-file-extensions',
          'mjs,a.mjs',
          '--resolve-index-files',
        ],
        {
          cwd: fixtureProjectPath,
          env: { ...process.env, FORCE_COLOR: 1 },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), '');
      await snapshot(
        stderr.toString(),
        resolve(
          __dirname,
          '../snapshots/find-unused-exports/resolve-file-extensions-and-index-files-stderr.txt'
        )
      );
      strictEqual(status, 1);
    }
  );

  tests.add(
    '`find-unused-exports` CLI with arg `--resolve-index-files` without using arg `--resolve-file-extensions`.',
    async () => {
      const fixtureProjectPath = resolve(
        __dirname,
        '../fixtures/extensionless-import-specifiers-and-index-files'
      );
      const { stdout, stderr, status, error } = spawnSync(
        'node',
        [CLI_PATH, '--resolve-index-files'],
        {
          cwd: fixtureProjectPath,
          env: { ...process.env, FORCE_COLOR: 1 },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), '');
      await snapshot(
        stderr.toString(),
        resolve(
          __dirname,
          '../snapshots/find-unused-exports/resolve-index-files-without-resolve-file-extensions-stderr.txt'
        )
      );
      strictEqual(status, 1);
    }
  );

  tests.add(
    '`find-unused-exports` CLI with a module Babel can’t parse.',
    async () => {
      const fixtureProjectPath = resolve(
        __dirname,
        '../fixtures/unparsable-module'
      );
      const { stdout, stderr, status, error } = spawnSync(
        'node',
        [CLI_PATH, '--module-glob', '**/*.txt'],
        {
          cwd: fixtureProjectPath,
          env: { ...process.env, FORCE_COLOR: 1 },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), '');
      await snapshot(
        stripStackTraces(
          stderr.toString().replace(fixtureProjectPath, '<path>')
        ),
        resolve(
          __dirname,
          `../snapshots/find-unused-exports/unparsable-module-stderr-node-v${nodeVersionMajor}.txt`
        )
      );
      strictEqual(status, 1);
    }
  );
};
