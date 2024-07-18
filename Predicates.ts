// TODO: ADD STORE FOR PREDICATES
// TODO: PREDICATE CAN BE MORE EFFICIENT WITH A_TRIE & INTEGRATION INTO GENERIC STORE

class PredicateProcedure{
    procedure: (arg: any) => boolean
    cache: Map<any, boolean>
    constructor(procedure: (arg: any) => boolean, cache: Map<any, boolean>){
        this.procedure = procedure
        this.cache = cache
    }
}

const predicatesStore = new Map<string, PredicateProcedure>()

//// WARNING !!!!: THIS IS ONLY FOR TEST, DO NOT TOUCH IT!!!
export function clear_predicate_store(){
    predicatesStore.clear()
}

export function execute_procedure(arg: any, proc: PredicateProcedure): any{

    const cached_value = proc.cache.get(arg)
    if (cached_value !== undefined && cached_value !== null){
        return cached_value
    }
    else{
        const result = proc.procedure(arg)
        proc.cache.set(arg, result)
        return result
    }
}

export function construct_procedure(proc: (arg: any) => boolean){
    return new PredicateProcedure(proc, new Map())
}

export function add_predicate(name: string, predicate: (args: any) => boolean){
    predicatesStore.set(name, construct_procedure(predicate))
}

export function get_predicate(name: string): PredicateProcedure | undefined{
    if (!predicatesStore.has(name)){
        throw new Error(`Predicate ${name} not found`)
    }
    return predicatesStore.get(name)
} 



export function execute_predicate(name: string, args: any){
    const predicate = get_predicate(name)
    if (!predicate){
        throw new Error(`Predicate ${name} not found`)
    }
    return execute_procedure(args, predicate)
}

export function match_preds(predicates: string[]): (...args: any) => boolean{
    return (...args: any) => {
       if(predicates.length !== args.length){
        throw new Error("Predicates and arguments length mismatch", { cause: { predicates, args } })
       }
       else{
        return predicates.every((predicate, index) => execute_predicate(predicate, args[index]))
       }
    }
}

export function match_args(arg_critics: ((arg: any) => boolean)[]): (...args: any) => boolean{
    return (...args: any) => args.every((arg, index) => arg_critics[index](arg))
}



export function display_all_predicates(){
    console.log(Array.from(predicatesStore.keys()))
}


export function search_predicate(name: string) {
    const result = Array.from(predicatesStore.keys())
            .filter(predicate => predicate.includes(name))
            .sort();
    console.log(result)
}