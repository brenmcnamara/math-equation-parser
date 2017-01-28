
export default class BinaryOperator {

  static claimToken(payload, text) {
    const symbol = payload.symbol;
    if (text.startsWith(symbol)) {
      return {claim: symbol, remainder: text.slice(symbol.length)};
    }
    return {claim: '', remainder: text};
  }

  static getType() { return 'BinaryOperator'; }

  static getNumberOfOperands() { return 2; }

  constructor(payload, operands) {
    const [left, right] = operands
    this._left = left;
    this._right = right;
    this._payload = payload;
  }

  toJSON() {
    return {
      type: this._payload.type,
      name: this._payload.name,
      left: this._left.toJSON(),
      right: this._right.toJSON(),
    };
  }

}
