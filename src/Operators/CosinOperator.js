
import FunctionOperator from './FunctionOperator';

export default class CosinOperator extends FunctionOperator {

  static getSymbol() { return 'cosin'; }

  static getNumberOfOperands() { return 1; }

  static getName() { return 'Cosine'; }
}
