'use strict';

const { strictEqual } = require('assert');
const replaceStackTraces = require('./replaceStackTraces');

module.exports = (tests) => {
  tests.add('`replaceStackTraces` with a non stack trace.', () => {
    const value = `Unrelated.
at Unrelated.
at Unrelated.
Unrelated.`;

    strictEqual(replaceStackTraces(value), value);
  });

  tests.add(
    '`replaceStackTraces` with an Error stack trace, not extra indented.',
    () => {
      strictEqual(
        replaceStackTraces(`Unrelated.

Uncaught Error: Message.
    at Foo (<anonymous>:1:24)
    at <anonymous>:1:50

Unrelated.`),
        `Unrelated.

Uncaught Error: Message.
    <stack trace>

Unrelated.`
      );
    }
  );

  tests.add(
    '`replaceStackTraces` with an Error stack trace, extra indented.',
    () => {
      strictEqual(
        replaceStackTraces(`Unrelated.

  Uncaught Error: Message.
      at Foo (<anonymous>:1:24)
      at <anonymous>:1:50

Unrelated.`),
        `Unrelated.

  Uncaught Error: Message.
      <stack trace>

Unrelated.`
      );
    }
  );

  tests.add(
    '`replaceStackTraces` with a Node.js MODULE_NOT_FOUND Error stack trace.',
    () => {
      strictEqual(
        replaceStackTraces(`Error: Cannot find module '<file path>'
    at Function.Module._resolveFilename (node:internal/modules/cjs/loader:919:15)
    at Function.Module._load (node:internal/modules/cjs/loader:763:27)
    at Function.executeUserEntryPoint [as runMain] (node:internal/modules/run_main:76:12)
    at node:internal/main/run_main_module:17:47 {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}`),
        `Error: Cannot find module '<file path>'
    <stack trace> {
  code: 'MODULE_NOT_FOUND',
  requireStack: []
}`
      );
    }
  );
};
