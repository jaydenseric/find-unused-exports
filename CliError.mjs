// @ts-check

/**
 * A CLI error. Useful for anticipated CLI errors (such as invalid CLI
 * arguments) that don’t need to be displayed with a stack trace, vs unexpected
 * internal errors.
 */
export default class CliError extends Error {
  /** @param {string} message Error message. */
  constructor(message) {
    if (typeof message !== "string")
      throw new TypeError("Argument 1 `message` must be a string.");

    super(message);

    this.name = this.constructor.name;
  }
}
