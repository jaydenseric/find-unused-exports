// @ts-check

// Use `@babel/core` instead of `@babel/parser` and `@babel/traverse` directly
// so that project Babel config will be respected when parsing code.
import babel from "@babel/core";

import getVariableDeclarationIdentifierNames from "./getVariableDeclarationIdentifierNames.mjs";

// Babel seems to also support non-standard string literals in place of named
// import and export identifiers, perhaps because CJS can have export names
// containing dashes, etc. such as `exports["a-b-c"]` and they want to support
// these names in ESM that’s transpiled to CJS. Such non-standard names are
// explicitly not supported here, using the assertion below.

/** @type {typeof babel.types.assertIdentifier} */
const assertIdentifier = babel.types.assertIdentifier;

/** @type {typeof babel.types.assertFile} */
const assertFile = babel.types.assertFile;

/**
 * Scans a JavaScript module’s code for ECMAScript module imports and exports.
 * An ECMAScript module may contain all kinds of imports and exports. A CommonJS
 * module may only contain dynamic imports, but because it might be source code
 * to be bundled or transpiled, regular imports and exports are still analysed.
 * @param {string} code JavaScript code.
 * @param {string} [path] Path to the file the code is from, for more useful
 *   Babel parse errors.
 * @returns {Promise<ModuleScan>} Resolves an analysis of the module’s imports
 *   and exports.
 */
export default async function scanModuleCode(code, path) {
  if (typeof code !== "string")
    throw new TypeError("Argument 1 `code` must be a string.");

  if (path !== undefined && typeof path !== "string")
    throw new TypeError("Argument 2 `path` must be a string.");

  /** @type {ModuleScan} */
  const analysis = {
    imports: {},
    exports: new Set(),
  };

  /** @type {Array<import("@babel/parser").ParserPlugin>} */
  const plugins = [
    // Allow parsing code containing modern syntax even if a project doesn’t
    // have Babel config to handle it.
    "classProperties",
    ["decorators", { decoratorsBeforeExport: false }],
  ];

  if (
    path &&
    // Path is a TypeScript module.
    (path.endsWith(".mts") || path.endsWith(".cts"))
  )
    // Allow parsing code containing TypeScript syntax.
    plugins.push("typescript");

  const ast = await babel.parseAsync(code, {
    // Provide the code file path for more useful Babel parse errors.
    filename: path,
    parserOpts: {
      plugins,
    },
  });

  // Todo: Clarify what might cause `ast` to not be a `File`.
  assertFile(ast);

  babel.traverse(ast, {
    ImportDeclaration(path) {
      // There may be multiple statements for the same specifier.
      if (!analysis.imports[path.node.source.value])
        analysis.imports[path.node.source.value] = new Set();

      for (const specifier of path.node.specifiers)
        switch (specifier.type) {
          case "ImportDefaultSpecifier":
            // E.g. `import a from "a"`
            //              ^
            analysis.imports[path.node.source.value].add("default");
            break;
          case "ImportNamespaceSpecifier":
            // E.g. `import * as a from "a"`
            //              ^^^^^^
            analysis.imports[path.node.source.value].add("*");
            break;
          case "ImportSpecifier": {
            // E.g. `import { a as b } from "a"`
            //                ^^^^^^

            // Guard against Babel support for a non-standard string literal:
            // E.g. `import { "a-b-c" as a } from "a"`
            //                ^^^^^^^
            assertIdentifier(specifier.imported);

            analysis.imports[path.node.source.value].add(
              specifier.imported.name
            );
            break;
          }
        }

      path.skip();
    },
    Import(path) {
      // E.g. `import("a")`
      //       ^^^^^^
      const [specifier] = /** @type {babel.types.CallExpression} */ (
        path.parent
      ).arguments;
      if (specifier && specifier.type === "StringLiteral") {
        // There may be multiple statements for the same specifier.
        if (!analysis.imports[specifier.value])
          analysis.imports[specifier.value] = new Set();

        // A dynamic import pulls in everything. It’s not feasible for this tool
        // to figure out exactly the default or named imports used at runtime.
        analysis.imports[specifier.value].add("default");
        analysis.imports[specifier.value].add("*");
      }
    },
    ExportDefaultDeclaration(path) {
      // E.g. `export default 1`
      //       ^^^^^^^^^^^^^^^^
      analysis.exports.add("default");

      path.skip();
    },
    ExportAllDeclaration(path) {
      // E.g. `export * from "a"`
      //       ^^^^^^^^^^^^^^^^^
      // This is a special case as the export names are unknown.
      // There may be multiple statements for the same specifier.
      if (!analysis.imports[path.node.source.value])
        analysis.imports[path.node.source.value] = new Set(["*"]);
      else analysis.imports[path.node.source.value].add("*");

      path.skip();
    },
    ExportNamedDeclaration(path) {
      // Determine if the export is a declaration and export in one, or if it is
      // either exporting an existing declaration or is “export from” syntax.
      if (path.node.declaration)
        switch (path.node.declaration.type) {
          case "FunctionDeclaration":
            // E.g. `export function a() {}`
            //              ^^^^^^^^^^^^^^^
            analysis.exports.add(
              // @ts-ignore `id` must exist in export declarations.
              path.node.declaration.id.name
            );
            break;
          case "VariableDeclaration": {
            // E.g. `export const a = 1`
            //              ^^^^^^^^^^^
            for (const name of getVariableDeclarationIdentifierNames(
              path.node.declaration
            ))
              analysis.exports.add(name);
          }
        }
      else if (path.node.source) {
        // E.g. `export { default } from "a"`
        //       ^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // E.g. `export { default as a, a as b } from "a"`
        //       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // E.g. `export * as a, { a as b } from "a"`
        //       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // There may be multiple statements for the same specifier.
        if (!analysis.imports[path.node.source.value])
          analysis.imports[path.node.source.value] = new Set();

        for (const specifier of path.node.specifiers) {
          // Process the import.
          switch (specifier.type) {
            case "ExportNamespaceSpecifier":
              // E.g. `export * as a from "a"`
              //              ^^^^^^
              analysis.imports[path.node.source.value].add("*");
              break;
            case "ExportSpecifier": {
              if (specifier.local.name === "default")
                // E.g. `export { default as a } from "a"`
                //                ^^^^^^^
                analysis.imports[path.node.source.value].add("default");
              // E.g. `export { a as b } from "a"`
              //                ^
              else
                analysis.imports[path.node.source.value].add(
                  specifier.local.name
                );
              break;
            }
          }

          // Guard against Babel support for a non-standard string literal:
          // E.g. `export { "a-b-c" as a } from "a"`
          //                ^^^^^^^
          assertIdentifier(specifier.exported);

          // Process the export.
          if (specifier.exported.name === "default") {
            // E.g. `export { a as default } from "a"`
            //                     ^^^^^^^
            analysis.exports.add("default");
          } else {
            // E.g. `export { a as b } from "a"`
            //                     ^
            analysis.exports.add(specifier.exported.name);
          }
        }
      } else {
        // E.g. `const a = 1; export { a }`
        //                    ^^^^^^^^^^^^
        for (const { exported } of path.node.specifiers) {
          // Guard against Babel support for a non-standard string literal:
          // E.g. `const a = 1; export { a as "a-b-c" }`
          //                                  ^^^^^^^
          assertIdentifier(exported);

          analysis.exports.add(exported.name);
        }
      }

      path.skip();
    },
  });

  // Scan comments to determine the ignored exports.
  if (ast.comments)
    for (const { value } of ast.comments) {
      const comment = value.trim();

      // Check if the comment matches an ignore exports comment.
      const match = comment.match(/^ignore unused exports *(.*)?$/iu);
      if (match) {
        const [, exportNameList] = match;
        if (exportNameList) {
          // Check the list of export names matches the required format (words
          // separated by a comma and optional spaces).
          if (exportNameList.match(/^\w+(?:, *\w+)*$/u))
            // Ignore all of the export names listed in the comment.
            for (const name of exportNameList.split(","))
              analysis.exports.delete(name.trim());
        }
        // No export names were provided, so ignore all the exports.
        else analysis.exports.clear();
      }
    }

  return analysis;
}

/**
 * Scan of an ECMAScript module’s imports and exports.
 * @typedef {object} ModuleScan
 * @prop {{ [importSpecifier: string]: ModuleImports }} imports Map of import
 *   specifiers and the imports used.
 * @prop {ModuleExports} exports Declared exports.
 */

/**
 * List of ECMAScript module import names, including `default` if one is a
 * default export or `*` for a namespace import.
 * @typedef {Set<string>} ModuleImports
 */

/**
 * List of ECMAScript module export names, including `default` if one is a
 * default export.
 * @typedef {Set<string>} ModuleExports
 * @example
 * These export statements:
 *
 * ```js
 * export const a = 1;
 * export const b = 2;
 * export default 3;
 * ```
 *
 * Translate to:
 *
 * ```js
 * new Set(["a", "b", "default"]);
 * ```
 */
