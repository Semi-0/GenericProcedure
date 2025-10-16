import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { is_any, is_array, is_function } from "./generic_predicates"
import { match_args } from "../Predicates"
import { force_load_generic_predicates } from "./generic_predicates"
import { guard, throw_error, throw_type_mismatch } from "./other_generic_helper"
force_load_generic_predicates()


export const map =  construct_simple_generic_procedure(
    "map",
    2,
    (array: any[], mapper: (value: any) => any) => {
        guard(is_array(array), throw_type_mismatch("map", "array", array.toString()))
       return array.map(mapper)
    }
)

export const filter =  construct_simple_generic_procedure(
    "filter",
    2,
    (array: any[], predicate: (value: any) => boolean) => {
        guard(is_array(array), throw_type_mismatch("filter", "array", array.toString()))
        return array.filter(predicate)
    }
)

export const reduce =  construct_simple_generic_procedure(
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

export const reduce_right =  construct_simple_generic_procedure(
    "reduce_right",
    3,
    (array: any[], reducer: (acc: any, value: any) => any, initial: any) => {
        guard(is_function(reducer), throw_type_mismatch("reduce_right", "function", typeof reducer))
        guard(is_array(array), throw_type_mismatch("reduce_right", "array", array.toString()))
        return _array_reduce_right(array, reducer, initial)
    }
)


function _array_reduce_right(array: any[], reducer: (acc: any, value: any) => any, initial: any){
        let result = initial;
        
        for (let i = length(array) - 1; i >= 0; i--) {
            result = reducer(result, array[i]);
        }
        
        return result;
};



export const for_each =  construct_simple_generic_procedure(
    "for_each",
    2,
    (array: any[], action: (value: any) => void) => {
        guard(is_array(array), throw_type_mismatch("for_each", "array", array.toString()))
        return _array_for_each(array, action)
    }
)

function _array_for_each(array: any[], action: (value: any) => void){
    for (const value of array){
        action(value)
    }
} 

export const flat_map =  construct_simple_generic_procedure(
    "flat_map",
    2,
    (array: any[], mapper: (value: any) => any) => {
        guard(is_array(array), throw_type_mismatch("flat_map", "array", array.toString()))
        return array.flatMap(mapper)
    }
)

export const remove_duplicates = construct_simple_generic_procedure(
    "remove_duplicates",
    1,
    (array: any[]) => {
        guard(is_array(array), throw_type_mismatch("remove_duplicates", "array", array.toString()))
        return array.filter((value, index, self) => self.indexOf(value) === index)
    }
)

export const first = construct_simple_generic_procedure(
    "first",
    1,
    (array: any[]) => {
        guard(is_array(array), throw_type_mismatch("first", "array", array.toString()))
        return array[0]
    }
)

export const last = construct_simple_generic_procedure(
    "last",
    1,
    (array: any[]) => {
        guard(is_array(array), throw_type_mismatch("last", "array", array.toString()))
       return array[array.length - 1]
    }
)

export const add_item =  construct_simple_generic_procedure(
    "add_item",
    2,
    (array: any[], item: any) => {
        guard(is_array(array), throw_type_mismatch("add_item", "array", array.toString()))
        array.push(item)
        return array
    }
)

export const remove_item =  construct_simple_generic_procedure(
    "remove_item",
    2,
    (array: any[], item: any) => {
        guard(is_array(array), throw_type_mismatch("remove_item", "array", array.toString()))
        return array.splice(array.indexOf(item), 1)
    }
)

export const copy =  construct_simple_generic_procedure(
    "copy",
    1,
    (array: any[]) => {
        guard(is_array(array), throw_type_mismatch("copy", "array", array.toString()))
        return array.slice()
    }
)

export const has =  construct_simple_generic_procedure(
    "has",
    2,
    (array: any[], item: any) => {
        guard(is_array(array), throw_type_mismatch("has", "array", array.toString()))
        return array.includes(item)
    }
)

export const has_all =  construct_simple_generic_procedure(
    "has_all",
    2,
    (array: any[], items: any[]) => {
        guard(is_array(array), throw_type_mismatch("has_all", "array", array.toString()))
        guard(is_array(items), throw_type_mismatch("has_all", "array", items.toString()))
        return items.every(item => array.includes(item))
    }
)


export const is_empty =  construct_simple_generic_procedure(
    "is_empty",
    1,
    (array: any[]) => {
        guard(is_array(array), throw_type_mismatch("is_empty", "array", array.toString()))
        return array.length === 0
    }
)


export const length =  construct_simple_generic_procedure(
    "length",
    1,
    (array: any[]) => {
        guard(is_array(array), throw_type_mismatch("length", "array", array.toString()))
        return array.length
    }
)

export const to_array =  construct_simple_generic_procedure(
    "to_array",
    1,
    (array: any[]) => {
        guard(is_array(array), throw_type_mismatch("to_array", "array", array.toString()))
        return array
    }
)


export const find =  construct_simple_generic_procedure(
    "find",
    2,
    (array: any[], predicate: (value: any) => boolean) => {
        guard(is_array(array), throw_type_mismatch("find", "array", array.toString()))
        return array.find(predicate)
    }
)


export const every =  construct_simple_generic_procedure(
    "every",
    2,
    (array: any[], predicate: (value: any) => boolean) => {
        guard(is_array(array), throw_type_mismatch("every", "array", array.toString()))
        return array.every(predicate)
    }
)



export const some =  construct_simple_generic_procedure(
    "some",
    2,
    (array: any[], predicate: (value: any) => boolean) => {
        guard(is_array(array), throw_type_mismatch("some", "array", array.toString()))
        return array.some(predicate)
    }
)