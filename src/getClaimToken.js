
const NumberRegExp = /(^[0-9]*\.?[0-9]+([eE][-+]?[0-9]+)?)/;

export default function getClaimToken(payload, text) {

  switch (payload.type) {

    case 'Literal': {
      const match = text.match(NumberRegExp);
      if (!match) {
        return { claim: '', remainder: text };
      }
      return { claim: match[0], remainder: text.slice(match[0].length) };
    }

    case 'Symbol': {
      if (!(/^[a-zA-Z]/.test(text))) {
        return { claim: '', remainder: text };
      }
      const { validSymbols } = payload;
      if (validSymbols && validSymbols.indexOf(text.charAt(0)) < 0) {
        return { claim: '', remainder: text };
      }
      return { claim: text.charAt(0), remainder: text.slice(1) };
    }

    case 'BinaryOperator': {
      const { symbol } = payload;
      if (text.startsWith(symbol)) {
        return {claim: symbol, remainder: text.slice(symbol.length)};
      }
      return {claim: '', remainder: text};
    }

    case 'FunctionOperator': {
      const { symbol } = payload;
      if (text.startsWith(symbol)) {
        return {claim: symbol, remainder: text.slice(symbol.length)};
      }
      return {claim: '', remainder: text};
    }

    default:
      throw Error(`Unrecognized payload ${payload.type}`);
  }

}
