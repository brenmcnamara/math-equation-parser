'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _BinaryOperator = require('./Operators/BinaryOperator');

var _BinaryOperator2 = _interopRequireDefault(_BinaryOperator);

var _CoreOperators = require('./Operators/CoreOperators');

var _CoreOperators2 = _interopRequireDefault(_CoreOperators);

var _FunctionOperator = require('./Operators/FunctionOperator');

var _FunctionOperator2 = _interopRequireDefault(_FunctionOperator);

var _LiteralOperator = require('./Operators/LiteralOperator');

var _LiteralOperator2 = _interopRequireDefault(_LiteralOperator);

var _SymbolOperator = require('./Operators/SymbolOperator');

var _SymbolOperator2 = _interopRequireDefault(_SymbolOperator);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _getClaimToken = require('./getClaimToken');

var _getClaimToken2 = _interopRequireDefault(_getClaimToken);

var _getNumberOfParams = require('./getNumberOfParams');

var _getNumberOfParams2 = _interopRequireDefault(_getNumberOfParams);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var PrecedenceMap = {
  LOW: 1,
  NORMAL: 2,
  MEDIUM: 3,
  HIGH: 4
};

var DefaultConfig = {
  // An array of symbols that are valid. If this is null, all symbols are valid.
  validSymbols: null,
  // Whether or not to allow implicit multiplication
  implicitMultiply: true,
  // The associativity of operations with the same precedence.
  isLeftAssociative: true
};

var TYPE_TO_OPERATOR_CTOR = {
  BinaryOperator: _BinaryOperator2.default,
  FunctionOperator: _FunctionOperator2.default
};

var Parser = function () {
  _createClass(Parser, null, [{
    key: 'parse',
    value: function parse(text) {
      // TODO: Memoize!
      return new Parser().parse(text);
    }
  }]);

  function Parser() {
    var config = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : DefaultConfig;

    _classCallCheck(this, Parser);

    this._binaryPayloads = Object.values(_CoreOperators2.default.Binary);
    this._functionPayloads = Object.values(_CoreOperators2.default.Function);
    this._config = Object.assign({}, DefaultConfig, config);
  }

  _createClass(Parser, [{
    key: 'addBinaryOperator',
    value: function addBinaryOperator(payload) {
      _assert2.default.equal(payload.type, 'BinaryOperator');
      this._binaryPayloads.push(payload);
      return this;
    }
  }, {
    key: 'addFunctionOperator',
    value: function addFunctionOperator(payload) {
      _assert2.default.equal(payload.type, 'FunctionOperator');
      this._functionPayloads.push(payload);
      return this;
    }
  }, {
    key: 'parse',
    value: function parse(text) {
      var LiteralPayload = { type: 'Literal' };
      var SymbolPayload = {
        type: 'Symbol',
        validSymbols: this._config.validSymbols
      };

      var textToProcess = text.replace(/\s+/g, '');
      var processor = new OperatorProcessor(this._config);

      // If we are processing a function, then we need to count the number
      // of operands we are expecting for that function.
      while (textToProcess.length) {
        processor.startPass();

        // Check if we found a number literal.
        var literalClaimToken = (0, _getClaimToken2.default)(LiteralPayload, textToProcess);
        if (literalClaimToken.claim.length > 0) {
          var value = parseFloat(literalClaimToken.claim, 10);
          var literal = new _LiteralOperator2.default(value);
          processor.addLiteral(literal);
          textToProcess = literalClaimToken.remainder;
          continue;
        }

        // Check if this is begin parenthesis.
        if (textToProcess.charAt(0) === '(') {
          textToProcess = textToProcess.slice(1);
          processor.addOpenParens();
          continue;
        }

        // Check if this is a end parenthesis or comma
        if (textToProcess.charAt(0) === ')' || textToProcess.charAt(0) === ',') {
          var closeSymbol = textToProcess.charAt(0);
          processor.addCloseSymbol(closeSymbol);
          textToProcess = textToProcess.slice(1);
          continue;
        }

        // Check if this is a binary operator.
        var isBinaryOperator = false;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._binaryPayloads[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var payload = _step.value;

            var claimToken = (0, _getClaimToken2.default)(payload, textToProcess);
            if (claimToken.claim.length > 0) {
              isBinaryOperator = true;
              processor.addBinaryPayload(payload);
              textToProcess = claimToken.remainder;
              break;
            }
          }
        } catch (err) {
          _didIteratorError = true;
          _iteratorError = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion && _iterator.return) {
              _iterator.return();
            }
          } finally {
            if (_didIteratorError) {
              throw _iteratorError;
            }
          }
        }

        if (isBinaryOperator) {
          continue;
        }

        // Check if this is a function operator
        var isFunctionOperator = false;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this._functionPayloads[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _payload = _step2.value;

            var _claimToken = (0, _getClaimToken2.default)(_payload, textToProcess);
            if (_claimToken.claim.length > 0) {
              isFunctionOperator = true;
              processor.addFunctionPayload(_payload);
              (0, _assert2.default)(_claimToken.remainder.charAt(0) === '(', // Paren after function
              'Invalid Equation');
              textToProcess = _claimToken.remainder.slice(1);
              break;
            }
          }
        } catch (err) {
          _didIteratorError2 = true;
          _iteratorError2 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion2 && _iterator2.return) {
              _iterator2.return();
            }
          } finally {
            if (_didIteratorError2) {
              throw _iteratorError2;
            }
          }
        }

        if (isFunctionOperator) {
          continue;
        }

        // Check if this is a symbol.
        var symbolClaimToken = (0, _getClaimToken2.default)(SymbolPayload, textToProcess);
        if (symbolClaimToken.claim.length > 0) {
          var symbol = new _SymbolOperator2.default(symbolClaimToken.claim);
          textToProcess = symbolClaimToken.remainder;
          processor.addSymbol(symbol);
          continue;
        }

        (0, _assert2.default)(false, 'Unexpected token: ' + textToProcess.charAt(0));
      }
      return processor.done();
    }
  }]);

  return Parser;
}();

// A utility class that helps process adding operators.


exports.default = Parser;

var OperatorProcessor = function () {
  function OperatorProcessor(config) {
    _classCallCheck(this, OperatorProcessor);

    this._remainingFunctionOperands = 0;
    this._typeAddedCurrentPass = null;
    this._typeAddedLastPass = null;
    this._isDone = false;
    this._operators = [];
    this._operatorPayloads = [];
    this._config = config;
  }

  _createClass(OperatorProcessor, [{
    key: 'addSymbol',
    value: function addSymbol(symbol) {
      this._typeAddedCurrentPass = 'Symbol';
      this._maybeImplicitMultiply();
      this._addOperator(symbol);
    }
  }, {
    key: 'addLiteral',
    value: function addLiteral(literal) {
      this._typeAddedCurrentPass = 'Literal';
      this._maybeImplicitMultiply();
      this._addOperator(literal);
    }
  }, {
    key: 'addBinaryPayload',
    value: function addBinaryPayload(payload) {
      this._typeAddedCurrentPass = 'BinaryOperator';
      this._addBinaryPayloadSilently(payload);
    }

    /**
     * Adds a binary payload without recording that the current pass added a
     * binary payload. This is used for implicit multiplication.
     */

  }, {
    key: '_addBinaryPayloadSilently',
    value: function _addBinaryPayloadSilently(payload) {
      var precedence = PrecedenceMap[payload.precedence];
      var lastPayload = this._operatorPayloads[this._operatorPayloads.length - 1];
      while (lastPayload && lastPayload !== '(' && lastPayload !== 'StartOfFunction' && (
      // Left Associative
      this._config.isLeftAssociative && PrecedenceMap[lastPayload.precedence] >= precedence ||
      // Right Associative
      PrecedenceMap[lastPayload.precedence] > precedence)) {
        (0, _assert2.default)(this._operators.length >= 2, 'Invalid equation');
        this._operatorPayloads.pop();
        var operands = this._operators.splice(-2, 2);
        var operator = new _BinaryOperator2.default(lastPayload, operands);
        this._operators.push(operator);
        lastPayload = this._operatorPayloads[this._operatorPayloads.length - 1];
      }
      this._operatorPayloads.push(payload);
    }
  }, {
    key: 'addFunctionPayload',
    value: function addFunctionPayload(payload) {
      this._typeAddedCurrentPass = 'FunctionOperator';
      this._maybeImplicitMultiply();
      this._operatorPayloads.push(payload, 'StartOfFunction');
      this._remainingFunctionOperands = (0, _getNumberOfParams2.default)(payload);
    }
  }, {
    key: 'addOpenParens',
    value: function addOpenParens() {
      this._typeAddedCurrentPass = '(';
      this._maybeImplicitMultiply();
      this._operatorPayloads.push('(');
    }
  }, {
    key: 'addCloseSymbol',
    value: function addCloseSymbol(commaOrCloseParens) {
      this._typeAddedCurrentPass = commaOrCloseParens;
      this._maybeImplicitMultiply();
      var isComma = commaOrCloseParens === ',';
      if (isComma) {
        this._remainingFunctionOperands -= 1;
      }
      // Continuously pop until reaching the corresponding parenthesis.
      var operatorPayload = this._operatorPayloads.pop();
      while (operatorPayload && operatorPayload !== '(' && operatorPayload !== 'StartOfFunction') {
        var numberOfParams = (0, _getNumberOfParams2.default)(operatorPayload);
        var operands = this._operators.splice(-numberOfParams, numberOfParams);
        var operatorName = operatorPayload.name;
        (0, _assert2.default)(operands.length === numberOfParams, 'Operator ' + operatorName + ' needs ' + numberOfParams + ' operands');
        this._operators.push(operatorPayload.type === 'BinaryOperator' ? new _BinaryOperator2.default(operatorPayload, operands) : new _FunctionOperator2.default(operatorPayload, operands));
        this._addedOperatorCurrentPass = true;
        operatorPayload = this._operatorPayloads.pop();
      }
      if (operatorPayload === 'StartOfFunction' && !isComma) {
        // We processed everything from the start to the end of the function,
        // need to finish off processing this function call.

        // We encountered 1 more operand in this pass of textToProcess.
        this._remainingFunctionOperands -= 1;

        // StartOfFunction is always preceded by its FunctionOperator
        var functionPayload = this._operatorPayloads.pop();
        var numberOfFunctionOperands = (0, _getNumberOfParams2.default)(functionPayload);
        _assert2.default.equal(functionPayload.type, 'FunctionOperator');
        var _operands = this._operators.splice(-numberOfFunctionOperands, numberOfFunctionOperands);
        (0, _assert2.default)(_operands.length === numberOfFunctionOperands, 'Corrupt state: Not enough elements in resolvedOperators');
        this._operators.push(new _FunctionOperator2.default(functionPayload, _operands));
      }
    }

    // Each pass begins when the parser is looking at a new token.

  }, {
    key: 'startPass',
    value: function startPass() {
      (0, _assert2.default)(!this._isDone, 'Cannot add operator ctors after process is done');
      this._typeAddedLastPass = this._typeAddedCurrentPass;
      this._typeAddedCurrentPass = null;
    }

    // Declare that we are done processing this equation and get the resulting
    // syntax tree, if there are no errors.

  }, {
    key: 'done',
    value: function done() {
      // Loop through, pop, and resolve any operators still left on the stack.
      while (this._operatorPayloads.length > 0) {
        var payload = this._operatorPayloads.pop();
        (0, _assert2.default)(payload !== '(' && payload !== 'StartOfFunction', 'Invalid equation');
        var numberOfParams = (0, _getNumberOfParams2.default)(payload);
        var operands = this._operators.splice(-numberOfParams, numberOfParams);
        _assert2.default.equal(operands.length, numberOfParams);
        var OperatorCtor = TYPE_TO_OPERATOR_CTOR[payload.type];
        _assert2.default.ok(OperatorCtor, 'Unrecognized payload', payload.type);
        this._operators.push(new OperatorCtor(payload, operands));
      }
      (0, _assert2.default)(this._operators.length === 1, 'Invalid equation');
      return this._operators[0].toJSON();
    }
  }, {
    key: '_maybeImplicitMultiply',
    value: function _maybeImplicitMultiply() {
      // Check for implicit multiplication.
      var leftTypes = [')', 'Literal', 'Symbol'];
      var rightTypes = ['FunctionOperator', '(', 'Literal', 'Symbol'];
      if (this._config.implicitMultiply && leftTypes.indexOf(this._typeAddedLastPass) >= 0 && rightTypes.indexOf(this._typeAddedCurrentPass) >= 0) {
        this._addBinaryPayloadSilently(_CoreOperators2.default.Binary.prod);
      }
    }
  }, {
    key: '_addOperator',
    value: function _addOperator(operator) {
      this._operators.push(operator);
      this._addedOperatorCurrentPass = true;
    }
  }]);

  return OperatorProcessor;
}();