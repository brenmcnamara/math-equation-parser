
import BinaryOperator from './Operators/BinaryOperator';
import CoreOperators from './Operators/CoreOperators';
import FunctionOperator from './Operators/FunctionOperator';
import LiteralOperator from './Operators/LiteralOperator';
import SymbolOperator from './Operators/SymbolOperator';

import assert from 'assert';
import getClaimToken from './getClaimToken';
import getNumberOfParams from './getNumberOfParams';

const PrecedenceMap = {
  LOW: 1,
  NORMAL: 2,
  MEDIUM: 3,
  HIGH: 4,
};

const DefaultConfig = {
  // An array of symbols that are valid. If this is null, all symbols are valid.
  validSymbols: null,
  // Whether or not to allow implicit multiplication
  implicitMultiply: true,
  // The associativity of operations with the same precedence.
  isLeftAssociative: true,
};

const TYPE_TO_OPERATOR_CTOR = {
  BinaryOperator,
  FunctionOperator,
};

export default class Parser {

  static parse(text) {
    // TODO: Memoize!
    return (new Parser()).parse(text);
  }

  constructor(config = DefaultConfig) {
    this._binaryPayloads = Object.values(CoreOperators.Binary);
    this._functionPayloads = Object.values(CoreOperators.Function);
    this._config = Object.assign({}, DefaultConfig, config);
  }

  addBinaryOperator(payload) {
    assert.equal(payload.type, 'BinaryOperator');
    this._binaryPayloads.push(payload);
    return this;
  }

  addFunctionOperator(payload) {
    assert.equal(payload.type, 'FunctionOperator');
    this._functionPayloads.push(payload);
    return this;
  }

  parse(text) {
    const LiteralPayload = { type: 'Literal' };
    const SymbolPayload = {
      type: 'Symbol',
      validSymbols: this._config.validSymbols,
    };

    let textToProcess = text.replace(/\s+/g, '');
    const processor = new OperatorProcessor(this._config);

    // If we are processing a function, then we need to count the number
    // of operands we are expecting for that function.
    while (textToProcess.length) {
      processor.startPass();

      // Check if we found a number literal.
      const literalClaimToken = getClaimToken(LiteralPayload, textToProcess);
      if (literalClaimToken.claim.length > 0) {
        const value = parseFloat(literalClaimToken.claim, 10);
        const literal = new LiteralOperator(value);
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
        const closeSymbol = textToProcess.charAt(0);
        processor.addCloseSymbol(closeSymbol);
        textToProcess = textToProcess.slice(1);
        continue;
      }

      // Check if this is a binary operator.
      let isBinaryOperator = false;
      for (let payload of this._binaryPayloads) {
        const claimToken = getClaimToken(payload, textToProcess);
        if (claimToken.claim.length > 0) {
          isBinaryOperator = true;
          processor.addBinaryPayload(payload);
          textToProcess = claimToken.remainder;
          break;
        }
      }
      if (isBinaryOperator) { continue; }

      // Check if this is a function operator
      let isFunctionOperator = false;
      for (let payload of this._functionPayloads) {
        const claimToken = getClaimToken(payload, textToProcess);
        if (claimToken.claim.length > 0) {
          isFunctionOperator = true;
          processor.addFunctionPayload(payload);
          assert(
            claimToken.remainder.charAt(0) === '(', // Paren after function
            'Invalid Equation',
          );
          textToProcess = claimToken.remainder.slice(1);
          break;
        }
      }
      if (isFunctionOperator) { continue; }

      // Check if this is a symbol.
      const symbolClaimToken = getClaimToken(SymbolPayload, textToProcess);
      if (symbolClaimToken.claim.length > 0) {
        const symbol = new SymbolOperator(symbolClaimToken.claim);
        textToProcess = symbolClaimToken.remainder;
        processor.addSymbol(symbol);
        continue;
      }

      assert(false, `Unexpected token: ${textToProcess.charAt(0)}`);

    }
    return processor.done();
  }

}

// A utility class that helps process adding operators.
class OperatorProcessor {

  constructor(config) {
    this._remainingFunctionOperands = 0;
    this._typeAddedCurrentPass = null;
    this._typeAddedLastPass = null;
    this._isDone = false;
    this._operators = [];
    this._operatorPayloads = [];
    this._config = config;
  }

  addSymbol(symbol) {
    this._typeAddedCurrentPass = 'Symbol';
    this._maybeImplicitMultiply();
    this._addOperator(symbol);
  }

  addLiteral(literal) {
    this._typeAddedCurrentPass = 'Literal';
    this._maybeImplicitMultiply();
    this._addOperator(literal);
  }

  addBinaryPayload(payload) {
    this._typeAddedCurrentPass = 'BinaryOperator';
    this._addBinaryPayloadSilently(payload);
  }

  /**
   * Adds a binary payload without recording that the current pass added a
   * binary payload. This is used for implicit multiplication.
   */
  _addBinaryPayloadSilently(payload) {
    const precedence = PrecedenceMap[payload.precedence];
    let lastPayload = this._operatorPayloads[this._operatorPayloads.length - 1];
    while (
      lastPayload &&
      lastPayload !== '(' &&
      lastPayload !== 'StartOfFunction' &&
      (
        // Left Associative
        (
          this._config.isLeftAssociative &&
          PrecedenceMap[lastPayload.precedence] >= precedence
        ) ||
        // Right Associative
        (PrecedenceMap[lastPayload.precedence] > precedence)
      )
    ) {
      assert(this._operators.length >= 2, 'Invalid equation');
      this._operatorPayloads.pop();
      const operands = this._operators.splice(-2, 2);
      const operator = new BinaryOperator(lastPayload, operands);
      this._operators.push(operator);
      lastPayload = this._operatorPayloads[this._operatorPayloads.length - 1];
    }
    this._operatorPayloads.push(payload);
  }

  addFunctionPayload(payload) {
    this._typeAddedCurrentPass = 'FunctionOperator';
    this._maybeImplicitMultiply();
    this._operatorPayloads.push(payload, 'StartOfFunction');
    this._remainingFunctionOperands = getNumberOfParams(payload);
  }

  addOpenParens() {
    this._typeAddedCurrentPass = '(';
    this._maybeImplicitMultiply();
    this._operatorPayloads.push('(');
  }

  addCloseSymbol(commaOrCloseParens) {
    this._typeAddedCurrentPass = commaOrCloseParens;
    this._maybeImplicitMultiply();
    const isComma = (commaOrCloseParens === ',');
    if (isComma) {
      this._remainingFunctionOperands -= 1;
    }
    // Continuously pop until reaching the corresponding parenthesis.
    let operatorPayload = this._operatorPayloads.pop();
    while (
      operatorPayload &&
      operatorPayload !== '(' &&
      operatorPayload !== 'StartOfFunction'
    ) {
      const numberOfParams = getNumberOfParams(operatorPayload);
      const operands =
        this._operators.splice(-numberOfParams, numberOfParams);
      const operatorName = operatorPayload.name;
      assert(
        operands.length === numberOfParams,
        `Operator ${operatorName} needs ${numberOfParams} operands`,
      );
      this._operators.push(
        operatorPayload.type === 'BinaryOperator'
          ? new BinaryOperator(operatorPayload, operands)
          : new FunctionOperator(operatorPayload, operands),
      );
      this._addedOperatorCurrentPass = true;
      operatorPayload = this._operatorPayloads.pop();
    }
    if (operatorPayload === 'StartOfFunction' && !isComma) {
      // We processed everything from the start to the end of the function,
      // need to finish off processing this function call.

      // We encountered 1 more operand in this pass of textToProcess.
      this._remainingFunctionOperands -= 1;

      // StartOfFunction is always preceded by its FunctionOperator
      const functionPayload = this._operatorPayloads.pop();
      const numberOfFunctionOperands = getNumberOfParams(functionPayload);
      assert.equal(functionPayload.type, 'FunctionOperator');
      const operands = this._operators.splice(
        -numberOfFunctionOperands,
        numberOfFunctionOperands,
      );
      assert(
        operands.length === numberOfFunctionOperands,
        'Corrupt state: Not enough elements in resolvedOperators',
      );
      this._operators.push(new FunctionOperator(functionPayload, operands));
    }
  }

  // Each pass begins when the parser is looking at a new token.
  startPass() {
    assert(!this._isDone, 'Cannot add operator ctors after process is done');
    this._typeAddedLastPass = this._typeAddedCurrentPass;
    this._typeAddedCurrentPass = null;
  }

  // Declare that we are done processing this equation and get the resulting
  // syntax tree, if there are no errors.
  done() {
    // Loop through, pop, and resolve any operators still left on the stack.
    while (this._operatorPayloads.length > 0) {
      const payload = this._operatorPayloads.pop();
      assert(
        payload !== '(' && payload !== 'StartOfFunction',
        'Invalid equation',
      );
      const numberOfParams = getNumberOfParams(payload);
      const operands = this._operators.splice(
        -numberOfParams,
        numberOfParams,
      );
      assert.equal(operands.length, numberOfParams);
      const OperatorCtor = TYPE_TO_OPERATOR_CTOR[payload.type];
      assert.ok(OperatorCtor, 'Unrecognized payload', payload.type);
      this._operators.push(new OperatorCtor(payload, operands));
    }
    assert(this._operators.length === 1, 'Invalid equation');
    return this._operators[0].toJSON();
  }

  _maybeImplicitMultiply() {
    // Check for implicit multiplication.
    const leftTypes = [
      ')',
      'Literal',
      'Symbol',
    ];
    const rightTypes = [
      'FunctionOperator',
      '(',
      'Literal',
      'Symbol',
    ];
    if (
      this._config.implicitMultiply &&
      leftTypes.indexOf(this._typeAddedLastPass) >= 0 &&
      rightTypes.indexOf(this._typeAddedCurrentPass) >= 0
    ) {
      this._addBinaryPayloadSilently(CoreOperators.Binary.prod);
    }
  }

  _addOperator(operator) {
    this._operators.push(operator);
    this._addedOperatorCurrentPass = true;
  }

}
