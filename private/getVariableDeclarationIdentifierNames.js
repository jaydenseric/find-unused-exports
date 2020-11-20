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
    switch (node.type) {
      case 'Identifier':
        names.push(node.name);
        break;
      case 'ObjectPattern':
        for (const property of node.properties)
          switch (property.type) {
            case 'ObjectProperty':
              collectIdentifierNames(property.value);
              break;
            case 'RestElement':
              collectIdentifierNames(property.argument);
          }
        break;
      case 'ArrayPattern':
        for (const element of node.elements)
          if (element !== null)
            if (element.type === 'RestElement')
              collectIdentifierNames(element.argument);
            else collectIdentifierNames(element);
    }
  }

  for (const { id } of variableDeclaration.declarations)
    collectIdentifierNames(id);

  return names;
};
