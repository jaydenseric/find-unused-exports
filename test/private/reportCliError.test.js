'use strict';

const { strictEqual, throws } = require('assert');
const { spawnSync } = require('child_process');
const { resolve } = require('path');
const snapshot = require('snapshot-assertion');
const reportCliError = require('../../private/reportCliError');
const replaceStackTraces = require('../replaceStackTraces');

module.exports = (tests) => {
  tests.add(
    '`reportCliError` with first argument `cliDescription` not a string.',
    () => {
      throws(() => {
        reportCliError(true);
      }, new TypeError('First argument `cliDescription` must be a string.'));
    }
  );

  tests.add(
    '`reportCliError` with a `Error` instance, with stack.',
    async () => {
      const { stdout, stderr, status, error } = spawnSync(
        'node',
        [
          resolve(
            __dirname,
            '../fixtures/reportCliError/Error-instance-with-stack.js'
          ),
        ],
        {
          env: {
            ...process.env,
            FORCE_COLOR: 1,
          },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), '');

      await snapshot(
        replaceStackTraces(stderr.toString()),
        resolve(
          __dirname,
          '../snapshots/reportCliError/Error-instance-with-stack-stderr.ans'
        )
      );

      strictEqual(status, 0);
    }
  );

  tests.add(
    '`reportCliError` with a `Error` instance, without stack.',
    async () => {
      const { stdout, stderr, status, error } = spawnSync(
        'node',
        [
          resolve(
            __dirname,
            '../fixtures/reportCliError/Error-instance-without-stack.js'
          ),
        ],
        {
          env: {
            ...process.env,
            FORCE_COLOR: 1,
          },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), '');

      await snapshot(
        replaceStackTraces(stderr.toString()),
        resolve(
          __dirname,
          '../snapshots/reportCliError/Error-instance-without-stack-stderr.ans'
        )
      );

      strictEqual(status, 0);
    }
  );

  tests.add('`reportCliError` with a `CliError` instance.', async () => {
    const { stdout, stderr, status, error } = spawnSync(
      'node',
      [resolve(__dirname, '../fixtures/reportCliError/CliError-instance.js')],
      {
        env: {
          ...process.env,
          FORCE_COLOR: 1,
        },
      }
    );

    if (error) throw error;

    strictEqual(stdout.toString(), '');

    await snapshot(
      replaceStackTraces(stderr.toString()),
      resolve(
        __dirname,
        '../snapshots/reportCliError/CliError-instance-stderr.ans'
      )
    );

    strictEqual(status, 0);
  });

  tests.add('`reportCliError` with a primitive value.', async () => {
    const { stdout, stderr, status, error } = spawnSync(
      'node',
      [resolve(__dirname, '../fixtures/reportCliError/primitive-value.js')],
      {
        env: {
          ...process.env,
          FORCE_COLOR: 1,
        },
      }
    );

    if (error) throw error;

    strictEqual(stdout.toString(), '');

    await snapshot(
      replaceStackTraces(stderr.toString()),
      resolve(
        __dirname,
        '../snapshots/reportCliError/primitive-value-stderr.ans'
      )
    );

    strictEqual(status, 0);
  });
};
