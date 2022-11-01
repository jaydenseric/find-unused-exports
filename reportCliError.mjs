// @ts-check

import { inspect } from "node:util";

import { bold, red } from "kleur/colors";

import CliError from "./CliError.mjs";
import errorConsole from "./errorConsole.mjs";

/**
 * Reports a CLI error via the process `stderr`.
 * @param {string} cliDescription CLI description.
 * @param {unknown} error Error to report.
 */
export default function reportCliError(cliDescription, error) {
  if (typeof cliDescription !== "string")
    throw new TypeError("Argument 1 `cliDescription` must be a string.");

  errorConsole.group(
    // Whitespace blank lines shouldn’t have redundant indentation or color.
    `\n${bold(red(`Error running ${cliDescription}:`))}\n`
  );

  errorConsole.error(
    red(
      error instanceof CliError
        ? error.message
        : error instanceof Error
        ? // Rarely, an error doesn’t have a stack. In that case, the standard
          // `toString` method returns the error’s `name` + `: ` + the
          // `message`. This is consistent with the first part of a standard
          // Node.js error’s `stack`.
          error.stack || error.toString()
        : inspect(error)
    )
  );

  errorConsole.groupEnd();

  // Whitespace blank line.
  errorConsole.error();
}
