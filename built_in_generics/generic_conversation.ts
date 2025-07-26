import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { match_args } from "../Predicates"
import { is_boolean, is_null, is_number,  is_object, is_array } from "./generic_predicates"

export const to_string = construct_simple_generic_procedure(
    "to_string",
    1,
    (a: string) => {
        if (typeof a !== "string") {
            try{
                return JSON.stringify(a)
            }
            catch(e){
                throw new Error("default generic to_string: expected a string, but got " + typeof a + " " + e)
            }
        }
        return a
    }
)

define_generic_procedure_handler(to_string, match_args(is_null), (a: null | undefined) => {
    if (a === null){
        return "null"
    }
    else {
        return "undefined"
    }
})

define_generic_procedure_handler(to_string, match_args(is_boolean), (a: boolean) => {
    return a.toString()
})

define_generic_procedure_handler(to_string, match_args(is_number), (a: number) => {
    return a.toString()
})

define_generic_procedure_handler(to_string, match_args(is_array), (a: any[]) => {
    return "[" + a.map((x) => to_string(x)).join(", ") + "]"
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