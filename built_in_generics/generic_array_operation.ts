import { construct_simple_generic_procedure } from "../GenericProcedure"
import { is_any, is_array, is_function } from "./generic_predicates"
import { match_args } from "../Predicates"
import { force_load_generic_predicates } from "./generic_predicates"
import { guard, throw_error, throw_type_mismatch } from "./other_generic_helper"
force_load_generic_predicates()


export const map = construct_simple_generic_procedure(
    "map",
    2,
    (array: any[], mapper: (value: any) => any) => {
       return array.map(mapper)
    }
)

export const filter = construct_simple_generic_procedure(
    "filter",
    2,
    (array: any[], predicate: (value: any) => boolean) => {
        return array.filter(predicate)
    }
)



export const reduce = construct_simple_generic_procedure(
    "reduce",
    3,
    (array: any[], reducer: (acc: any, value: any) => any, initial: any) => {
        guard(is_function(reducer), throw_type_mismatch("reduce", "function", typeof reducer))
        guard(is_array(array), throw_type_mismatch("reduce", "array", array.toString()))
        return _array_reduce(array, reducer, initial)
    }
)

function _array_reduce(array: any[], reducer: (acc: any, value: any) => any, initial: any){
    var new_value = initial 
    for (const value of array){
        new_value = reducer(new_value, value)
    }
    return new_value
}



export const remove_duplicates = construct_simple_generic_procedure(
    "remove_duplicates",
    1,
    (array: any[]) => {
        return array.filter((value, index, self) => self.indexOf(value) === index)
    }
)

export const first = construct_simple_generic_procedure(
    "first",
    1,
    (array: any[]) => {
        return array[0]
    }
)

export const last = construct_simple_generic_procedure(
    "last",
    1,
    (array: any[]) => {
       return array[array.length - 1]
    }
)

export const array_operation = {
    map,
    filter,
    reduce,
    remove_duplicates,
    first,
    last
}