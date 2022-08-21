// @ts-check

import { strictEqual, throws } from "node:assert";

import CliError from "./CliError.mjs";

/**
 * Adds `CliError` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add("`CliError` with argument 1 `message` not a string.", () => {
    throws(() => {
      new CliError(
        // @ts-expect-error Testing invalid.
        true
      );
    }, new TypeError("Argument 1 `message` must be a string."));
  });

  tests.add("`CliError` with arguments valid.", () => {
    const message = "Message.";
    const error = new CliError(message);

    strictEqual(error instanceof Error, true);
    strictEqual(error.name, "CliError");
    strictEqual(error.message, message);
  });
};
