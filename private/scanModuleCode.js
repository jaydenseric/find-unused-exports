'use strict';

const { parseAsync, traverse } =
  // Use `@babel/core` instead of `@babel/parser` and `@babel/traverse` directly
  // so that project Babel config will be respected when parsing code.
  require('@babel/core');
const getVariableDeclarationIdentifierNames = require('../private/getVariableDeclarationIdentifierNames');

/**
 * Scans the module imports and exports in ECMAScript module code.
 * @kind function
 * @name scanModuleCode
 * @param {string} code ECMAScript module code.
 * @param {string} [path] Path to the ECMAScript module file the code is from, for more useful Babel parse errors.
 * @returns {Promise<ModuleScan>} Resolves an analysis of the module’s imports and exports.
 * @ignore
 */
module.exports = async function scanModuleCode(code, path) {
  const analysis = {
    imports: {},
    exports: new Set(),
  };

  const ast = await parseAsync(code, {
    // Provide the code file path for more useful Babel parse errors.
    filename: path,

    // Allow parsing code containing modern syntax even if a project doesn’t
    // have Babel config to handle it.
    parserOpts: {
      plugins: [
        'classProperties',
        ['decorators', { decoratorsBeforeExport: false }],
      ],
    },
  });

  traverse(ast, {
    ImportDeclaration(path) {
      // There may be multiple statements for the same specifier.
      if (!analysis.imports[path.node.source.value])
        analysis.imports[path.node.source.value] = new Set();

      for (const specifier of path.node.specifiers)
        switch (specifier.type) {
          case 'ImportDefaultSpecifier':
            // E.g. `import a from 'a'`
            //              ^
            analysis.imports[path.node.source.value].add('default');
            break;
          case 'ImportNamespaceSpecifier':
            // E.g. `import * as a from 'a'`
            //              ^^^^^^
            analysis.imports[path.node.source.value].add('*');
            break;
          case 'ImportSpecifier':
            // E.g. `import { a as b } from 'a'`
            //                ^^^^^^
            analysis.imports[path.node.source.value].add(
              specifier.imported.name
            );
            break;
        }

      path.skip();
    },
    Import(path) {
      // E.g. `import('a')`
      //       ^^^^^^
      const [specifier] = path.parent.arguments;
      if (specifier && specifier.type === 'StringLiteral') {
        // There may be multiple statements for the same specifier.
        if (!analysis.imports[specifier.value])
          analysis.imports[specifier.value] = new Set();

        // A dynamic import pulls in everything. It’s not feasible for this tool
        // to figure out exactly the default or named imports used at runtime.
        analysis.imports[specifier.value].add('default');
        analysis.imports[specifier.value].add('*');
      }
    },
    ExportDefaultDeclaration(path) {
      // E.g. `export default 1`
      //       ^^^^^^^^^^^^^^^^
      analysis.exports.add('default');

      path.skip();
    },
    ExportAllDeclaration(path) {
      // E.g. `export * from 'a'`
      //       ^^^^^^^^^^^^^^^^^
      // This is a special case as the export names are unknown.
      // There may be multiple statements for the same specifier.
      if (!analysis.imports[path.node.source.value])
        analysis.imports[path.node.source.value] = new Set(['*']);
      else analysis.imports[path.node.source.value].add('*');

      path.skip();
    },
    ExportNamedDeclaration(path) {
      // Determine if the export is a declaration and export in one, or if it is
      // either exporting an existing declaration or is “export from” syntax.
      if (path.node.declaration)
        switch (path.node.declaration.type) {
          case 'FunctionDeclaration':
            // E.g. `export function a() {}`
            //              ^^^^^^^^^^^^^^^
            analysis.exports.add(path.node.declaration.id.name);
            break;
          case 'VariableDeclaration': {
            // E.g. `export const a = 1`
            //              ^^^^^^^^^^^
            for (const name of getVariableDeclarationIdentifierNames(
              path.node.declaration
            ))
              analysis.exports.add(name);
          }
        }
      else if (path.node.source) {
        // E.g. `export { default } from 'a'`
        //       ^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // E.g. `export { default as a, a as b } from 'a'`
        //       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // E.g. `export * as a, { a as b } from 'a'`
        //       ^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^
        // There may be multiple statements for the same specifier.
        if (!analysis.imports[path.node.source.value])
          analysis.imports[path.node.source.value] = new Set();

        for (const specifier of path.node.specifiers) {
          // Process the import.
          switch (specifier.type) {
            case 'ExportNamespaceSpecifier':
              // E.g. `export * as a from 'a'`
              //              ^^^^^^
              analysis.imports[path.node.source.value].add('*');
              break;
            case 'ExportSpecifier': {
              if (specifier.local.name === 'default')
                // E.g. `export { default as a } from 'a'`
                //                ^^^^^^^
                analysis.imports[path.node.source.value].add('default');
              // E.g. `export { a as b } from 'a'`
              //                ^
              else
                analysis.imports[path.node.source.value].add(
                  specifier.local.name
                );
              break;
            }
          }

          // Process the export.
          if (specifier.exported.name === 'default')
            // E.g. `export { a as default } from 'a'`
            //                     ^^^^^^^
            analysis.exports.add('default');
          // E.g. `export { a as b } from 'a'`
          //                     ^
          else analysis.exports.add(specifier.exported.name);
        }
      }
      // E.g. `const a = 1; export { a }`
      //                    ^^^^^^^^^^^^
      else
        for (const {
          exported: { name },
        } of path.node.specifiers)
          analysis.exports.add(name);

      path.skip();
    },
  });

  // Scan comments to determine the ignored exports.
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
          for (const name of exportNameList.split(','))
            analysis.exports.delete(name.trim());
      }
      // No export names were provided, so ignore all the exports.
      else analysis.exports.clear();
    }
  }

  return analysis;
};
