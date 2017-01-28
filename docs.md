# API Documentation

### class MathEquationParser

#### *static* parse(text: string): SyntaxTree

- Take some equation literal (aka "1 + 2", "x * 7 + 3") and get back a syntax
  tree for that literal
- This will throw an error if the equation literal provided is not a valid
  equation
- This does the same thing as the instance method *parse*, except this will use
  the default configuration. For custom configurations and custom operators,
  you need to create an instance of the parser.

*Example*

```
import Parser from 'math-equation-parser';

console.log(Parser.parse('1 + 2'));
```

*Output*

```
{
  "type": "BinaryOperator",
  "name": "Sum",
  "left": {
    "type": "Literal",
    "name": "Literal",
    "value": 1
  },
  "right": {
    "type": "Literal",
    "name": "Literal",
    "value": 2
  }
}
```

#### constructor(config: ParserConfig = DefaultConfig): MathEquationParser
- If you want to customize the behavior of your parser, provide a config object.
  If you use the static "parse" method, you will get the default behavior.
- *Parser Config*
  - **isLeftAssociative**: *(default = true)* True if binary operations should
    be left false is it is right associative
  - **validSymbols**: *(default = null)* An optional array of acceptable symbols
    *(aka ['x', 'y'])*. If this is set to null, then all symbols are accepted as
    valid
  - **implicitMultiply**: *(default = true)* True if implicit multiplication is
    allowed *(aka 4x)*, false otherwise.


#### parse(text: string): SyntaxTree
- Take some equation literal (aka "1 + 2", "x * 7 + 3") and get back a syntax
  tree for that literal
- This will throw an error if the equation literal provided is not a valid
  equation

*Example*

```
import Parser from 'math-equation-parser';

const parser = new Parser({ isLeftAssociative: false });
console.log(parser.parse('1 - 2 - 3'));

```

*Output*

```
{
  "type": "BinaryOperator",
  "name": "Diff",
  "left": {
    "type": "Literal",
    "name": "Diff",
    "value": 1
  },
  "right": {
    "type": "BinaryOperator",
    "name": "Diff",
    "left": {
      "type": "Literal",
      "name": "Literal",
      "value": 2
    },
    "right": {
      "type": "Literal",
      "name": "Literal",
      "value": 3
    }
  }
}
```
