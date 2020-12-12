# find-unused-exports changelog

## Next

### Patch

- Updated dependencies.
- Removed `dynamicImport` and `objectRestSpread` plugins from the Babel parser config, as they are enabled by default nowadays.
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
