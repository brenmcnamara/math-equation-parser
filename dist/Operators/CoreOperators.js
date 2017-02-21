'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {

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
      numberOfOperands: 1
    },
    cosin: {
      type: 'FunctionOperator',
      name: 'Cosine',
      symbol: 'cosin',
      numberOfOperands: 1
    },
    tan: {
      type: 'FunctionOperator',
      name: 'Tangent',
      symbol: 'tan',
      numberOfOperands: 1
    },
    pow: {
      type: 'FunctionOperator',
      name: 'Exponent',
      symbol: 'pow',
      numberOfOperands: 2
    },
    log: {
      type: 'FunctionOperator',
      name: 'Log10',
      symbol: 'log',
      numberOfOperands: 1
    }
  }

};