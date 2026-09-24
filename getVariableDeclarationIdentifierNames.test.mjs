// @ts-check

/** @import { types } from "@babel/core" */

import { deepStrictEqual, throws } from "node:assert";
import { suite, test } from "node:test";

import { template } from "@babel/core";

import getVariableDeclarationIdentifierNames from "./getVariableDeclarationIdentifierNames.mjs";

suite(
  "Function `getVariableDeclarationIdentifierNames`.",
  { concurrency: true },
  () => {
    test("Argument 1 `variableDeclaration` not a `VariableDeclaration` Babel AST node.", () => {
      throws(
        () =>
          getVariableDeclarationIdentifierNames(
            // @ts-expect-error Testing invalid.
            true,
          ),
        new TypeError(
          "Argument 1 `variableDeclaration` must be a `VariableDeclaration` Babel AST node.",
        ),
      );
    });

    suite("Single declaration.", { concurrency: true }, () => {
      test("Simple identifier.", () => {
        deepStrictEqual(
          getVariableDeclarationIdentifierNames(
            /** @type {types.VariableDeclaration} */ (
              template.ast("const a = 1")
            ),
          ),
          ["a"],
        );
      });

      suite("Single declaration.", { concurrency: true }, () => {
        test("No renaming.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const { a, b } = { a: 1, b: 1 }")
              ),
            ),
            ["a", "b"],
          );
        });

        test("Renaming.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const { a, b: c } = { a: 1, b: 1 }")
              ),
            ),
            ["a", "c"],
          );
        });

        test("Rest element.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const { a, ...b } = { a: 1, b: 1, c: 1 }")
              ),
            ),
            ["a", "b"],
          );
        });

        test("Nested array pattern.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const { a, b: [c]} = { a: 1, b: [1] }")
              ),
            ),
            ["a", "c"],
          );
        });

        test("Nested object pattern.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const { a, b: { c }} = { a: 1, b: { c: 1 } }")
              ),
            ),
            ["a", "c"],
          );
        });
      });

      suite("Array pattern.", { concurrency: true }, () => {
        test("No skipping.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const [a, b] = [1, 2]")
              ),
            ),
            ["a", "b"],
          );
        });

        test("Skipping.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const [, b] = [1, 2]")
              ),
            ),
            ["b"],
          );
        });

        test("Rest element.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const [a, ...b] = [1, 2, 3]")
              ),
            ),
            ["a", "b"],
          );
        });

        test("Nested array pattern.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const [a, [b]] = [1, [1, 2, 3]]")
              ),
            ),
            ["a", "b"],
          );
        });

        test("Nested object pattern.", () => {
          deepStrictEqual(
            getVariableDeclarationIdentifierNames(
              /** @type {types.VariableDeclaration} */ (
                template.ast("const [a, { b }] = [1, { b: 1 }]")
              ),
            ),
            ["a", "b"],
          );
        });
      });
    });

    test("Multiple declarations.", () => {
      deepStrictEqual(
        getVariableDeclarationIdentifierNames(
          /** @type {types.VariableDeclaration} */ (
            template.ast("var a, b = 1")
          ),
        ),
        ["a", "b"],
      );
    });
  },
);
