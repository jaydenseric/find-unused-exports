# find-unused-exports

A [Node.js](https://nodejs.org) [CLI](#cli) and equivalent JS [API](#exports) to find unused [ECMAScript module exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) in a project.

To achieve this the whole project is analyzed at once, something [ESLint](https://eslint.org) can’t do as it lints files in isolation.

- The `npx find-unused-exports` script is handy for finding redundant code to remove in legacy projects.
- Use the [CLI](#cli) command [`find-unused-exports`](#command-find-unused-exports) in package test scripts, so that [CI](https://en.wikipedia.org/wiki/Continuous_integration) can prevent the addition of redundant code.

## Installation

To install [`find-unused-exports`](https://npm.im/find-unused-exports) with [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm), run:

```sh
npm install find-unused-exports --save-dev
```

Then, either use the [CLI](#cli) command [`find-unused-exports`](#command-find-unused-exports) or import and use the function [`findUnusedExports`](./findUnusedExports.mjs).

## Excluding modules

Exclude third party modules and build artifacts from analysis via an exclude glob. This is specified for the [CLI](#cli) command [`find-unused-exports`](#command-find-unused-exports) via the argument `--exclude-glob` (relative to the current working directory), and for the function [`findUnusedExports`](./findUnusedExports.mjs) via the option `excludeGlob` (relative to the current working directory specified by the option `cwd`, defaulting to `process.cwd()`).

By default TypeScript declaration files and `node_modules` directories are recursively excluded:

```sh
{**/{,*,.*}.d.{mts,cts,ts},**/node_modules/**}
```

When specifying a custom exclude glob, include what the default does. E.g. to also exclude a directory `dist` at the project root:

```sh
{**/{,*,.*}.d.{mts,cts,ts},**/node_modules/**,dist/**}
```

Don’t exclude modules you author as a way to ignore validly unused exports:

- Accidental unused exports in the excluded modules won’t be detected.
- The imports won’t be analyzed, potentially causing exports elsewhere in the project to be falsely considered unused.

See below for how to properly ignore specific exports in specific modules.

## Ignoring unused exports

Ignore exports that are unused in a project for valid reasons:

- If the project is a package intended to be used by other projects, the package exports may be unused.
- If the project has configuration modules for tools, the exports are unused. E.g. the [ESLint](https://eslint.org) config file `eslint.config.mjs` has an unused default export.
- If the project uses a framework that by convention consumes certain certain exports from project modules, they may be unused. E.g. in a [Next.js](https://nextjs.org) project the directory `pages` modules have unused default exports.

### Ignore exports map

A map of module file globs and export names to ignore as unused. The export name `default` ignores the default export, and `*` ignores all exports (usually a bad idea). This is specified for the [CLI](#cli) command [`find-unused-exports`](#command-find-unused-exports) via the argument `--ignore` (relative to the current working directory), and for the function [`findUnusedExports`](./findUnusedExports.mjs) via the option `ignore` (relative to the current working directory specified by the option `cwd`, defaulting to `process.cwd()`).

#### Examples

For a [Next.js](https://nextjs.org) and [ESLint](https://eslint.org) project, a contrived `ignore-unused-exports.json`:

```json
{
  "eslint.config.js": ["default"],
  "next.config.js": ["default"],
  "pages/**/*.js": [
    "default",
    "getServerSideProps",
    "getStaticPaths",
    "getStaticProps"
  ]
}
```

Then, using [`npx`](https://docs.npmjs.com/cli/v11/commands/npx):

```sh
npx find-unused-exports --ignore "$(cat ignore-unused-exports.json)"
```

For a published package, to ignore all the unused exports in a package main index module, the ignore exports map may contain:

```json
{
  "index.mjs": ["*"]
}
```

Please don’t publish a package main index module though, for [optimal JavaScript module design](https://jaydenseric.com/blog/optimal-javascript-module-design).

It’s usually a bad idea to ignore every export with `*`; instead ignore specific export names to be able to detect other accidental unused exports.

### Ignore comments

Ignore comments can be used anywhere in a module to ignore all or specific unused exports. They are line or block comments, with the format:

1. Optional whitespace.
2. `ignore unused exports` (case insensitive).
3. Optional to only ignore specific exports:
   1. Optional spaces.
   2. The names of exports to ignore, separated by a `,` and optional spaces.
4. Optional whitespace.

#### Examples

How to ignore all unused exports (usually a bad idea):

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

- [Node.js](https://nodejs.org) versions `^22.19.0 || >=24.5.0`.

Projects must configure [TypeScript](https://typescriptlang.org) to use types from the ECMAScript modules that have a `// @ts-check` comment:

- [`compilerOptions.allowJs`](https://typescriptlang.org/tsconfig#allowJs) should be `true`.
- [`compilerOptions.maxNodeModuleJsDepth`](https://typescriptlang.org/tsconfig#maxNodeModuleJsDepth) should be reasonably large, e.g. `10`.
- [`compilerOptions.module`](https://typescriptlang.org/tsconfig#module) should be `"node16"` or `"nodenext"`.

## CLI

### Command `find-unused-exports`

Finds unused [ECMAScript module exports](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/export) in a project. If some are found, it reports them to `stderr` and exits with a `1` error status.

It implements the function [`findUnusedExports`](./findUnusedExports.mjs).

#### Arguments

| Argument | Default | Description |
| :-- | :-- | :-- |
| `--exclude-glob` | `"{**/{,*,.*}.d.{mts,cts,ts},**/node_modules/**}"` | File glob pattern to exclude files from the `--module-glob` results, relative to the current working directory. |
| `--ignore` | `"{}"` | JSON [ignore exports map](#ignore-exports-map) of module file globs (relative to the current working directory) and export names to ignore as unused. The export name `default` ignores the default export, and `*` ignores all exports (usually a bad idea). |
| `--import-map` | `"{}"` | JSON [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap#import_map_json_representation), relative to the current working directory. |
| `--module-glob` | `"**/{,*,.*}.{mts,cts,ts,tsx,mjs,cjs,js,jsx}"` | Module file glob pattern, relative to the current working directory. |
| `--resolve-file-extensions` |  | File extensions (without the leading `.`, multiple separated with `,` in preference order) to automatically resolve in extensionless import specifiers. [Import specifier file extensions are mandatory in Node.js](https://nodejs.org/api/esm.html#mandatory-file-extensions); if your project resolves extensionless imports at build time (e.g. [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org)) `mjs,js` might be appropriate. |
| `--resolve-index-files` |  | Should directory index files be automatically resolved in extensionless import specifiers. [Node.js doesn’t do this by default](https://nodejs.org/api/esm.html#mandatory-file-extensions); if your project resolves extensionless imports at build time (e.g. [Next.js](https://nextjs.org), via [webpack](https://webpack.js.org)) this argument might be appropriate. This argument only works if the argument `--resolve-file-extensions` is used. |

#### Examples

Using [`npx`](https://docs.npmjs.com/cli/v11/commands/npx) in a standard [Node.js](https://nodejs.org) project:

```sh
npx find-unused-exports
```

Using [`npx`](https://docs.npmjs.com/cli/v11/commands/npx) in a legacy [webpack](https://webpack.js.org) project that has ESM in `.js` files, extensionless import specifiers, and `index.js` files:

```sh
npx find-unused-exports --module-glob "**/*.js" --resolve-file-extensions js --resolve-index-files
```

Using [`npx`](https://docs.npmjs.com/cli/v11/commands/npx) in a project with an [import map](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/script/type/importmap#import_map_json_representation) in a file `import-map.json`:

```sh
npx find-unused-exports --import-map "$(cat import-map.json)"
```

[`package.json` scripts](https://docs.npmjs.com/cli/v11/using-npm/scripts) for a project that also uses [`eslint`](https://npm.im/eslint) and [`prettier`](https://npm.im/prettier):

```json
{
  "scripts": {
    "prettier": "prettier -c .",
    "eslint": "eslint",
    "find-unused-exports": "find-unused-exports",
    "test": "node --run prettier && node --run eslint && node --run find-unused-exports",
    "prepublishOnly": "node --run test"
  }
}
```

## Exports

The [npm](https://npmjs.com) package [`find-unused-exports`](https://npm.im/find-unused-exports) features [optimal JavaScript module design](https://jaydenseric.com/blog/optimal-javascript-module-design). It doesn’t have a main index module, so use deep imports from the ECMAScript modules that are exported via the [`package.json`](./package.json) field [`exports`](https://nodejs.org/api/packages.html#exports):

- [`findUnusedExports.mjs`](./findUnusedExports.mjs)
