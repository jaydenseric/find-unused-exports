// @ts-check

/**
 * @import { ImportMap, ParsedImportMap } from "@import-maps/resolve"
 * @import { ModuleExports, ModuleScan } from "./scanModuleCode.mjs"
 */

import { readFile } from "node:fs/promises";
import { extname, join, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parse, resolve as resolveImport } from "@import-maps/resolve";
import { globby } from "globby";

import directoryPathToFileURL from "./directoryPathToFileURL.mjs";
import isDirectoryPath from "./isDirectoryPath.mjs";
import MODULE_GLOB from "./MODULE_GLOB.mjs";
import scanModuleCode from "./scanModuleCode.mjs";

/**
 * Finds unused
 * [ECMAScript module exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
 * in a project. `.gitignore` files are used to ignore files.
 * @param {object} [options] Options.
 * @param {string} [options.cwd] A directory path to scope the search for source
 *   and `.gitignore` files, defaulting to `process.cwd()`.
 * @param {ImportMap} [options.importMap]
 *   [Import map](https://github.com/WICG/import-maps) that’s relative to the
 *   current working directory specified by the option {@linkcode cwd}. Defaults
 *   to `{}`.
 * @param {string} [options.moduleGlob] JavaScript file glob pattern. Defaults
 *   to {@linkcode MODULE_GLOB}.
 * @param {Array<string>} [options.resolveFileExtensions] File extensions
 *   (without the leading `.`, in preference order) to automatically resolve in
 *   extensionless import specifiers.
 *   [Import specifier file extensions are mandatory in Node.js](https://nodejs.org/api/esm.html#mandatory-file-extensions);
 *   if your project resolves extensionless imports at build time (e.g.
 *   [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org))
 *   `["mjs", "js"]` might be appropriate.
 * @param {boolean} [options.resolveIndexFiles] Should directory index files be
 *   automatically resolved in extensionless import specifiers.
 *   [Node.js doesn’t do this by default](https://nodejs.org/api/esm.html#mandatory-file-extensions);
 *   if your project resolves extensionless imports at build time (e.g.
 *   [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org))
 *   `true` might be appropriate. This option only works if the option
 *   `resolveFileExtensions` is used. Defaults to `false`.
 * @returns {Promise<{
 *   [moduleFilePath: string]: ModuleExports,
 * }>} Map of module file paths and unused module exports.
 */
export default async function findUnusedExports({
  cwd = process.cwd(),
  importMap = {},
  moduleGlob = MODULE_GLOB,
  resolveFileExtensions,
  resolveIndexFiles = false,
} = {}) {
  if (typeof cwd !== "string")
    throw new TypeError("Option `cwd` must be a string.");

  if (!(await isDirectoryPath(cwd)))
    throw new TypeError("Option `cwd` must be an accessible directory path.");

  const cwdUrl = directoryPathToFileURL(cwd);

  /** @type {ParsedImportMap} */
  let parsedImportMap;

  try {
    parsedImportMap = parse(importMap, cwdUrl);
  } catch (cause) {
    throw new TypeError("Option `importMap` must be a valid import map.", {
      cause,
    });
  }

  if (typeof moduleGlob !== "string")
    throw new TypeError("Option `moduleGlob` must be a string.");

  if (typeof resolveFileExtensions !== "undefined")
    if (
      !Array.isArray(resolveFileExtensions) ||
      !resolveFileExtensions.length ||
      !resolveFileExtensions.every((x) => typeof x === "string")
    )
      throw new TypeError(
        "Option `resolveFileExtensions` must be an array of strings.",
      );

  if (typeof resolveIndexFiles !== "boolean")
    throw new TypeError("Option `resolveIndexFiles` must be a boolean.");

  if (!resolveFileExtensions && resolveIndexFiles)
    throw new TypeError(
      "Option `resolveIndexFiles` can only be `true` if the option `resolveFileExtensions` is used.",
    );

  // These paths are relative to the given `cwd`.
  const moduleFileRelativePaths = await globby(moduleGlob, {
    cwd,
    dot: true,
    gitignore: true,
  });

  /**
   * @type {{
   *   [moduleFilePath: string]: ModuleScan,
   * }}
   */
  const scannedModules = {};

  await Promise.all(
    moduleFileRelativePaths.map(async (moduleFileRelativePath) => {
      const moduleFilePath = join(cwd, moduleFileRelativePath);
      const code = await readFile(moduleFilePath, "utf8");

      scannedModules[moduleFilePath] = await scanModuleCode(
        code,
        moduleFilePath,
      );
    }),
  );

  // All possibly unused exports are mapped by module absolute file paths, then
  // any found to have been imported in project files are eliminated.

  /**
   * @type {{
   *   [moduleFilePath: string]: ModuleExports,
   * }}
   */
  const possiblyUnusedExports = {};

  for (const [path, { exports }] of Object.entries(scannedModules))
    if (exports.size) possiblyUnusedExports[path] = exports;

  for (const [path, { imports }] of Object.entries(scannedModules))
    for (const [specifier, moduleImports] of Object.entries(imports)) {
      const { resolvedImport } = resolveImport(
        specifier,
        parsedImportMap,
        pathToFileURL(path),
      );

      // This tool only scans project files; bail if the import couldn’t be
      // resolved to a file URL.
      if (resolvedImport?.protocol !== "file:") continue;

      const specifierAbsolutePath = fileURLToPath(resolvedImport);
      const specifierExtension = extname(specifierAbsolutePath);
      const specifierPossiblePaths = [specifierAbsolutePath];

      switch (specifierExtension) {
        // TypeScript import specifiers may use the `.mjs` file extension to
        // resolve an `.mts` file in that directory with the same name.
        case ".mjs": {
          specifierPossiblePaths.push(
            `${specifierAbsolutePath.slice(0, -specifierExtension.length)}.mts`,
          );
          break;
        }

        // TypeScript import specifiers may use the `.cjs` file extension to
        // resolve a `.cts` file in that directory with the same name.
        case ".cjs": {
          specifierPossiblePaths.push(
            `${specifierAbsolutePath.slice(0, -specifierExtension.length)}.cts`,
          );
          break;
        }

        // TypeScript import specifiers may use the `.js` file extension to
        // resolve a `.ts` or `.tsx` file in that directory with the same
        // name.
        case ".js": {
          const pathWithoutExtension = specifierAbsolutePath.slice(
            0,
            -specifierExtension.length,
          );

          specifierPossiblePaths.push(
            `${pathWithoutExtension}.ts`,
            `${pathWithoutExtension}.tsx`,
          );
          break;
        }

        // No file extension.
        case "": {
          if (resolveFileExtensions) {
            for (const extension of resolveFileExtensions)
              specifierPossiblePaths.push(
                `${specifierAbsolutePath}.${extension}`,
              );

            if (resolveIndexFiles)
              for (const extension of resolveFileExtensions)
                specifierPossiblePaths.push(
                  `${specifierAbsolutePath}${sep}index.${extension}`,
                );
          }
        }
      }

      // If there’s no match for the imported module in the map of (so far)
      // unused exports it means either none of the imported module’s exports
      // remain unused, or the import is simply unresolvable (not an issue for
      // this tool).
      const importedModulePath = specifierPossiblePaths.find(
        (path) => path in possiblyUnusedExports,
      );

      if (importedModulePath) {
        // If a namespace import (`import * as`) imported all exports of the
        // module, delete every export from the unused exports set. Otherwise,
        // delete only the imported exports from the unused exports set.
        for (const name of moduleImports.has("*")
          ? possiblyUnusedExports[importedModulePath]
          : moduleImports)
          possiblyUnusedExports[importedModulePath].delete(name);

        // Check if the module still has possibly unused exports.
        if (!possiblyUnusedExports[importedModulePath].size)
          // Delete the file from the map of unused exports.
          delete possiblyUnusedExports[importedModulePath];
      }
    }

  return possiblyUnusedExports;
}
