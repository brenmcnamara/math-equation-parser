
import BinaryOperator from './BinaryOperator';

export default class ExpOperator extends BinaryOperator {

  static getSymbol() { return '^'; }

  static getName() { return 'Exp'; }

  static getPrecedence() { return 'HIGH'; }

}
