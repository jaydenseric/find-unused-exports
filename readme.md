# find-unused-exports

[![npm version](https://badgen.net/npm/v/find-unused-exports)](https://npm.im/find-unused-exports) [![CI status](https://github.com/jaydenseric/find-unused-exports/workflows/CI/badge.svg)](https://github.com/jaydenseric/find-unused-exports/actions)

A [Node.js](https://nodejs.org) [CLI](#cli) and equivalent JS [API](#api) to find unused [ECMAScript module exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) in a project.

To achieve this the whole project is analyzed at once, something [ESLint](https://eslint.org) can’t do as it lints files in isolation.

- The `npx find-unused-exports` script is handy for finding redundant code to remove in legacy projects.
- Use the [CLI](#cli) command [`find-unused-exports`](#command-find-unused-exports) in package test scripts, so that [CI](https://en.wikipedia.org/wiki/Continuous_integration) can prevent the addition of redundant code.

## Setup

To install with [npm](https://npmjs.com/get-npm), run:

```sh
npm install find-unused-exports --save-dev
```

Then, use either the [CLI](#cli) command [`find-unused-exports`](#command-find-unused-exports) or the JS [API](#api) function [`findUnusedExports`](#function-findunusedexports).

## Ignoring unused exports

`.gitignore` files are used to ignore whole files or directories. This is useful for ignoring:

- Third party modules, e.g. `node_modules`.
- Compiled files, e.g. `.next` or `dist`.

Special comments can be used anywhere in a module to ignore all or specific unused exports. This is useful for ignoring intentionally unused exports intended to be imported from external code, e.g.

- For published packages, the public exports.
- For [Next.js](https://nextjs.org) projects, the `default` exports in `pages` directory modules.

#### Examples

_How to ignore all unused exports._

> ```js
> // ignore unused exports
> export const a = true;
> export default true;
> ```

_How to ignore specific unused exports._

> ```js
> // ignore unused exports b, default
> export const a = true;
> export const b = true;
> export default true;
> ```

_Multiple comments can be used._

> ```js
> // ignore unused exports a
> export const a = true;
>
> // ignore unused exports b
> export const b = true;
> ```

_Comments are case-insensitive, except for the export names._

> ```js
> // iGnOrE UnUsEd eXpOrTs default
> ```

_Line or block comments can be used._

> ```js
> /* ignore unused exports */
> ```

## CLI

### Command `find-unused-exports`

Finds unused [ECMAScript module exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) in a project. If some are found, it reports them to `stderr` and exits with a `1` error status. `.gitignore` files are used to ignore files.

It implements the function [`findUnusedExports`](#function-findunusedexports).

#### Arguments

| Argument | Default | Description |
| :-- | :-- | :-- |
| `--module-glob` | `**/*.{mjs,cjs,js}` | JavaScript file glob pattern. |
| `--resolve-file-extensions` |  | File extensions (without the leading `.`, multiple separated with `,` in preference order) to automatically resolve in extensionless import specifiers. [Import specifier file extensions are mandatory in Node.js](https://nodejs.org/api/esm.html#esm_mandatory_file_extensions); if your project resolves extensionless imports at build time (e.g. [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org)) `mjs,js` might be appropriate. |

#### Examples

_Using [`npx`](https://docs.npmjs.com/cli/v7/commands/npx) in a standard [Node.js](https://nodejs.org) project:_

> ```sh
> npx find-unused-exports
> ```

_Using [`npx`](https://docs.npmjs.com/cli/v7/commands/npx) in a typical [webpack](https://webpack.js.org) project that has ESM in `.js` files, extensionless import specifiers, and `index.js` files:_

> ```sh
> npx find-unused-exports --module-glob "**/*.js" --resolve-file-extensions js --resolve-index-files
> ```

_Using package scripts._

> [`package.json` scripts](https://docs.npmjs.com/cli/v7/using-npm/scripts) for a project that also uses [`eslint`](https://npm.im/eslint) and [`prettier`](https://npm.im/prettier):
>
> ```json
> {
>   "scripts": {
>     "test": "npm run test:eslint && npm run test:prettier && npm run test:unused-exports",
>     "test:eslint": "eslint .",
>     "test:prettier": "prettier -c .",
>     "test:unused-exports": "find-unused-exports",
>     "prepublishOnly": "npm test"
>   }
> }
> ```

## API

### Table of contents

- [function findUnusedExports](#function-findunusedexports)
- [type ModuleExports](#type-moduleexports)

### function findUnusedExports

Finds unused [ECMAScript module exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) in a project. `.gitignore` files are used to ignore files.

| Parameter | Type | Description |
| :-- | :-- | :-- |
| `options` | object? | Options. |
| `options.cwd` | string? | A directory path to scope the search for source and `.gitignore` files, defaulting to `process.cwd()`. |
| `options.moduleGlob` | string? = `**/*.{mjs,cjs,js}` | JavaScript file glob pattern. |
| `options.resolveFileExtensions` | Array<string>? | File extensions (without the leading `.`, in preference order) to automatically resolve in extensionless import specifiers. [Import specifier file extensions are mandatory in Node.js](https://nodejs.org/api/esm.html#esm_mandatory_file_extensions); if your project resolves extensionless imports at build time (e.g. [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org)) `['mjs', 'js']` might be appropriate. |
| `options.resolveIndexFiles` | boolean? = `false` | Should directory index files be automatically resolved in extensionless import specifiers. Node.js doesn’t do this by default; if your project resolves extensionless imports at build time (e.g. [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org)) `true` might be appropriate. This option only works if the option `resolveFileExtensions` is used. |

**Returns:** object\<string, [ModuleExports](#type-moduleexports)> — Map of module file paths and unused module exports.

#### Examples

_Ways to `import`._

> ```js
> import { findUnusedExports } from 'find-unused-exports';
> ```
>
> ```js
> import findUnusedExports from 'find-unused-exports/public/findUnusedExports.mjs';
> ```

---

### type ModuleExports

List of ECMAScript module export names, including `default` if one is a default export.

**Type:** Set\<string>

#### Examples

_How export statements translate._

> These export statements:
>
> ```js
> export const a = 1;
> export const b = 2;
> export default 3;
> ```
>
> Translate to:
>
> ```js
> new Set(['a', 'b', 'default']);
> ```

## Caveats

### Dynamic imports

A [dynamic import](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/import#Dynamic_Imports) marks the default and all named exports of the imported module as used. It’s not feasible for this tool to determine exactly the default or named imports used at runtime.

#### Examples

_A dynamic import._

> ```js
> import('./a.mjs');
> ```

### Re-exporting all

Using `*` to [re-export](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export#Re-exporting_Aggregating) all named exports from a module marks them as used. Figuring out the export names `*` represents is hard for project files and impossible for external files. Avoid re-exporting all with `*` to find every unused export.

#### Examples

_It can’t be determined if all of these exports are imported somewhere else._

> ```js
> export * from './b.mjs';
> ```
