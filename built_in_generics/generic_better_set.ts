// a better set that is more flexible and powerful than the built-in set

import { define_generic_procedure_handler } from "../GenericProcedure"
import { match_args, register_predicate } from "../Predicates"
import { is_atom } from "./generic_predicates"

export type BetterSet<T> = {
    meta_data: Map<string, T>
    identify_by: (a: T) => string

}



class BetterSetImpl<T> implements BetterSet<T>{
    public meta_data: Map<string, any> = new Map()
    public identify_by: (a: T) => string
    constructor(meta_data: Map<string, any>, compara_by: (a: T) => string){
        this.meta_data = meta_data
        this.identify_by = compara_by
    }
}

export const is_better_set = register_predicate("is_better_set", (a: any) => a instanceof BetterSetImpl)
export function construct_better_set<T>(values: T[], identify_by: (a: T) => string): BetterSet<T>{
    var meta_data = new Map<string, T>()
    for (const value of values){
        meta_data.set(identify_by(value), value)
    }
    return new BetterSetImpl(meta_data, identify_by)
}

export function add_item<T>(set: BetterSet<T>, item: T): BetterSet<T>{
    return construct_better_set([...set.meta_data.values(), item], set.identify_by)
} 

export function remove_item<T>(set: BetterSet<T>, item: T): BetterSet<T>{
    return construct_better_set([...set.meta_data.values()].filter((value) => value !== item), set.identify_by)
} 

export function merge_set<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    return construct_better_set([...set1.meta_data.values(), ...set2.meta_data.values()], set1.identify_by)
}

export function difference_set<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    return construct_better_set([...set1.meta_data.values()].filter((value) => !set2.meta_data.has(set1.identify_by(value))), set1.identify_by)
}


// adaption 

export function get_meta_data<T>(set: BetterSet<T>): Map<string, T> {
    return set.meta_data;
}

export function get<T>(set: BetterSet<T>, value: T): T {
    return set.meta_data.get(set.identify_by(value)) as T
}

export function add<T>(set: BetterSet<T>, value: T): BetterSet<T> {
    const copy = new Map(set.meta_data);
    copy.set(set.identify_by(value), value);
    return new BetterSetImpl(copy, set.identify_by);
}

export function remove<T>(set: BetterSet<T>, value: T): BetterSet<T> {
    const copy = new Map(set.meta_data);
    copy.delete(set.identify_by(value));
    return new BetterSetImpl(copy, set.identify_by);
}

export function has<T>(set: BetterSet<T>, value: T): boolean {
    return set.meta_data.has(set.identify_by(value));
}

export function do_operation<A, B>(set: BetterSet<A>, func: (meta_data: Map<string, A>) => Map<string, B>, new_compare_by: (a: B) => string): BetterSet<B> {
    const copy = func(new Map(set.meta_data));
    return new BetterSetImpl(copy, new_compare_by);
}

export function merge<T>(set1: BetterSet<T>, set2: BetterSet<T>, new_compare_by: (a: T) => string ): BetterSet<T> {
    return do_operation(set2, (s) => new Map([...set1.meta_data, ...s]), new_compare_by);
}

export function filter<T>(set: BetterSet<T>, predicate: (value: T) => boolean): BetterSet<T> {
    return do_operation(set, (s) => new Map([...s].filter(([, value]) => predicate(value))), set.identify_by);
}

export function map<A, B>(set: BetterSet<A>, mapper: (value: A) => B): B[] {
    return Array.from(set.meta_data.values()).map(mapper);
}

export function for_each<T>(set: BetterSet<T>, action: (value: T) => void): void {
    set.meta_data.forEach((value) => action(value));
}

export function flat_map<A,B>(set: BetterSet<A>, mapper: (value: A) => [string, B][], new_compare_by: (a: B) => string): BetterSet<B> {
    return do_operation(set, (s) => new Map([...s].flatMap(([, value]) => mapper(value))), new_compare_by);
}

export function reduce<T>(set: BetterSet<T>, reducer: (acc: T, value: T) => T, initial: T): T {
    return [...set.meta_data.values()].reduce(reducer, initial);
}

export function find<T>(set: BetterSet<T>, predicate: (value: T) => boolean): T | undefined {
    return [...set.meta_data.values()].find(predicate);
}

export function get_length<T>(set: BetterSet<T>): number {
    return set.meta_data.size;
}

export function to_array<T>(set: BetterSet<T>): T[] {
    return [...set.meta_data.values()];
}

export function has_all<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    for (const value of set1.meta_data.values()) {
        if (!has(set2, value)) {
            return false;
        }
    }
    return true;
}

export function is_subset_of<T>(set1: BetterSet<T>, set2: BetterSet<T>): boolean {
    return (get_length(set1) <= get_length(set2)) && has_all(set1, set2);
}

export function get_value<T>(set: BetterSet<T>, index: number): T {
    return [...set.meta_data.values()][index];
}

// ... existing code ...


export function force_load_generic_better_set(){
 
}