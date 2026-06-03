// @ts-check

/**
 * File glob pattern to recursively match files to exclude from finding unused
 * exports, including TypeScript declaration files (`.d.mts`, `.d.cts`, and
 * `.d.ts`) and `node_modules` directories, including dotfiles.
 */
const EXCLUDE_GLOB = "{**/{,*,.*}.d.{mts,cts,ts},**/node_modules/**}";

export default EXCLUDE_GLOB;
