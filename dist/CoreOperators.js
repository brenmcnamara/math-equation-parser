'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {

  Unary: {},

  Binary: {
    sum: {
      type: 'BinaryOperator',
      name: 'Sum',
      symbol: '+',
      precedence: 'NORMAL'
    },
    diff: {
      type: 'BinaryOperator',
      name: 'Difference',
      symbol: '-',
      precedence: 'NORMAL'
    },
    prod: {
      type: 'BinaryOperator',
      name: 'Product',
      symbol: '*',
      precedence: 'MEDIUM'
    },
    quot: {
      type: 'BinaryOperator',
      name: 'Quotient',
      symbol: '/',
      precedence: 'MEDIUM'
    },
    exp: {
      type: 'BinaryOperator',
      name: 'Exponent',
      symbol: '^',
      precedence: 'HIGH'
    }
  },

  Function: {
    sin: {
      type: 'FunctionOperator',
      name: 'Sine',
      symbol: 'sin',
      numberOfParams: 1
    },
    cosin: {
      type: 'FunctionOperator',
      name: 'Cosine',
      symbol: 'cosin',
      numberOfParams: 1
    },
    tan: {
      type: 'FunctionOperator',
      name: 'Tangent',
      symbol: 'tan',
      numberOfParams: 1
    },
    pow: {
      type: 'FunctionOperator',
      name: 'Exponent',
      symbol: 'pow',
      numberOfParams: 2
    },
    log: {
      type: 'FunctionOperator',
      name: 'Log10',
      symbol: 'log',
      numberOfParams: 1
    }
  }

};