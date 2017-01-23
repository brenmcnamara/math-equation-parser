
export default class FunctionOperator {

  static getType() { return 'FunctionOperator'; }

  static claimToken(text) {
    const symbol = this.getSymbol();
    if (text.startsWith(symbol)) {
      return {claim: symbol, remainder: text.slice(symbol.length)};
    }
    return {claim: '', remainder: text};
  }

  static getSymbol() {
    throw Error('FunctionOperator subclass must override getSymbol');
  }

  static getNumberOfOperands() {
    throw Error('FunctionOperator subclass must override getNumberOfOperands');
  }

  static getName() {
    throw Error('FunctionOperator subclass must override getName');
  }

  constructor(params) {
    this._params = params;
  }

  toJSON() {
    return {
      type: this.constructor.getType(),
      name: this.constructor.getName(),
      params: this._params.map(p => p.toJSON()),
    };
  }

}
