// @ts-check

import { rejects, strictEqual } from "node:assert";
import { suite, test } from "node:test";
import { fileURLToPath } from "node:url";

import isDirectoryPath from "./isDirectoryPath.mjs";

suite("Function `isDirectoryPath`.", { concurrency: true }, () => {
  test("Argument 1 `path` not a string.", async () => {
    await rejects(
      isDirectoryPath(
        // @ts-expect-error Testing invalid.
        true,
      ),
      new TypeError("Argument 1 `path` must be a string."),
    );
  });

  test("Directory path.", async () => {
    strictEqual(
      await isDirectoryPath(fileURLToPath(new URL("./", import.meta.url))),
      true,
    );
  });

  test("File path.", async () => {
    strictEqual(await isDirectoryPath(fileURLToPath(import.meta.url)), false);
  });

  test("Nonexistent path.", async () => {
    strictEqual(
      await isDirectoryPath(
        fileURLToPath(new URL("nonexistent", import.meta.url)),
      ),
      false,
    );
  });
});
