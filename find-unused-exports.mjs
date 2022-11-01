#!/usr/bin/env node
// @ts-check

import { relative } from "node:path";

import arg from "arg";
import { bold, dim, green, red, underline } from "kleur/colors";

import CliError from "./CliError.mjs";
import errorConsole from "./errorConsole.mjs";
import findUnusedExports from "./findUnusedExports.mjs";
import reportCliError from "./reportCliError.mjs";

/**
 * Runs the `find-unused-exports` CLI.
 * @returns {Promise<void>} Resolves once the operation is done.
 */
async function findUnusedExportsCli() {
  try {
    const {
      "--module-glob": moduleGlob,
      "--resolve-file-extensions": resolveFileExtensionsList,
      "--resolve-index-files": resolveIndexFiles,
    } = arg({
      "--module-glob": String,
      "--resolve-file-extensions": String,
      "--resolve-index-files": Boolean,
    });

    if (resolveIndexFiles && !resolveFileExtensionsList)
      throw new CliError(
        "The `--resolve-index-files` flag can only be used with the `--resolve-file-extensions` argument."
      );

    const unusedExports = await findUnusedExports({
      moduleGlob,
      resolveFileExtensions: resolveFileExtensionsList
        ? resolveFileExtensionsList.split(",")
        : undefined,
      resolveIndexFiles,
    });

    // Sort the list so that the results will be deterministic (important for
    // snapshot tests) and tidy (for output readability).
    const unusedExportsModulePaths = Object.keys(unusedExports).sort();
    const countUnusedExportsModules = unusedExportsModulePaths.length;

    let countUnusedExports = 0;

    if (countUnusedExportsModules) {
      const cwd = process.cwd();

      for (const path of unusedExportsModulePaths) {
        const exports = unusedExports[path];

        countUnusedExports += exports.size;

        errorConsole.group(`\n${underline(red(relative(cwd, path)))}`);
        errorConsole.error(dim(red(Array.from(exports).join(", "))));
        errorConsole.groupEnd();
      }

      errorConsole.error(
        `\n${bold(
          red(
            `${countUnusedExports} unused export${
              countUnusedExports === 1 ? "" : "s"
            } in ${countUnusedExportsModules} module${
              countUnusedExportsModules === 1 ? "" : "s"
            }.`
          )
        )}\n`
      );

      process.exitCode = 1;
    } else console.info(`\n${bold(green(`0 unused exports.`))}\n`);
  } catch (error) {
    reportCliError("find-unused-exports", error);

    process.exitCode = 1;
  }
}

findUnusedExportsCli();
