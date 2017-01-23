
import CosinOperator from './CosinOperator';
import DiffOperator from './DiffOperator';
import ExpOperator from './ExpOperator';
import LogOperator from './LogOperator';
import PowOperator from './PowOperator';
import ProdOperator from './ProdOperator';
import QuotOperator from './QuotOperator';
import SinOperator from './SinOperator';
import SumOperator from './SumOperator';
import TanOperator from './TanOperator';

export default {

  Binary: [
    DiffOperator,
    ExpOperator,
    ProdOperator,
    QuotOperator,
    SumOperator,
  ],

  Function: [
    CosinOperator,
    LogOperator,
    PowOperator,
    SinOperator,
    TanOperator,
  ],

  PrecedingUnary: [],

};
