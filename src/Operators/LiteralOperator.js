
const NumberRegExp = /(^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/;

export default class LiteralOperator {

  static getType() { return 'Literal'; }
  static claimToken(text) {
    // Test for some valid number.
    const match = text.match(NumberRegExp);
    if (!match) { return {claim: '', remainder: text}; }
    return {claim: match[0], remainder: text.slice(match[0].length)};
  }

  constructor(value) {
    this._value = value;
  }

  toJSON() {
    return {
      type: this.constructor.getType(),
      name: this.constructor.getType(),
      value: this._value,
    };
  }

  toString() { return `[Literal ${this._value}]`; }

  toSource() { return this.toString(); }
}
