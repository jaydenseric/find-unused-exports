// @ts-check

import { strictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import CliError from "./CliError.mjs";

describe("Class `CliError`.", { concurrency: true }, () => {
  it("Argument 1 `message` not a string.", () => {
    throws(() => {
      new CliError(
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 1 `message` must be a string."));
  });

  it("Arguments valid.", () => {
    const message = "Message.";
    const error = new CliError(message);

    strictEqual(error instanceof Error, true);
    strictEqual(error.name, "CliError");
    strictEqual(error.message, message);
  });
});
