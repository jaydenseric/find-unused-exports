// @ts-check

import { deepStrictEqual, throws } from "node:assert";

import babel from "@babel/core";

import getVariableDeclarationIdentifierNames from "./getVariableDeclarationIdentifierNames.mjs";

/**
 * Adds `getVariableDeclarationIdentifierNames` tests.
 * @param {import("test-director").default} tests Test director.
 */
export default (tests) => {
  tests.add(
    "`getVariableDeclarationIdentifierNames` with argument 1 `variableDeclaration` not a `VariableDeclaration` Babel AST node.",
    () => {
      throws(
        () =>
          getVariableDeclarationIdentifierNames(
            // @ts-expect-error Testing invalid.
            true
          ),
        new TypeError(
          "Argument 1 `variableDeclaration` must be a `VariableDeclaration` Babel AST node."
        )
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, simple identifier.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const a = 1")
          )
        ),
        ["a"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, no renaming.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const { a, b } = { a: 1, b: 1 }")
          )
        ),
        ["a", "b"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, renaming.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const { a, b: c } = { a: 1, b: 1 }")
          )
        ),
        ["a", "c"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, rest element.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const { a, ...b } = { a: 1, b: 1, c: 1 }")
          )
        ),
        ["a", "b"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, nested array pattern.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const { a, b: [c]} = { a: 1, b: [1] }")
          )
        ),
        ["a", "c"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, nested object pattern.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const { a, b: { c }} = { a: 1, b: { c: 1 } }")
          )
        ),
        ["a", "c"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, no skipping.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const [a, b] = [1, 2]")
          )
        ),
        ["a", "b"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, skipping.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const [, b] = [1, 2]")
          )
        ),
        ["b"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, rest element.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const [a, ...b] = [1, 2, 3]")
          )
        ),
        ["a", "b"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, nested array pattern.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const [a, [b]] = [1, [1, 2, 3]]")
          )
        ),
        ["a", "b"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, nested object pattern.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("const [a, { b }] = [1, { b: 1 }]")
          )
        ),
        ["a", "b"]
      );
    }
  );

  tests.add(
    "`getVariableDeclarationIdentifierNames` with multiple declarations.",
    async () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("var a, b = 1")
          )
        ),
        ["a", "b"]
      );
    }
  );
};
