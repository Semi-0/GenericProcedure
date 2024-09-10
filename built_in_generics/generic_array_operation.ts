import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { force_load_generic_better_set, is_better_set } from "./generic_better_set"
import { map as map_set, filter as filter_set, reduce as reduce_set } from "./generic_better_set"
import { is_any, is_array, is_function } from "./generic_predicates"
import { BetterSet } from "./generic_better_set"
import { match_args } from "../Predicates"
import { force_load_generic_predicates } from "./generic_predicates"
import { guard, throw_error, throw_type_mismatch } from "./other_generic_helper"
import { inspect } from "bun"
force_load_generic_better_set()
force_load_generic_predicates()


const map = construct_simple_generic_procedure(
    "map",
    2,
    (array: any[], mapper: (value: any) => any) => {
       return array.map(mapper)
    }
)

define_generic_procedure_handler(map,
    match_args(is_better_set, is_function),
    (set: BetterSet<any>, mapper: (value: any) => any) => {
        return map_set(set, mapper)
    }
)

const filter = construct_simple_generic_procedure(
    "filter",
    2,
    (array: any[], predicate: (value: any) => boolean) => {
        return array.filter(predicate)
    }
)

define_generic_procedure_handler(filter,
    match_args(is_better_set, is_function),
    (set: BetterSet<any>, predicate: (value: any) => boolean) => {
        return filter_set(set, predicate)
    }
)

const reduce = construct_simple_generic_procedure(
    "reduce",
    3,
    (array: any[], reducer: (acc: any, value: any) => any, initial: any) => {
        guard(is_function(reducer), throw_type_mismatch("reduce", "function", typeof reducer))
        guard(is_array(array), throw_type_mismatch("reduce", "array", inspect(array)))
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

define_generic_procedure_handler(reduce,
    match_args(is_better_set, is_function, is_any),
    (set: BetterSet<any>, reducer: (acc: any, value: any) => any, initial: any) => {
        return reduce_set(set, reducer, initial)
    }
)

const remove_duplicates = construct_simple_generic_procedure(
    "remove_duplicates",
    1,
    (array: any[]) => {
        return array.filter((value, index, self) => self.indexOf(value) === index)
    }
)

const first = construct_simple_generic_procedure(
    "first",
    1,
    (array: any[]) => {
        return array[0]
    }
)

const last = construct_simple_generic_procedure(
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