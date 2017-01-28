
import BinaryOperator from './Operators/BinaryOperator';
import CoreOperators from './Operators/CoreOperators';
import FunctionOperator from './Operators/FunctionOperator';
import LiteralOperator from './Operators/LiteralOperator';
import SymbolOperator from './Operators/SymbolOperator';

import assert from 'assert';

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
    let textToProcess = text.replace(/\s+/g, '');
    const processor = new OperatorProcessor(this._config);

    // If we are processing a function, then we need to count the number
    // of operands we are expecting for that function.
    while (textToProcess.length) {
      processor.startPass();

      // Check if we found a number literal.
      const literalClaimObj = LiteralOperator.claimToken(textToProcess);
      if (literalClaimObj.claim.length > 0) {
        const value = parseFloat(literalClaimObj.claim, 10);
        const literal = new LiteralOperator(value);
        processor.addLiteral(literal);
        textToProcess = literalClaimObj.remainder;
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
        const claimObj = BinaryOperator.claimToken(payload, textToProcess);
        if (claimObj.claim.length > 0) {
          isBinaryOperator = true;
          processor.addBinaryPayload(payload);
          textToProcess = claimObj.remainder;
          break;
        }
      }
      if (isBinaryOperator) { continue; }

      // Check if this is a function operator
      let isFunctionOperator = false;
      for (let payload of this._functionPayloads) {
        const claimObj = FunctionOperator.claimToken(payload, textToProcess);
        if (claimObj.claim.length > 0) {
          isFunctionOperator = true;
          processor.addFunctionPayload(payload);
          assert(
            claimObj.remainder.charAt(0) === '(', // Paren after function
            'Invalid Equation',
          );
          textToProcess = claimObj.remainder.slice(1);
          break;
        }
      }
      if (isFunctionOperator) { continue; }

      // Check if this is a symbol.
      const symbolClaimObj = SymbolOperator.claimToken(textToProcess);
      if (
        symbolClaimObj.claim.length > 0 &&
        (
          !this._config.validSymbols ||
          this._config.validSymbols.indexOf(symbolClaimObj.claim) >= 0
        )
      ) {
        const symbol = new SymbolOperator(symbolClaimObj.claim);
        textToProcess = symbolClaimObj.remainder;
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

  addBinaryPayload(payload, implicitMultiply = false) {
    if (!implicitMultiply) {
      this._typeAddedCurrentPass = 'BinaryOperator';
      this._maybeImplicitMultiply();
    }
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
    this._remainingFunctionOperands = _numberOfOperands(payload);
  }

  addOpenParens() {
    this._typeAddedCurrentPass = '(';
    this._maybeImplicitMultiply();
    this._operatorPayloads.push('(');
  }

  addCloseSymbol(commaOrCloseParens) {
    this._typeAddedCurrentPass = commaOrCloseParens;
    this._maybeImplicitMultiply();
    const isComma = commaOrCloseParens === ',';
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
      const numberOfOperands = _numberOfOperands(operatorPayload);
      const operands =
        this._operators.splice(-numberOfOperands, numberOfOperands);
      const operatorName = operatorPayload.name;
      assert(
        operands.length === numberOfOperands,
        `Operator ${operatorName} needs ${numberOfOperands} operands`,
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
      const numberOfFunctionOperands = _numberOfOperands(functionPayload);
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
      const numberOfOperands = _numberOfOperands(payload);
      const operands = this._operators.splice(
        -numberOfOperands,
        numberOfOperands,
      );
      assert.equal(operands.length, numberOfOperands);
      this._operators.push(
        payload.type === 'BinaryOperator'
          ? new BinaryOperator(payload, operands)
          : new FunctionOperator(payload, operands),
      );
    }
    assert(this._operators.length === 1, 'Invalid equation');
    return this._operators[0];
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
      this.addBinaryPayload(CoreOperators.Binary.prod, true);
    }
  }

  _addOperator(operator) {
    this._operators.push(operator);
    this._addedOperatorCurrentPass = true;
  }

}

function _numberOfOperands(payload) {
  return payload.type === 'BinaryOperator' ? 2 : payload.numberOfOperands;
}
