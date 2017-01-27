
import CoreOperators from './Operators/CoreOperators';
import LiteralOperator from './Operators/LiteralOperator';
import ProdOperator from './Operators/ProdOperator';
import SymbolOperator from './Operators/SymbolOperator';

import assert from 'assert';

const PrecedenceMap = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

const DefaultConfig = {
  // An array of symbols that are valid. If this is null, all symbols are valid.
  validSymbols: null,
  // Whether or not to allow implicit multiplication
  implicitMultiply: true,
};

export default class Parser {

  static parse(text) {
    // TODO: Memoize!
    return (new Parser()).parse(text);
  }

  constructor(config = DefaultConfig) {
    this._binaryOperators = CoreOperators.Binary.slice();
    this._functionOperators = CoreOperators.Function.slice();
    this._config = Object.assign({}, DefaultConfig, config);
  }

  addBinaryOperator(Operator) {
    this._binaryOperators.push(Operator);
    return this;
  }

  addFunctionOperator(Operator) {
    this._functionOperators.push(Operator);
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
      for (let Operator of this._binaryOperators) {
        const claimObj = Operator.claimToken(textToProcess);
        if (claimObj.claim.length > 0) {
          isBinaryOperator = true;
          processor.addBinaryOperatorCtor(Operator);
          textToProcess = claimObj.remainder;
          break;
        }
      }
      if (isBinaryOperator) { continue; }

      // Check if this is a function operator
      let isFunctionOperator = false;
      for (let Operator of this._functionOperators) {
        const claimObj = Operator.claimToken(textToProcess);
        if (claimObj.claim.length > 0) {
          isFunctionOperator = true;
          processor.addFunctionOperatorCtor(Operator);
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
    this._operatorCtors = [];
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

  addBinaryOperatorCtor(operatorCtor, implicitMultiply = false) {
    if (!implicitMultiply) {
      this._typeAddedCurrentPass = 'BinaryOperator';
      this._maybeImplicitMultiply();
    }
    const precedence = PrecedenceMap[operatorCtor.getPrecedence()];
    let lastOperatorCtor = this._operatorCtors[this._operatorCtors.length - 1];
    while (
      lastOperatorCtor &&
      lastOperatorCtor !== '(' &&
      lastOperatorCtor !== 'StartOfFunction' &&
      PrecedenceMap[lastOperatorCtor.getPrecedence()] > precedence
    ) {
      assert(this._operators.length >= 2, 'Invalid equation');
      this._operatorCtors.pop();
      const operands = this._operators.splice(-2, 2);
      const operator = new lastOperatorCtor(operands);
      this._operators.push(operator);
      lastOperatorCtor = this._operatorCtors[this._operatorCtors.length - 1];
    }
    this._operatorCtors.push(operatorCtor);
  }

  addFunctionOperatorCtor(operatorCtor) {
    this._typeAddedCurrentPass = 'FunctionOperator';
    this._maybeImplicitMultiply();
    this._operatorCtors.push(operatorCtor, 'StartOfFunction');
    this._remainingFunctionOperands = operatorCtor.getNumberOfOperands();
  }

  addOpenParens() {
    this._typeAddedCurrentPass = '(';
    this._maybeImplicitMultiply();
    this._operatorCtors.push('(');
  }

  addCloseSymbol(commaOrCloseParens) {
    this._typeAddedCurrentPass = commaOrCloseParens;
    this._maybeImplicitMultiply();
    const isComma = commaOrCloseParens === ',';
    if (isComma) {
      this._remainingFunctionOperands -= 1;
    }
    // Continuously pop until reaching the corresponding parenthesis.
    let operatorCtor = this._operatorCtors.pop();
    while (
      operatorCtor &&
      operatorCtor !== '(' &&
      operatorCtor !== 'StartOfFunction'
    ) {
      const numberOfOperands = operatorCtor.getNumberOfOperands();
      const operands =
        this._operators.splice(-numberOfOperands, numberOfOperands);
      const operatorName = operatorCtor.getName();
      assert(
        operands.length === numberOfOperands,
        `Operator ${operatorName} needs ${numberOfOperands} operands`,
      );
      this._operators.push(new operatorCtor(operands));
      this._addedOperatorCurrentPass = true;
      operatorCtor = this._operatorCtors.pop();
    }
    if (operatorCtor === 'StartOfFunction' && !isComma) {
      // We processed everything from the start to the end of the function,
      // need to finish off processing this function call.

      // We encountered 1 more operand in this pass of textToProcess.
      this._remainingFunctionOperands -= 1;

      // StartOfFunction is always preceded by its FunctionOperator
      const functionOperatorCtor = this._operatorCtors.pop();
      const numberOfFunctionOperands =
        functionOperatorCtor.getNumberOfOperands();
      assert(
        functionOperatorCtor.getType() === 'FunctionOperator',
        'Corrupt State: Expected Function Operator',
      );
      const operands = this._operators.splice(
        -numberOfFunctionOperands,
        numberOfFunctionOperands,
      );
      assert(
        operands.length === numberOfFunctionOperands,
        'Corrupt state: Not enough elements in resolvedOperators',
      );
      this._operators.push(new functionOperatorCtor(operands));
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
    while (this._operatorCtors.length > 0) {
      const operatorCtor = this._operatorCtors.pop();
      assert(
        operatorCtor !== '(' && operatorCtor !== 'StartOfFunction',
        'Invalid equation',
      );
      const numberOfOperands = operatorCtor.getNumberOfOperands();
      const operands = this._operators.splice(
        -numberOfOperands,
        numberOfOperands,
      );
      assert(operands.length === numberOfOperands, 'Invalid equation');
      this._operators.push(new operatorCtor(operands));
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
      this.addBinaryOperatorCtor(ProdOperator, true);
    }
  }

  _addOperator(operator) {
    this._operators.push(operator);
    this._addedOperatorCurrentPass = true;
  }

}
