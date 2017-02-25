# Math Equation Parser

A library for parsing math equations in Javascript.

## Setup Environment

- Download [node js](https://nodejs.org/en/download/)
- Download [yarn package manager](https://yarnpkg.com/en/)
- Clone the repo
- Run the following command: `yarn`
- To rebuild the source code, run `npm run build`
- To run the unit tests, run `npm run test`
  - `npm run test-watch` to reload unit tests on file changes


## Features

- Custom Binary Operators
- Custom Function Operators
- Custom Unary Operators
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

## Contributing to Project

Please do the following with any pull request:
- Run the unit tests: `npm run test`
- Rebuild the code `npm run build`
- Add unit tests for any features you added
- Thanks in advance for contributing!
