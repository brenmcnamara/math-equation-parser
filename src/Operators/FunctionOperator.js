
export default class FunctionOperator {

  static getType() { return 'FunctionOperator'; }

  static claimToken(payload, text) {
    const symbol = payload.symbol;
    if (text.startsWith(symbol)) {
      return {claim: symbol, remainder: text.slice(symbol.length)};
    }
    return {claim: '', remainder: text};
  }

  constructor(payload, params) {
    this._params = params;
    this._payload = payload;
  }

  toJSON() {
    return {
      type: this._payload.type,
      name: this._payload.name,
      params: this._params.map(p => p.toJSON()),
    };
  }

}
