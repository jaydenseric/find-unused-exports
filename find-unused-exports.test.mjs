// @ts-check

import { strictEqual } from "node:assert";
import { spawnSync } from "node:child_process";
import { snapshot, suite, test } from "node:test";
import { fileURLToPath } from "node:url";

import replaceStackTraces from "replace-stack-traces";

snapshot.setDefaultSnapshotSerializers([String]);

suite("CLI command `find-unused-exports`.", { concurrency: true }, () => {
  const FIND_UNUSED_EXPORTS_CLI_PATH = fileURLToPath(
    new URL("./find-unused-exports.mjs", import.meta.url),
  );

  test("No unused exports.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH],
      {
        cwd: new URL(
          "./test-helpers/fixtures/no-unused-exports",
          import.meta.url,
        ),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    context.assert.fileSnapshot(
      stdout.toString(),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/find-unused-exports/no-unused-exports-stdout.ans",
          import.meta.url,
        ),
      ),
    );
    strictEqual(stderr.toString(), "");
    strictEqual(status, 0);
  });

  test("Some unused exports.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH],
      {
        cwd: new URL(
          "./test-helpers/fixtures/some-unused-exports",
          import.meta.url,
        ),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    context.assert.fileSnapshot(
      stderr.toString(),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/find-unused-exports/some-unused-exports-stderr.ans",
          import.meta.url,
        ),
      ),
    );
    strictEqual(status, 1);
  });

  test("Module containing TypeScript syntax.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH],
      {
        cwd: new URL(
          "./test-helpers/fixtures/typescript-syntax",
          import.meta.url,
        ),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    context.assert.fileSnapshot(
      stderr.toString(),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/find-unused-exports/typescript-syntax-stderr.ans",
          import.meta.url,
        ),
      ),
    );
    strictEqual(status, 1);
  });

  test("Arg `--exclude-glob`.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH, "--exclude-glob", "**/b.mjs"],
      {
        cwd: new URL("./test-helpers/fixtures/excludeGlob", import.meta.url),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    context.assert.fileSnapshot(
      stderr.toString(),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/find-unused-exports/exclude-glob-stderr.ans",
          import.meta.url,
        ),
      ),
    );
    strictEqual(status, 1);
  });

  suite("Arg `--ignore`.", { concurrency: true }, () => {
    test("Invalid.", (context) => {
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [FIND_UNUSED_EXPORTS_CLI_PATH, "--ignore", "_"],
        {
          cwd: new URL(
            "./test-helpers/fixtures/option-ignore",
            import.meta.url,
          ),
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        },
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");
      context.assert.fileSnapshot(
        stderr.toString(),
        fileURLToPath(
          new URL(
            "./test-helpers/snapshots/find-unused-exports/ignore-invalid-stderr.ans",
            import.meta.url,
          ),
        ),
      );
      strictEqual(status, 1);
    });

    test("Valid.", (context) => {
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [
          FIND_UNUSED_EXPORTS_CLI_PATH,
          "--ignore",
          JSON.stringify({
            "a.mjs": ["default"],
            "b.mjs": ["a"],
          }),
        ],
        {
          cwd: new URL(
            "./test-helpers/fixtures/option-ignore",
            import.meta.url,
          ),
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        },
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");
      context.assert.fileSnapshot(
        stderr.toString(),
        fileURLToPath(
          new URL(
            "./test-helpers/snapshots/find-unused-exports/ignore-valid-stderr.ans",
            import.meta.url,
          ),
        ),
      );
      strictEqual(status, 1);
    });
  });

  suite("Arg `--import-map`.", { concurrency: true }, () => {
    test("Invalid.", (context) => {
      const { stdout, stderr, status, error } = spawnSync(
        "node",
        [FIND_UNUSED_EXPORTS_CLI_PATH, "--import-map", "_"],
        {
          cwd: new URL("./test-helpers/fixtures/import-map", import.meta.url),
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
        },
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");
      context.assert.fileSnapshot(
        stderr.toString(),
        fileURLToPath(
          new URL(
            "./test-helpers/snapshots/find-unused-exports/import-map-invalid-stderr.ans",
            import.meta.url,
          ),
        ),
      );
      strictEqual(status, 1);
    });

    test("Valid.", (context) => {
      const { stdout, stderr, status, error } = spawnSync(
        // Workaround Node.js deprecating passing args with shell enabled:
        // https://nodejs.org/api/deprecations.html#DEP0190
        [
          "node",
          FIND_UNUSED_EXPORTS_CLI_PATH,
          "--import-map",
          // Instead of providing the import map directly, shell is used to test
          // the readme example of using the CLI with an import map JSON file.
          '"$(cat import-map.json)"',
        ].join(" "),
        {
          cwd: new URL("./test-helpers/fixtures/import-map", import.meta.url),
          env: {
            ...process.env,
            FORCE_COLOR: "1",
          },
          shell: true,
        },
      );

      if (error) throw error;

      strictEqual(stdout.toString(), "");
      context.assert.fileSnapshot(
        stderr.toString(),
        fileURLToPath(
          new URL(
            "./test-helpers/snapshots/find-unused-exports/import-map-valid-stderr.ans",
            import.meta.url,
          ),
        ),
      );
      strictEqual(status, 1);
    });
  });

  test("Arg `--module-glob`.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH, "--module-glob", "**/*.txt"],
      {
        cwd: new URL("./test-helpers/fixtures/moduleGlob", import.meta.url),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    context.assert.fileSnapshot(
      stderr.toString(),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/find-unused-exports/module-glob-stderr.ans",
          import.meta.url,
        ),
      ),
    );
    strictEqual(status, 1);
  });

  test("Arg `--resolve-file-extensions`.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH, "--resolve-file-extensions", "mjs,a.mjs"],
      {
        cwd: new URL(
          "./test-helpers/fixtures/extensionless-import-specifiers",
          import.meta.url,
        ),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    context.assert.fileSnapshot(
      stderr.toString(),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/find-unused-exports/resolve-file-extensions-stderr.ans",
          import.meta.url,
        ),
      ),
    );
    strictEqual(status, 1);
  });

  test("Args `--resolve-file-extensions` and `--resolve-index-files`.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [
        FIND_UNUSED_EXPORTS_CLI_PATH,
        "--resolve-file-extensions",
        "mjs,a.mjs",
        "--resolve-index-files",
      ],
      {
        cwd: new URL(
          "./test-helpers/fixtures/extensionless-import-specifiers-and-index-files",
          import.meta.url,
        ),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    context.assert.fileSnapshot(
      stderr.toString(),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/find-unused-exports/resolve-file-extensions-and-index-files-stderr.ans",
          import.meta.url,
        ),
      ),
    );
    strictEqual(status, 1);
  });

  test("Arg `--resolve-index-files` without using arg `--resolve-file-extensions`.", (context) => {
    const { stdout, stderr, status, error } = spawnSync(
      "node",
      [FIND_UNUSED_EXPORTS_CLI_PATH, "--resolve-index-files"],
      {
        cwd: new URL(
          "./test-helpers/fixtures/extensionless-import-specifiers-and-index-files",
          import.meta.url,
        ),
        env: {
          ...process.env,
          FORCE_COLOR: "1",
        },
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    context.assert.fileSnapshot(
      stderr.toString(),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/find-unused-exports/resolve-index-files-without-resolve-file-extensions-stderr.ans",
          import.meta.url,
        ),
      ),
    );
    strictEqual(status, 1);
  });

  test("Module Babel can’t parse.", (context) => {
    const fixtureProjectPath = fileURLToPath(
      new URL("./test-helpers/fixtures/unparsable-module", import.meta.url),
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
      },
    );

    if (error) throw error;

    strictEqual(stdout.toString(), "");
    context.assert.fileSnapshot(
      replaceStackTraces(
        stderr.toString().replace(fixtureProjectPath, "<path>"),
      ),
      fileURLToPath(
        new URL(
          "./test-helpers/snapshots/find-unused-exports/unparsable-module-stderr.ans",
          import.meta.url,
        ),
      ),
    );
    strictEqual(status, 1);
  });
});
