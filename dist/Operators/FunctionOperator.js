'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var FunctionOperator = function () {
  _createClass(FunctionOperator, null, [{
    key: 'getType',
    value: function getType() {
      return 'FunctionOperator';
    }
  }, {
    key: 'claimToken',
    value: function claimToken(payload, text) {
      var symbol = payload.symbol;
      if (text.startsWith(symbol)) {
        return { claim: symbol, remainder: text.slice(symbol.length) };
      }
      return { claim: '', remainder: text };
    }
  }]);

  function FunctionOperator(payload, params) {
    _classCallCheck(this, FunctionOperator);

    this._params = params;
    this._payload = payload;
  }

  _createClass(FunctionOperator, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        type: this._payload.type,
        name: this._payload.name,
        params: this._params.map(function (p) {
          return p.toJSON();
        })
      };
    }
  }]);

  return FunctionOperator;
}();

exports.default = FunctionOperator;