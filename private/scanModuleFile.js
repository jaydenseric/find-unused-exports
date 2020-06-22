'use strict';

const fs = require('fs');
const scanModuleCode = require('./scanModuleCode');

/**
 * Gets exports from a ECMAScript module file.
 * @kind function
 * @name scanFileExports
 * @param {string} path ECMAScript module file path.
 * @returns {Promise<ModuleExportAnalysis>} Resolves the module export analysis.
 * @ignore
 */
module.exports = async function scanFileExports(path) {
  const code = await fs.promises.readFile(path, { encoding: 'utf8' });
  return scanModuleCode(code, path);
};
