'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = createOperator;

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function createOperator(payload, params) {

  switch (payload.type) {

    case 'Literal':
      _assert2.default.ok(params.length === 1 && typeof params[0] === 'number', 'Invalid literal parameters: ' + params.toString());
      return {
        type: 'Literal',
        name: 'Literal',
        value: params[0]
      };

    case 'Variable':
      _assert2.default.ok(params.length === 1 && typeof params[0] === 'string', 'Invalid variable parameters: ' + params.toString());
      return {
        type: 'Variable',
        name: 'Variable',
        variable: params[0]
      };

    case 'UnaryOperator':
      _assert2.default.ok(params.length === 1, 'Unary Operator should have exactly 1 parameter');
      return {
        type: 'UnaryOperator',
        name: payload.name,
        param: params[0]
      };

    case 'BinaryOperator':
      _assert2.default.ok(params.length === 2, 'Binary Operator should have exactly 2 parameters');
      return {
        type: 'BinaryOperator',
        name: payload.name,
        left: params[0],
        right: params[1]
      };

    case 'FunctionOperator':
      _assert2.default.ok(params.length === payload.numberOfParams, 'Expected Function Operator to have ' + payload.numberOfParams + ' params');
      return {
        type: 'FunctionOperator',
        name: payload.name,
        params: params
      };

    default:
      throw Error('createOperator not implemented for payload ' + payload.type);
  }
}