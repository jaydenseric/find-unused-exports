'use strict';

/**
 * Gets identifier names from a Babel AST `VariableDeclaration` instance. Used
 * to find export names within a named export declaration that contains a
 * variable declaration.
 * @kind function
 * @name getVariableDeclarationIdentifierNames
 * @param {VariableDeclaration} variableDeclaration A Babel AST `VariableDeclaration` instance.
 * @returns {Array<string>} Identifier names.
 * @ignore
 */
module.exports = function getVariableDeclarationIdentifierNames(
  variableDeclaration
) {
  const names = [];

  // Recursive function and call to go here…

  return names;
};
