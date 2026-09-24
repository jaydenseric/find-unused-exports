// @ts-check

import { strictEqual, throws } from "node:assert";
import { suite, test } from "node:test";

import CliError from "./CliError.mjs";

suite("Class `CliError`.", { concurrency: true }, () => {
  test("Argument 1 `message` not a string.", () => {
    throws(() => {
      new CliError(
        // @ts-expect-error Testing invalid.
        true,
      );
    }, new TypeError("Argument 1 `message` must be a string."));
  });

  test("Arguments valid.", () => {
    const message = "Message.";
    const error = new CliError(message);

    strictEqual(error instanceof Error, true);
    strictEqual(error.name, "CliError");
    strictEqual(error.message, message);
  });
});
