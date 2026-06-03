// @ts-check

/**
 * File glob pattern to recursively match TypeScript (`.mts`, `.cts`, `.ts`, and
 * `.tsx`) and JavaScript (`.mjs`, `.cjs`, `.js`, and `.jsx`) modules, including
 * dotfiles.
 */
const MODULE_GLOB = `**/{,*,.*}.{mts,cts,ts,tsx,mjs,cjs,js,jsx}`;

export default MODULE_GLOB;
