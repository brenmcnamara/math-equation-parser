'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getNumberOfParams;
function getNumberOfParams(payload) {

  switch (payload.type) {
    case 'UnaryOperator':
      return 1;
    case 'BinaryOperator':
      return 2;
    case 'FunctionOperator':
      return payload.numberOfParams;
    default:
      throw Error('Unknown payload ' + payload.type);
  }
}