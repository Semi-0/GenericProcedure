import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { match_args } from "../Predicates"
import { isBoolean, isNull, isNumber, isObject } from "./generic_predicates"
import { isArray } from "./generic_array"

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


// to_number

export const to_number = construct_simple_generic_procedure(
    "to_number",
    1,
    (a: string) => {
        if (typeof a !== "string") {
            throw new Error("default generic to_number: expected a string, but got " + typeof a)
        }
        return Number(a)
    }
)

// to_boolean

export const to_boolean = construct_simple_generic_procedure(
    "to_boolean",
    1,
    (a: string) => {
        if (typeof a !== "string") {
            throw new Error("default generic to_boolean: expected a string, but got " + typeof a)
        }
        return Boolean(a)
    }
)