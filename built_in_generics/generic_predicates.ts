
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { all_match, match_args } from "../Predicates"
import { is_array } from "./generic_array"
// helper functions 



export const is_string = (a: any): a is string => {
    return typeof a === "string"
}

export const is_object = (a: any): a is object => {
    return typeof a === "object" && a !== null
}

export const is_atom = (a: any): a is string | number | boolean => {
  if (is_string(a) || is_number(a) || is_boolean(a) || (is_object(a) && !is_array(a))) {
    return true
  }
  return false
}

export const is_null = (a: any): a is null => {
    return a === null || a === undefined
}

export const is_boolean = (a: any): a is boolean => {
    return typeof a === "boolean"
}

export const is_number = (a: any): a is number => {
    return typeof a === "number"
}

export const is_int = (a: any): a is number => {
    return typeof a === "number" && a % 1 === 0
} 

export const is_float = (a: any): a is number => {
    return typeof a === "number" && a % 1 !== 0
}