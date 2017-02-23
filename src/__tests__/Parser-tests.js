
import Parser from '../Parser';

function Literal(value) { return { type: 'Literal', name: 'Literal', value }; }

function Variable(variable) {
  return { type: 'Variable', name: 'Variable', variable };
}

describe('Parser', () => {

  it('parses number literals', () => {

    expect(Parser.parse('2')).toEqual(Literal(2));

    expect(Parser.parse('1.12')).toEqual(Literal(1.12));

    expect(Parser.parse('.12')).toEqual(Literal(0.12));

  });

  it('parses the sum operation', () => {

    expect(Parser.parse('2 + 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: Literal(2),
      right: Literal(3),
    });

  });

  it('parses the minus operator', () => {

    expect(Parser.parse('2 - 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Difference',
      left: Literal(2),
      right: Literal(3),
    });

  });

  it('parses assuming left associativity', () => {

    expect(Parser.parse('1 + 2 + 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: {
        type: 'BinaryOperator',
        name: 'Sum',
        left: Literal(1),
        right: Literal(2),
      },
      right: Literal(3),
    });

  });

  it('parses the multiplication operator', () => {

    expect(Parser.parse('2 * 3.1')).toEqual({
      type: 'BinaryOperator',
      name: 'Product',
      left: Literal(2),
      right: Literal(3.1),
    });
  });

  it('parses the division operator', () => {

    expect(Parser.parse('.12 / .48')).toEqual({
      type: 'BinaryOperator',
      name: 'Quotient',
      left: Literal(.12),
      right: Literal(.48),
    });

  });

  it('parses the exponent operator', () => {

    expect(Parser.parse('1.1 ^ 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Exponent',
      left: Literal(1.1),
      right: Literal(3),
    });

  });

  it('gives multiplication higher precedence than addition', () => {

    expect(Parser.parse('1 + 2 * 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: Literal(1),
      right: {
        type: 'BinaryOperator',
        name: 'Product',
        left: Literal(2),
        right: Literal(3),
      },
    });

    expect(Parser.parse('1 * 2 + 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: {
        type: 'BinaryOperator',
        name: 'Product',
        left: Literal(1),
        right: Literal(2),
      },
      right: Literal(3),
    });

  });

  it('gives exponent higher precedence than multiplication', () => {

    expect(Parser.parse('1 + 2 ^ 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: Literal(1),
      right: {
        type: 'BinaryOperator',
        name: 'Exponent',
        left: Literal(2),
        right: Literal(3),
      },
    });

    expect(Parser.parse('1 ^ 2 + 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: {
        type: 'BinaryOperator',
        name: 'Exponent',
        left: Literal(1),
        right: Literal(2),
      },
      right: Literal(3),
    });

  });

  it('parses variables', () => {

    expect(Parser.parse('x')).toEqual(Variable('x'));

    expect(Parser.parse('1 + x')).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: Literal(1),
      right: Variable('x'),
    });

  });

  it('parses parenthesis', () => {

    expect(Parser.parse('(1)')).toEqual(Literal(1));

    expect(Parser.parse('((1))')).toEqual(Literal(1));

  });

  it('sets precedence on operations within parenthesis', () => {

    expect(Parser.parse('(1 + 2) * 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Product',
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

    expect(Parser.parse('log(1)')).toEqual({
      type: 'FunctionOperator',
      name: 'Log10',
      params: [Literal(1)],
    });

  });

  it('parses the pow operator', () => {

    expect(Parser.parse('pow(1, 2)')).toEqual({
      type: 'FunctionOperator',
      name: 'Exponent',
      params: [Literal(1), Literal(2)],
    });

  });

  it('parses the sin operator', () => {

    expect(Parser.parse('sin(0)')).toEqual({
      type: 'FunctionOperator',
      name: 'Sine',
      params: [Literal(0)],
    });

  });

  it('parses the cosin operator', () => {

    expect(Parser.parse('cosin(0)')).toEqual({
      type: 'FunctionOperator',
      name: 'Cosine',
      params: [Literal(0)],
    });

  });

  it('parses the tan operator', () => {

    expect(Parser.parse('tan(1)')).toEqual({
      type: 'FunctionOperator',
      name: 'Tangent',
      params: [Literal(1)],
    });

  });


  it('configures to only allow certain variables', () => {
    const parser = new Parser({validVariables: ['x', 'y']});
    expect(() => parser.parse('tan(x + y)')).not.toThrow();
    expect(() => parser.parse('tan(x + z)')).toThrow();
  });


  describe('implicit multiply', () => {

    it('works between variable and literal', () => {

      expect(Parser.parse('3x')).toEqual({
        type: 'BinaryOperator',
        name: 'Product',
        left: Literal(3),
        right: Variable('x'),
      });
      expect(Parser.parse('x3')).toEqual({
        type: 'BinaryOperator',
        name: 'Product',
        left: Variable('x'),
        right: Literal(3),
      });
    });

    it('works between variable and variable', () => {

      expect(Parser.parse('xy')).toEqual({
        type: 'BinaryOperator',
        name: 'Product',
        left: Variable('x'),
        right: Variable('y'),
      });

    });

    it('works between complex operations', () => {

      expect(Parser.parse('x^2y^2')).toEqual({
        type: 'BinaryOperator',
        name: 'Product',
        left: {
          type: 'BinaryOperator',
          name: 'Exponent',
          left: Variable('x'),
          right: Literal(2),
        },
        right: {
          type: 'BinaryOperator',
          name: 'Exponent',
          left: Variable('y'),
          right: Literal(2),
        },
      });

    });

    it('works with parenthesis', () => {

      expect(Parser.parse('(1)(2)')).toEqual({
        type: 'BinaryOperator',
        name: 'Product',
        left: Literal(1),
        right: Literal(2),
      });

      expect(Parser.parse('1(2)')).toEqual({
        type: 'BinaryOperator',
        name: 'Product',
        left: Literal(1),
        right: Literal(2),
      });

      expect(Parser.parse('(1)2')).toEqual({
        type: 'BinaryOperator',
        name: 'Product',
        left: Literal(1),
        right: Literal(2),
      });

    });

    it('works with function operators', () => {

      expect(Parser.parse('xsin(y)')).toEqual({
        type: 'BinaryOperator',
        name: 'Product',
        left: Variable('x'),
        right: {
          type: 'FunctionOperator',
          name: 'Sine',
          params: [Variable('y')],
        },
      });

    });

  });

  it('configures to disable implicit multiply', () => {
    const parser = new Parser({implicitMultiply: false});
    expect(() => parser.parse('xy')).toThrow();
  });

  it('configures to calculate with right associativity', () => {
    const parser = new Parser({isLeftAssociative: false});

    expect(parser.parse('1 + 2 + 3')).toEqual({
      type: 'BinaryOperator',
      name: 'Sum',
      left: Literal(1),
      right: {
        type: 'BinaryOperator',
        name: 'Sum',
        left: Literal(2),
        right: Literal(3),
      },
    });

  });

  it('supports custom unary operators', () => {
    const parser = new Parser();
    parser.addOperatorPayload({
      type: 'UnaryOperator',
      name: 'Blah',
      symbol: '$',
    });
    expect(parser.parse('$1')).toEqual({
      type: 'UnaryOperator',
      name: 'Blah',
      param: Literal(1),
    });
  });

  describe('Unary Operators', () => {

    it('parses with parenthesis', () => {
      const parser = new Parser();
      parser.addOperatorPayload({
        type: 'UnaryOperator',
        name: 'Blah',
        symbol: '$',
      });
      expect(parser.parse('$(1)')).toEqual({
        type: 'UnaryOperator',
        name: 'Blah',
        param: Literal(1),
      });
      expect(parser.parse('($1)')).toEqual({
        type: 'UnaryOperator',
        name: 'Blah',
        param: Literal(1),
      });
    });

    it('parses with highest precedence with binary operators', () => {
      const parser = new Parser();
      parser.addOperatorPayload({
        type: 'UnaryOperator',
        name: 'Blah',
        symbol: '$',
      });
      expect(parser.parse('$1 + 2')).toEqual({
        type: 'BinaryOperator',
        name: 'Sum',
        left: {
          type: 'UnaryOperator',
          name: 'Blah',
          param: Literal(1),
        },
        right: Literal(2),
      });
      expect(parser.parse('1 + $2')).toEqual({
        type: 'BinaryOperator',
        name: 'Sum',
        left: Literal(1),
        right: {
          type: 'UnaryOperator',
          name: 'Blah',
          param: Literal(2),
        },
      });
      expect(parser.parse('$1 + 2 * 3')).toEqual({
        type: 'BinaryOperator',
        name: 'Sum',
        left: {
          type: 'UnaryOperator',
          name: 'Blah',
          param: Literal(1),
        },
        right: {
          type: 'BinaryOperator',
          name: 'Product',
          left: Literal(2),
          right: Literal(3),
        },
      });
    });

    it('parses with more complicated math statements nested inside', () => {
      const parser = new Parser();
      parser.addOperatorPayload({
        type: 'UnaryOperator',
        name: 'Blah',
        symbol: '$',
      });
      expect(parser.parse('$(1 + 2sin(x))')).toEqual({
        type: 'UnaryOperator',
        name: 'Blah',
        param: {
          type: 'BinaryOperator',
          name: 'Sum',
          left: Literal(1),
          right: {
            type: 'BinaryOperator',
            name: 'Product',
            left: Literal(2),
            right: {
              type: 'FunctionOperator',
              name: 'Sine',
              params: [Variable('x')],
            },
          },
        },
      });
    });

    it('parses with implicit multiplication', () => {
      const parser = new Parser();
      parser.addOperatorPayload({
        type: 'UnaryOperator',
        name: 'Blah',
        symbol: '$',
      });
      expect(parser.parse('2$1')).toEqual({
        type: 'BinaryOperator',
        name: 'Product',
        left: Literal(2),
        right: {
          type: 'UnaryOperator',
          name: 'Blah',
          param: Literal(1),
        },
      });
    });

  });

});
