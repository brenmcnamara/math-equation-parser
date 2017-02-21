'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var NumberRegExp = /(^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/;

var LiteralOperator = function () {
  _createClass(LiteralOperator, null, [{
    key: 'getType',
    value: function getType() {
      return 'Literal';
    }
  }]);

  function LiteralOperator(value) {
    _classCallCheck(this, LiteralOperator);

    this._value = value;
  }

  _createClass(LiteralOperator, [{
    key: 'toJSON',
    value: function toJSON() {
      return {
        type: this.constructor.getType(),
        name: this.constructor.getType(),
        value: this._value
      };
    }
  }, {
    key: 'toString',
    value: function toString() {
      return '[Literal ' + this._value + ']';
    }
  }, {
    key: 'toSource',
    value: function toSource() {
      return this.toString();
    }
  }]);

  return LiteralOperator;
}();

exports.default = LiteralOperator;