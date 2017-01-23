
import CoreOperators from './Operators/CoreOperators';
import LiteralOperator from './Operators/LiteralOperator';
import SymbolOperator from './Operators/SymbolOperator';

import assert from 'assert';

const PrecedenceMap = {
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
};

export default class Parser {

  static parse(text) {
    // TODO: Memoize!
    return (new Parser()).parse(text);
  }

  constructor() {
    this._binaryOperators = CoreOperators.Binary.slice();
    this._functionOperators = CoreOperators.Function.slice();
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
    // If we are processing a function, then we need to count the number
    // of operands we are expecting for that function.
    let remainingFunctionOperands = 0;
    const operatorStack = [];
    const resolvedOperators = [];
    while (textToProcess.length) {
      // Check if we found a number literal.
      const literalClaimObj = LiteralOperator.claimToken(textToProcess);
      if (literalClaimObj.claim.length > 0) {
        const value = parseFloat(literalClaimObj.claim, 10);
        resolvedOperators.push(new LiteralOperator(value));
        textToProcess = literalClaimObj.remainder;
        continue;
      }

      // Check if this is begin parenthesis.
      if (textToProcess.charAt(0) === '(') {
        textToProcess = textToProcess.slice(1);
        operatorStack.push('(');
        continue;
      }


      // Check if this is a end parenthesis or comma
      if (textToProcess.charAt(0) === ')' || textToProcess.charAt(0) === ',') {
        const closeSymbol = textToProcess.charAt(0);
        assert(
          closeSymbol === ')' || remainingFunctionOperands > 0,
          'Unexpected token: ,',
        );
        if (closeSymbol === ',') {
          --remainingFunctionOperands;
        }
        textToProcess = textToProcess.slice(1);
        // Continuously pop operators.
        let TopOperator = operatorStack.pop();
        while (
          TopOperator &&
          TopOperator !== '(' &&
          TopOperator !== 'StartOfFunction'
        ) {
          const numberOfOperands = TopOperator.getNumberOfOperands();
          const operands = resolvedOperators.slice(-numberOfOperands);
          const topOperatorName = TopOperator.getName();
          assert(
            operands.length === numberOfOperands,
            `Operator ${topOperatorName} needs ${numberOfOperands} params`,
          );
          resolvedOperators.splice(-numberOfOperands, numberOfOperands);
          resolvedOperators.push(new TopOperator(operands));
          TopOperator = operatorStack.pop();
        }
        if (TopOperator === 'StartOfFunction' && closeSymbol === ')') {
          // We processed everything from the start to the end of the function,
          // need to finish off processing this function call.

          // We encountered 1 more operand in this pass of textToProcess.
          --remainingFunctionOperands;

          // StartOfFunction is always preceded by its FunctionOperator
          const FunctionOperator = operatorStack.pop();
          const numberOfFunctionOperands =
            FunctionOperator.getNumberOfOperands();
          assert(
            FunctionOperator.getType() === 'FunctionOperator',
            'Corrupt State: Expected FunctionOperator',
          );
          const functionName = FunctionOperator.getName();
          assert(
            remainingFunctionOperands === 0,
            `${functionName}: Needs ${numberOfFunctionOperands} operand(s)`,
          );
          // Apply the function to all the resolved operators.
          const operands = resolvedOperators.splice(
            -numberOfFunctionOperands,
            numberOfFunctionOperands,
          );
          assert(
            operands.length === numberOfFunctionOperands,
            'Corrupt state: Not enough elements in resolvedOperators',
          )
          resolvedOperators.push(new FunctionOperator(operands));
        }
        continue;
      }

      // Check if this is a binary operator.
      let isBinaryOperator = false;
      for (let Operator of this._binaryOperators) {
        const claimObj = Operator.claimToken(textToProcess);
        if (claimObj.claim.length > 0) {
          isBinaryOperator = true;
          const OperatorPrecedence = PrecedenceMap[Operator.getPrecedence()];
          let LastOperator = operatorStack[operatorStack.length - 1];
          while (
            LastOperator &&
            LastOperator !== '(' &&
            PrecedenceMap[LastOperator.getPrecedence()] > OperatorPrecedence
          ) {
            assert(
              resolvedOperators.length >= 2,
              'Binary Operator must have 2 operands',
            );
            operatorStack.pop();
            const rightOperand = resolvedOperators.pop();
            const leftOperand = resolvedOperators.pop();
            const operator = new LastOperator([leftOperand, rightOperand]);
            resolvedOperators.push(operator);
            LastOperator = operatorStack[operatorStack.length - 1];
          }
          operatorStack.push(Operator);
          textToProcess = claimObj.remainder;
          if (isBinaryOperator) { break; } // Out of looping operators
        }
      }
      if (isBinaryOperator) { continue; }

      // Check if this is a function operator
      let isFunctionOperator = false;
      for (let Operator of this._functionOperators) {
        const claimObj = Operator.claimToken(textToProcess);
        if (claimObj.claim.length > 0) {
          operatorStack.push(Operator);
          // Function has parameters with comma delimiter.
          textToProcess = claimObj.remainder;
          assert(
            textToProcess.charAt(0) === '(',
            'The function operator should start with (',
          );
          textToProcess = textToProcess.slice(1);
          operatorStack.push('StartOfFunction');
          isFunctionOperator = true;
          remainingFunctionOperands = Operator.getNumberOfOperands();
          break;
        }
      }
      if (isFunctionOperator) { continue; }

      // Check if this is a symbol.
      const symbolClaimObj = SymbolOperator.claimToken(textToProcess);
      if (symbolClaimObj.claim.length > 0) {
        resolvedOperators.push(new SymbolOperator(symbolClaimObj.claim));
        textToProcess = symbolClaimObj.remainder;
        continue;
      }

      assert(false, `Unexpected token: "${textToProcess.charAt(0)}"`);

    }
    // Looped through all the text, pop and resolve any operators still
    // on the stack.
    while (operatorStack.length) {
      const Operator = operatorStack.pop();
      const numberOfOperands = Operator.getNumberOfOperands();
      const operands = resolvedOperators.slice(-numberOfOperands);
      resolvedOperators.splice(-numberOfOperands, numberOfOperands);
      resolvedOperators.push(new Operator(operands));
    }
    assert(resolvedOperators.length === 1, `Invalid equation: ${text}`);
    return resolvedOperators[0];
  }

}
