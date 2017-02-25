'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

var _CoreOperators = require('./CoreOperators');

var _CoreOperators2 = _interopRequireDefault(_CoreOperators);

var _assert = require('assert');

var _assert2 = _interopRequireDefault(_assert);

var _createOperator = require('./createOperator');

var _createOperator2 = _interopRequireDefault(_createOperator);

var _getClaimToken = require('./getClaimToken');

var _getClaimToken2 = _interopRequireDefault(_getClaimToken);

var _getNumberOfParams = require('./getNumberOfParams');

var _getNumberOfParams2 = _interopRequireDefault(_getNumberOfParams);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

var UnaryMinusPayload = {
  type: 'UnaryOperator',
  name: 'Minus',
  symbol: '-'
};

var PrecedenceMap = {
  LOW: 1,
  NORMAL: 2,
  MEDIUM: 3,
  HIGH: 4
};

var DefaultConfig = {
  // An array of variables that are valid. If this is null, all variables
  // are valid.
  validVariables: null,
  // Whether or not to allow implicit multiplication
  implicitMultiply: true,
  // The associativity of operations with the same precedence.
  isLeftAssociative: true
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
    this._unaryPayloads = Object.values(_CoreOperators2.default.Unary);
    this._functionPayloads = Object.values(_CoreOperators2.default.Function);
    this._config = Object.assign({}, DefaultConfig, config);
  }

  _createClass(Parser, [{
    key: 'addOperatorPayload',
    value: function addOperatorPayload(payload) {
      switch (payload.type) {
        case 'FunctionOperator':
          this._functionPayloads.push(payload);
          break;
        case 'BinaryOperator':
          this._binaryPayloads.push(payload);
          break;
        case 'UnaryOperator':
          this._unaryPayloads.push(payload);
          break;
        default:
          throw Error('Unrecognized operator payload ' + payload.type);
      }
      return this;
    }
  }, {
    key: 'parse',
    value: function parse(text) {
      var LiteralPayload = { type: 'Literal' };
      var VariablePayload = {
        type: 'Variable',
        validVariables: this._config.validVariables
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
          var literal = (0, _createOperator2.default)(LiteralPayload, [value]);
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
          var closeVariable = textToProcess.charAt(0);
          processor.addCloseVariable(closeVariable);
          textToProcess = textToProcess.slice(1);
          continue;
        }

        // Check if this is a unary operator.
        var isUnaryOperator = false;
        var _iteratorNormalCompletion = true;
        var _didIteratorError = false;
        var _iteratorError = undefined;

        try {
          for (var _iterator = this._unaryPayloads[Symbol.iterator](), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
            var payload = _step.value;

            var claimToken = (0, _getClaimToken2.default)(payload, textToProcess);
            if (claimToken.claim.length > 0) {
              isUnaryOperator = true;
              processor.addPayload(payload);
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

        if (isUnaryOperator) {
          continue;
        }

        // Check for the unary minus operator.
        var unaryMinusClaimToken = (0, _getClaimToken2.default)(UnaryMinusPayload, textToProcess);
        if (unaryMinusClaimToken.claim.length > 0 && processor.isUnaryMinus()) {
          processor.addPayload(UnaryMinusPayload);
          textToProcess = unaryMinusClaimToken.remainder;
          continue;
        }

        // Check if this is a binary operator.
        var isBinaryOperator = false;
        var _iteratorNormalCompletion2 = true;
        var _didIteratorError2 = false;
        var _iteratorError2 = undefined;

        try {
          for (var _iterator2 = this._binaryPayloads[Symbol.iterator](), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
            var _payload = _step2.value;

            var _claimToken = (0, _getClaimToken2.default)(_payload, textToProcess);
            if (_claimToken.claim.length > 0) {
              isBinaryOperator = true;
              processor.addPayload(_payload);
              textToProcess = _claimToken.remainder;
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

        if (isBinaryOperator) {
          continue;
        }

        // Check if this is a function operator
        var isFunctionOperator = false;
        var _iteratorNormalCompletion3 = true;
        var _didIteratorError3 = false;
        var _iteratorError3 = undefined;

        try {
          for (var _iterator3 = this._functionPayloads[Symbol.iterator](), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
            var _payload2 = _step3.value;

            var _claimToken2 = (0, _getClaimToken2.default)(_payload2, textToProcess);
            if (_claimToken2.claim.length > 0) {
              isFunctionOperator = true;
              processor.addPayload(_payload2);
              (0, _assert2.default)(_claimToken2.remainder.charAt(0) === '(', // Paren after function
              'Invalid Equation');
              textToProcess = _claimToken2.remainder.slice(1);
              break;
            }
          }
        } catch (err) {
          _didIteratorError3 = true;
          _iteratorError3 = err;
        } finally {
          try {
            if (!_iteratorNormalCompletion3 && _iterator3.return) {
              _iterator3.return();
            }
          } finally {
            if (_didIteratorError3) {
              throw _iteratorError3;
            }
          }
        }

        if (isFunctionOperator) {
          continue;
        }

        // Check if this is a variable.
        var variableClaimToken = (0, _getClaimToken2.default)(VariablePayload, textToProcess);
        if (variableClaimToken.claim.length > 0) {
          var rawVariable = variableClaimToken.claim;
          var variable = (0, _createOperator2.default)(VariablePayload, [rawVariable]);
          processor.addVariable(variable);
          textToProcess = variableClaimToken.remainder;
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
    key: 'addVariable',
    value: function addVariable(variable) {
      this._typeAddedCurrentPass = 'Variable';
      this._maybeImplicitMultiply();
      this._addOperator(variable);
    }
  }, {
    key: 'addLiteral',
    value: function addLiteral(literal) {
      this._typeAddedCurrentPass = 'Literal';
      this._maybeImplicitMultiply();
      this._addOperator(literal);
    }
  }, {
    key: 'addPayload',
    value: function addPayload(payload) {
      switch (payload.type) {
        case 'UnaryOperator':
          return this._addUnaryPayload(payload);
        case 'BinaryOperator':
          return this._addBinaryPayload(payload, false);
        case 'FunctionOperator':
          return this._addFunctionPayload(payload);
        default:
          throw Error('Unrecognized operator payload ' + payload.type);
      }
    }
  }, {
    key: 'isUnaryMinus',
    value: function isUnaryMinus() {
      return this._typeAddedLastPass !== 'Literal' && this._typeAddedLastPass !== ')';
    }
  }, {
    key: '_addUnaryPayload',
    value: function _addUnaryPayload(payload) {
      this._typeAddedCurrentPass = 'UnaryOperator';
      this._maybeImplicitMultiply();
      this._operatorPayloads.push(payload);
    }

    /**
     * Adds a binary payload and optionally add it silently. A payload added
     * silently will not record the current pass as adding a binary operator.
     * This is used to process implicit multiplication correctly.
     */

  }, {
    key: '_addBinaryPayload',
    value: function _addBinaryPayload(payload, isSilent) {
      if (!isSilent) {
        this._typeAddedCurrentPass = 'BinaryOperator';
      }
      var precedenceValue = getPrecedenceValue(payload);
      var lastPayload = this._operatorPayloads[this._operatorPayloads.length - 1];
      while (lastPayload && lastPayload !== '(' && lastPayload !== 'StartOfFunction' && (
      // Left Associative
      this._config.isLeftAssociative && getPrecedenceValue(lastPayload) >= precedenceValue ||
      // Right Associative
      getPrecedenceValue(lastPayload) > precedenceValue)) {
        this._operatorPayloads.pop();
        var numberOfParams = (0, _getNumberOfParams2.default)(lastPayload);
        var params = this._operators.splice(-numberOfParams, numberOfParams);
        var operator = (0, _createOperator2.default)(lastPayload, params);
        this._operators.push(operator);
        lastPayload = this._operatorPayloads[this._operatorPayloads.length - 1];
      }
      this._operatorPayloads.push(payload);
    }
  }, {
    key: '_addFunctionPayload',
    value: function _addFunctionPayload(payload) {
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
    key: 'addCloseVariable',
    value: function addCloseVariable(commaOrCloseParens) {
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
        var params = this._operators.splice(-numberOfParams, numberOfParams);
        var operatorName = operatorPayload.name;
        (0, _assert2.default)(params.length === numberOfParams, 'Operator ' + operatorName + ' needs ' + numberOfParams + ' params');
        this._operators.push((0, _createOperator2.default)(operatorPayload, params));
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
        var numberOfFunctionParams = (0, _getNumberOfParams2.default)(functionPayload);
        _assert2.default.equal(functionPayload.type, 'FunctionOperator');
        var _params = this._operators.splice(-numberOfFunctionParams, numberOfFunctionParams);
        (0, _assert2.default)(_params.length === numberOfFunctionParams, 'Corrupt state: Not enough elements in resolvedOperators');
        this._operators.push((0, _createOperator2.default)(functionPayload, _params));
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
        var params = this._operators.splice(-numberOfParams, numberOfParams);
        _assert2.default.equal(params.length, numberOfParams);
        this._operators.push((0, _createOperator2.default)(payload, params));
      }
      (0, _assert2.default)(this._operators.length === 1, 'Invalid equation');
      return this._operators[0];
    }
  }, {
    key: '_maybeImplicitMultiply',
    value: function _maybeImplicitMultiply() {
      // Check for implicit multiplication.
      var leftTypes = [')', 'Literal', 'Variable'];
      var rightTypes = ['UnaryOperator', 'FunctionOperator', '(', 'Literal', 'Variable'];
      if (this._config.implicitMultiply && leftTypes.indexOf(this._typeAddedLastPass) >= 0 && rightTypes.indexOf(this._typeAddedCurrentPass) >= 0) {
        this._addBinaryPayload(_CoreOperators2.default.Binary.prod, true);
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

/**
 * Get the precedence value of the operator payload.
 *
 * NOTE: Do not handle function payloads here because functions get processed
 * immediately after the closing parenthesis, so they will never be compared
 * to other operators.
 */


function getPrecedenceValue(payload) {
  switch (payload.type) {
    case 'BinaryOperator':
      return PrecedenceMap[payload.precedence];
    case 'UnaryOperator':
      return Infinity;
    default:
      throw Error('getPrecedenceValue has unknown payload ' + payload.type);
  }
}