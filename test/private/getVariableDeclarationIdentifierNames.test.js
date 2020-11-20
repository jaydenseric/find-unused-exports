'use strict';

const { deepStrictEqual } = require('assert');
const { parseAsync } = require('@babel/core');
const getVariableDeclarationIdentifierNames = require('../../private/getVariableDeclarationIdentifierNames');

module.exports = (tests) => {
  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, simple identifier.',
    async () => {
      const ast = await parseAsync('export const a = true');
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, no renaming.',
    async () => {
      const ast = await parseAsync(
        'export const { a, b } = { a: true, b: true }'
      );
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'b']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, renaming.',
    async () => {
      const ast = await parseAsync(
        'export const { a, b: c } = { a: true, b: true }'
      );
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'c']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, rest element.',
    async () => {
      const ast = await parseAsync(
        'export const { a, ...b } = { a: true, b: true, c: true }'
      );
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'b']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, nested array pattern.',
    async () => {
      const ast = await parseAsync(
        'export const { a, b: [c]} = { a: true, b: [1, 2] }'
      );
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'c']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, object pattern, nested object pattern.',
    async () => {
      const ast = await parseAsync(
        'export const { a, b: { c }} = { a: true, b: { c: true } }'
      );
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'c']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, no skipping.',
    async () => {
      const ast = await parseAsync('export const [a, b] = [1, 2]');
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'b']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, skipping.',
    async () => {
      const ast = await parseAsync('export const [, b] = [1, 2]');
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['b']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, rest element.',
    async () => {
      const ast = await parseAsync('export const [a, ...b] = [1, 2, 3]');
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'b']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, nested array pattern.',
    async () => {
      const ast = await parseAsync('export const [a, [b]] = [1, [1, 2, 3]]');
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'b']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with a single declaration, array pattern, nested object pattern.',
    async () => {
      const ast = await parseAsync(
        'export const [a, { b }] = [1, { a: true, b: true }]'
      );
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'b']
      );
    }
  );

  tests.add(
    '`getVariableDeclarationIdentifierNames` with multiple declarations.',
    async () => {
      const ast = await parseAsync('export var a, b = true');
      const variableDeclaration = ast.program.body[0].declaration;

      deepStrictEqual(
        getVariableDeclarationIdentifierNames(variableDeclaration),
        ['a', 'b']
      );
    }
  );
};
