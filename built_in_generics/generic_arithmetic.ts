import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { all_match, match_args, one_of_args_match } from "../Predicates"
import {  is_array, is_atom, is_null, is_number, is_string, is_object } from "./generic_predicates"

import { guard } from "./other_generic_helper"
import { compose, orCompose } from "./generic_combinator"


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





export const is_equal = construct_simple_generic_procedure(
    "is_equal",
    2,
    (a: any, b: any) => {
        return a === b
    }
)

define_generic_procedure_handler(is_equal,
    all_match(is_array),
    (a: any[], b: any[]) => {
        return a.length === b.length && a.every((x, i) => is_equal(x, b[i]))
    }
)

define_generic_procedure_handler(is_equal,
    all_match(is_object),
    (a: any, b: any) => {
        // Special handling for ErrorPair objects
        if (a.identifier === "error_pair" && b.identifier === "error_pair") {
            return is_equal(a.get_error(), b.get_error()) && is_equal(a.get_value(), b.get_value())
        }
        
        // General object equality
        const aKeys = Object.keys(a).sort()
        const bKeys = Object.keys(b).sort()
        
        if (aKeys.length !== bKeys.length) return false
        
        // Check if key arrays match
        for (let i = 0; i < aKeys.length; i++) {
            if (aKeys[i] !== bKeys[i]) return false
        }
        
        // Check if all values are equal, skipping functions
        for (const key of aKeys) {
            if (typeof a[key] === 'function' && typeof b[key] === 'function') {
                // Skip function properties
                continue
            }
            if (!is_equal(a[key], b[key])) return false
        }
        
        return true
    }
)

export const greater_than = construct_simple_generic_procedure(
    "greater_than",
    2,
    (a: number, b: number) => {
        return a > b
    }
)

define_generic_procedure_handler(greater_than,  all_match(is_array), (a: any[], b: any[]) => {
    return a.length > b.length
}) 

export const less_than = construct_simple_generic_procedure(
    "less_than",
    2,
    (a: number, b: number) => {
        return a < b
    }
) 

define_generic_procedure_handler(less_than, all_match(is_array), (a: any[], b: any[]) => {
    return a.length < b.length
})


export const greater_than_or_equal = orCompose(greater_than, is_equal)

export const less_than_or_equal = orCompose(less_than, is_equal)


