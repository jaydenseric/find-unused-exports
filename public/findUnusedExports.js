'use strict';

const { dirname, extname, resolve, sep } = require('path');
const isDirectoryPath = require('../private/isDirectoryPath');
const scanProject = require('../private/scanProject');

/**
 * Finds unused ECMAScript module exports in a project. `.gitignore` files are
 * used to ignore files.
 * @kind function
 * @name findUnusedExports
 * @param {object} [options] Options.
 * @param {string} [options.cwd] A directory path to scope the search for source and .gitignore files, defaulting to `process.cwd()`.
 * @param {string} [options.moduleGlob='**\/*.{mjs,js}'] ECMAScript module file glob pattern.
 * @param {Array<string>} [options.resolveFileExtensions] File extensions (without the leading `.`, in preference order) to automatically resolve in extensionless import specifiers. [Import specifier file extensions are mandatory in Node.js](https://nodejs.org/api/esm.html#esm_mandatory_file_extensions); if your project resolves extensionless imports at build time (e.g. [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org)) `['mjs', 'js']` might be appropriate.
 * @param {boolean} [options.resolveIndexFiles=false] Should directory index files be automatically resolved in extensionless import specifiers. Node.js doesn’t do this by default; if your project resolves extensionless imports at build time (e.g. [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org)) `true` might be appropriate. This option only works if the option `resolveFileExtensions` is used.
 * @returns {object<string, ModuleExports>} Map of module file paths and unused module exports.
 * @example <caption>Ways to `import`.</caption>
 * ```js
 * import { findUnusedExports } from 'find-unused-exports';
 * ```
 *
 * ```js
 * import findUnusedExports from 'find-unused-exports/public/findUnusedExports.js';
 * ```
 * @example <caption>Ways to `require`.</caption>
 * ```js
 * const { findUnusedExports } = require('find-unused-exports');
 * ```
 *
 * ```js
 * const findUnusedExports = require('find-unused-exports/public/findUnusedExports');
 * ```
 */
module.exports = async function findUnusedExports({
  cwd = process.cwd(),
  moduleGlob = '**/*.{mjs,js}',
  resolveFileExtensions,
  resolveIndexFiles = false,
} = {}) {
  if (typeof cwd !== 'string')
    throw new TypeError('Option `cwd` must be a string.');

  if (!(await isDirectoryPath(cwd)))
    throw new TypeError('Option `cwd` must be an accessible directory path.');

  if (typeof moduleGlob !== 'string')
    throw new TypeError('Option `moduleGlob` must be a string.');

  if (typeof resolveFileExtensions !== 'undefined')
    if (
      !Array.isArray(resolveFileExtensions) ||
      !resolveFileExtensions.length ||
      !resolveFileExtensions.every((x) => typeof x === 'string')
    )
      throw new TypeError(
        'Option `resolveFileExtensions` must be an array of strings.'
      );

  if (typeof resolveIndexFiles !== 'boolean')
    throw new TypeError('Option `resolveIndexFiles` must be a boolean.');

  if (!resolveFileExtensions && resolveIndexFiles)
    throw new TypeError(
      'Option `resolveIndexFiles` can only be `true` if the option `resolveFileExtensions` is used.'
    );

  const scannedFiles = await scanProject({ cwd, moduleGlob });

  // All possibly unused exports are mapped by module absolute file paths, then
  // any found to have been imported in project files are eliminated.
  const possiblyUnusedExports = {};

  for (const [path, { exports }] of Object.entries(scannedFiles))
    if (exports.size) possiblyUnusedExports[path] = exports;

  // Bail if the specifier is bare; this tool only scans project files.
  for (const [path, { imports }] of Object.entries(scannedFiles))
    for (const [specifier, moduleImports] of Object.entries(imports))
      if (specifier.startsWith('.')) {
        const specifierAbsolutePath = resolve(dirname(path), specifier);
        const specifierPossiblePaths = [specifierAbsolutePath];

        if (!extname(specifierAbsolutePath) && resolveFileExtensions) {
          for (const extension of resolveFileExtensions)
            specifierPossiblePaths.push(
              `${specifierAbsolutePath}.${extension}`
            );

          if (resolveIndexFiles)
            for (const extension of resolveFileExtensions)
              specifierPossiblePaths.push(
                `${specifierAbsolutePath}${sep}index.${extension}`
              );
        }

        // If there’s no match for the imported module in the map of (so far)
        // unused exports it means either none of the imported module’s exports
        // remain unused, or the import is simply unresolvable (not an issue for
        // this tool).
        const importedModulePath = specifierPossiblePaths.find(
          (path) => path in possiblyUnusedExports
        );

        if (importedModulePath) {
          if (moduleImports.has('*')) {
            // Delete all the named exports from the unused exports set.
            for (const name of possiblyUnusedExports[importedModulePath])
              if (name !== 'default')
                possiblyUnusedExports[importedModulePath].delete(name);

            // Check if a default import also needs to be deleted from the unused
            // exports set.
            if (moduleImports.has('default'))
              possiblyUnusedExports[importedModulePath].delete('default');
          } else
            for (const name of moduleImports)
              possiblyUnusedExports[importedModulePath].delete(name);

          // Check if the module still has possibly unused exports.
          if (!possiblyUnusedExports[importedModulePath].size)
            // Delete the file from the map of unused exports.
            delete possiblyUnusedExports[importedModulePath];
        }
      }

  return possiblyUnusedExports;
};
