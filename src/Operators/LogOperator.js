
import FunctionOperator from './FunctionOperator';

export default class LogOperator extends FunctionOperator {

  static getSymbol() { return 'log'; }

  static getNumberOfOperands() { return 1; }

  static getName() { return 'Log'; }

}
