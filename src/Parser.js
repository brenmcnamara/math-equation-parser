
import CoreOperators from './CoreOperators';

import assert from 'assert';
import createOperator from './createOperator';
import getClaimToken from './getClaimToken';
import getNumberOfParams from './getNumberOfParams';

const PrecedenceMap = {
  LOW: 1,
  NORMAL: 2,
  MEDIUM: 3,
  HIGH: 4,
};

const DefaultConfig = {
  // An array of variables that are valid. If this is null, all variables
  // are valid.
  validVariables: null,
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
    this._unaryPayloads = Object.values(CoreOperators.Unary);
    this._functionPayloads = Object.values(CoreOperators.Function);
    this._config = Object.assign({}, DefaultConfig, config);
  }

  addOperatorPayload(payload) {
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
        throw Error(`Unrecognized operator payload ${payload.type}`);
    }
    return this;
  }

  parse(text) {
    const LiteralPayload = { type: 'Literal' };
    const VariablePayload = {
      type: 'Variable',
      validVariables: this._config.validVariables,
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
        const literal = createOperator(LiteralPayload, [value]);
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
        const closeVariable = textToProcess.charAt(0);
        processor.addCloseVariable(closeVariable);
        textToProcess = textToProcess.slice(1);
        continue;
      }

      // Check if this is a unary operator.
      let isUnaryOperator = false;
      for (let payload of this._unaryPayloads) {
        const claimToken = getClaimToken(payload, textToProcess);
        if (claimToken.claim.length > 0) {
          isUnaryOperator = true;
          processor.addPayload(payload);
          textToProcess = claimToken.remainder;
          break;
        }
      }
      if (isUnaryOperator) { continue; }

      // Check if this is a binary operator.
      let isBinaryOperator = false;
      for (let payload of this._binaryPayloads) {
        const claimToken = getClaimToken(payload, textToProcess);
        if (claimToken.claim.length > 0) {
          isBinaryOperator = true;
          processor.addPayload(payload);
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
          processor.addPayload(payload);
          assert(
            claimToken.remainder.charAt(0) === '(', // Paren after function
            'Invalid Equation',
          );
          textToProcess = claimToken.remainder.slice(1);
          break;
        }
      }
      if (isFunctionOperator) { continue; }

      // Check if this is a variable.
      const variableClaimToken = getClaimToken(VariablePayload, textToProcess);
      if (variableClaimToken.claim.length > 0) {
        const rawVariable = variableClaimToken.claim;
        const variable = createOperator(VariablePayload, [rawVariable]);
        processor.addVariable(variable);
        textToProcess = variableClaimToken.remainder;
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

  addVariable(variable) {
    this._typeAddedCurrentPass = 'Variable';
    this._maybeImplicitMultiply();
    this._addOperator(variable);
  }

  addLiteral(literal) {
    this._typeAddedCurrentPass = 'Literal';
    this._maybeImplicitMultiply();
    this._addOperator(literal);
  }

  addPayload(payload) {
    switch (payload.type) {
      case 'UnaryOperator':
        return this._addUnaryPayload(payload);
      case 'BinaryOperator':
        return this._addBinaryPayload(payload, false);
      case 'FunctionOperator':
        return this._addFunctionPayload(payload);
      default:
        throw Error(`Unrecognized operator payload ${payload.type}`);
    }
  }

  _addUnaryPayload(payload) {
    this._typeAddedCurrentPass = 'UnaryOperator';
    this._maybeImplicitMultiply();
    this._operatorPayloads.push(payload);
  }

  /**
   * Adds a binary payload and optionally add it silently. A payload added
   * silently will not record the current pass as adding a binary operator.
   * This is used to process implicit multiplication correctly.
   */
  _addBinaryPayload(payload, isSilent) {
    if (!isSilent) {
      this._typeAddedCurrentPass = 'BinaryOperator';
    }
    const precedenceValue = getPrecedenceValue(payload);
    let lastPayload = this._operatorPayloads[this._operatorPayloads.length - 1];
    while (
      lastPayload &&
      lastPayload !== '(' &&
      lastPayload !== 'StartOfFunction' &&
      (
        // Left Associative
        (
          this._config.isLeftAssociative &&
          getPrecedenceValue(lastPayload) >= precedenceValue
        ) ||
        // Right Associative
        getPrecedenceValue(lastPayload) > precedenceValue
      )
    ) {
      this._operatorPayloads.pop();
      const numberOfParams = getNumberOfParams(lastPayload);
      const params = this._operators.splice(-numberOfParams, numberOfParams);
      const operator = createOperator(lastPayload, params);
      this._operators.push(operator);
      lastPayload = this._operatorPayloads[this._operatorPayloads.length - 1];
    }
    this._operatorPayloads.push(payload);
  }

  _addFunctionPayload(payload) {
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

  addCloseVariable(commaOrCloseParens) {
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
      const params = this._operators.splice(-numberOfParams, numberOfParams);
      const operatorName = operatorPayload.name;
      assert(
        params.length === numberOfParams,
        `Operator ${operatorName} needs ${numberOfParams} params`,
      );
      this._operators.push(createOperator(operatorPayload, params));
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
      const numberOfFunctionParams = getNumberOfParams(functionPayload);
      assert.equal(functionPayload.type, 'FunctionOperator');
      const params = this._operators.splice(
        -numberOfFunctionParams,
        numberOfFunctionParams,
      );
      assert(
        params.length === numberOfFunctionParams,
        'Corrupt state: Not enough elements in resolvedOperators',
      );
      this._operators.push(createOperator(functionPayload, params));
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
      const params = this._operators.splice(-numberOfParams, numberOfParams);
      assert.equal(params.length, numberOfParams);
      this._operators.push(createOperator(payload, params));
    }
    assert(this._operators.length === 1, 'Invalid equation');
    return this._operators[0];
  }

  _maybeImplicitMultiply() {
    // Check for implicit multiplication.
    const leftTypes = [
      ')',
      'Literal',
      'Variable',
    ];
    const rightTypes = [
      'UnaryOperator',
      'FunctionOperator',
      '(',
      'Literal',
      'Variable',
    ];
    if (
      this._config.implicitMultiply &&
      leftTypes.indexOf(this._typeAddedLastPass) >= 0 &&
      rightTypes.indexOf(this._typeAddedCurrentPass) >= 0
    ) {
      this._addBinaryPayload(CoreOperators.Binary.prod, true);
    }
  }

  _addOperator(operator) {
    this._operators.push(operator);
    this._addedOperatorCurrentPass = true;
  }

}

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
      throw Error(`getPrecedenceValue has unknown payload ${payload.type}`);
  }
}
