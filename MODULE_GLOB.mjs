// @ts-check

/**
 * File glob pattern to recursively match TypeScript (`.mts`, and `.cts`;
 * excluding TypeScript definition files) and JavaScript (`.mjs`, `.cjs`, and
 * `.js`) modules.
 */
export default "**/{!(*.d).mts,!(*.d).cts,*.{mjs,cjs,js}}";
