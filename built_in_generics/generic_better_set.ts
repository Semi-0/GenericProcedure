// a better set that is more flexible and powerful than the built-in set

import {construct_simple_generic_procedure, define_generic_procedure_handler} from "../GenericProcedure"
import { match_args, register_predicate } from "../Predicates"
import { to_string } from "./generic_conversation"
import { map, filter, reduce } from "./generic_array_operation"
import { is_any, is_array, is_function } from "./generic_predicates"
import { v4 as uuidv4 } from 'uuid';
import { createHash } from 'crypto';

export const identify_by = construct_simple_generic_procedure("identify_by", 1, to_string)

define_generic_procedure_handler(identify_by, match_args(is_array), (a: any) => {
    return createHash('sha256').update(JSON.stringify(a)).digest('hex')
})

export class BetterSet<T> {
    public id: string
    private meta_data: Map<string, any> = new Map()

    constructor(meta_data: Map<string, any>){
        this.id = uuidv4()
        this.meta_data = meta_data
    }

    add_item(item: T): BetterSet<T> {
        const meta_data = new Map(this.meta_data)
        meta_data.set(identify_by(item), item)
        return new BetterSet(meta_data)
    }

    remove_item(item: T): BetterSet<T> {
        const meta_data = new Map(this.meta_data)
        meta_data.delete(identify_by(item))
        return new BetterSet(meta_data)
    }

    copy(): BetterSet<T> {
        const meta_data = new Map(this.meta_data)
        return new BetterSet(meta_data)
    }

    first(): T | undefined {
        return this.meta_data.values().next().value
    } 

    rest(): BetterSet<T> {
        const meta_data = new Map(this.meta_data)
        meta_data.delete(this.meta_data.keys().next().value)
        return new BetterSet(meta_data)
    }

    has(item: T): boolean {
        return this.meta_data.has(identify_by(item))
    }

    length(): number {
        return this.meta_data.size
    } 

}

export const is_better_set = register_predicate("is_better_set", (a: any) => a !== null && a !== undefined &&
                                         a.add_item !== undefined && a.remove_item !== undefined && a.copy !== undefined)


define_generic_procedure_handler(identify_by, match_args(is_better_set), (a: any) => {
    return a.id
})

define_generic_procedure_handler(to_string, match_args(is_better_set), (a: BetterSet<any>) => {
    return 'BetterSet[' + reduce(a, (acc, value) => acc + to_string(value), '')   + ']'
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

export function set_add_item<T>(set: BetterSet<T>, item: T): BetterSet<T>{
    return set.add_item(item)
} 

export function set_remove_item<T>(set: BetterSet<T>, item: T): BetterSet<T>{
    return set.remove_item(item)
} 

export function set_for_each<T>(action: (item: T) => void, set: BetterSet<T>): void {
    var set_in_loop = set.copy()
    for (let i = 0; i < set.length(); i++){
        if (set_in_loop.first() !== undefined){
            action(set_in_loop.first() as T)
        }
        else{
            throw new Error('set_for_each: first item is undefined')
        }
        set_in_loop = set_in_loop.rest()
    }
}


export function merge_set<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    var result = set1.copy()
    set_for_each((value) => {
        result = result.add_item(value)
    }, set2)
    return result
}

export function difference_set<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    var result = set1.copy()
    set_for_each((value) => {
        if (set_has(set2, value)){
            result = result.remove_item(value)
        }
    }, set1)
    return result
}


export function set_has<T>(set: BetterSet<T>, value: T): boolean {
    return set.has(value)
}

export function set_filter<T>(set: BetterSet<T>, predicate: (value: T) => boolean): BetterSet<T> {
    var result = set.copy()
    set_for_each((value) => {
        if (!predicate(value)){
            result = result.remove_item(value)
        }
    }, set)
    return result
}

export function set_map<A, B>(set: BetterSet<A>, mapper: (value: A) => B): BetterSet<B> {
    var result = construct_better_set<B>([])
    set_for_each((value) => {
        result = result.add_item(mapper(value as A) as B)
    }, set)
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
    
    return merge_set(set1, set2);
}


export const set_reduce_right = <T, R>(f: (acc: R, value: T) => R, set: BetterSet<T>, initial: R): BetterSet<R> => {
    ensure_valid_better_set(set);
    const values = to_array(set);
    let result = initial;
    
    for (let i = set_get_length(set) - 1; i >= 0; i--) {
        result = f(result, values[i]);
    }
    
    return construct_better_set([result]);
};

export function set_flat_map<A,B>(set: BetterSet<A>, mapper: (value: A) => B): BetterSet<B> {
    var flatten_set = construct_better_set<B>([]);
    
    set_for_each((value) => {
        const mapped = mapper(value as A);
        if (is_better_set(mapped)) {
            // If mapper returns a set, add all its values to the result
            set_for_each((innerValue) => {
                flatten_set = flatten_set.add_item(innerValue);
            }, mapped as BetterSet<B>);
        } else {
            // If mapper returns a single value, add it to the result
            flatten_set = flatten_set.add_item(mapped as B);
        }
    }, set);

    return flatten_set
}

export function set_reduce<T, B>(set: BetterSet<T>, reducer: (acc: B, value: T) => B, initial: B): B {
    ensure_valid_better_set(set);
    var result = initial;

    set_for_each((value) => {
        result = reducer(result, value as T)
    }, set)
    return result;
}

export function set_find<T>(predicate: (value: T) => boolean, set: BetterSet<T>): T | undefined {
   for (let i = 0; i < set.length(); i++){
    if (set.first() !== undefined){
        if (predicate(set.first() as T)){
            return set.first() as T
        }
    }
   }
}

export function set_get_length<T>(set: BetterSet<T>): number {
    return set.length();
}

export function to_array<T>(set: BetterSet<T>): T[] {
    var result: T[] = []
    set_for_each((value) => {
        result.push(value)
    }, set)
    return result
}

export function set_has_all<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    set_for_each((value) => {
        if (!set_has(set2, value)) {
            return false;
        }
    }, set1)
    return true;
}

export function is_subset_of<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return (set_get_length(set1) <= set_get_length(set2)) && set_has_all(set1, set2);
}

export function get_value<T>(set: BetterSet<T>, index: number): T {
    return to_array(set)[index]
}

export function set_equal<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return set_get_length(set1) === set_get_length(set2) && 
                                 set_has_all(set1, set2) && 
                                 set_has_all(set2, set1);
} 

export function set_smaller_than<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return set_get_length(set1) < set_get_length(set2) && set_has_all(set1, set2);
}

export function set_larger_than<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return set_smaller_than(set2, set1);
}

export function set_remove<T>(set: BetterSet<T>, ...elts: T[]): BetterSet<T>{
    var result = set.copy()
    set_for_each((value) => {
        if (elts.includes(value)){
            result = result.remove_item(value)
        }
    }, set)
    return result
}

export function set_every<T>(set: BetterSet<T>, predicate: (value: T) => boolean): boolean {
    set_for_each((value) => {
        if (!predicate(value as T)){
            return false
        }
    }, set)
    return true
}

export function set_some<T>(set: BetterSet<T>, predicate: (value: T) => boolean): boolean {
    set_for_each((value) => {
        if (predicate(value as T)){
            return true
        }
    }, set)
    return false
}

define_generic_procedure_handler(map, match_args(is_better_set, is_function), set_map)

define_generic_procedure_handler(filter, match_args(is_better_set, is_function), set_filter)

define_generic_procedure_handler(reduce, match_args(is_better_set, is_function, is_any), set_reduce)

// ... existing code ...


export function force_load_generic_better_set(){
 
}