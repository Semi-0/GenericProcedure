import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { all_match, match_args, one_of_args_match } from "../Predicates"
import {  isAtom, isNull, isNumber, isString } from "./generic_predicates"
import { isArray, filter, map, reduce } from "./generic_array"
import { guard } from "./other_generic_helper"
import { add_item, BetterSet, difference_set, is_better_set, merge_set, remove_item } from "./generic_better_set"


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

define_generic_procedure_handler(add, all_match(isArray), (a: any[], b: any[]) => {
    return [...a, ...b]
})

define_generic_procedure_handler(add, match_args(isArray, isAtom), (a: any[], b: string) => {
    return [...a, b]
}) 


define_generic_procedure_handler(add, match_args(is_better_set, is_better_set), (a: BetterSet<any>, b: BetterSet<any>) => {
    return merge_set(a, b)
})

define_generic_procedure_handler(add, match_args(is_better_set, isAtom), (a: BetterSet<any>, b: any) => {
    return add_item(a, b)
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
        return filter(a, (x) => x !== b)
    }
)

define_generic_procedure_handler(subtract, match_args(isArray, isArray), (a: any[], b: any[]) => {
    return a.filter((x) => !b.includes(x))
}) 


define_generic_procedure_handler(subtract, match_args(is_better_set, is_better_set), (a: BetterSet<any>, b: BetterSet<any>) => {
    return difference_set(a, b)
})

define_generic_procedure_handler(subtract, match_args(is_better_set, isAtom), (a: BetterSet<any>, b: any) => {
    return remove_item(a, b)
})



export const is_equal = construct_simple_generic_procedure(
    "is_equal",
    2,
    (a: any, b: any) => {
        return a === b
    }
)

define_generic_procedure_handler(is_equal,
    all_match(isArray),
    (a: any[], b: any[]) => {
        return a.length === b.length && a.every((x, i) => is_equal(x, b[i]))
    }
)