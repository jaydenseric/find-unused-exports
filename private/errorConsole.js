'use strict';

const { Console } = require('console');

/*
 * The `console` API, but all output is to `stderr`. This allows `console.group`
 * to be used with `console.error`.
 */
module.exports = new Console({
  stdout: process.stderr,
  stderr: process.stderr,
});
