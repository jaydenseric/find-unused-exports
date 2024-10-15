// @ts-check

import { pathToFileURL } from "node:url";

/**
 * Converts a directory path to a file URL that always ends with `/` so it can
 * be safely used as a base URL for constructing file URLs with relative paths.
 * @param {string} directoryPath Directory path to convert.
 * @returns {URL} Directory file URL.
 */
export default function directoryPathToFileURL(directoryPath) {
  if (typeof directoryPath !== "string")
    throw new TypeError("Argument 1 `directoryPath` must be a string.");

  // @ts-ignore https://github.com/microsoft/TypeScript/issues/59996
  return pathToFileURL(
    directoryPath.endsWith("/") ? directoryPath : `${directoryPath}/`,
  );
}
