export { default as findUnusedExports } from "./findUnusedExports.mjs";

/**
 * List of ECMAScript module export names, including `default` if one is a default export.
 * @kind typedef
 * @name ModuleExports
 * @type {Set<string>}
 * @example <caption>How export statements translate.</caption>
 * These export statements:
 *
 * ```js
 * export const a = 1;
 * export const b = 2;
 * export default 3;
 * ```
 *
 * Translate to:
 *
 * ```js
 * new Set(["a", "b", "default"]);
 * ```
 */

/**
 * List of ECMAScript module import names, including `default` if one is a default export or `*` for a namespace import.
 * @kind typedef
 * @name ModuleImports
 * @type {Set<string>}
 * @ignore
 */

/**
 * Scan of an ECMAScript module’s imports and exports.
 * @kind typedef
 * @name ModuleScan
 * @type {object}
 * @prop {object<string, ModuleImports>} imports Map of import specifiers and the imports used.
 * @prop {ModuleExports} exports Declared exports.
 * @ignore
 */
