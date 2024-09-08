import { define_generic_procedure_handler } from "./GenericProcedure"
import { get_metaData } from "./GenericStore"
import { match_args } from "./Predicates"



export function search_handler(procedure: (...args: any) => any, criteria: (...args: any) => boolean){
    const metaData = get_metaData(procedure)
    if(metaData !== undefined){
        return metaData.dispatchStore.get_handler(criteria)?.toString()
    }
    else{
        throw new Error("GenericProcedureMetadata not found")
    }
}

export function summary_all_rules(procedure: (...args: any) => any){
    const metaData = get_metaData(procedure)
    if(metaData !== undefined){
        return metaData.dispatchStore.summary_rules()
    }
    else{
        throw new Error("GenericProcedureMetadata not found")
    }
}

export function summary_all_rules_with_args(procedure: (...args: any) => any, args: any[]): string[]{
    const metaData = get_metaData(procedure)
    if(metaData !== undefined){
        return metaData.dispatchStore.summary_rules_with_args(args)
    }
    else{
        throw new Error("GenericProcedureMetadata not found")
    }
}

import { add } from "./built_in_generics/generic_arithmetic"
import { is_array, is_atom, is_string } from "./built_in_generics/generic_predicates"

define_generic_procedure_handler(add, match_args(is_string, is_string), (a: number, b: number) => a + b)

define_generic_procedure_handler(add, match_args(is_atom, is_array), (a: number, b: number) => a + b)

summary_all_rules(add).
forEach(a => {
    console.log(a)
})

