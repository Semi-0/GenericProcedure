# Generic Procedure

## Overview

This project provides a flexible and powerful framework for defining and handling generic procedures. It allows you to create procedures with multiple handlers that can be dynamically selected based on predicates. The framework supports various built-in generics, predicates, and combinators to facilitate complex operations.

## Origins

This library is a TypeScript reimplementation of generic procedure framework 
originally developed by Chris Hanson and Gerald Jay
Sussman as part of the SDF system accompanying the book
*Software Design for Flexibility*.

The original implementation is written in MIT/GNU Scheme and released
under the GNU General Public License v3 or later.

This implementation is not a line-by-line translation. It adapts the
core ideas to a modern TypeScript runtime and introduces architectural
changes appropriate to a push-based and distributed execution model.

## Features

- **Generic Procedures**: Define procedures with multiple handlers.
- **Predicates**: Register and use predicates to determine which handler to execute.
- **Combinators**: Combine functions and predicates in various ways.
- **Better Set**: A more flexible and powerful set implementation.
- **Advice and Wrappers**: Modify function inputs and outputs dynamically.

## Installation

To install the dependencies, run:
bash
npm install


## Usage

### Defining a Generic Procedure

To define a generic procedure, use the `construct_simple_generic_procedure` function:


```typescript
import { construct_simple_generic_procedure } from './GenericProcedure';
const myProcedure = construct_simple_generic_procedure("myProcedure", 2, (a, b) => a + b)
```


### Registering Predicates

Before using predicates in your generic procedures, you need to register them:


```typescript
import { register_predicate } from './Predicates';
const isString = register_predicate('isString', (arg) => typeof arg === 'string');
```


### Defining a Generic Procedure Handler

To define a handler for a generic procedure, use the `define_generic_procedure_handler` function. **Note**: You must register the predicate first.

```typescript
import { define_generic_procedure_handler } from './GenericProcedure';
import { match_args } from './Predicates';
define_generic_procedure_handler(myProcedure, match_args(isString, isString), (a, b) => [a, b]);
```

### Using Predicates in Generic Procedures

You can now use the predicates in your generic procedures:


```typescript
const result = myProcedure("hello", "world"); // result is ["hello", "world"]
```