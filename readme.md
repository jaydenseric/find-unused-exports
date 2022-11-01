# find-unused-exports

A [Node.js](https://nodejs.org) [CLI](#cli) and equivalent JS [API](#exports) to find unused [ECMAScript module exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) in a project.

To achieve this the whole project is analyzed at once, something [ESLint](https://eslint.org) can’t do as it lints files in isolation.

- The `npx find-unused-exports` script is handy for finding redundant code to remove in legacy projects.
- Use the [CLI](#cli) command [`find-unused-exports`](#command-find-unused-exports) in package test scripts, so that [CI](https://en.wikipedia.org/wiki/Continuous_integration) can prevent the addition of redundant code.

## Installation

To install [`find-unused-exports`](https://npm.im/find-unused-exports) with [npm](https://npmjs.com/get-npm), run:

```sh
npm install find-unused-exports --save-dev
```

Then, either use the [CLI](#cli) command [`find-unused-exports`](#command-find-unused-exports) or import and use the function [`findUnusedExports`](./findUnusedExports.mjs).

## Ignoring unused exports

`.gitignore` files are used to ignore whole files or directories. This is useful for ignoring:

- Third party modules, e.g. `node_modules`.
- Compiled files, e.g. `.next` or `dist`.

Special comments can be used anywhere in a module to ignore all or specific unused exports. This is useful for ignoring intentionally unused exports intended to be imported from external code, e.g.

- For published packages, the public exports.
- For [Next.js](https://nextjs.org) projects, the `default` exports in `pages` directory modules.

#### Examples

How to ignore all unused exports:

```js
// ignore unused exports
export const a = true;
export default true;
```

How to ignore specific unused exports:

```js
// ignore unused exports b, default
export const a = true;
export const b = true;
export default true;
```

Multiple comments can be used:

```js
// ignore unused exports a
export const a = true;

// ignore unused exports b
export const b = true;
```

Comments are case-insensitive, except for the export names:

```js
// iGnOrE UnUsEd eXpOrTs default
```

Line or block comments can be used:

```js
/* ignore unused exports */
```

## Requirements

Supported runtime environments:

- [Node.js](https://nodejs.org) versions `^14.17.0 || ^16.0.0 || >= 18.0.0`.

Projects must configure [TypeScript](https://typescriptlang.org) to use types from the ECMAScript modules that have a `// @ts-check` comment:

- [`compilerOptions.allowJs`](https://typescriptlang.org/tsconfig#allowJs) should be `true`.
- [`compilerOptions.maxNodeModuleJsDepth`](https://typescriptlang.org/tsconfig#maxNodeModuleJsDepth) should be reasonably large, e.g. `10`.
- [`compilerOptions.module`](https://typescriptlang.org/tsconfig#module) should be `"node16"` or `"nodenext"`.

## CLI

### Command `find-unused-exports`

Finds unused [ECMAScript module exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) in a project. If some are found, it reports them to `stderr` and exits with a `1` error status. `.gitignore` files are used to ignore files.

It implements the function [`findUnusedExports`](./findUnusedExports.mjs).

#### Arguments

| Argument | Default | Description |
| :-- | :-- | :-- |
| `--module-glob` | `"**/{!(*.d).mts,!(*.d).cts,*.{mjs,cjs,js}}"` | Module file glob pattern. |
| `--resolve-file-extensions` |  | File extensions (without the leading `.`, multiple separated with `,` in preference order) to automatically resolve in extensionless import specifiers. [Import specifier file extensions are mandatory in Node.js](https://nodejs.org/api/esm.html#mandatory-file-extensions); if your project resolves extensionless imports at build time (e.g. [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org)) `mjs,js` might be appropriate. |
| `--resolve-index-files` |  | Should directory index files be automatically resolved in extensionless import specifiers. [Node.js doesn’t do this by default](https://nodejs.org/api/esm.html#mandatory-file-extensions); if your project resolves extensionless imports at build time (e.g. [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org)) this argument might be appropriate. This argument only works if the argument `--resolve-file-extensions` is used. |

#### Examples

Using [`npx`](https://docs.npmjs.com/cli/v8/commands/npx) in a standard [Node.js](https://nodejs.org) project:

```sh
npx find-unused-exports
```

Using [`npx`](https://docs.npmjs.com/cli/v8/commands/npx) in a typical [webpack](https://webpack.js.org) project that has ESM in `.js` files, extensionless import specifiers, and `index.js` files:

```sh
npx find-unused-exports --module-glob "**/*.js" --resolve-file-extensions js --resolve-index-files
```

[`package.json` scripts](https://docs.npmjs.com/cli/v8/using-npm/scripts) for a project that also uses [`eslint`](https://npm.im/eslint) and [`prettier`](https://npm.im/prettier):

```json
{
  "scripts": {
    "eslint": "eslint .",
    "prettier": "prettier -c .",
    "find-unused-exports": "find-unused-exports",
    "test": "npm run eslint && npm run prettier && npm run find-unused-exports",
    "prepublishOnly": "npm test"
  }
}
```

## Exports

The [npm](https://npmjs.com) package [`find-unused-exports`](https://npm.im/find-unused-exports) features [optimal JavaScript module design](https://jaydenseric.com/blog/optimal-javascript-module-design). It doesn’t have a main index module, so use deep imports from the ECMAScript modules that are exported via the [`package.json`](./package.json) field [`exports`](https://nodejs.org/api/packages.html#exports):

- [`findUnusedExports.mjs`](./findUnusedExports.mjs)
