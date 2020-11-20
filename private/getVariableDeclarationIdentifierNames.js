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

  /**
   * Recursively collects identifier names from variable declarations.
   * @kind function
   * @name collectIdentifierNames
   * @param {object} node A Babel AST Node.
   * @ignore
   */
  function collectIdentifierNames(node) {
    if (node.type === 'Identifier') names.push(node.name);
    else if (node.type === 'ObjectPattern')
      for (const property of node.properties) {
        if (property.type === 'ObjectProperty')
          collectIdentifierNames(property.value);
        else if (property.type === 'RestElement')
          collectIdentifierNames(property.argument);
      }
    else if (node.type === 'ArrayPattern')
      for (const element of node.elements)
        if (element !== null)
          if (element.type === 'RestElement')
            collectIdentifierNames(element.argument);
          else collectIdentifierNames(element);
  }

  for (const { id } of variableDeclaration.declarations)
    collectIdentifierNames(id);

  return names;
};
