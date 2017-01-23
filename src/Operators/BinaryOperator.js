
export default class BinaryOperator {

  static getType() { return 'BinaryOperator'; }
  static getPrecedence() {
    throw Error('BinaryOperator getPrecedence must be overridden');
  }

  static getName() {
    throw Error('BinaryOperator getName must be overridden');
  }

  static getSymbol() {
    throw Error('BinaryOperator getSymbol must be overridden');
  }

  static claimToken(text) {
    const symbol = this.getSymbol();
    if (text.startsWith(symbol)) {
      return {claim: symbol, remainder: text.slice(symbol.length)};
    }
    return {claim: '', remainder: text};
  }

  static getNumberOfOperands() {
    return 2;
  }

  constructor(operands) {
    const [left, right] = operands
    this._left = left;
    this._right = right;
  }

  toJSON() {
    return {
      type: this.constructor.getType(),
      name: this.constructor.getName(),
      left: this._left.toJSON(),
      right: this._right.toJSON(),
    };
  }

}
