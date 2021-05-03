/**
 * A CLI error. Useful for anticipated CLI errors (such as invalid CLI
 * arguments) that don’t need to be displayed with a stack trace, vs unexpected
 * internal errors.
 * @kind class
 * @name CliError
 * @param {string} message Error message.
 * @ignore
 */
export default class CliError extends Error {
  constructor(...args) {
    super(...args);
    this.name = this.constructor.name;
  }
}
