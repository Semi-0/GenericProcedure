import { findAncestor, isArrowFunction } from "typescript";
import { construct_simple_generic_procedure, define_generic_procedure_handler } from "../GenericProcedure"
import { match_args } from "../Predicates";
import { BetterSet, is_better_set } from "./generic_better_set";
// only need to extend this four method to support map over custom array type

// protocols

export const get_element = construct_simple_generic_procedure("get_element", 2,
    <T>(array: T[], index: number): T => array[index]
)

export const set_element = construct_simple_generic_procedure("set_element", 3,
    <T>(array: T[], index: number, value: T): T[] => {
        const newArray = [...array];
        newArray[index] = value;
        return newArray;
    }
)

export const get_length = construct_simple_generic_procedure("get_length", 1,
    <T>(array: T[]): number => array.length
)

export const isArray = construct_simple_generic_procedure("isArray", 1,
    <T>(obj: any): obj is T[] => Array.isArray(obj)
)

export const push = <T>(array: T[], item: T): T[] => 
    set_element(array, get_length(array), item)

export const slice = <T>(array: T[], start: number, end: number = get_length(array)): T[] => {
    let result: T[] = [];
    for (let i = start; i < end && i < get_length(array); i++) {
        result = push(result, get_element(array, i));
    }
    return result;
}


export const _filter = <T>(array: T[], predicate: (item: T) => boolean): T[] => {
    let result: T[] = [];
    for (let i = 0; i < get_length(array); i++) {
        const item = get_element(array, i);
        if (predicate(item)) {
            result = push(result, item);
        }
    }
    return result;
}

export const _find = <T>(array: T[], predicate: (item: T) => boolean): T | undefined => {
    for (let i = 0; i < get_length(array); i++) {
        const item = get_element(array, i);
        if (predicate(item)) {
            return item;
        }
    }
    return undefined;
}



export const _map = <T, U>(array: T[], mapper: (item: T) => U): U[] => {
    let result: U[] = [];
    for (let i = 0; i < get_length(array); i++) {
        result = push(result, mapper(get_element(array, i)));
    }
    return result;
}

export const _reduce = <T, U>(array: T[], reducer: (acc: U, item: T) => U, initial: U): U => {
    let acc = initial;
    for (let i = 0; i < get_length(array); i++) {
        acc = reducer(acc, get_element(array, i));
    }
    return acc;
}

   

export const _for_each = <T>(array: T[], action: (item: T) => void): void => {
    for (let i = 0; i < get_length(array); i++) {
        action(get_element(array, i));
    }
} 

 

export const _flat_map = <T, U>(array: T[], mapper: (item: T) => U[]): U[] => {
    const flatten = (arr: any[], acc: U[]): U[] => {
        if (get_length(arr) === 0) return acc;
        const fst = first(arr)
        const rst = rest(arr)   
        if (isArray(fst)) {
            return flatten([...fst, ...rst], acc);
        } else {
            return flatten(rst, push(acc, fst));
        }
    };

    const mappedArray = array.map(mapper);
    return flatten(mappedArray, []);
}

function _removeDuplicates<T>(array: T[], compare: (a: T, b: T) => boolean = (a, b) => a === b): T[] {
    return _filter(array, (item) => 
       _find(array, (element) => compare(element, item)) === item
    );
}


export const first = <T>(array: T[]): T => get_element(array, 0)

export const rest = <T>(array: T[]): T[] => slice(array, 1, get_length(array))


export const second = <T>(array: T[]): T => get_element(array, 1)

export const third = <T>(array: T[]): T => get_element(array, 2)

export const construct = <T>(item: T, ...rest: T[]): T[] => {
    let result: T[] = [item];
    for (let i = 0; i < get_length(rest); i++) {
        result = push(result, get_element(rest, i));
    }
    return result;
}

export const isPair = <T>(array: T[]): boolean => 
    isArray(array) && get_length(array) > 0

export const isEmpty = <T>(array: T[]): boolean => 
    get_length(array) === 0



export const isOriginalArray = isArray


// operators

export const find = construct_simple_generic_procedure("find", 2,
    <T>(array: T[], predicate: (item: T) => boolean): T | undefined => {
        return _find(array, predicate)
    }
)

export const remove_duplicates =  construct_simple_generic_procedure("remove_duplicates", 2,
    <T>(array: T[], compare: (a: T, b: T) => boolean): T[] => {
        return _removeDuplicates(array, compare)
    }
)

export const filter = construct_simple_generic_procedure("filter", 2,
    <T>(array: T[], predicate: (item: T) => boolean): T[] => {
        return _filter(array, predicate)
    }
) 

export const map = construct_simple_generic_procedure("map", 2,
    <T, U>(array: T[], mapper: (item: T) => U): U[] => {
        return _map(array, mapper)
    }
)

export const for_each = construct_simple_generic_procedure("for_each", 2,
    <T>(array: T[], action: (item: T) => void): void => {
        return _for_each(array, action)
    }
)

export const flat_map = construct_simple_generic_procedure("flat_map", 2,
    <T, U>(array: T[], mapper: (item: T) => U[]): U[] => {
        return _flat_map(array, mapper)
    }
)   

export const reduce = construct_simple_generic_procedure("reduce", 3,
    <T, U>(array: T[], reducer: (acc: U, item: T) => U, initial: U): U => {
        return _reduce(array, reducer, initial)
    }
)


/// 

define_generic_procedure_handler(map, match_args(is_better_set, isArrowFunction), (set: BetterSet<any>, mapper) => {
    return set.map(mapper)
})

define_generic_procedure_handler(filter, match_args(is_better_set, isArrowFunction), (set: BetterSet<any>, predicate) => {
    return set.filter(predicate)
}) 

define_generic_procedure_handler(reduce, match_args(is_better_set, isArrowFunction, is_better_set), (set: BetterSet<any>, reducer, initial) => {
    return set.reduce(reducer, initial)
})

define_generic_procedure_handler(for_each, match_args(is_better_set, isArrowFunction), (set: BetterSet<any>, action) => {
    return set.for_each(action)
})

define_generic_procedure_handler(flat_map, match_args(is_better_set, isArrowFunction), (set: BetterSet<any>, mapper) => {
    return set.flat_map(mapper)
})

define_generic_procedure_handler(remove_duplicates, match_args(is_better_set), (set: BetterSet<any>, compare) => {
    return set.remove_duplicates(compare)
}) 

define_generic_procedure_handler(find, match_args(is_better_set, isArrowFunction), (set: BetterSet<any>, predicate) => {
    return set.find(predicate)
}) 