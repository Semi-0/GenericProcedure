import { set_metaData, get_metaData, get_default_store, set_store, summarize_metadatas } from "./GenericStore";
import { find_matched_rule, GenericProcedureMetadata, get_handler, trace_find_matched_rule, trace_get_handler } from "./GenericProcedureMetadata";
import type { Int } from "./types";
import {  SimpleDispatchStore } from "./DispatchStore";
import type { DispatchStore } from "./DispatchStore";
import { get_predicate, Predicate } from "./Predicates";
import { Applicability } from "./Applicatability";
import { is_applicatable, Rule } from "./Rule";

// idea: for a new ide, maybe instead of consider everything linear, it should always seperatable and reorganizable in blocks(and import exportable)

export function define_generic_procedure_handler(procedure: (...args: any) => any, applicability: Applicability, handler: (...args: any) => any): void{
    const metaData = get_metaData(procedure)
    if(metaData !== undefined){
        metaData.addHandler(applicability, handler)
    }
    else{
        throw new Error(`GenericProcedureMetadata not found, procedure: ${procedure.toString()}, 
        avaliable procedures: ${summarize_metadatas().join(", ")}`)
    }
}



function _generic_procedure_dispatch(
    find_matched_rule: (metaData: GenericProcedureMetadata, args: any[]) => Rule | undefined,
    get_handler: (rule: Rule) => (...args: any) => any
){
    return (metaData: GenericProcedureMetadata, args: any[]) => {
        const matched = find_matched_rule(metaData, args)
        if(matched !== undefined){
            return get_handler(matched)(...args)
        }
        else{
            return metaData.dispatchStore.get_default_handler()(...args)
        }
    }
}

export const generic_procedure_dispatch = _generic_procedure_dispatch(find_matched_rule, get_handler)


export const traced_generic_procedure_dispatch  = (logger: (log: string) => void) => _generic_procedure_dispatch(
    trace_find_matched_rule(logger),
    trace_get_handler(logger)
)



export function trace_generic_procedure(logger: (log: string) => void,procedure: (...args: any) => any, args: any[]): any{
    // maybe as a monad?
    // better for this to be a pure function
    const metaData = get_metaData(procedure)
    if(metaData !== undefined){
        return traced_generic_procedure_dispatch(logger)(metaData, args)
    }
    else{
        throw new Error(`GenericProcedureMetadata not found, procedure: ${procedure.toString()}, 
        avaliable procedures: ${summarize_metadatas().join(", ")}`)
    }
}

export function construct_generic_procedure(dispatchStoreMaker: (...args: any) => DispatchStore){
    const constructor = (name: string, arity: Int, defaultHandler: ((...args: any) => any) | undefined) => {
        const metaData = new GenericProcedureMetadata(name, arity, dispatchStoreMaker(), defaultHandler ? defaultHandler : error_generic_procedure_handler(name))
        const the_generic_procedure = (...args: any) => {
            return generic_procedure_dispatch(metaData, args)
        }
  
        set_metaData(the_generic_procedure, metaData)
        return the_generic_procedure
    }
    return constructor
}

export function error_generic_procedure_handler(name: string){
    return (...args: any) => {
        throw new Error(`Generic procedure ${name} has no handler for arguments ${args.map((arg: any) => arg.toString()).join(", ")}`)
    }
}

var constant_generic_procedure_handlers: Map<(() => any), (...args: any) => any> = new Map() 

function set_constant_generic_procedure_handler(constant: () => any, handler: (...args: any) => any){
    constant_generic_procedure_handlers.set(constant, handler)
} 

export function constant_generic_procedure_handler(constant: () => any){
    const handler = (...args: any) => {constant()}
    set_constant_generic_procedure_handler(constant, handler)
    return handler
}

export function construct_simple_generic_procedure(name: string, arity: Int, defaultHandler: ((...args: any) => any) | undefined = undefined){
    return construct_generic_procedure(() => new SimpleDispatchStore())(name, arity, defaultHandler)
}

// export function construct_cached_generic_procedure(name: string, arity: Int, defaultHandler: ((...args: any) => any) | undefined = undefined){
//     return construct_generic_procedure(() => new CachedDispatchStore())(name, arity, defaultHandler)
// }

