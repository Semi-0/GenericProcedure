
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { all_match, match_args } from "../Predicates"
import { isArray } from "./generic_array"
// helper functions 



export const isString = (a: any): a is string => {
    return typeof a === "string"
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

export const isBoolean = (a: any): a is boolean => {
    return typeof a === "boolean"
}

export const isNumber = (a: any): a is number => {
    return typeof a === "number"
}

export const isInteger = (a: any): a is number => {
    return typeof a === "number" && a % 1 === 0
} 

export const isFloat = (a: any): a is number => {
    return typeof a === "number" && a % 1 !== 0
}