# Math Equation Parser

A library for parsing math equations in Javascript.

## Features

- Custom Binary Operators
- Custom Function Operators
- Implicit Multiplication
- Math Symbols ('x', 'y', etc...)
- Configure for Left and Right Associativity

## Basic Usage

##### ES6 Imports

```
import Parser from 'math-equation-parser';

console.log(Parser.parse('1 + 2'));
```

##### Common JS
```
const Parser = require('math-equation-parser');

console.log(Parser.parse('1 + 2'));
```

##### Printed Value

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
