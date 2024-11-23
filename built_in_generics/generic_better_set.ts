// a better set that is more flexible and powerful than the built-in set

import { define_generic_procedure_handler } from "../GenericProcedure"
import { match_args, register_predicate } from "../Predicates"
import { to_string } from "./generic_conversation"
import { map, filter, reduce } from "./generic_array_operation"
import { is_any, is_function } from "./generic_predicates"

export type BetterSet<T> = {
    meta_data: Map<string, T>
    identify_by: (a: T) => string
    copy(): BetterSet<T>
}



class BetterSetImpl<T> implements BetterSet<T>{
    public meta_data: Map<string, any> = new Map()
    public identify_by: (a: T) => string
    constructor(meta_data: Map<string, any>, compara_by: (a: T) => string){
        this.meta_data = meta_data
        this.identify_by = compara_by
    }

    copy(): BetterSet<T> {
        return new BetterSetImpl(new Map(this.meta_data), this.identify_by)
    }
}


export const is_better_set = register_predicate("is_better_set", (a: any) => a !== null && a !== undefined &&
                                         a.meta_data !== undefined && a.identify_by !== undefined)

define_generic_procedure_handler(to_string, match_args(is_better_set), (a: BetterSet<any>) => {
    return 'BetterSet[' + reduce(a, (acc, value) => acc + to_string(value), '')   + ']'
})

export function make_better_set<T>(values: T[]): BetterSet<T>{
    // convenient method to make a better set with generic operations, should not over use
    return construct_better_set(values, to_string)
}

export function make_multi_dimensional_set(data: any[]): BetterSet<any>{
    return construct_better_set(data.map(item => 
        Array.isArray(item) ? make_multi_dimensional_set(item) : item
    ), to_string);
}


export function construct_better_set<T>(values: T[], identify_by: (a: T) => string): BetterSet<T>{
    var meta_data = new Map<string, T>()
    for (const value of values){
        meta_data.set(identify_by(value), value)
    }
    return new BetterSetImpl(meta_data, identify_by)
}

export function set_add_item<T>(set: BetterSet<T>, item: T): BetterSet<T>{
    var copy = set.copy()
    copy.meta_data.set(set.identify_by(item), item)
    return copy
} 

export function set_remove_item<T>(set: BetterSet<T>, item: T): BetterSet<T>{
    var copy = set.copy()
    copy.meta_data.delete(set.identify_by(item))
    return copy
} 

export function merge_set<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    const copy = set1.copy()
    set_for_each((value) => copy.meta_data.set(set1.identify_by(value), value), set2)
    return copy
}

export function difference_set<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    return construct_better_set([...set1.meta_data.values()].filter((value) => !set2.meta_data.has(set1.identify_by(value))), set1.identify_by)
}

export function get_meta_data<T>(set: BetterSet<T>): Map<string, T> {
    return set.meta_data;
}

export function get<T>(set: BetterSet<T>, value: T): T {
    return set.meta_data.get(set.identify_by(value)) as T
}

export function set_has<T>(set: BetterSet<T>, value: T): boolean {
    return set.meta_data.has(set.identify_by(value));
}

export function do_operation<A, B>(set: BetterSet<A>, func: (meta_data: Map<string, A>) => Map<string, B>, new_compare_by: (a: B) => string): BetterSet<B> {
    const copy = func(new Map(set.meta_data));
    return new BetterSetImpl(copy, new_compare_by);
}

export function set_merge<T>(set1: BetterSet<T>, set2: BetterSet<T>, new_compare_by: (a: T) => string ): BetterSet<T> {
    const copy = set1.copy()
    copy.identify_by = new_compare_by
    set_for_each((value) => copy.meta_data.set(new_compare_by(value), value), set2)
    return copy
}
export function set_filter<T>(set: BetterSet<T>, predicate: (value: T) => boolean): BetterSet<T> {
    return do_operation(set, (s) => new Map([...s].filter(([, value]) => predicate(value))), set.identify_by);
}

export function map_to_new_set<A, B>(set: BetterSet<A>, mapper: (value: A) => B, new_identify_by: (b: B) => string): BetterSet<B> {
    return do_operation(set, 
        (s) => {
            var result = new Map()
            for (const value of s.values()){
                const mapped_value = mapper(value)
                result.set(new_identify_by(mapped_value), mapped_value)
            }
            return result
        },
        new_identify_by
    );
}

export function map_to_same_set<A>(set: BetterSet<A>, mapper: (value: A) => A): BetterSet<A> {
    return map_to_new_set(set, mapper, set.identify_by);
}

export const set_map = (set: BetterSet<any>, mapper: (value: any) => any) => {
    return map_to_new_set(set, mapper, to_string)
}

export const set_union = (set1: any, set2: any) => {
    return merge_set(make_better_set([set1]), make_better_set([set2]))
}


export const set_reduce_right = <T, R>(f: (acc: R, value: T) => R, set: BetterSet<T>, initial: R): BetterSet<R> => {
    const values = to_array(set);
    let result = initial;
    
    for (let i = set_get_length(set) - 1; i >= 0; i--) {
        result = f(result, get_value(set, i));
    }
    
    return construct_better_set([result], to_string);
};



export function set_for_each<T>(action: (value: T) => void, set: BetterSet<T>): void {
    set.meta_data.forEach((value) => action(value));
}

export function set_flat_map<A,B>(set: BetterSet<A>, mapper: (value: A) => BetterSet<B>): BetterSet<B> {
    var result = construct_better_set([], to_string)
    
    function flatten(innerSet: BetterSet<A | B>) {
        for (const value of innerSet.meta_data.values()) {
            if (is_better_set(value)) {
                // @ts-ignore
                flatten(value as BetterSet<B>);
            } else {
              
                result = set_add_item(result, value)
            }
        }
    }

    const mappedSet = set_map(set, mapper);
    flatten(mappedSet);

    return result
}

export function set_reduce<T, B>(set: BetterSet<T>, reducer: (acc: B, value: T) => B, initial: B): B {
    var result = initial

    for (var i = 0; i < set_get_length(set); i++){
        result = reducer(result, get_value(set, i))
    }

    return result
}

export function set_find<T>(predicate: (value: T) => boolean, set: BetterSet<T>): T | undefined {
    return [...set.meta_data.values()].find(predicate);
}

export function set_get_length<T>(set: BetterSet<T>): number {
    return set.meta_data.size;
}

export function to_array<T>(set: BetterSet<T>): T[] {
    return [...set.meta_data.values()];
}

export function set_has_all<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    for (const value of set1.meta_data.values()) {
        if (!set_has(set2, value)) {
            return false;
        }
    }
    return true;
}

export function is_subset_of<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return (set_get_length(set1) <= set_get_length(set2)) && set_has_all(set1, set2);
}

export function get_value<T>(set: BetterSet<T>, index: number): T {
    return [...set.meta_data.values()][index];
}

export function set_equal<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return set_get_length(set1) === set_get_length(set2) && is_subset_of(set1, set2)
} 

export function set_smaller_than<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return is_subset_of(set1, set2) && set_get_length(set1) < set_get_length(set2)
}

export function set_larger_than<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return set_smaller_than(set2, set1)
}

export function set_remove<T>(set: BetterSet<T>, ...elts: T[]): BetterSet<T>{
    return construct_better_set([...set.meta_data.values()].filter((value) => !elts.includes(value)), set.identify_by)
}

export function set_every<T>(set: BetterSet<T>, predicate: (value: T) => boolean): boolean {
    return [...set.meta_data.values()].every(predicate);
}

export function set_some<T>(set: BetterSet<T>, predicate: (value: T) => boolean): boolean {
    return [...set.meta_data.values()].some(predicate);
}

define_generic_procedure_handler(map, match_args(is_better_set, is_function), set_map)

define_generic_procedure_handler(filter, match_args(is_better_set, is_function), set_filter)

define_generic_procedure_handler(reduce, match_args(is_better_set, is_function, is_any), set_reduce)

// ... existing code ...


export function force_load_generic_better_set(){
 
}