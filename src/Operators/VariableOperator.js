
export default class VariableOperator {

  static getType() { return 'Variable'; }

  constructor(variable) {
    this._variable = variable;
  }

  toJSON() {
    return {
      type: this.constructor.getType(),
      name: this.constructor.getType(),
      variable: this._variable,
    };
  }

}
