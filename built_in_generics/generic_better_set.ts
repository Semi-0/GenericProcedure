// a better set that is more flexible and powerful than the built-in set

import { define_generic_procedure_handler } from "../GenericProcedure"
import { match_args, register_predicate } from "../Predicates"
import { is_atom } from "./generic_predicates"

export type BetterSet<T> = {
    meta_data: Map<string, T>
    identify_by: (a: T) => string
    // get(value: T): T
    // add(value: T): BetterSet<T>
    // remove(value: T): BetterSet<T>
    // has(value: T): boolean
    // do(func: (meta_data: Map<string, T>) => Map<string, T>): BetterSet<T>
    // merge(set: BetterSet<T>): BetterSet<T>
    // filter(predicate: (value: T) => boolean): BetterSet<T>
    // map(mapper: (value: T) => T): BetterSet<T>
    // for_each(action: (value: T) => void): void
    // flat_map(mapper: (value: T) => [string, T][]): BetterSet<T>
    // reduce(reducer: (acc: T, value: T) => T, initial: T): T
    // find(predicate: (value: T) => boolean): T | undefined
    // get_length(): number
    // to_array(): T[]
    // has_all(set: BetterSet<T>): boolean
    // is_subset_of(set: BetterSet<T>): boolean
    // get_value(index: number): T
}



class BetterSetImpl<T> implements BetterSet<T>{
    public meta_data: Map<string, any> = new Map()
    public identify_by: (a: T) => string
    constructor(meta_data: Map<string, any>, compara_by: (a: T) => string){
        this.meta_data = meta_data
        this.identify_by = compara_by
    }

    // get_meta_data(): Map<string, T>{
    //     return this.meta_data
    // }

    // get(value: T): T{
    //     return this.meta_data.get(this.compara_by(value))
    // }

    // add(value: T): BetterSet<T>{
    //     var copy = this.meta_data
    //     copy.set(this.compara_by(value), value)

    //     return new BetterSet(copy, this.compara_by)
    // }

    // remove(value: T): BetterSet<T>{
    //     var copy = this.meta_data
    //     copy.delete(this.compara_by(value))

    //     return new BetterSet(copy, this.compara_by)
    // }

    // has(value: T): boolean{
    //     return this.meta_data.has(this.compara_by(value))
    // }

    // do(func: (meta_data: Map<string, T>) => Map<string, T>): BetterSet<T>{
    //     var copy = this.meta_data
    //     copy = func(copy)

    //     return new BetterSet(copy, this.compara_by)
    // }

    // merge(set: BetterSet<T>): BetterSet<T>{
    //     return set.do((s) => { return new Map([...this.meta_data, ...s])})
    // }

    // filter(predicate: (value: T) => boolean): BetterSet<T>{
    //     return this.do((s) => { return new Map([...s].filter(([key, value]) => predicate(value)))})
    // } 

    // map(mapper: (value: T) => T): BetterSet<T>{
    //     return this.do((s) => { return new Map([...s].map(([key, value]) => [key, mapper(value)]))})
    // }

    // for_each(action: (value: T) => void): void{
    //     this.meta_data.forEach((value, key) => action(value))
    // } 

    // flat_map(mapper: (value: T) => [string, T][]): BetterSet<T> {
    //     return this.do((s) => { 
    //         return new Map([...s].flatMap(([, value]) => mapper(value)))
    //     })
    // }

    // reduce(reducer: (acc: T, value: T) => T, initial: T): T{
    //     return [...this.meta_data.values()].reduce(reducer, initial)
    // }

    // find(predicate: (value: T) => boolean): T | undefined{
    //     return [...this.meta_data.values()].find(predicate)
    // } 

    // get_length(): number{
    //     return this.meta_data.size
    // }

    // to_array(): T[]{
    //     return [...this.meta_data.values()]
    // }

    // has_all(set: BetterSet<T>): boolean{
    //     for (const [key, value] of this.meta_data){
    //         if (!set.has(value)){
    //             return false
    //         }
    //     }
    //     return true
    // }

    // is_subset_of(set: BetterSet<T>): boolean{
    //    if ((this.get_length() > set.get_length()) && this.has_all(set)){
    //      return false
    //    }
    //    else{
    //      return true
    //    }
    // }

    // get_value(index: number): T{
    //     return [...this.meta_data.values()][index]
    // } 
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