import { strictEqual, throws } from 'assert';
import { spawnSync } from 'child_process';
import { fileURLToPath } from 'url';
import snapshot from 'snapshot-assertion';
import reportCliError from '../../private/reportCliError.mjs';
import replaceStackTraces from '../replaceStackTraces.mjs';

export default (tests) => {
  tests.add(
    '`reportCliError` with argument 1 `cliDescription` not a string.',
    () => {
      throws(() => {
        reportCliError(true);
      }, new TypeError('Argument 1 `cliDescription` must be a string.'));
    }
  );

  tests.add(
    '`reportCliError` with a `Error` instance, with stack.',
    async () => {
      const { stdout, stderr, status, error } = spawnSync(
        'node',
        [
          fileURLToPath(
            new URL(
              '../fixtures/reportCliError/Error-instance-with-stack.mjs',
              import.meta.url
            )
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
        new URL(
          '../snapshots/reportCliError/Error-instance-with-stack-stderr.ans',
          import.meta.url
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
          fileURLToPath(
            new URL(
              '../fixtures/reportCliError/Error-instance-without-stack.mjs',
              import.meta.url
            )
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
        new URL(
          '../snapshots/reportCliError/Error-instance-without-stack-stderr.ans',
          import.meta.url
        )
      );

      strictEqual(status, 0);
    }
  );

  tests.add('`reportCliError` with a `CliError` instance.', async () => {
    const { stdout, stderr, status, error } = spawnSync(
      'node',
      [
        fileURLToPath(
          new URL(
            '../fixtures/reportCliError/CliError-instance.mjs',
            import.meta.url
          )
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
      new URL(
        '../snapshots/reportCliError/CliError-instance-stderr.ans',
        import.meta.url
      )
    );

    strictEqual(status, 0);
  });

  tests.add('`reportCliError` with a primitive value.', async () => {
    const { stdout, stderr, status, error } = spawnSync(
      'node',
      [
        fileURLToPath(
          new URL(
            '../fixtures/reportCliError/primitive-value.mjs',
            import.meta.url
          )
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
      new URL(
        '../snapshots/reportCliError/primitive-value-stderr.ans',
        import.meta.url
      )
    );

    strictEqual(status, 0);
  });
};
