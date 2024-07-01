// @ts-check

import { deepStrictEqual, throws } from "node:assert";
import { describe, it } from "node:test";

import babel from "@babel/core";

import getVariableDeclarationIdentifierNames from "./getVariableDeclarationIdentifierNames.mjs";

describe(
  "Function `getVariableDeclarationIdentifierNames`.",
  { concurrency: true },
  () => {
    it("Argument 1 `variableDeclaration` not a `VariableDeclaration` Babel AST node.", () => {
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
    });

    describe("Single declaration.", { concurrency: true }, () => {
      it("Simple identifier.", () => {
        deepStrictEqual(
          getVariableDeclarationIdentifierNames(
            /** @type {babel.types.VariableDeclaration} */ (
              babel.template.ast("const a = 1")
            )
          ),
          ["a"]
        );
      });

      describe("Single declaration.", { concurrency: true }, () => {
        it("No renaming.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast("const { a, b } = { a: 1, b: 1 }")
              )
            ),
            ["a", "b"]
          );
        });

        it("Renaming.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast("const { a, b: c } = { a: 1, b: 1 }")
              )
            ),
            ["a", "c"]
          );
        });

        it("Rest element.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast("const { a, ...b } = { a: 1, b: 1, c: 1 }")
              )
            ),
            ["a", "b"]
          );
        });

        it("Nested array pattern.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast("const { a, b: [c]} = { a: 1, b: [1] }")
              )
            ),
            ["a", "c"]
          );
        });

        it("Nested object pattern.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast(
                  "const { a, b: { c }} = { a: 1, b: { c: 1 } }"
                )
              )
            ),
            ["a", "c"]
          );
        });
      });

      describe("Array pattern.", { concurrency: true }, () => {
        it("No skipping.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast("const [a, b] = [1, 2]")
              )
            ),
            ["a", "b"]
          );
        });

        it("Skipping.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast("const [, b] = [1, 2]")
              )
            ),
            ["b"]
          );
        });

        it("Rest element.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast("const [a, ...b] = [1, 2, 3]")
              )
            ),
            ["a", "b"]
          );
        });

        it("Nested array pattern.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast("const [a, [b]] = [1, [1, 2, 3]]")
              )
            ),
            ["a", "b"]
          );
        });

        it("Nested object pattern.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {babel.types.VariableDeclaration} */ (
                babel.template.ast("const [a, { b }] = [1, { b: 1 }]")
              )
            ),
            ["a", "b"]
          );
        });
      });
    });

    it("Multiple declarations.", () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {babel.types.VariableDeclaration} */ (
            babel.template.ast("var a, b = 1")
          )
        ),
        ["a", "b"]
      );
    });
  }
);
