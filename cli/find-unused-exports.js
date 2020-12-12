#!/usr/bin/env node

'use strict';

const { relative } = require('path');
const arg = require('arg');
const kleur = require('kleur');
const CliError = require('../private/CliError');
const errorConsole = require('../private/errorConsole');
const reportCliError = require('../private/reportCliError');
const findUnusedExports = require('../public/findUnusedExports');

/**
 * Runs the `find-unused-exports` CLI.
 * @kind function
 * @name findUnusedExportsCli
 * @returns {Promise<void>} Resolves once the operation is done.
 * @ignore
 */
async function findUnusedExportsCli() {
  try {
    const {
      '--module-glob': moduleGlob,
      '--resolve-file-extensions': resolveFileExtensionsList,
      '--resolve-index-files': resolveIndexFiles,
    } = arg({
      '--module-glob': String,
      '--resolve-file-extensions': String,
      '--resolve-index-files': Boolean,
    });

    if (resolveIndexFiles && !resolveFileExtensionsList)
      throw new CliError(
        'The `--resolve-index-files` flag can only be used with the `--resolve-file-extensions` argument.'
      );

    const unusedExports = await findUnusedExports({
      moduleGlob,
      resolveFileExtensions: resolveFileExtensionsList
        ? resolveFileExtensionsList.split(',')
        : undefined,
      resolveIndexFiles,
    });

    const countUnusedExportsModules = Object.keys(unusedExports).length;

    let countUnusedExports = 0;

    if (countUnusedExportsModules) {
      for (const [path, exports] of Object.entries(unusedExports)) {
        countUnusedExports += exports.size;
        errorConsole.group(
          `\n${kleur.underline().red(relative(process.cwd(), path))}`
        );
        errorConsole.error(kleur.dim().red(Array.from(exports).join(', ')));
        errorConsole.groupEnd();
      }

      errorConsole.error(
        `\n${kleur
          .bold()
          .red(
            `${countUnusedExports} unused export${
              countUnusedExports === 1 ? '' : 's'
            } in ${countUnusedExportsModules} module${
              countUnusedExportsModules === 1 ? '' : 's'
            }.`
          )}\n`
      );

      process.exitCode = 1;
    } else console.info(`\n${kleur.bold().green(`0 unused exports.`)}\n`);
  } catch (error) {
    reportCliError('find-unused-exports', error);

    process.exitCode = 1;
  }
}

findUnusedExportsCli();
