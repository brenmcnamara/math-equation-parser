'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = getClaimToken;

var NumberRegExp = /(^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/;

function getClaimToken(payload, text) {

  switch (payload.type) {

    case 'Literal':
      {
        var match = text.match(NumberRegExp);
        if (!match) {
          return { claim: '', remainder: text };
        }
        return { claim: match[0], remainder: text.slice(match[0].length) };
      }

    case 'Variable':
      {
        if (!/^[a-zA-Z]/.test(text)) {
          return { claim: '', remainder: text };
        }
        var validVariables = payload.validVariables;

        if (validVariables && validVariables.indexOf(text.charAt(0)) < 0) {
          return { claim: '', remainder: text };
        }
        return { claim: text.charAt(0), remainder: text.slice(1) };
      }

    case 'UnaryOperator':
      {
        var symbol = payload.symbol;

        if (text.startsWith(symbol)) {
          return { claim: symbol, remainder: text.slice(symbol.length) };
        }
        return { claim: '', remainder: text };
      }

    case 'BinaryOperator':
      {
        var _symbol = payload.symbol;

        if (text.startsWith(_symbol)) {
          return { claim: _symbol, remainder: text.slice(_symbol.length) };
        }
        return { claim: '', remainder: text };
      }

    case 'FunctionOperator':
      {
        var _symbol2 = payload.symbol;

        if (text.startsWith(_symbol2)) {
          return { claim: _symbol2, remainder: text.slice(_symbol2.length) };
        }
        return { claim: '', remainder: text };
      }

    default:
      throw Error('Unrecognized payload ' + payload.type);
  }
}