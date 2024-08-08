// @ts-check

/**
 * File glob pattern to recursively match TypeScript (`.mts`, `.cts`, `.ts`, and
 * `.tsx`; excluding TypeScript definition files) and JavaScript (`.mjs`,
 * `.cjs`, `.js`, and `.jsx`) modules.
 */
export default "**/{!(*.d).mts,!(*.d).cts,!(*.d).ts,*.{mjs,cjs,js,jsx,tsx}}";
