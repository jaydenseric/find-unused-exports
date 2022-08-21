# find-unused-exports changelog

## Next

### Major

- Updated Node.js support to `^14.17.0 || ^16.0.0 || >= 18.0.0`.
- Updated dev dependencies, some of which require newer Node.js versions than previously supported.

### Patch

- Updated dependencies.
- Updated `jsconfig.json`:
  - Set `compilerOptions.maxNodeModuleJsDepth` to `10`.
  - Set `compilerOptions.module` to `nodenext`.
- Updated ESLint config.
- Updated GitHub Actions CI config:
  - Run tests with Node.js v14, v16, v18.
  - Updated `actions/checkout` to v3.
  - Updated `actions/setup-node` to v3.

## 3.0.0

### Major

- Updated Node.js support to `^12.22.0 || ^14.17.0 || >= 16.0.0`.
- Updated dependencies, some of which require newer Node.js versions than previously supported.
- Public modules are now individually listed in the package `files` and `exports` fields.
- Removed `./package` from the package `exports` field; the full `package.json` filename must be used in a `require` path.
- Removed the package main index module; deep imports must be used.
- Shortened public module deep import paths, removing the `/public/`.
- Implemented TypeScript types via JSDoc comments.

### Minor

- Added a package `sideEffects` field.

### Patch

- Simplified dev dependencies and config for ESLint.
- Simplified package scripts.
- Removed the [`jsdoc-md`](https://npm.im/jsdoc-md) dev dependency and the related package scripts, replacing the readme “API” section with a manually written “Exports” section.
- Check TypeScript types via a new package `types` script.
- Various type safety improvements.
- Also run GitHub Actions CI with Node.js v17, and drop v15.
- Use a new [`replace-stack-traces`](https://npm.im/replace-stack-traces) dev dependency in tests.
- Reorganized the test file structure.
- Renamed imports in the test index module.
- Stopped using the [`kleur`](https://npm.im/kleur) chaining API.
- Configured Prettier option `singleQuote` to the default, `false`.
- Added a `license.md` MIT License file.
- Improved documentation.

## 2.0.0

### Major

- Updated Node.js support to `^12.20 || >= 14.13`.
- Updated dependencies, some of which require newer Node.js versions than previously supported.
- The API is now ESM in `.mjs` files instead of CJS in `.js` files, [accessible via `import` but not `require`](https://nodejs.org/dist/latest/docs/api/esm.html#esm_require).
- Replaced the the `package.json` `exports` field public [subpath folder mapping](https://nodejs.org/api/packages.html#packages_subpath_folder_mappings) (deprecated by Node.js) with a [subpath pattern](https://nodejs.org/api/packages.html#packages_subpath_patterns).
- By default also scan files with the `.cjs` file extension.

### Minor

- Process ECMAScript module files in parallel.
- Alphabetically sort ECMAScript module file paths in results.

### Patch

- Stop using [`hard-rejection`](https://npm.im/hard-rejection) to detect unhandled `Promise` rejections in tests, as Node.js v15+ does this natively.
- Updated GitHub Actions CI config:
  - Run tests with Node.js v12, v14, v15, v16.
  - Updated `actions/checkout` to v2.
  - Updated `actions/setup-node` to v2.
  - Don’t specify the `CI` environment variable as it’s set by default.
- Updated the package scripts:
  - Simpler JSDoc related scripts now that [`jsdoc-md`](https://npm.im/jsdoc-md) v10 automatically generates a Prettier formatted readme.
  - Added a `test:jsdoc` script that checks the readme API docs are up to date with the source JSDoc.
- Stop snapshot testing Node.js versions separately as now all supported versions result in the same CLI output.
- Improved the test helper function `replaceStackTraces`.
- Eliminated the private helper functions `scanModuleFile` and `scanProject`.
- Test the private `CliError` class.
- Always use regex `u` mode.
- Improved runtime argument type checking.
- JSDoc tweaks.
- Test tweaks.
- Readme tweaks.

## 1.2.0

### Minor

- Improved console output for `find-unused-exports` CLI errors.

### Patch

- Updated dependencies.
- Removed `dynamicImport` and `objectRestSpread` plugins from the Babel parser config, as they are enabled by default nowadays.
- Ensure `CliError` instances have correct `name` properties.
- Replaced the `stripStackTraces` test helper with a smarter `replaceStackTraces` helper that allows tests to detect a missing stack trace.
- Use the `.ans` file extension for snapshot text files containing ANSI formatting.
- Removed `npm-debug.log` from the `.gitignore` file as npm [v4.2.0](https://github.com/npm/npm/releases/tag/v4.2.0)+ doesn’t create it in the current working directory.
- JSDoc improvements.

## 1.1.1

### Patch

- Updated dependencies.
- Also run GitHub Actions with Node.js v15.
- Simplified the GitHub Actions CI config with the [`npm install-test`](https://docs.npmjs.com/cli/v7/commands/npm-install-test) command.
- Fix testing of CLI output colors, broken due to changes in non server major [`kleur`](https://npm.im/kleur) releases.
- Refactored `forEach` loops to `for…of` syntax.
- Refactored some tests.
- Tweaked some documentation.
- Support named export variable declaration destructuring, fixing [#1](https://github.com/jaydenseric/find-unused-exports/issues/1) via [#2](https://github.com/jaydenseric/find-unused-exports/pull/2) and [#3](https://github.com/jaydenseric/find-unused-exports/pull/3).

## 1.1.0

### Minor

- Support ignore unused exports comments.

### Patch

- Updated dev dependencies.

## 1.0.1

### Patch

- Fixed some `find-unused-exports` CLI snapshot tests.

## 1.0.0

Initial release.
