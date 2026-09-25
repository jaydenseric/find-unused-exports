// @ts-check

import { strictEqual, throws } from "node:assert";
import { spawnSync } from "node:child_process";
import { snapshot, suite, test } from "node:test";
import { fileURLToPath } from "node:url";

import replaceStackTraces from "replace-stack-traces";

import reportCliError from "./reportCliError.mjs";

snapshot.setDefaultSnapshotSerializers([String]);

suite("Function `reportCliError`.", { concurrency: true }, () => {
  test("Argument 1 `cliDescription` not a string.", () => {
    throws(() => {
      reportCliError(
        // @ts-expect-error Testing invalid.
        true,
        new Error("Message."),
      );
    }, new TypeError("Argument 1 `cliDescription` must be a string."));
  });

  suite("`Error` instance.", { concurrency: true }, () => {
    test("With stack.", (context) => {
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [
          fileURLToPath(
            new URL(
              "./test-helpers/fixtures/reportCliError/Error-instance-with-stack.mjs",
              import.meta.url,
            ),
          ),
        ],
        {
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        },
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");

      context.assert.fileSnapshot(
        replaceStackTraces(stderr.toString()),
        fileURLToPath(
          new URL(
            "./test-helpers/snapshots/reportCliError/Error-instance-with-stack-stderr.ans",
            import.meta.url,
          ),
        ),
      );

      strictEqual(status, 0);
    });

    test("Without stack.", (context) => {
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [
          fileURLToPath(
            new URL(
              "./test-helpers/fixtures/reportCliError/Error-instance-without-stack.mjs",
              import.meta.url,
            ),
          ),
        ],
        {
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        },
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");

      context.assert.fileSnapshot(
        replaceStackTraces(stderr.toString()),
        fileURLToPath(
          new URL(
            "./test-helpers/snapshots/reportCliError/Error-instance-without-stack-stderr.ans",
            import.meta.url,
          ),
        ),
      );

      strictEqual(status, 0);
    });
  });

  test("`CliError` instance.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [
        fileURLToPath(
          new URL(
            "./test-helpers/fixtures/reportCliError/CliError-instance.mjs",
            import.meta.url,
          ),
        ),
      ],
      {
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");

    context.assert.fileSnapshot(
      replaceStackTraces(stderr.toString()),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/reportCliError/CliError-instance-stderr.ans",
          import.meta.url,
        ),
      ),
    );

    strictEqual(status, 0);
  });

  test("Primitive value.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [
        fileURLToPath(
          new URL(
            "./test-helpers/fixtures/reportCliError/primitive-value.mjs",
            import.meta.url,
          ),
        ),
      ],
      {
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");

    context.assert.fileSnapshot(
      replaceStackTraces(stderr.toString()),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/reportCliError/primitive-value-stderr.ans",
          import.meta.url,
        ),
      ),
    );

    strictEqual(status, 0);
  });
});
