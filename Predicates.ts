/**
 * Copyright © 2024–2026 semi-0
 *
 * Based on propagator and interpreter ideas originally developed by
 * Chris Hanson and Gerald Jay Sussman as part of the SDF system
 * accompanying the book "Software Design for Flexibility".
 *
 * This file is part of a substantially modified TypeScript
 * reimplementation with a different execution, scheduling,
 * and distribution model.
 *
 * Licensed under the GNU General Public License v3.0 or later.
 */

// TODO: PREDICATE CAN BE MORE EFFICIENT WITH A_TRIE & INTEGRATION INTO GENERIC STORE

import { Applicability } from './Applicatability';
import { guard } from './built_in_generics/other_generic_helper';


export class Predicate{
    name: string
    procedure: (...args: any) => any
    side_note: string 

    constructor( name: string, procedure: (...args: any) => any, side_note: string = ""){
        this.name = name
        this.procedure = procedure
        this.side_note = side_note
    }

    execute(...args: any[]){
        return this.procedure(...args)
    } 

    summary(){
        return  this.name + " " + this.side_note
    } 

    summary_with_args(...args: any){
        return  this.name + " " + this.side_note + " args: " + args + " result: " + this.execute(args)
    }

    equals(other: Predicate){
        return this.name === other.name && this.procedure === other.procedure && this.side_note === other.side_note
    }

}



export class PredicateStore {
  
    private predicates: Predicate[] = []

    constructor(){
        this.predicates = []
    }


    register(predicate: Predicate) {
        if (this.has(predicate.procedure)) {
            throw new Error(`Predicate ${predicate.name} already registered`);
        }
        this.predicates.push(predicate);
    }

    get(name: string): (arg: any) => boolean {
        const handler = this.predicates.find(predicate => predicate.name === name);
        if (!handler) {
            throw new Error(`Predicate ${name} not found`);
        }
        return handler.procedure;
    }

    getFromProcedure(procedure: (arg: any) => boolean): Predicate | undefined {
        return this.predicates.find(predicate => predicate.procedure === procedure);
    }

    has(predicate: (arg: any) => boolean) {
        return this.predicates.some(pred => pred.procedure === predicate)
    }

    execute(name: string, args: any) {
        return this.get(name)(args);
    }

    get_all_predicates() {
        return this.predicates;
    }

    display_all() {
        console.log(this.get_all_predicates());
    }

    search(name: string) {
        const result = this.get_all_predicates()
            .filter(predicate => predicate.name === name)
            .sort();
        console.log(result);
    }

    clear(){
        // only for testing!!!
        this.predicates = []
    }
}

export function clear_predicate_store(){
    console.log("warning!!: if you saw this in a runtime, it means probably this is a bug in the code, the predicate should never be cleared unless in very specific cases")
    defaultPredicateStore.clear()
}

export var defaultPredicateStore = new PredicateStore();


export function guarantee_default_predicate_store_is_inited(){
    if (defaultPredicateStore === undefined){
        console.log("defaultPredicateStore is undefined, creating new one")
        defaultPredicateStore = new PredicateStore()
    }
}

export type PredicateFunction = (...args: any) => boolean

export function register_predicate(name: string, predicate: PredicateFunction) {
    guarantee_default_predicate_store_is_inited()
    defaultPredicateStore.register(new Predicate(name, predicate));
    return predicate
}

// export function trace_predicate(predicate: PredicateFunction) {
//     const name = defaultPredicateStore.getFromProcedure(predicate)?.name || "unknown"
//     const traced =  register_predicate(name, log_tracer(name, predicate))
//     return traced as PredicateFunction
// }

export function is_predicate_registered(callback: (arg: any) => boolean): boolean {
    return defaultPredicateStore.has(callback)
}

export function get_predicate(name: string): ((arg: any) => boolean) | undefined {
    return defaultPredicateStore.get(name);
}

export function get_predicates() {
    return defaultPredicateStore.get_all_predicates();
}

export function filter_predicates(predicate: (name: string) => boolean) {
    return defaultPredicateStore.get_all_predicates().filter((pred) => predicate(pred.name) );
}

export function execute_predicate(name: string, args: any) {
    return defaultPredicateStore.execute(name, args);
}

export function display_all_predicates() {
    defaultPredicateStore.display_all();
}

export function search_predicate(name: string) {
    defaultPredicateStore.search(name);
}

export function summary_all_predicates(){
    return get_predicates().map(predicate => predicate.summary()).join(", ")
}



function find_predicates_and_guarantee_registered(preds: ((arg: any) => boolean)[]): Predicate[] {
    const predicates = preds.map(arg_critic => defaultPredicateStore.getFromProcedure(arg_critic))

    guard(predicates.every(predicate => predicate !== undefined), () => {
        const unregistered_predicates = preds.filter(arg_critic => defaultPredicateStore.getFromProcedure(arg_critic) === undefined).toString()
        throw new Error("find predicates has not been registered, predicate: " 
            + unregistered_predicates +"\nregistered predicates:" 
            + summary_all_predicates());
    })
    //@ts-ignore
    return predicates
}



export function match_args(...preds: ((arg: any) => boolean)[]): Applicability {
    //@ts-ignore`
    return new Applicability("match_args", find_predicates_and_guarantee_registered(preds), 
        (preds: Predicate[]) =>
            (...args: any[]) => 
                preds.every((pred, index) => pred.execute(args[index])))
}



export function match_one_of_preds(...preds: ((arg: any) => boolean)[]): Applicability {
    return new Applicability("match_one_of_preds", find_predicates_and_guarantee_registered(preds), (preds: Predicate[]) =>
        (arg: any) => preds.some(pred => pred.execute(arg)))
}

export function one_of_args_match(pred: ((arg: any) => boolean)): Applicability {
    return new Applicability("one_of_args_match", find_predicates_and_guarantee_registered([pred]), (preds: Predicate[]) =>
        (...args: any[]) => args.some(arg => preds[0].execute(arg)))
}

export function all_match(pred: ((arg: any) => boolean)): Applicability {
    return new Applicability("all_match", find_predicates_and_guarantee_registered([pred]), (preds: Predicate[]) =>
        (...args: any[]) => args.every(arg => preds[0].execute(arg)))
} 


export function force_load_predicate(){

}
//TGDO: GENERIC PREDICATE: 1. ONE OF  2. BOTH  3. AND  4. OR 5. ANY 6. CONSTANT
