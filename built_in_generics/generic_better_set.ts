// a better set that is more flexible and powerful than the built-in set

import {construct_simple_generic_procedure, define_generic_procedure_handler} from "../GenericProcedure"
import { all_match, match_args, register_predicate } from "../Predicates"
import { to_string } from "./generic_conversation"
import { map, filter, reduce, add_item, remove_item, copy, has, length, for_each, reduce_right, flat_map, to_array, has_all, is_empty, find, every, first, last } from "./generic_collection"
import { is_any, is_array, is_function } from "./generic_predicates"

import { compose } from "./generic_combinator"
import { greater_than, is_equal, less_than } from "./generic_arithmetic"
import { some } from "./generic_collection"
export const identify_by = construct_simple_generic_procedure("identify_by", 1, to_string)

export class BetterSet<T> implements Iterable<T> {
    [Symbol.iterator](): Iterator<T> {
        return this.meta_data.values()
    }
    private meta_data: Map<string, T> = new Map()

    constructor(meta_data: Map<string, T> = new Map()){
        this.meta_data = meta_data
    }

    private _add_item(item: T): BetterSet<T> {
        const meta_data = new Map(this.meta_data)
        meta_data.set(identify_by(item), item)
        return new BetterSet(meta_data)
    }

    private _remove_item(item: T): BetterSet<T> {
        const meta_data = new Map(this.meta_data)
        meta_data.delete(identify_by(item))
        return new BetterSet(meta_data)
    }

    private _copy(): BetterSet<T> {
        const meta_data = new Map(this.meta_data)
        return new BetterSet(meta_data)
    }
    private _has(item: T): boolean {
        return this.meta_data.has(identify_by(item))
    }

    private _length(): number {
        return this.meta_data.size
    } 

    public static is_better_set = register_predicate("is_better_set", (a: any) => a instanceof BetterSet && typeof a[Symbol.iterator] === "function")

    static {
        define_generic_procedure_handler(add_item, 
            match_args(this.is_better_set, is_any), 
            (set: BetterSet<any>, item: any) => set._add_item(item))
        define_generic_procedure_handler(remove_item, 
            match_args(this.is_better_set, is_any), 
            (set: BetterSet<any>, item: any) => set._remove_item(item))
        define_generic_procedure_handler(copy, 
            match_args(this.is_better_set), 
            (set: BetterSet<any>) => set._copy())
        define_generic_procedure_handler(has, 
            match_args(this.is_better_set, is_any), (set: BetterSet<any>, item: any) => set._has(item))
        define_generic_procedure_handler(length, 
            match_args(this.is_better_set), (set: BetterSet<any>) => set._length())
    }
}

export const is_better_set = BetterSet.is_better_set

function simpleHash(str: string): number {
    let hash = 5381;
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i); // hash * 33 + c
    }
    return hash >>> 0; // Convert to unsigned 32-bit integer
}

function stableStringify(obj: any): string {
    if (Array.isArray(obj)) {
        return `[${obj.map(stableStringify).join(',')}]`;
    } else if (obj && typeof obj === 'object') {
        return `{${Object.keys(obj).sort().map(
            k => JSON.stringify(k) + ':' + stableStringify(obj[k])
        ).join(',')}}`;
    } else {
        return JSON.stringify(obj);
    }
}

function hashObjectSync(obj: any): string {
    return simpleHash(stableStringify(obj)).toString(16);
}

define_generic_procedure_handler(
    identify_by, 
    match_args(is_array), 
    (a: any[]) => {
        const items = a.map(i => identify_by(i));
        items.sort(); // ensure order-independence
        return hashObjectSync(items);
    }
);

define_generic_procedure_handler(
    identify_by,
    match_args(is_better_set),
    (s: BetterSet<any>) => {
        const items = to_array(s).map(i => identify_by(i));
        items.sort(); // ensure order-independence
        return hashObjectSync(items);
    }
);
                                          

define_generic_procedure_handler(
    to_string, 
    match_args(is_better_set), 
    (a: BetterSet<any>) => {
        return 'BetterSet[' + 
              reduce(a, (acc, value) => acc + to_string(value), '')   
              + ']'
})

export function to_set_item(value: any): any{
    if (is_array(value)){
        return construct_better_set(value)
    }
    else{
        return value
    }
}

export function construct_better_set<T>(values: T[]): BetterSet<T>{
    const map = new Map<string, T>()
    for (const item of values){
        map.set(identify_by(item), to_set_item(item))
    }
    return new BetterSet(map)
}

export function ensure_valid_better_set<T>(obj: any): BetterSet<T> {
    if (!is_better_set(obj)) {
        throw new Error('Invalid BetterSet: missing required properties');
    }
    return obj;
}

define_generic_procedure_handler(for_each, match_args(is_better_set, is_function), (set: BetterSet<any>, action: (item: any) => void) => {
    for (const item of set){
        action(item)
    }
})

define_generic_procedure_handler(filter, match_args(is_better_set, is_function), (set: BetterSet<any>, predicate: (item: any) => boolean) => {
    var result = copy(set)
    for_each(set, (value) => {
        if (!predicate(value)){
            result = remove_item(result, value)
        }
    })
    return result
})

define_generic_procedure_handler(map, match_args(is_better_set, is_function), (set: BetterSet<any>, mapper: (item: any) => any) => {
    var result = construct_better_set<any>([])
    for_each(set, (value) => {
        result = add_item(result, mapper(value))
    })
    return result
})

define_generic_procedure_handler(reduce, match_args(is_better_set, is_function, is_any), (set: BetterSet<any>, reducer: (acc: any, value: any) => any, initial: any) => {
    var result = initial
    for_each(set, (value) => {
        result = reducer(result, value)
    })
    return result
})


export function set_merge<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    var result = copy(set1)
    for_each(set2, (value) => {
        result = add_item(result, value)
    })
    return result
}

export function set_difference<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    var result = copy(set1)
    for_each(set1, (value) => {
        if (has(set2, value)){
            result = remove_item(result, value)
        }
    })
    return result
}

export const set_union = (set1: any, set2: any) => {
    // Special case handling for non-BetterSet arguments
    if (is_better_set(set1)) {
        ensure_valid_better_set(set1);
    } else {
        set1 = construct_better_set([set1]);
    }
    
    if (is_better_set(set2)) {
        ensure_valid_better_set(set2);
    } else {
        set2 = construct_better_set([set2]);
    }
    
    return set_merge(set1, set2);
}



define_generic_procedure_handler(reduce_right,
    match_args(is_better_set, is_function, is_any),
    (set: BetterSet<any>, reducer: (acc: any, value: any) => any, initial: any) => {
        return reduce_right(to_array(set), reducer, initial)
    }
)


define_generic_procedure_handler(flat_map,
    match_args(is_better_set, is_function),
    (set: BetterSet<any>, mapper: (item: any) => any) => {
        var flatten_set = construct_better_set([]);
    
        for_each(set,(value) => {
            const mapped = mapper(value);
            if (is_better_set(mapped)) {
                // If mapper returns a set, add all its values to the result
                for_each(mapped, (innerValue) => {
                    flatten_set = add_item(flatten_set, innerValue);
                })
            } else {
                // If mapper returns a single value, add it to the result
                flatten_set = add_item(flatten_set, mapped);
            }
        });
    
        return flatten_set
    }
)


define_generic_procedure_handler(is_empty,
    match_args(is_better_set),
    (set: BetterSet<any>) => {
        return length(set) === 0
    }
)

define_generic_procedure_handler(find,
    match_args(is_better_set, is_function),
    (set: BetterSet<any>, predicate: (item: any) => boolean) => {
        for (const item of set){
            if (predicate(item)){
                return item
            }
        }
        return undefined
    }
)


define_generic_procedure_handler(to_array,
    match_args(is_better_set),
    (set: BetterSet<any>) => {
        return Array.from(set)
    }
)

define_generic_procedure_handler(has_all,
    match_args(is_better_set, is_better_set),
    (set1: BetterSet<any>, set2: BetterSet<any>) => {
        for (const item of set2){
            if (!has(set1, item)){
                return false
            }
        }
        return true 
    }
)


export function is_subset_of<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return (length(set1) <= length(set2)) && has_all(set2, set1);
}

export function get_value<T>(set: BetterSet<T>, index: number): T {
    return to_array(set)[index]
}

define_generic_procedure_handler(is_equal, 
    all_match(is_better_set),
    (set1: BetterSet<any>, set2: BetterSet<any>) => {
        return length(set1) === length(set2) && 
            has_all(set1, set2) && 
            has_all(set2, set1);
    }
)

define_generic_procedure_handler(less_than,
    all_match(is_better_set),
    (set1: BetterSet<any>, set2: BetterSet<any>) => {
        return length(set1) < length(set2) && has_all(set1, set2);
    }
)


define_generic_procedure_handler(greater_than,
    all_match(is_better_set),
    (set1: BetterSet<any>, set2: BetterSet<any>) => {
        return length(set1) > length(set2) && has_all(set1, set2);
    }
)



export function set_remove<T>(set: BetterSet<T>, ...elts: T[]): BetterSet<T>{
    var result = copy(set)
    for_each(set, (value) => {
        if (elts.includes(value)){
            result = remove_item(result, value)
        }
    })
    return result
}

define_generic_procedure_handler(every,
    match_args(is_better_set, is_function),
    (set: BetterSet<any>, predicate: (item: any) => boolean) => {
        for (const item of set){
            if (!predicate(item)){
                return false
            }
        }
        return true
    }
)

define_generic_procedure_handler(some,
    match_args(is_better_set, is_function),
    (set: BetterSet<any>, predicate: (item: any) => boolean) => {
        for (const item of set){
            if (predicate(item)){
                return true
            }
        }
        return false
    }
)

define_generic_procedure_handler(first,
    match_args(is_better_set),
    (set: BetterSet<any>) => {
        return first(to_array(set))
    }
)

define_generic_procedure_handler(last,
    match_args(is_better_set),
    (set: BetterSet<any>) => {
        return last(to_array(set))
    }
)