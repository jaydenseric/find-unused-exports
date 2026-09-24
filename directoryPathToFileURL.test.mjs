// @ts-check

import { deepStrictEqual, throws } from "node:assert";
import { suite, test } from "node:test";

import directoryPathToFileURL from "./directoryPathToFileURL.mjs";

suite("Function `directoryPathToFileURL`.", { concurrency: true }, () => {
  test("Argument 1 `directoryPath` not a string.", () => {
    throws(() => {
      directoryPathToFileURL(
        // @ts-expect-error Testing invalid.
        true,
      );
    }, new TypeError("Argument 1 `directoryPath` must be a string."));
  });

  test("Directory path ends with `/`.", () => {
    const directoryPath = "/a/b/c/";

    deepStrictEqual(
      directoryPathToFileURL(directoryPath),
      new URL(`file://${directoryPath}`),
    );
  });

  test("Directory path doesn’t end with `/`.", () => {
    const directoryPath = "/a/b/c";

    deepStrictEqual(
      directoryPathToFileURL(directoryPath),
      new URL(`file://${directoryPath}/`),
    );
  });
});
