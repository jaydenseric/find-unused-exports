import fs from 'fs';
import scanModuleCode from './scanModuleCode.mjs';

/**
 * Scans the module imports and exports in an ECMAScript module file.
 * @kind function
 * @name scanModuleFile
 * @param {string} path ECMAScript module file path.
 * @returns {Promise<ModuleScan>} Resolves an analysis of the module’s imports and exports.
 * @ignore
 */
export default async function scanModuleFile(path) {
  const code = await fs.promises.readFile(path, { encoding: 'utf8' });
  return scanModuleCode(code, path);
}
