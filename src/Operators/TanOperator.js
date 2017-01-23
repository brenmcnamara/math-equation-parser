
import FunctionOperator from './FunctionOperator';

export default class TanOperator extends FunctionOperator {

  static getSymbol() { return 'tan'; }

  static getNumberOfOperands() { return 1; }

  static getName() { return 'Tangent'; }
}
