
import Parser from '../Parser';

import assert from 'assert';

function Literal(value) { return {type: 'Literal', name: 'Literal', value}; }

function Symbol(symbol) { return {type: 'Symbol', name: 'Symbol', symbol}; }

function AssertionError(message) {
  return new assert.AssertionError({
    actual: false,
    expected: true,
    message,
    operation: '==',
    stackStartFunction: assert.ok,
  });
}

describe('Parser', () => {

  it('parses number literals', () => {

    expect(Parser.parse('2').toJSON()).toEqual(Literal(2));

    expect(Parser.parse('1.12').toJSON()).toEqual(Literal(1.12));

    expect(Parser.parse('.12').toJSON()).toEqual(Literal(0.12));

  });

  it('parses the sum operation', () => {

    expect(Parser.parse('2 + 3').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: Literal(2),
      right: Literal(3),
    });

  });

  it('parses the minus operator', () => {

    expect(Parser.parse('2 - 3').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Diff',
      left: Literal(2),
      right: Literal(3),
    });

  });

  it('parses the multiplication operator', () => {

    expect(Parser.parse('2 * 3.1').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Prod',
      left: Literal(2),
      right: Literal(3.1),
    });
  });

  it('parses the division operator', () => {

    expect(Parser.parse('.12 / .48').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Quot',
      left: Literal(.12),
      right: Literal(.48),
    });

  });

  it('parses the exponent operator', () => {

    expect(Parser.parse('1.1 ^ 3').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Exp',
      left: Literal(1.1),
      right: Literal(3),
    });

  });

  it('gives multiplication higher precedence than addition', () => {

    expect(Parser.parse('1 + 2 * 3').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: Literal(1),
      right: {
        type: 'BinaryOperator',
        name: 'Prod',
        left: Literal(2),
        right: Literal(3),
      },
    });

    expect(Parser.parse('1 * 2 + 3').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: {
        type: 'BinaryOperator',
        name: 'Prod',
        left: Literal(1),
        right: Literal(2),
      },
      right: Literal(3),
    });

  });

  it('gives exponent higher precedence than multiplication', () => {

    expect(Parser.parse('1 + 2 ^ 3').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: Literal(1),
      right: {
        type: 'BinaryOperator',
        name: 'Exp',
        left: Literal(2),
        right: Literal(3),
      },
    });

    expect(Parser.parse('1 ^ 2 + 3').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: {
        type: 'BinaryOperator',
        name: 'Exp',
        left: Literal(1),
        right: Literal(2),
      },
      right: Literal(3),
    });

  });

  it('parses symbols', () => {

    expect(Parser.parse('x').toJSON()).toEqual(Symbol('x'));

    expect(Parser.parse('1 + x').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: Literal(1),
      right: Symbol('x'),
    });

  });

  it('parses parenthesis', () => {

    expect(Parser.parse('(1)').toJSON()).toEqual(Literal(1));

    expect(Parser.parse('((1))').toJSON()).toEqual(Literal(1));

  });

  it('sets precedence on operations within parenthesis', () => {

    expect(Parser.parse('(1 + 2) * 3').toJSON()).toEqual({
      type: 'BinaryOperator',
      name: 'Prod',
      left: {
        type: 'BinaryOperator',
        name: 'Sum',
        left: Literal(1),
        right: Literal(2),
      },
      right: Literal(3),
    });

  });

  it('throws an error when a binary operation is used incorrectly', () => {

    expect(() => Parser.parse('1 *')).toThrow();

  });

  it('parses the log operator', () => {

    expect(Parser.parse('log(1)').toJSON()).toEqual({
      type: 'FunctionOperator',
      name: 'Log',
      params: [Literal(1)],
    });

  });

  it('parses the pow operator', () => {

    expect(Parser.parse('pow(1, 2)').toJSON()).toEqual({
      type: 'FunctionOperator',
      name: 'Pow',
      params: [Literal(1), Literal(2)],
    });

  });

  it('parses the sin operator', () => {

    expect(Parser.parse('sin(0)').toJSON()).toEqual({
      type: 'FunctionOperator',
      name: 'Sine',
      params: [Literal(0)],
    });

  });

  it('parses the cosin operator', () => {

    expect(Parser.parse('cosin(0)').toJSON()).toEqual({
      type: 'FunctionOperator',
      name: 'Cosine',
      params: [Literal(0)],
    });

  });

  it('parses the tan operator', () => {

    expect(Parser.parse('tan(1)').toJSON()).toEqual({
      type: 'FunctionOperator',
      name: 'Tangent',
      params: [Literal(1)],
    });

  });

});
