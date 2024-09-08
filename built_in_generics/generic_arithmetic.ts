import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { all_match, match_args, one_of_args_match } from "../Predicates"
import {  is_array, is_atom, is_null, is_number, is_string } from "./generic_predicates"

import { guard } from "./other_generic_helper"
import { add_item, BetterSet, difference_set, is_better_set, merge_set, remove_item } from "./generic_better_set"
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

define_generic_procedure_handler(greater_than, all_match(is_better_set), (a: BetterSet<any>, b: BetterSet<any>) => {
    return b.is_subset_of(a)
})

export const less_than = construct_simple_generic_procedure(
    "less_than",
    2,
    (a: number, b: number) => {
        return a < b
    }
) 

define_generic_procedure_handler(less_than, all_match(is_better_set), (a: BetterSet<any>, b: BetterSet<any>) => {
    return a.is_subset_of(b)
}) 

define_generic_procedure_handler(less_than, all_match(is_array), (a: any[], b: any[]) => {
    return a.length < b.length
})


export const greater_than_or_equal = orCompose(greater_than, is_equal)

export const less_than_or_equal = orCompose(less_than, is_equal)


