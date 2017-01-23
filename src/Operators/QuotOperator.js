
import BinaryOperator from './BinaryOperator';

export default class QuotOperator extends BinaryOperator {

  static getSymbol() { return '/'; }

  static getName() { return 'Quot'; }

  static getPrecedence() { return 'MEDIUM'; }

}
