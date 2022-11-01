// @ts-check

import { strictEqual } from "node:assert";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import replaceStackTraces from "replace-stack-traces";
import snapshot from "snapshot-assertion";

const FIND_UNUSED_EXPORTS_CLI_PATH = fileURLToPath(
  new URL("./find-unused-exports.mjs", import.meta.url)
);

/**
 * Adds `find-unused-exports` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`find-unused-exports` CLI with no unused exports.", async () => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH],
      {
        cwd: fileURLToPath(
          new URL("./test/fixtures/no-unused-exports", import.meta.url)
        ),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      }
    );

    if (error) throw error;

    await snapshot(
      stdout.toString(),
      new URL(
        "./test/snapshots/find-unused-exports/no-unused-exports-stdout.ans",
        import.meta.url
      )
    );
    strictEqual(stderr.toString(), "");
    strictEqual(status, 0);
  });

  tests.add("`find-unused-exports` CLI with some unused exports.", async () => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH],
      {
        cwd: fileURLToPath(
          new URL("./test/fixtures/some-unused-exports", import.meta.url)
        ),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      }
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    await snapshot(
      stderr.toString(),
      new URL(
        "./test/snapshots/find-unused-exports/some-unused-exports-stderr.ans",
        import.meta.url
      )
    );
    strictEqual(status, 1);
  });

  tests.add(
    "`find-unused-exports` CLI with a module containing TypeScript syntax.",
    async () => {
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [FIND_UNUSED_EXPORTS_CLI_PATH],
        {
          cwd: fileURLToPath(
            new URL("./test/fixtures/typescript-syntax", import.meta.url)
          ),
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");
      await snapshot(
        stderr.toString(),
        new URL(
          "./test/snapshots/find-unused-exports/typescript-syntax-stderr.ans",
          import.meta.url
        )
      );
      strictEqual(status, 1);
    }
  );

  tests.add("`find-unused-exports` CLI with arg `--module-glob`.", async () => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH, "--module-glob", "**/*.txt"],
      {
        cwd: fileURLToPath(
          new URL("./test/fixtures/moduleGlob", import.meta.url)
        ),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      }
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    await snapshot(
      stderr.toString(),
      new URL(
        "./test/snapshots/find-unused-exports/module-glob-stderr.ans",
        import.meta.url
      )
    );
    strictEqual(status, 1);
  });

  tests.add(
    "`find-unused-exports` CLI with arg `--resolve-file-extensions`.",
    async () => {
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [
          FIND_UNUSED_EXPORTS_CLI_PATH,
          "--resolve-file-extensions",
          "mjs,a.mjs",
        ],
        {
          cwd: fileURLToPath(
            new URL(
              "./test/fixtures/extensionless-import-specifiers",
              import.meta.url
            )
          ),
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");
      await snapshot(
        stderr.toString(),
        new URL(
          "./test/snapshots/find-unused-exports/resolve-file-extensions-stderr.ans",
          import.meta.url
        )
      );
      strictEqual(status, 1);
    }
  );

  tests.add(
    "`find-unused-exports` CLI with args `--resolve-file-extensions` and `--resolve-index-files`.",
    async () => {
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [
          FIND_UNUSED_EXPORTS_CLI_PATH,
          "--resolve-file-extensions",
          "mjs,a.mjs",
          "--resolve-index-files",
        ],
        {
          cwd: fileURLToPath(
            new URL(
              "./test/fixtures/extensionless-import-specifiers-and-index-files",
              import.meta.url
            )
          ),
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");
      await snapshot(
        stderr.toString(),
        new URL(
          "./test/snapshots/find-unused-exports/resolve-file-extensions-and-index-files-stderr.ans",
          import.meta.url
        )
      );
      strictEqual(status, 1);
    }
  );

  tests.add(
    "`find-unused-exports` CLI with arg `--resolve-index-files` without using arg `--resolve-file-extensions`.",
    async () => {
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [FIND_UNUSED_EXPORTS_CLI_PATH, "--resolve-index-files"],
        {
          cwd: fileURLToPath(
            new URL(
              "./test/fixtures/extensionless-import-specifiers-and-index-files",
              import.meta.url
            )
          ),
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");
      await snapshot(
        stderr.toString(),
        new URL(
          "./test/snapshots/find-unused-exports/resolve-index-files-without-resolve-file-extensions-stderr.ans",
          import.meta.url
        )
      );
      strictEqual(status, 1);
    }
  );

  tests.add(
    "`find-unused-exports` CLI with a module Babel can’t parse.",
    async () => {
      const fixtureProjectPath = fileURLToPath(
        new URL("./test/fixtures/unparsable-module", import.meta.url)
      );
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [FIND_UNUSED_EXPORTS_CLI_PATH, "--module-glob", "**/*.txt"],
        {
          cwd: fixtureProjectPath,
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        }
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");
      await snapshot(
        replaceStackTraces(
          stderr.toString().replace(fixtureProjectPath, "<path>")
        ),
        new URL(
          "./test/snapshots/find-unused-exports/unparsable-module-stderr.ans",
          import.meta.url
        )
      );
      strictEqual(status, 1);
    }
  );
};
