
import FunctionOperator from './FunctionOperator';

export default class SinOperator extends FunctionOperator {

  static getSymbol() { return 'sin'; }

  static getNumberOfOperands() { return 1; }

  static getName() { return 'Sine' }

}
