#!/usr/bin/env node
// @ts-check

/** @import { ImportMap } from "@import-maps/resolve" */

import { relative } from "node:path";
import { styleText } from "node:util";

import arg from "arg";

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
      "--import-map": importMapJson,
      "--module-glob": moduleGlob,
      "--resolve-file-extensions": resolveFileExtensionsList,
      "--resolve-index-files": resolveIndexFiles,
    } = arg({
      "--import-map": String,
      "--module-glob": String,
      "--resolve-file-extensions": String,
      "--resolve-index-files": Boolean,
    });

    /** @type {ImportMap | undefined} */
    let importMap;

    if (importMapJson) {
      try {
        importMap = JSON.parse(importMapJson);
      } catch {
        throw new CliError(`The \`--import-map\` argument must be JSON.`);
      }
    }

    if (resolveIndexFiles && !resolveFileExtensionsList)
      throw new CliError(
        "The `--resolve-index-files` flag can only be used with the `--resolve-file-extensions` argument.",
      );

    const unusedExports = await findUnusedExports({
      importMap,
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

        errorConsole.group(
          `\n${styleText(["underline", "red"], relative(cwd, path), {
            stream: process.stderr,
          })}`,
        );
        errorConsole.error(
          styleText(["dim", "red"], Array.from(exports).join(", "), {
            stream: process.stderr,
          }),
        );
        errorConsole.groupEnd();
      }

      errorConsole.error(
        `\n${styleText(
          ["bold", "red"],
          `${countUnusedExports} unused export${
            countUnusedExports === 1 ? "" : "s"
          } in ${countUnusedExportsModules} module${
            countUnusedExportsModules === 1 ? "" : "s"
          }.`,
          {
            stream: process.stderr,
          },
        )}\n`,
      );

      process.exitCode = 1;
    } else
      console.info(
        `\n${styleText(["bold", "green"], `0 unused exports.`, {
          stream: process.stdout,
        })}\n`,
      );
  } catch (error) {
    reportCliError("find-unused-exports", error);

    process.exitCode = 1;
  }
}

findUnusedExportsCli();
