
import BinaryOperator from './BinaryOperator';

export default class ProdOperator extends BinaryOperator {

  static getSymbol() { return '*'; }

  static getName() { return 'Prod'; }

  static getPrecedence() { return 'MEDIUM'; }

}
