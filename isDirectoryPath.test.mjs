// @ts-check

import { rejects, strictEqual } from "node:assert";
import { describe, it } from "node:test";
import { fileURLToPath } from "node:url";

import isDirectoryPath from "./isDirectoryPath.mjs";

describe("Function `isDirectoryPath`.", { concurrency: true }, () => {
  it("Argument 1 `path` not a string.", async () => {
    await rejects(
      isDirectoryPath(
        // @ts-expect-error Testing invalid.
        true,
      ),
      new TypeError("Argument 1 `path` must be a string."),
    );
  });

  it("Directory path.", async () => {
    strictEqual(
      await isDirectoryPath(fileURLToPath(new URL("./", import.meta.url))),
      true,
    );
  });

  it("File path.", async () => {
    strictEqual(await isDirectoryPath(fileURLToPath(import.meta.url)), false);
  });

  it("Nonexistent path.", async () => {
    strictEqual(
      await isDirectoryPath(
        fileURLToPath(new URL("nonexistent", import.meta.url)),
      ),
      false,
    );
  });
});
