import { set_metaData, get_metaData, get_default_store, set_store } from "./GenericStore";
import { GenericProcedureMetadata } from "./GenericProcedureMetadata";
import type { Int } from "./types";
import { DispatchStore, SimpleDispatchStore } from "./DispatchStore";
import { get_predicate } from "./Predicates";

// idea: for a new ide, maybe instead of consider everything linear, it should always seperatable and reorganizable in blocks(and import exportable)

export function define_generic_procedure_handler(procedure: (...args: any) => any, predicate: ((...args: any) => any) | string, handler: (...args: any) => any): void{
    const metaData = get_metaData(procedure)
    if(metaData !== undefined){
        if (typeof predicate === "string"){
            const predicate_function = get_predicate(predicate)
            if(predicate_function !== undefined){
                metaData.addHandler(predicate_function, handler)
            }
            else{
                throw new Error("Predicate not found")
            }
        }
        else if (typeof predicate === "function"){
            metaData.addHandler(predicate, handler)
        }
        else{
            throw new Error("unknown predicate type")
        }
    }
    else{
        throw new Error("GenericProcedureMetadata not found")
    }
}

function generic_procedure_dispatch(metaData: GenericProcedureMetadata, args: any[]): any{
    const matched_handler = metaData.dispatchStore.get_handler(...args)
    if(matched_handler !== null){
        return matched_handler(...args)
    }
    else{
        return metaData.dispatchStore.get_default_handler()(...args)
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
        throw new Error(`Generic procedure ${name} has no handler for arguments ${args.map(arg => arg.toString()).join(", ")}`)
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

export function search_handler(procedure: (...args: any) => any, criteria: (...args: any) => boolean){
    const metaData = get_metaData(procedure)
    if(metaData !== undefined){
        return metaData.dispatchStore.get_handler(criteria)?.toString()
    }
    else{
        throw new Error("GenericProcedureMetadata not found")
    }
}

export function get_all_critics(procedure: (...args: any) => any){
    const metaData = get_metaData(procedure)
    if(metaData !== undefined){
        return metaData.dispatchStore.get_all_critics()
    }
    else{
        throw new Error("GenericProcedureMetadata not found")
    }
}