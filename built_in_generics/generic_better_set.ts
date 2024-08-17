// a better set that is more flexible and powerful than the built-in set

import { define_generic_procedure_handler } from "../GenericProcedure"
import { match_args } from "../Predicates"
import { add, subtract } from "./generic_arithmetic"
import { is_atom } from "./generic_predicates"

export class BetterSet<T> {
    private meta_data: Map<string, any> = new Map()
    private compara_by: (a: T) => string
    constructor(meta_data: Map<string, any>, compara_by: (a: T) => string){
        this.meta_data = meta_data
        this.compara_by = compara_by
    }

    get(value: T): T{
        return this.meta_data.get(this.compara_by(value))
    }

    add(value: T): BetterSet<T>{
        var copy = this.meta_data
        copy.set(this.compara_by(value), value)

        return new BetterSet(copy, this.compara_by)
    }

    remove(value: T): BetterSet<T>{
        var copy = this.meta_data
        copy.delete(this.compara_by(value))

        return new BetterSet(copy, this.compara_by)
    }

    has(value: T): boolean{
        return this.meta_data.has(this.compara_by(value))
    }

    do(func: (meta_data: Map<string, T>) => Map<string, T>): BetterSet<T>{
        var copy = this.meta_data
        copy = func(copy)

        return new BetterSet(copy, this.compara_by)
    }

    merge(set: BetterSet<T>): BetterSet<T>{
        return set.do((s) => { return new Map([...this.meta_data, ...s])})
    }

    filter(predicate: (value: T) => boolean): BetterSet<T>{
        return this.do((s) => { return new Map([...s].filter(([key, value]) => predicate(value)))})
    } 

    map(mapper: (value: T) => T): BetterSet<T>{
        return this.do((s) => { return new Map([...s].map(([key, value]) => [key, mapper(value)]))})
    }

    for_each(action: (value: T) => void): void{
        this.meta_data.forEach((value, key) => action(value))
    } 

    flat_map(mapper: (value: T) => [string, T][]): BetterSet<T> {
        return this.do((s) => { 
            return new Map([...s].flatMap(([, value]) => mapper(value)))
        })
    }

    reduce(reducer: (acc: T, value: T) => T, initial: T): T{
        return [...this.meta_data.values()].reduce(reducer, initial)
    }

    find(predicate: (value: T) => boolean): T | undefined{
        return [...this.meta_data.values()].find(predicate)
    } 

    get_length(): number{
        return this.meta_data.size
    }

    to_array(): T[]{
        return [...this.meta_data.values()]
    }

    has_all(set: BetterSet<T>): boolean{
        for (const [key, value] of this.meta_data){
            if (!set.has(value)){
                return false
            }
        }
        return true
    }

    is_subset_of(set: BetterSet<T>): boolean{
       if ((this.get_length() > set.get_length()) && this.has_all(set)){
         return false
       }
       else{
         return true
       }
    }
}

export function is_better_set<T>(set: any): set is BetterSet<T>{
    return set instanceof BetterSet
}

export function construct_better_set<T>(values: T[], compara_by: (a: T) => string): BetterSet<T>{
    var meta_data = new Map<string, T>()
    for (const value of values){
        meta_data.set(compara_by(value), value)
    }
    return new BetterSet(meta_data, compara_by)
}

export function add_item<T>(set: BetterSet<T>, item: T): BetterSet<T>{
    return set.add(item)
} 

export function remove_item<T>(set: BetterSet<T>, item: T): BetterSet<T>{
    return set.remove(item)
} 

export function merge_set<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    return set1.merge(set2)
}

export function difference_set<T>(set1: BetterSet<T>, set2: BetterSet<T>): BetterSet<T>{
    return set1.do((s) => { return new Map([...s].filter(([key, value]) => !set2.has(value)))})
}


// adaption 