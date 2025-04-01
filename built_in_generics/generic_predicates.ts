
import { all_match, match_args, register_predicate, Predicate, force_load_predicate, get_predicates, summary_all_predicates, PredicateFunction } from "../Predicates"

// helper functions 

force_load_predicate()

export const is_string =  register_predicate("is_string",  (a: any) => typeof a === "string" )

export const is_object = register_predicate("is_object", (a: any) => typeof a === "object" && a !== null)

export const is_array = register_predicate("is_array", (a: any) => Array.isArray(a))

export const is_atom = register_predicate("is_atom", (a: any) => {
    return _is_atom(a)
})

export const is_function = register_predicate("is_function", (a: any) => typeof a === "function") 

export const is_any = register_predicate("is_any", (a: any) => true)    

export const is_date = register_predicate("is_date", (a: any) => a instanceof Date)

export const optional_predicate_constructor = (predicate: PredicateFunction) => {
    return register_predicate(`optional_${predicate.name}`, (a: any) => {
        if (a === undefined || a === null) {
            return true
        }
        return predicate(a)
    })
}


const _is_atom = (a: any): a is string | number | boolean => {
  if (is_string(a) || is_number(a) || is_boolean(a) || (is_object(a) && !is_array(a))) {
    return true
  }
  return false
}

export const is_null = register_predicate("is_null", (a: any): a is null => 
    a === null || a === undefined
)

export const is_boolean = register_predicate("is_boolean", (a: any): a is boolean => 
    typeof a === "boolean"
)

export const is_number = register_predicate("is_number", (a: any): a is number => 
    typeof a === "number"
)

export const is_int = register_predicate("is_int", (a: any): a is number => 
    typeof a === "number" && a % 1 === 0
)

export const is_float = register_predicate("is_float", (a: any): a is number => 
    typeof a === "number" && a % 1 !== 0
)

export function force_load_generic_predicates(){
 
    
}