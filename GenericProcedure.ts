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

export function construct_generic_procedure(generic_procedure_store: Map<(...args: any) => any, GenericProcedureMetadata> | undefined){
    const constructor = (name: string, arity: Int, defaultHandler: (...args: any) => any) => {
        const metaData = new GenericProcedureMetadata(name, arity, new SimpleDispatchStore(), defaultHandler)
        const the_generic_procedure = (...args: any) => {
            return generic_procedure_dispatch(metaData, args)
        }
        if (generic_procedure_store !== undefined){
            set_store(generic_procedure_store)
            set_metaData(the_generic_procedure, metaData)
        }
        else{
            set_metaData(the_generic_procedure, metaData)
        }
        return the_generic_procedure
    }
    return constructor
}

export function construct_simple_generic_procedure(name: string, arity: Int, defaultHandler: (...args: any) => any){
    const generic_procedure_store = get_default_store()
    return construct_generic_procedure(generic_procedure_store)(name, arity, defaultHandler)
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
        return metaData.dispatchStore.get_all_critics().map(critic => critic.toString())
    }
    else{
        throw new Error("GenericProcedureMetadata not found")
    }
}