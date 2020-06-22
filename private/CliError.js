'use strict';

/**
 * A CLI error. Useful for anticipated CLI errors (such as invalid CLI
 * arguments) that don’t need to be displayed with a stack trace, vs unexpected
 * internal errors.
 * @kind class
 * @name CliError
 * @ignore
 */
module.exports = class CliError extends Error {};
