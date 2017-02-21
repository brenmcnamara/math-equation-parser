
export default class SymbolOperator {

  static getType() { return 'Symbol'; }

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
