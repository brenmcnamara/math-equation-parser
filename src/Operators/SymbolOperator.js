
export default class SymbolOperator {

  static getType() { return 'Symbol'; }

  static claimToken(text) {
    if (/^[a-zA-Z]/.test(text)) {
      return {claim: text.charAt(0), remainder: text.slice(1)};
    }
    return {claim: '', remainder: text};
  }

  constructor(symbol) {
    this._symbol = symbol;
  }

  toJSON() {
    return {
      type: this.constructor.getType(),
      name: this.constructor.getType(),
      symbol: this._symbol,
    };
  }

}
