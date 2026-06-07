// @ts-check

/**
 * @import { ImportMap, ParsedImportMap } from "@import-maps/resolve"
 * @import { ModuleExports, ModuleScan } from "./scanModuleCode.mjs"
 */

import { glob, readFile } from "node:fs/promises";
import { extname, join, matchesGlob, relative, sep } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { parse, resolve as resolveImport } from "@import-maps/resolve";

import directoryPathToFileURL from "./directoryPathToFileURL.mjs";
import EXCLUDE_GLOB from "./EXCLUDE_GLOB.mjs";
import isDirectoryPath from "./isDirectoryPath.mjs";
import MODULE_GLOB from "./MODULE_GLOB.mjs";
import scanModuleCode from "./scanModuleCode.mjs";

/**
 * Finds unused
 * [ECMAScript module exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export)
 * in a project.
 * @param {object} [options] Options.
 * @param {string} [options.cwd] Directory path to scope the search for module
 *   files, defaulting to `process.cwd()`.
 * @param {string} [options.excludeGlob] File glob pattern to exclude files
 *   from the {@linkcode moduleGlob} results, relative to the current working
 *   directory specified by the option {@linkcode cwd}. Defaults to
 *   {@linkcode EXCLUDE_GLOB}.
 * @param {IgnoreExportsMap} [options.ignore] Map of module file globs (relative
 *   to the current working directory specified by the option {@linkcode cwd})
 *   and export names to ignore as unused.
 * @param {ImportMap} [options.importMap]
 *   [Import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap#import_map_json_representation),
 *   relative to the current working directory specified by the option
 *   {@linkcode cwd}. Defaults to `{}`.
 * @param {string} [options.moduleGlob] Module file glob pattern, relative to
 *   the current working directory specified by the option {@linkcode cwd}.
 *   Defaults to {@linkcode MODULE_GLOB}.
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
 * }>} Map of module file paths (relative to the current working directory
 *   specified by the option {@linkcode cwd}) and unused exports.
 */
export default async function findUnusedExports({
  cwd = process.cwd(),
  excludeGlob = EXCLUDE_GLOB,
  ignore = {},
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

  if (typeof excludeGlob !== "string")
    throw new TypeError("Option `excludeGlob` must be a string.");

  if (typeof ignore !== "object" || ignore === null || Array.isArray(ignore))
    throw new TypeError("Option `ignore` must be an object.");

  const ignoreEntries = Object.entries(ignore);

  for (const [glob, exportNames] of ignoreEntries) {
    if (!Array.isArray(exportNames))
      throw new TypeError(
        `Option \`ignore\` entry \`${glob}\` must be an array.`,
      );

    for (const [index, exportName] of exportNames.entries())
      if (typeof exportName !== "string")
        throw new TypeError(
          `Option \`ignore\` entry \`${glob}\` entry ${index} must be a string.`,
        );
  }

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

  /**
   * Map of module file paths (relative to the option `cwd`) and possibly unused
   * exports. At first, all scanned module exports are considered possibly
   * unused, then any found to have been imported in other scanned modules are
   * eliminated. Finally, if there are any truly unused exports, those that are
   * to be ignored are eliminated.
   * @type {Map<string, ModuleExports>}
   */
  const possiblyUnusedExports = new Map();

  /**
   * Scanned module promises.
   * @type {Array<Promise<{ path: string, scan: ModuleScan }>>}
   */
  const scannedModulePromises = [];

  // These paths are relative to the given `cwd`.
  for await (const moduleFileRelativePath of glob(moduleGlob, {
    cwd,
    exclude: [excludeGlob],
  })) {
    scannedModulePromises.push(
      (async () => {
        const path = join(cwd, moduleFileRelativePath);
        const scan = await scanModuleCode(await readFile(path, "utf8"), path);

        if (scan.exports.size)
          possiblyUnusedExports.set(moduleFileRelativePath, scan.exports);

        return { path, scan };
      })(),
    );
  }

  const scannedModules = await Promise.all(scannedModulePromises);

  if (possiblyUnusedExports.size)
    // Iterate each scanned module and its imports, and for each resolved import
    // that matches a module with possibly unused exports, delete the imported
    // export names from that module’s possibly unused exports set, and if the
    // set becomes empty, delete the module from the map of possibly unused
    // exports.
    scannedModulesLoop: for (const scannedModule of scannedModules) {
      const scannedModuleFileUrl = pathToFileURL(scannedModule.path);

      for (const importSpecifier in scannedModule.scan.imports) {
        const moduleImports = scannedModule.scan.imports[importSpecifier];

        // If it’s a side effect import that doesn't use exports, it can’t be
        // used to eliminate any unused exports, so skip it.
        if (!moduleImports.size) continue;

        const { resolvedImport: importSpecifierImportMappedUrl } =
          resolveImport(importSpecifier, parsedImportMap, scannedModuleFileUrl);

        // This tool only scans project files; bail if the import specifier
        // couldn’t be import map resolved to a file URL.
        if (importSpecifierImportMappedUrl?.protocol !== "file:") continue;

        // Try to match the imported module to an entry in the map of (so far)
        // unused exports. If there’s no match, either none of that module’s
        // exports remain unused, or the import is simply unresolvable (not an
        // issue for this tool).

        /**
         * The import specifier import mapped path, relative to the
         * {@linkcode cwd}.
         */
        const importSpecifierImportMappedPath = relative(
          cwd,
          fileURLToPath(importSpecifierImportMappedUrl),
        );

        /** The imported module file path, relative to the {@linkcode cwd}. */
        let importedModuleFilePath = importSpecifierImportMappedPath;

        /** @type {ModuleExports | undefined} */
        let importedModuleUnusedExports = possiblyUnusedExports.get(
          importedModuleFilePath,
        );

        if (!importedModuleUnusedExports) {
          const extension = extname(importSpecifierImportMappedPath);

          switch (extension) {
            // TypeScript import specifiers may use the `.mjs` file extension
            // to resolve an `.mts` file in that directory with the same name.
            case ".mjs": {
              importedModuleFilePath = `${importSpecifierImportMappedPath.slice(0, -extension.length)}.mts`;
              importedModuleUnusedExports = possiblyUnusedExports.get(
                importedModuleFilePath,
              );
              break;
            }

            // TypeScript import specifiers may use the `.cjs` file extension
            // to resolve a `.cts` file in that directory with the same name.
            case ".cjs": {
              importedModuleFilePath = `${importSpecifierImportMappedPath.slice(0, -extension.length)}.cts`;
              importedModuleUnusedExports = possiblyUnusedExports.get(
                importedModuleFilePath,
              );
              break;
            }

            // TypeScript import specifiers may use the `.js` file extension to
            // resolve a `.ts` or `.tsx` file in that directory with the same
            // name.
            case ".js": {
              const pathWithoutExtension =
                importSpecifierImportMappedPath.slice(0, -extension.length);

              importedModuleFilePath = `${pathWithoutExtension}.ts`;
              importedModuleUnusedExports = possiblyUnusedExports.get(
                importedModuleFilePath,
              );

              if (!importedModuleUnusedExports) {
                importedModuleFilePath = `${pathWithoutExtension}.tsx`;
                importedModuleUnusedExports = possiblyUnusedExports.get(
                  importedModuleFilePath,
                );
              }
              break;
            }

            // No file extension.
            case "": {
              if (resolveFileExtensions) {
                for (const extension of resolveFileExtensions) {
                  importedModuleFilePath = `${importSpecifierImportMappedPath}.${extension}`;
                  importedModuleUnusedExports = possiblyUnusedExports.get(
                    importedModuleFilePath,
                  );

                  if (importedModuleUnusedExports) break;
                }

                if (!importedModuleUnusedExports && resolveIndexFiles)
                  for (const extension of resolveFileExtensions) {
                    importedModuleFilePath = `${importSpecifierImportMappedPath}${sep}index.${extension}`;
                    importedModuleUnusedExports = possiblyUnusedExports.get(
                      importedModuleFilePath,
                    );

                    if (importedModuleUnusedExports) break;
                  }
              }
            }
          }
        }

        if (importedModuleUnusedExports) {
          // If a namespace import (`import * as`) imported all exports of the
          // module, clear the unused exports set. Otherwise, delete only the
          // imported exports from the unused exports set.
          if (moduleImports.has("*")) importedModuleUnusedExports.clear();
          else
            for (const name of moduleImports)
              importedModuleUnusedExports.delete(name);

          // Check if the module still has possibly unused exports.
          if (!importedModuleUnusedExports.size) {
            // Delete the file from the map of unused exports.
            possiblyUnusedExports.delete(importedModuleFilePath);

            // If there are no more possibly unused exports left, skip redundant
            // processing.
            if (!possiblyUnusedExports.size) break scannedModulesLoop;
          }
        }
      }
    }

  if (possiblyUnusedExports.size && ignoreEntries.length)
    // At this point the possibly unused exports map only contains definitely
    // unused exports. Next step is to remove any ignored exports.

    // Iterate each module with unused exports and for each ignore entry that
    // glob matches, delete the ignored export names from the module’s unused
    // exports set, and if the set becomes empty, delete the module from the map
    // of possibly unused exports.
    for (const [moduleFilePath, unusedExports] of possiblyUnusedExports)
      for (const [glob, ignoredExports] of ignoreEntries)
        if (matchesGlob(moduleFilePath, glob)) {
          for (const ignoredExportName of ignoredExports)
            unusedExports.delete(ignoredExportName);

          // Check if the module still has unused exports.
          if (!unusedExports.size) {
            // Delete the file from the map of unused exports.
            possiblyUnusedExports.delete(moduleFilePath);

            // Skip looking for more ignore entries for this module, as it no
            // longer has possibly unused exports to ignore.
            break;
          }
        }

  return Object.fromEntries(possiblyUnusedExports);
}

/**
 * Map of module file globs (relative to a current working directory) and export
 * names to ignore as unused.
 * @typedef {{ [glob: string]: Array<string> }} IgnoreExportsMap
 */
