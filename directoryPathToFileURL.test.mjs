// @ts-check

import { deepStrictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import directoryPathToFileURL from "./directoryPathToFileURL.mjs";

describe("Function `directoryPathToFileURL`.", { concurrency: true }, () => {
  it("Argument 1 `directoryPath` not a string.", () => {
    throws(() => {
      directoryPathToFileURL(
        // @ts-expect-error Testing invalid.
        true,
      );
    }, new TypeError("Argument 1 `directoryPath` must be a string."));
  });

  it("Directory path ends with `/`.", () => {
    const directoryPath = "/a/b/c/";

    deepStrictEqual(
      directoryPathToFileURL(directoryPath),
      new URL(`file://${directoryPath}`),
    );
  });

  it("Directory path doesn’t end with `/`.", () => {
    const directoryPath = "/a/b/c";

    deepStrictEqual(
      directoryPathToFileURL(directoryPath),
      new URL(`file://${directoryPath}/`),
    );
  });
});
