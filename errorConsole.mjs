// @ts-check

import { Console } from "node:console";

/**
 * The `console` API, but all output is to `stderr`. This allows `console.group`
 * to be used with `console.error`.
 */
export default new Console({
  stdout: process.stderr,
  stderr: process.stderr,
});
