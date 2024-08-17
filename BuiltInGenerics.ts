import { isNumber } from "fp-ts/lib/number"
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "./GenericProcedure"
import { all_match, match_args } from "./Predicates"
import { isString } from "fp-ts/lib/string"
import { isBoolean } from "fp-ts/lib/boolean"

// helper functions 

export const isArray = (a: any): a is any[] => {
    return Array.isArray(a)
} 

export const isObject = (a: any): a is object => {
    return typeof a === "object" && a !== null
}

export const isAtom = (a: any): a is string | number | boolean => {
  if (isString(a) || isNumber(a) || isBoolean(a) || (isObject(a) && !isArray(a))) {
    return true
  }
  return false
}

export const isNull = (a: any): a is null => {
    return a === null || a === undefined
}

/// basic arithmetic operations

export const add = construct_simple_generic_procedure(
    "add",
    2,
    (a: number, b: number) => {
        if (typeof a !== "number" || typeof b !== "number") {
            throw new Error("default generic add: expected two numbers, but got " + typeof a + " and " + typeof b)
        }
        return a + b
    }
)

define_generic_procedure_handler(add, all_match(Array.isArray), (a: any[], b: any[]) => {
    return [...a, ...b]
})

define_generic_procedure_handler(add, match_args(Array.isArray, isAtom), (a: any[], b: string) => {
    return [...a, b]
}) 


export const multiply = construct_simple_generic_procedure(
    "multiply",
    2,
    (a: number, b: number) => {
        if (typeof a !== "number" || typeof b !== "number") {
            throw new Error("default generic multiply: expected two numbers, but got " + typeof a + " and " + typeof b)
        }
        return a * b
    }
)

export const divide = construct_simple_generic_procedure(
    "divide",
    2,
    (a: number, b: number) => {
        if (typeof a !== "number" || typeof b !== "number") {
            throw new Error("default generic divide: expected two numbers, but got " + typeof a + " and " + typeof b)
        }
        return a / b
    }
)

export const subtract = construct_simple_generic_procedure(
    "subtract",
    2,
    (a: number, b: number) => {
        if (typeof a !== "number" || typeof b !== "number") {
            throw new Error("default generic subtract: expected two numbers, but got " + typeof a + " and " + typeof b)
        }
        return a - b
    }
)

define_generic_procedure_handler(subtract,
    match_args(isArray, isAtom), 
    (a: any[], b: any) => {
        return a.filter((x) => x !== b)
    }
)

define_generic_procedure_handler(subtract, match_args(isArray, isArray), (a: any[], b: any[]) => {
    return a.filter((x) => !b.includes(x))
}) 


// conversions

export const to_string = construct_simple_generic_procedure(
    "to_string",
    1,
    (a: string) => {
        if (typeof a !== "string") {
            throw new Error("default generic to_string: expected a string, but got " + typeof a)
        }
        return a
    }
)

define_generic_procedure_handler(to_string, match_args(isNull), (a: null | undefined) => {
    if (a === null){
        return "null"
    }
    else {
        return "undefined"
    }
})

define_generic_procedure_handler(to_string, match_args(isBoolean), (a: boolean) => {
    return a.toString()
})

define_generic_procedure_handler(to_string, match_args(isNumber), (a: number) => {
    return a.toString()
})

define_generic_procedure_handler(to_string, match_args(isArray), (a: any[]) => {
    return "[" + a.map((x) => to_string(x)).join(", ") + "]"
})

define_generic_procedure_handler(to_string, match_args(isObject), (a: object) => {
    return JSON.stringify(a)
})
