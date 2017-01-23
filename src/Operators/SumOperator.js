
import BinaryOperator from './BinaryOperator';

export default class SumOperator extends BinaryOperator {

  static getSymbol() { return '+'; }

  static getName() { return 'Sum'; }

  static getPrecedence() { return 'LOW'; }

}
