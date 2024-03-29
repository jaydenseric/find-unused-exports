// @ts-check

import { rejects, strictEqual } from "node:assert";
import { fileURLToPath } from "node:url";

import isDirectoryPath from "./isDirectoryPath.mjs";

/**
 * Adds `isDirectoryPath` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add(
    "`isDirectoryPath` with argument 1 `path` not a string.",
    async () => {
      await rejects(
        isDirectoryPath(
          // @ts-expect-error Testing invalid.
          true
        ),
        new TypeError("Argument 1 `path` must be a string.")
      );
    }
  );

  tests.add("`isDirectoryPath` with a directory path.", async () => {
    strictEqual(
      await isDirectoryPath(fileURLToPath(new URL("./", import.meta.url))),
      true
    );
  });

  tests.add("`isDirectoryPath` with a file path.", async () => {
    strictEqual(await isDirectoryPath(fileURLToPath(import.meta.url)), false);
  });

  tests.add("`isDirectoryPath` with a nonexistent path.", async () => {
    strictEqual(
      await isDirectoryPath(
        fileURLToPath(new URL("nonexistent", import.meta.url))
      ),
      false
    );
  });
};
