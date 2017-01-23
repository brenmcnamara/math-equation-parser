
import FunctionOperator from './FunctionOperator';

export default class PowOperator extends FunctionOperator {

  static getSymbol() { return 'pow'; }

  static getName() { return 'Pow'; }

  static getNumberOfOperands() { return 2; }

}
