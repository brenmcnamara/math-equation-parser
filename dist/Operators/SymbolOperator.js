'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var SymbolOperator = function () {
  _createClass(SymbolOperator, null, [{
    key: 'getType',
    value: function getType() {
      return 'Symbol';
    }
  }, {
    key: 'claimToken',
    value: function claimToken(text) {
      if (/^[a-zA-Z]/.test(text)) {
        return { claim: text.charAt(0), remainder: text.slice(1) };
      }
      return { claim: '', remainder: text };
    }
  }]);

  function SymbolOperator(symbol) {
    _classCallCheck(this, SymbolOperator);

    this._symbol = symbol;
  }

  _createClass(SymbolOperator, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        type: this.constructor.getType(),
        name: this.constructor.getType(),
        symbol: this._symbol
      };
    }
  }]);

  return SymbolOperator;
}();

exports.default = SymbolOperator;