// @ts-check

import babel from "@babel/core";

/**
 * Gets identifier names from a variable declaration Babel AST node. Used to
 * find export names within a named export declaration that contains a variable
 * declaration.
 * @param {babel.types.VariableDeclaration} variableDeclaration Variable
 *   declaration Babel AST node.
 * @returns {Array<string>} Identifier names.
 */
export default function getVariableDeclarationIdentifierNames(
  variableDeclaration
) {
  if (!babel.types.isVariableDeclaration(variableDeclaration))
    throw new TypeError(
      "Argument 1 `variableDeclaration` must be a `VariableDeclaration` Babel AST node."
    );

  /** @type {Array<string>} */
  const names = [];

  /**
   * Recursively collects identifier names.
   * @param {babel.types.Node} node Babel AST node.
   */
  function collectIdentifierNames(node) {
    switch (node.type) {
      case "Identifier":
        // E.g. `export const a = 1`
        //                    ^
        // E.g. `export var a, b, c = 1`
        //                  ^
        // E.g. `export const { a } = { a: 1 }`
        //                      ^
        // E.g. `export const [a] = [1]`
        //                     ^
        names.push(node.name);
        break;
      case "ObjectPattern":
        // E.g. `export const { a } = { a: 1 }`
        //                    ^^^^^
        for (const property of node.properties)
          switch (property.type) {
            case "ObjectProperty":
              // E.g. `export const { a } = { a: 1 }`
              //                      ^
              // E.g. `export const { a: { b } } = { a: { b: 1 } }`
              //                      ^^^^^^^^
              // E.g. `export const { a: [b] } = { a: [1] }`
              //                      ^^^^^^
              // E.g. `export const { a: b } = { a: 1 }`
              //                      ^^^^
              collectIdentifierNames(
                // To account for property renaming use the `value`, not the
                // `key`. If the property isn’t renamed they are the same.
                property.value
              );
              break;
            case "RestElement":
              // E.g. `export const { a, ...b } = { a: 1, b: 1, c: 1 }`
              //                         ^^^^
              collectIdentifierNames(property.argument);
          }
        break;
      case "ArrayPattern":
        // E.g. `export const [a, b] = [1, 2]`
        //                    ^^^^^^
        for (const element of node.elements)
          if (
            // A `null` element represents a skipped array item.
            // E.g. `export const [, a] = [1, 2]`
            //                     ^
            element !== null
          )
            if (element.type === "RestElement")
              // E.g. `export const [a, ...b] = [1, 2, 3]`
              //                        ^^^^
              // E.g. `export const [a, ...[b]] = [1, 2, 3]`
              //                        ^^^^^^
              collectIdentifierNames(element.argument);
            // As the element is neither skipped or rest, further recursion is
            // necessary.
            // E.g. `export const [a] = [1]`
            //                     ^
            // E.g. `export const [[a]] = [[1]]`
            //                     ^^^
            // E.g. `export const [{ a }] = [{ a: 1 }]`
            //                     ^^^^^
            else collectIdentifierNames(element);
    }
  }

  // The variable declaration could have one or more declarations.
  // E.g. `export const a = 1`
  //                    ^^^^^
  // E.g. `export var a, b, c = 1`
  //                  ^  ^  ^^^^^

  // Only the `id` (not the `init` value) is relevant for gathering identifier
  // names.
  // E.g. `export const a = 1`
  //                    ^

  for (const { id } of variableDeclaration.declarations)
    collectIdentifierNames(id);

  return names;
}
