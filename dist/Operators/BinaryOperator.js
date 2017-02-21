'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var BinaryOperator = function () {
  _createClass(BinaryOperator, null, [{
    key: 'claimToken',
    value: function claimToken(payload, text) {
      var symbol = payload.symbol;
      if (text.startsWith(symbol)) {
        return { claim: symbol, remainder: text.slice(symbol.length) };
      }
      return { claim: '', remainder: text };
    }
  }, {
    key: 'getType',
    value: function getType() {
      return 'BinaryOperator';
    }
  }, {
    key: 'getNumberOfOperands',
    value: function getNumberOfOperands() {
      return 2;
    }
  }]);

  function BinaryOperator(payload, operands) {
    _classCallCheck(this, BinaryOperator);

    var _operands = _slicedToArray(operands, 2),
        left = _operands[0],
        right = _operands[1];

    this._left = left;
    this._right = right;
    this._payload = payload;
  }

  _createClass(BinaryOperator, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        type: this._payload.type,
        name: this._payload.name,
        left: this._left.toJSON(),
        right: this._right.toJSON()
      };
    }
  }]);

  return BinaryOperator;
}();

exports.default = BinaryOperator;