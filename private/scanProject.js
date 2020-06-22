'use strict';
const { join } = require('path');
const globby = require('globby');
const scanModuleFile = require('./scanModuleFile');

/**
 * Scans the imports and exports of ECMAScript module files in a project directory.
 * @kind function
 * @name scanProject
 * @param {object} [options] Options.
 * @param {string} [options.cwd] A directory path to scope the search for module and `.gitignore` files, defaulting to `process.cwd()`.
 * @param {string} [options.moduleGlob='**\/*.{mjs,js}'] ECMAScript module file glob pattern.
 * @returns {ModuleExports} Unused module exports.
 * @ignore
 */
module.exports = async function scanProject({
  cwd = process.cwd(),
  moduleGlob = '**/*.{mjs,js}',
} = {}) {
  const projectAnalysis = {};

  for (const path of await globby(moduleGlob, { cwd, gitignore: true })) {
    // globby provides the path relative to the given `cwd`.
    const absolutePath = join(cwd, path);
    projectAnalysis[absolutePath] = await scanModuleFile(absolutePath);
  }

  return projectAnalysis;
};
