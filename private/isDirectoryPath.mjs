import fs from 'fs';

/**
 * Tests if a path is a directory path.
 * @kind function
 * @name isDirectoryPath
 * @param {string} path Filesystem path to test.
 * @returns {Promise<boolean>} Resolves if the path is a directory path.
 * @ignore
 */
export default async function isDirectoryPath(path) {
  try {
    const stats = await fs.promises.lstat(path);
    if (!stats.isDirectory()) throw new TypeError('Not a directory.');
  } catch (error) {
    return false;
  }

  return true;
}
