
export default class FunctionOperator {

  static getType() { return 'FunctionOperator'; }

  static getNumberOfOperands(payload) {
    assert.ok(payload.type === 'FunctionOperator');
    return payload.numberOfOperands;
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
